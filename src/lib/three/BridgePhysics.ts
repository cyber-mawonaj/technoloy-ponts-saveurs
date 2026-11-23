import initJolt from 'jolt-physics/wasm';
import joltWasmUrl from 'jolt-physics/jolt-physics.wasm.wasm?url';
import type JoltTypes from 'jolt-physics';
import type { DeckProfile, PhysicsSimResult, ReinforcementType } from '../stores/appState.svelte';

export interface PhysicsBridgeConfig {
  deckProfile: DeckProfile;
  reinforcement: ReinforcementType;
  spanCm: 18 | 22;
  coinCount: number;
  coinOffsetCm: number;
  pillarMismatchMm: number;
  stiffnessFactor: number;
}

export interface PhysicsFrameSnapshot {
  segmentY: number[];
  segmentRotX: number[];
  segmentRotZ: number[];
  centerSag: number;
  cakePos: [number, number, number];
  cakeQuat: [number, number, number, number];
  coinTransforms: Array<{ pos: [number, number, number]; quat: [number, number, number, number] }>;
  result: PhysicsSimResult;
  statusLabel: string;
}

const LAYER_STATIC = 0;
const LAYER_DYNAMIC = 1;

let cachedJoltPromise: Promise<typeof JoltTypes> | null = null;

async function getJolt(): Promise<typeof JoltTypes> {
  if (!cachedJoltPromise) {
    cachedJoltPromise = initJolt({
      locateFile: () => joltWasmUrl,
    });
  }
  return cachedJoltPromise;
}

export class BridgePhysicsWorld {
  private Jolt!: typeof JoltTypes;
  private joltInterface!: JoltTypes.JoltInterface;
  private physicsSystem!: JoltTypes.PhysicsSystem;
  private bodyInterface!: JoltTypes.BodyInterface;

  private activeBodyIds: JoltTypes.BodyID[] = [];
  private activeConstraints: JoltTypes.TwoBodyConstraint[] = [];
  private deckBodies: JoltTypes.Body[] = [];
  private cakeBody: JoltTypes.Body | null = null;
  private coinBodies: JoltTypes.Body[] = [];
  private centerConstraint: JoltTypes.TwoBodyConstraint | null = null;

  private initialized = false;
  private running = false;
  private elapsed = 0;
  private ruptured = false;
  private canYield = false;
  private currentResult: PhysicsSimResult = 'idle';
  private statusLabel = 'Prêt pour simulation gravitaire';

  public async ensureReady(): Promise<void> {
    if (this.initialized) return;
    this.Jolt = await getJolt();
    const Jolt = this.Jolt;

    const objectFilter = new Jolt.ObjectLayerPairFilterTable(2);
    objectFilter.EnableCollision(LAYER_STATIC, LAYER_DYNAMIC);
    objectFilter.EnableCollision(LAYER_DYNAMIC, LAYER_DYNAMIC);

    const bp0 = new Jolt.BroadPhaseLayer(0);
    const bp1 = new Jolt.BroadPhaseLayer(1);
    const bpInterface = new Jolt.BroadPhaseLayerInterfaceTable(2, 2);
    bpInterface.MapObjectToBroadPhaseLayer(LAYER_STATIC, bp0);
    bpInterface.MapObjectToBroadPhaseLayer(LAYER_DYNAMIC, bp1);

    const bpFilter = new Jolt.ObjectVsBroadPhaseLayerFilterTable(
      bpInterface,
      2,
      objectFilter,
      2,
    );

    const settings = new Jolt.JoltSettings();
    settings.mMaxBodies = 256;
    settings.mMaxBodyPairs = 512;
    settings.mMaxContactConstraints = 512;
    settings.mObjectLayerPairFilter = objectFilter;
    settings.mBroadPhaseLayerInterface = bpInterface;
    settings.mObjectVsBroadPhaseLayerFilter = bpFilter;

    this.joltInterface = new Jolt.JoltInterface(settings);
    Jolt.destroy(settings);

    this.physicsSystem = this.joltInterface.GetPhysicsSystem();
    this.bodyInterface = this.physicsSystem.GetBodyInterface();

    const gVec = new Jolt.Vec3(0, -16.0, 0);
    this.physicsSystem.SetGravity(gVec);
    Jolt.destroy(gVec);

    this.initialized = true;
  }

  public clearBodies(): void {
    if (!this.initialized) return;
    for (const c of this.activeConstraints) {
      this.physicsSystem.RemoveConstraint(c);
    }
    this.activeConstraints = [];
    this.centerConstraint = null;

    for (const id of this.activeBodyIds) {
      if (this.bodyInterface.IsAdded(id)) {
        this.bodyInterface.RemoveBody(id);
        this.bodyInterface.DestroyBody(id);
      }
    }
    this.activeBodyIds = [];
    this.deckBodies = [];
    this.cakeBody = null;
    this.coinBodies = [];
    this.running = false;
    this.elapsed = 0;
    this.ruptured = false;
    this.currentResult = 'idle';
  }

  public async startDropSimulation(cfg: PhysicsBridgeConfig): Promise<void> {
    await this.ensureReady();
    this.clearBodies();

    const Jolt = this.Jolt;
    const identityQuat = new Jolt.Quat(0, 0, 0, 1);

    // 1. Static Table Top (y = -4.02, surface at y = -4.0)
    const groundShape = new Jolt.BoxShape(new Jolt.Vec3(25, 0.5, 16));
    const groundPos = new Jolt.RVec3(0, -4.5, 0);
    const groundSettings = new Jolt.BodyCreationSettings(
      groundShape,
      groundPos,
      identityQuat,
      Jolt.EMotionType_Static,
      LAYER_STATIC,
    );
    groundSettings.mFriction = 0.8;
    const groundBody = this.bodyInterface.CreateBody(groundSettings);
    this.bodyInterface.AddBody(groundBody.GetID(), Jolt.EActivation_DontActivate);
    this.activeBodyIds.push(groundBody.GetID());
    Jolt.destroy(groundSettings);
    Jolt.destroy(groundPos);

    // 2. 4 Support Pillars (Left & Right, respecting span & optional mismatch fault)
    const halfSpan = cfg.spanCm === 22 ? 9.1 : 7.4;
    const mismatchDrop = Math.max(0, cfg.pillarMismatchMm) * 0.085;
    const pillarShape = new Jolt.CylinderShape(2.0, 1.05, 0.04);

    const pillarCoords: Array<[number, number, number]> = [
      [-halfSpan, -2.0, -1.18],
      [-halfSpan, -2.0, 1.18],
      [halfSpan, -2.0, -1.18],
      [halfSpan, -2.0 - mismatchDrop, 1.18],
    ];
    for (const [px, py, pz] of pillarCoords) {
      const pPos = new Jolt.RVec3(px, py, pz);
      const pSet = new Jolt.BodyCreationSettings(
        pillarShape,
        pPos,
        identityQuat,
        Jolt.EMotionType_Static,
        LAYER_STATIC,
      );
      pSet.mFriction = 0.72;
      const pBody = this.bodyInterface.CreateBody(pSet);
      this.bodyInterface.AddBody(pBody.GetID(), Jolt.EActivation_DontActivate);
      this.activeBodyIds.push(pBody.GetID());
      Jolt.destroy(pSet);
      Jolt.destroy(pPos);
    }

    // 3. Articulated 5-Segment Deck resting atop pillars (y = 0.08)
    const segCount = 5;
    const totalLen = 19.6;
    const segHalfLen = totalLen / segCount / 2;
    const segHalfWidth = cfg.deckProfile === 'flat' ? 2.1 : 2.15;
    const segHalfThick = cfg.deckProfile === 'flat' ? 0.08 : 0.14;
    const segShape = new Jolt.BoxShape(new Jolt.Vec3(segHalfLen, segHalfThick, segHalfWidth));

    for (let i = 0; i < segCount; i++) {
      const sx = -totalLen / 2 + (i + 0.5) * (segHalfLen * 2);
      const sPos = new Jolt.RVec3(sx, 0.16, 0);
      const sSet = new Jolt.BodyCreationSettings(
        segShape,
        sPos,
        identityQuat,
        Jolt.EMotionType_Dynamic,
        LAYER_DYNAMIC,
      );
      sSet.mOverrideMassProperties = Jolt.EOverrideMassProperties_CalculateInertia;
      sSet.mMassPropertiesOverride.mMass = 0.45;
      sSet.mFriction = 0.78;
      sSet.mLinearDamping = 0.35;
      sSet.mAngularDamping = 0.55;
      const sBody = this.bodyInterface.CreateBody(sSet);
      this.bodyInterface.AddBody(sBody.GetID(), Jolt.EActivation_Activate);
      this.activeBodyIds.push(sBody.GetID());
      this.deckBodies.push(sBody);
      Jolt.destroy(sSet);
      Jolt.destroy(sPos);
    }

    // Calibrated SixDOF Spring Constraints linking the 5 deck segments
    const stiffness = cfg.stiffnessFactor;
    const spanPenalty = cfg.spanCm === 22 ? 0.68 : 1.0;
    const springFreq = Math.max(1.1, stiffness * 2.35 * spanPenalty);
    const flexLimitRad = cfg.deckProfile === 'flat' ? 0.65 : 0.18;
    const twistLimitRad = cfg.deckProfile === 'flat' ? 0.42 : 0.12;
    this.canYield = stiffness < 2.2 || (cfg.spanCm === 22 && cfg.reinforcement !== 'accordion' && cfg.coinCount >= 5);

    for (let i = 0; i < segCount - 1; i++) {
      const jointX = -totalLen / 2 + (i + 1) * (segHalfLen * 2);
      const cSet = new Jolt.SixDOFConstraintSettings();
      cSet.mSpace = Jolt.EConstraintSpace_WorldSpace;
      const jPos = new Jolt.RVec3(jointX, 0.16, 0);
      cSet.mPosition1 = jPos;
      cSet.mPosition2 = jPos;

      cSet.MakeFixedAxis(Jolt.SixDOFConstraintSettings_EAxis_TranslationX);
      cSet.MakeFixedAxis(Jolt.SixDOFConstraintSettings_EAxis_TranslationY);
      cSet.MakeFixedAxis(Jolt.SixDOFConstraintSettings_EAxis_TranslationZ);
      cSet.MakeFixedAxis(Jolt.SixDOFConstraintSettings_EAxis_RotationY);
      cSet.SetLimitedAxis(Jolt.SixDOFConstraintSettings_EAxis_RotationX, -twistLimitRad, twistLimitRad);
      cSet.SetLimitedAxis(Jolt.SixDOFConstraintSettings_EAxis_RotationZ, -flexLimitRad, flexLimitRad);

      const springZ = cSet.get_mLimitsSpringSettings(Jolt.SixDOFConstraintSettings_EAxis_RotationZ);
      springZ.mFrequency = springFreq;
      springZ.mDamping = 0.72;
      cSet.set_mLimitsSpringSettings(Jolt.SixDOFConstraintSettings_EAxis_RotationZ, springZ);

      const constraint = this.bodyInterface.CreateConstraint(
        cSet,
        this.deckBodies[i].GetID(),
        this.deckBodies[i + 1].GetID(),
      );
      this.physicsSystem.AddConstraint(constraint);
      this.activeConstraints.push(constraint);
      if (i === 1) this.centerConstraint = constraint;
      Jolt.destroy(jPos);
      Jolt.destroy(cSet);
    }

    // 4. 3-Tier Wedding Cake Body placed gently above center deck
    const cakeShape = new Jolt.CylinderShape(1.1, 1.55, 0.04);
    const cakePos = new Jolt.RVec3(0, 1.48, 0);
    const cakeSet = new Jolt.BodyCreationSettings(
      cakeShape,
      cakePos,
      identityQuat,
      Jolt.EMotionType_Dynamic,
      LAYER_DYNAMIC,
    );
    cakeSet.mOverrideMassProperties = Jolt.EOverrideMassProperties_CalculateInertia;
    cakeSet.mMassPropertiesOverride.mMass = 0.6;
    cakeSet.mFriction = 0.7;
    cakeSet.mLinearDamping = 0.25;
    cakeSet.mAngularDamping = 0.35;
    this.cakeBody = this.bodyInterface.CreateBody(cakeSet);
    this.bodyInterface.AddBody(this.cakeBody.GetID(), Jolt.EActivation_Activate);
    this.activeBodyIds.push(this.cakeBody.GetID());
    Jolt.destroy(cakeSet);
    Jolt.destroy(cakePos);

    // 5. Dynamic 1 EUR Coins dropped onto cake/deck with lateral Z offset
    const coinShape = new Jolt.CylinderShape(0.08, 0.58, 0.02);
    const offsetZ = cfg.coinOffsetCm * 0.95;
    for (let i = 0; i < cfg.coinCount; i++) {
      const cPos = new Jolt.RVec3((i % 2 === 0 ? 0.05 : -0.05), 3.15 + i * 0.28, offsetZ);
      const cSet = new Jolt.BodyCreationSettings(
        coinShape,
        cPos,
        identityQuat,
        Jolt.EMotionType_Dynamic,
        LAYER_DYNAMIC,
      );
      cSet.mOverrideMassProperties = Jolt.EOverrideMassProperties_CalculateInertia;
      cSet.mMassPropertiesOverride.mMass = 0.42;
      cSet.mFriction = 0.62;
      cSet.mRestitution = 0.08;
      cSet.mLinearDamping = 0.12;
      const cBody = this.bodyInterface.CreateBody(cSet);
      this.bodyInterface.AddBody(cBody.GetID(), Jolt.EActivation_Activate);
      this.activeBodyIds.push(cBody.GetID());
      this.coinBodies.push(cBody);
      Jolt.destroy(cSet);
      Jolt.destroy(cPos);
    }

    Jolt.destroy(identityQuat);
    this.running = true;
    this.elapsed = 0;
    this.ruptured = false;
    this.currentResult = 'running';
    this.statusLabel = 'Chute physique Jolt en cours…';
  }

  public step(dt: number): PhysicsFrameSnapshot | null {
    if (!this.initialized || !this.running) return null;

    const clampedDt = Math.min(Math.max(dt, 1 / 120), 1 / 30);
    this.joltInterface.Step(clampedDt, clampedDt > 1 / 55 ? 2 : 1);
    this.elapsed += clampedDt;

    // Trigger progressive structural yield if sheet is flat or overloaded at 22 cm
    if (this.canYield && !this.ruptured && this.elapsed > 1.35 && this.centerConstraint) {
      this.physicsSystem.RemoveConstraint(this.centerConstraint);
      this.ruptured = true;
    }

    const segmentY: number[] = [];
    const segmentRotX: number[] = [];
    const segmentRotZ: number[] = [];

    for (const b of this.deckBodies) {
      const p = b.GetPosition();
      const q = b.GetRotation();
      segmentY.push(p.GetY());
      // Extract approximate roll/pitch from unit quaternion
      const qx = q.GetX();
      const qy = q.GetY();
      const qz = q.GetZ();
      const qw = q.GetW();
      const sinr = 2 * (qw * qx + qy * qz);
      const cosr = 1 - 2 * (qx * qx + qy * qy);
      segmentRotX.push(Math.atan2(sinr, cosr));
      const sinz = 2 * (qw * qz + qx * qy);
      const cosz = 1 - 2 * (qy * qy + qz * qz);
      segmentRotZ.push(Math.atan2(sinz, cosz));
    }

    const midY = segmentY[2] ?? 0.16;
    const centerSag = Math.max(0, 0.16 - midY);

    let cakePos: [number, number, number] = [0, 1.48, 0];
    let cakeQuat: [number, number, number, number] = [0, 0, 0, 1];
    if (this.cakeBody) {
      const cp = this.cakeBody.GetPosition();
      const cq = this.cakeBody.GetRotation();
      cakePos = [cp.GetX(), cp.GetY(), cp.GetZ()];
      cakeQuat = [cq.GetX(), cq.GetY(), cq.GetZ(), cq.GetW()];
    }

    const coinTransforms = this.coinBodies.map((cb) => {
      const p = cb.GetPosition();
      const q = cb.GetRotation();
      return {
        pos: [p.GetX(), p.GetY(), p.GetZ()] as [number, number, number],
        quat: [q.GetX(), q.GetY(), q.GetZ(), q.GetW()] as [number, number, number, number],
      };
    });

    // Evaluate outcome after impact settles
    const cakeFell = cakePos[1] < -1.1 || Math.abs(cakePos[2]) > 2.4;
    const anyCoinFell = coinTransforms.some((c) => c.pos[1] < -1.4);

    if (this.ruptured || centerSag > 1.75) {
      this.currentResult = 'collapsed';
      this.statusLabel = 'Effondrement structural Jolt : rigidité insuffisante';
    } else if (cakeFell || anyCoinFell) {
      this.currentResult = 'tipped';
      this.statusLabel = 'Basculement latéral : charge excentrée ou appuis inégaux';
    } else if (this.elapsed >= 3.2) {
      this.currentResult = 'holding';
      this.statusLabel = `Équilibre stable Jolt (${this.coinBodies.length} pièce(s) maintenue(s))`;
    }

    return {
      segmentY,
      segmentRotX,
      segmentRotZ,
      centerSag,
      cakePos,
      cakeQuat,
      coinTransforms,
      result: this.currentResult,
      statusLabel: this.statusLabel,
    };
  }

  public dispose(): void {
    this.clearBodies();
    if (this.initialized) {
      this.Jolt.destroy(this.joltInterface);
      this.initialized = false;
    }
  }
}
