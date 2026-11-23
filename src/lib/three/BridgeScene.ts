import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import type { BridgeCameraPreset } from '../data/curriculum';
import type {
  CulturalTheme3D,
  DeckProfile,
  PhysicsSimResult,
  ReinforcementType,
} from '../stores/appState.svelte';
import { BridgePhysicsWorld, type PhysicsBridgeConfig } from './BridgePhysics';

export interface BridgeSceneCallbacks {
  onSelectPart?: (partKey: string) => void;
  onContextLost?: (lost: boolean) => void;
  onPhysicsUpdate?: (result: PhysicsSimResult, statusLabel: string) => void;
}

const CAMERA_PRESETS: Record<
  BridgeCameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  ensemble: { pos: [0.5, 9.5, 22.5], target: [0, 1.5, 0] },
  pillars: { pos: [-14.5, 4.2, 10.5], target: [-8.0, -1.6, 0] },
  deck: { pos: [7.5, 4.8, 12.0], target: [0, 0.3, 0] },
  reinforcement: { pos: [6.0, -1.2, 11.2], target: [0, -0.4, 0] },
  cake: { pos: [4.2, 7.6, 11.5], target: [0, 3.3, 0] },
};

const _vec3 = new THREE.Vector3();
const _colorA = new THREE.Color(0x10b981);
const _colorB = new THREE.Color(0xf59e0b);
const _colorC = new THREE.Color(0xef4444);
const _tmpColor = new THREE.Color();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export class BridgeSceneController {
  private container: HTMLElement;
  private callbacks: BridgeSceneCallbacks;
  private isSoftwareGl: boolean;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private pmremGenerator: THREE.PMREMGenerator;
  private envRT: THREE.WebGLRenderTarget;

  private rootGroup = new THREE.Group();
  private partGroups: Record<
    string,
    { group: THREE.Group; basePos: THREE.Vector3; explodeOffset: THREE.Vector3 }
  > = {};
  private clickableMeshes: THREE.Object3D[] = [];
  private disposableResources: Array<{ dispose: () => void }> = [];

  // Dynamic mechanical sub-assemblies
  private leftPillarsGroup = new THREE.Group();
  private rightPillarsGroup = new THREE.Group();
  private rightFrontPillar: THREE.Group | null = null;
  private spanMarkerMesh: THREE.Mesh | null = null;
  private spanLabelSprite: THREE.Sprite | null = null;
  private widthLabelSprite: THREE.Sprite | null = null;
  private dimensionsGroup = new THREE.Group();

  private deckContainer = new THREE.Group();
  private deckFloorGeo: THREE.PlaneGeometry | null = null;
  private deckFloorBasePos: Float32Array | null = null;
  private deckFloorColors: Float32Array | null = null;
  private deckLeftPivot = new THREE.Group();
  private deckRightPivot = new THREE.Group();
  private deckLeftWall: THREE.Mesh | null = null;
  private deckRightWall: THREE.Mesh | null = null;
  private deckLeftFlangePivot = new THREE.Group();
  private deckRightFlangePivot = new THREE.Group();
  private deckLeftFlange: THREE.Mesh | null = null;
  private deckRightFlange: THREE.Mesh | null = null;

  private accordionGroup = new THREE.Group();
  private flatReinforceMesh: THREE.Mesh | null = null;
  private cakeGroup = new THREE.Group();
  private cakePlaqueKenya: THREE.Mesh | null = null;
  private cakePlaqueNigeria: THREE.Mesh | null = null;
  private cakePlaqueUnion: THREE.Mesh | null = null;
  private ribMat!: THREE.MeshStandardMaterial;

  private coinsGroup = new THREE.Group();
  private coinMeshes: THREE.Group[] = [];
  private coinBaseLocalPos: Array<[number, number, number]> = [];

  // Stress / Force Flow Visualizers
  private flowGroup = new THREE.Group();
  private flowParticles: Array<{
    mesh: THREE.Mesh;
    curve: THREE.CatmullRomCurve3;
    offset: number;
    speed: number;
  }> = [];

  // Studio stage & lighting refs for dark/light theme adaptation
  private keyLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;
  private rimLight: THREE.DirectionalLight | null = null;
  private tableMat: THREE.MeshStandardMaterial | null = null;
  private lightGrid: THREE.GridHelper | null = null;
  private darkGrid: THREE.GridHelper | null = null;

  // Shared PBR Materials
  private paperMat!: THREE.MeshStandardMaterial;
  private paperEdgeMat!: THREE.MeshStandardMaterial;
  private tapeMat!: THREE.MeshPhysicalMaterial;

  // JoltPhysics World (lazy loaded on first physics test)
  private physicsWorld = new BridgePhysicsWorld();
  private isPhysicsActive = false;
  private lastPhysicsResult: PhysicsSimResult = 'idle';

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private lastHoverCheck = 0;

  private targetExplode = 0;
  private currentExplode = 0;
  private targetDeflection = 0;
  private currentDeflection = 0;
  private targetFold = 1;
  private currentFold = 1;
  private showHeatmap = false;
  private currentSpanCm: 18 | 22 = 18;
  private currentDeckProfile: DeckProfile = 'ufold';
  private currentCoinOffsetCm = 0;

  private camTargetPos = new THREE.Vector3(...CAMERA_PRESETS.ensemble.pos);
  private camLookTarget = new THREE.Vector3(...CAMERA_PRESETS.ensemble.target);
  private isCameraTransitioning = false;

  private frameId = 0;
  private clock = new THREE.Clock();
  private resizeObserver: ResizeObserver;
  private disposed = false;

  constructor(container: HTMLElement, callbacks: BridgeSceneCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareWebGL();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4f1ea);
    this.scene.fog = new THREE.FogExp2(0xf4f1ea, 0.011);

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 200);
    this.camera.position.set(...CAMERA_PRESETS.ensemble.pos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    // Studio IBL environment
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envRT = this.pmremGenerator.fromScene(roomEnv, 0.04);
    this.scene.environment = this.envRT.texture;
    roomEnv.dispose();
    this.disposableResources.push(this.envRT);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 44;
    this.controls.maxPolarAngle = Math.PI * 0.54;
    this.controls.target.set(...CAMERA_PRESETS.ensemble.target);
    this.controls.update();

    this.controls.addEventListener('start', () => {
      this.isCameraTransitioning = false;
    });

    this.setupLighting();
    this.setupStudioStage();
    this.buildBridgeAssembly();
    this.buildStressFlows();
    this.buildDimensionsGuide();

    this.scene.add(this.rootGroup);
    this.flowGroup.visible = false;
    this.rootGroup.add(this.flowGroup);
    this.rootGroup.add(this.dimensionsGroup);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.renderer.domElement.addEventListener('click', this.handleClick);
    this.renderer.domElement.addEventListener('pointermove', this.handlePointerMove);
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    this.startLoop();
  }

  private setupLighting(): void {
    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.1);
    keyLight.position.set(14, 22, 16);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.near = 2;
      keyLight.shadow.camera.far = 65;
      const d = 18;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.keyLight = keyLight;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xfef3c7, 0x94a3b8, 0.85);
    hemiLight.position.set(0, 20, 0);
    this.hemiLight = hemiLight;
    this.scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 1.15);
    rimLight.position.set(-14, 12, -14);
    this.rimLight = rimLight;
    this.scene.add(rimLight);

    if (!this.isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxTop = new THREE.RectAreaLight(0xffffff, 2.2, 20, 7);
      softboxTop.position.set(0, 14, 5);
      softboxTop.lookAt(0, 1, 0);
      this.scene.add(softboxTop);
    }
  }

  private setupStudioStage(): void {
    const tableGeo = new THREE.CircleGeometry(36, 64);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0xe7e2d8,
      roughness: 0.9,
      metalness: 0.03,
    });
    this.tableMat = tableMat;
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.rotation.x = -Math.PI / 2;
    table.position.y = -4.02;
    table.receiveShadow = !this.isSoftwareGl;
    this.scene.add(table);
    this.disposableResources.push(tableGeo, tableMat);

    const grid = new THREE.GridHelper(32, 32, 0xb8b0a2, 0xd6d0c4);
    grid.position.y = -3.99;
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.45;
    gridMat.polygonOffset = true;
    gridMat.polygonOffsetFactor = -1;
    gridMat.polygonOffsetUnits = -1;
    this.lightGrid = grid;
    this.scene.add(grid);

    const darkGrid = new THREE.GridHelper(32, 32, 0x475569, 0x1e293b);
    darkGrid.position.y = -3.99;
    const darkGridMat = darkGrid.material as THREE.Material;
    darkGridMat.transparent = true;
    darkGridMat.opacity = 0.55;
    darkGridMat.polygonOffset = true;
    darkGridMat.polygonOffsetFactor = -1;
    darkGridMat.polygonOffsetUnits = -1;
    darkGrid.visible = false;
    this.darkGrid = darkGrid;
    this.scene.add(darkGrid);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 16, 128, 128, 124);
      grad.addColorStop(0, 'rgba(30, 27, 24, 0.32)');
      grad.addColorStop(0.55, 'rgba(30, 27, 24, 0.12)');
      grad.addColorStop(1, 'rgba(30, 27, 24, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactGeo = new THREE.PlaneGeometry(26, 12);
    const contactMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const contactPlane = new THREE.Mesh(contactGeo, contactMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.set(0, -3.97, 0);
    this.scene.add(contactPlane);
    this.disposableResources.push(shadowTex, contactGeo, contactMat);
  }

  private createCardboardTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#c49a6c';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = 'rgba(120, 72, 24, 0.28)';
      ctx.lineWidth = 3;
      for (let i = -256; i < 512; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 256, 256);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(92, 54, 16, 0.12)';
      for (let i = 0; i < 400; i++) {
        ctx.fillRect((i * 53) % 256, (i * 97) % 256, 2, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.disposableResources.push(tex);
    return tex;
  }

  private createBannerTexture(
    title: string,
    sub: string,
    stripeColors: string[],
    motif: 'bars' | 'diamonds' | 'waves' = 'bars',
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fffdf7';
      ctx.fillRect(0, 0, 512, 192);

      const bandW = 512 / stripeColors.length;
      stripeColors.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.fillRect(i * bandW, 0, bandW + 1, 22);
        ctx.fillRect(i * bandW, 170, bandW + 1, 22);
      });

      if (motif === 'diamonds') {
        ctx.fillStyle = 'rgba(187, 0, 0, 0.12)';
        for (let x = 24; x < 500; x += 44) {
          ctx.beginPath();
          ctx.moveTo(x, 36);
          ctx.lineTo(x + 12, 48);
          ctx.lineTo(x, 60);
          ctx.lineTo(x - 12, 48);
          ctx.closePath();
          ctx.fill();
        }
      } else if (motif === 'waves') {
        ctx.strokeStyle = 'rgba(0, 135, 81, 0.18)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = 16; x < 496; x += 24) {
          ctx.lineTo(x, 42 + ((x / 24) % 2 === 0 ? 8 : -8));
        }
        ctx.stroke();
      }

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 28, 496, 136);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title.slice(0, 18), 256, 92);

      ctx.fillStyle = '#475569';
      ctx.font = '600 20px sans-serif';
      ctx.fillText(sub.slice(0, 32), 256, 136);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.disposableResources.push(tex);
    return tex;
  }

  private createDimensionSprite(text: string, bgColor = '#0f172a'): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 56, 12);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 37);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4.0, 1.12, 1);
    sprite.renderOrder = 20;
    this.disposableResources.push(tex, mat);
    return sprite;
  }

  private registerPart(
    key: string,
    group: THREE.Group,
    explodeOffset: [number, number, number],
  ): void {
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.userData.partKey = key;
        if (!this.isSoftwareGl) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        this.clickableMeshes.push(child);
      }
    });
    this.partGroups[key] = {
      group,
      basePos: group.position.clone(),
      explodeOffset: new THREE.Vector3(...explodeOffset),
    };
    this.rootGroup.add(group);
  }

  private buildBridgeAssembly(): void {
    const cardboardTex = this.createCardboardTexture();
    const cardboardMat = new THREE.MeshStandardMaterial({
      map: cardboardTex,
      roughness: 0.85,
      metalness: 0.02,
    });
    const cardboardInsideMat = new THREE.MeshStandardMaterial({
      color: 0x9a734b,
      roughness: 0.92,
      side: THREE.BackSide,
    });
    this.paperMat = new THREE.MeshStandardMaterial({
      color: 0xfdfcf8,
      roughness: 0.72,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    this.paperEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xe2dfd7,
      roughness: 0.68,
    });
    this.tapeMat = new THREE.MeshPhysicalMaterial({
      color: 0xfef08a,
      roughness: 0.25,
      transparent: true,
      opacity: 0.62,
      clearcoat: 0.8,
    });
    const brassRingMat = new THREE.MeshPhysicalMaterial({
      color: 0xeab308,
      metalness: 0.88,
      roughness: 0.24,
      anisotropy: 0.7,
    });
    const nickelCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0xd1d5db,
      metalness: 0.9,
      roughness: 0.22,
      anisotropy: 0.6,
    });
    this.disposableResources.push(
      cardboardMat,
      cardboardInsideMat,
      this.paperMat,
      this.paperEdgeMat,
      this.tapeMat,
      brassRingMat,
      nickelCoreMat,
    );

    // 1. 4 CARDBOARD PILLARS
    const pillarsGroup = new THREE.Group();
    const tubeGeo = new THREE.CylinderGeometry(1.05, 1.05, 4.0, 28, 1, true);
    const tubeCapGeo = new THREE.RingGeometry(0.92, 1.05, 28);
    const tubeInnerGeo = new THREE.CylinderGeometry(0.92, 0.92, 4.0, 24, 1, true);

    const makePillarPair = (target: THREE.Group, isRight: boolean) => {
      [-1.18, 1.18].forEach((zPos, idx) => {
        const pillar = new THREE.Group();
        pillar.position.set(0, -2.0, zPos);
        const outer = new THREE.Mesh(tubeGeo, cardboardMat);
        const inner = new THREE.Mesh(tubeInnerGeo, cardboardInsideMat);
        const topRing = new THREE.Mesh(tubeCapGeo, cardboardMat);
        topRing.rotation.x = -Math.PI / 2;
        topRing.position.y = 2.0;
        pillar.add(outer, inner, topRing);
        target.add(pillar);
        if (isRight && idx === 1) {
          this.rightFrontPillar = pillar;
        }
      });
    };

    makePillarPair(this.leftPillarsGroup, false);
    makePillarPair(this.rightPillarsGroup, true);
    this.leftPillarsGroup.position.x = -7.4;
    this.rightPillarsGroup.position.x = 7.4;
    pillarsGroup.add(this.leftPillarsGroup, this.rightPillarsGroup);

    const spanGeo = new THREE.BoxGeometry(13.0, 0.04, 0.22);
    const spanMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    this.spanMarkerMesh = new THREE.Mesh(spanGeo, spanMat);
    this.spanMarkerMesh.position.set(0, -3.96, 2.35);
    pillarsGroup.add(this.spanMarkerMesh);

    this.disposableResources.push(tubeGeo, tubeCapGeo, tubeInnerGeo, spanGeo, spanMat);
    this.registerPart('pillars', pillarsGroup, [0, -2.1, 0]);

    // 2. DEFORMABLE A4 PAPER DECK WITH ORIGAMI HINGED WALLS & HEATMAP VERTEX COLORS
    const deckGroup = new THREE.Group();
    const deckLen = 20.5;
    const deckWidth = 4.2;
    this.deckFloorGeo = new THREE.PlaneGeometry(deckLen, deckWidth, 36, 4);
    this.deckFloorGeo.rotateX(-Math.PI / 2);
    this.deckFloorBasePos = new Float32Array(this.deckFloorGeo.attributes.position.array);
    const vertCount = this.deckFloorGeo.attributes.position.count;
    this.deckFloorColors = new Float32Array(vertCount * 3);
    for (let i = 0; i < vertCount; i++) {
      this.deckFloorColors[i * 3] = 1;
      this.deckFloorColors[i * 3 + 1] = 1;
      this.deckFloorColors[i * 3 + 2] = 1;
    }
    this.deckFloorGeo.setAttribute('color', new THREE.BufferAttribute(this.deckFloorColors, 3));

    const floorMesh = new THREE.Mesh(this.deckFloorGeo, this.paperMat);
    floorMesh.position.y = 0.06;
    this.deckContainer.add(floorMesh);

    // Hinged Origami Side Walls (pivot at floor edge z = ±deckWidth/2)
    const wallGeo = new THREE.BoxGeometry(deckLen, 1.25, 0.08);
    const flangeGeo = new THREE.BoxGeometry(deckLen, 0.08, 0.65);

    this.deckLeftPivot.position.set(0, 0.06, -deckWidth / 2);
    this.deckLeftWall = new THREE.Mesh(wallGeo, this.paperEdgeMat);
    this.deckLeftWall.position.set(0, 0.625, 0);
    this.deckLeftPivot.add(this.deckLeftWall);

    this.deckLeftFlangePivot.position.set(0, 1.25, 0);
    this.deckLeftFlange = new THREE.Mesh(flangeGeo, this.paperMat);
    this.deckLeftFlange.position.set(0, 0, 0.325);
    this.deckLeftFlangePivot.add(this.deckLeftFlange);
    this.deckLeftPivot.add(this.deckLeftFlangePivot);

    this.deckRightPivot.position.set(0, 0.06, deckWidth / 2);
    this.deckRightWall = new THREE.Mesh(wallGeo, this.paperEdgeMat);
    this.deckRightWall.position.set(0, 0.625, 0);
    this.deckRightPivot.add(this.deckRightWall);

    this.deckRightFlangePivot.position.set(0, 1.25, 0);
    this.deckRightFlange = new THREE.Mesh(flangeGeo, this.paperMat);
    this.deckRightFlange.position.set(0, 0, -0.325);
    this.deckRightFlangePivot.add(this.deckRightFlange);
    this.deckRightPivot.add(this.deckRightFlangePivot);

    const tapeGeo = new THREE.BoxGeometry(0.95, 0.09, 1.4);
    [-9.2, 9.2].forEach((tx) => {
      const tMesh = new THREE.Mesh(tapeGeo, this.tapeMat);
      tMesh.position.set(tx, 0.1, 0);
      this.deckContainer.add(tMesh);
    });

    this.deckContainer.add(this.deckLeftPivot, this.deckRightPivot);
    deckGroup.add(this.deckContainer);

    this.disposableResources.push(this.deckFloorGeo, wallGeo, flangeGeo, tapeGeo);
    this.registerPart('deck', deckGroup, [0, 1.5, 0]);

    // 3. UNDER-DECK REINFORCEMENTS
    const reinforceGroup = new THREE.Group();
    const flatReinGeo = new THREE.BoxGeometry(19.2, 0.1, 3.6);
    this.flatReinforceMesh = new THREE.Mesh(flatReinGeo, this.paperEdgeMat);
    this.flatReinforceMesh.position.set(0, -0.08, 0);
    this.flatReinforceMesh.visible = false;
    reinforceGroup.add(this.flatReinforceMesh);

    const segCount = 12;
    const totalLen = 13.8;
    const segLen = totalLen / segCount;
    const trussH = 0.92;
    const diagLen = Math.hypot(segLen, trussH);
    const diagAngle = Math.atan2(trussH, segLen);
    const strutGeo = new THREE.BoxGeometry(diagLen, 0.06, 0.72);

    [-1.1, 1.1].forEach((zLine) => {
      for (let i = 0; i < segCount; i++) {
        const strut = new THREE.Mesh(strutGeo, this.paperEdgeMat);
        const xCenter = -totalLen / 2 + (i + 0.5) * segLen;
        strut.position.set(xCenter, -0.45, zLine);
        strut.rotation.z = i % 2 === 0 ? -diagAngle : diagAngle;
        this.accordionGroup.add(strut);
      }
      [-6.8, 0, 6.8].forEach((tx) => {
        const t = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.8), this.tapeMat);
        t.position.set(tx, -0.02, zLine);
        this.accordionGroup.add(t);
      });
    });

    reinforceGroup.add(this.accordionGroup);
    this.disposableResources.push(flatReinGeo, strutGeo);
    this.registerPart('reinforcement', reinforceGroup, [0, -0.9, 2.8]);

    // 4. 3-TIER SYMBOLIC WEDDING CAKE + CULTURAL PLAQUES
    const cakeWrapper = new THREE.Group();
    const tier1Geo = new THREE.CylinderGeometry(1.95, 2.02, 0.95, 36);
    const tier1Mat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.65 });
    const tier1 = new THREE.Mesh(tier1Geo, tier1Mat);
    tier1.position.y = 0.54;

    const tier2Geo = new THREE.CylinderGeometry(1.38, 1.44, 0.85, 36);
    const tier2Mat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
    const tier2 = new THREE.Mesh(tier2Geo, tier2Mat);
    tier2.position.y = 1.44;

    const tier3Geo = new THREE.CylinderGeometry(0.86, 0.92, 0.75, 36);
    const tier3Mat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.55 });
    const tier3 = new THREE.Mesh(tier3Geo, tier3Mat);
    tier3.position.y = 2.24;

    this.ribMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.35 });
    const rib1Geo = new THREE.CylinderGeometry(2.01, 2.02, 0.12, 36);
    const rib1 = new THREE.Mesh(rib1Geo, this.ribMat);
    rib1.position.y = 0.14;
    const rib2Geo = new THREE.CylinderGeometry(1.43, 1.44, 0.1, 36);
    const rib2 = new THREE.Mesh(rib2Geo, this.ribMat);
    rib2.position.y = 1.07;

    const kenyaTex = this.createBannerTexture('KENYA', 'Mandazi · Cardamome', ['#111827', '#bb0000', '#006600'], 'diamonds');
    const nigeriaTex = this.createBannerTexture('NIGERIA', 'Chin Chin · Zobo', ['#008751', '#ffffff', '#008751'], 'waves');
    const unionTex = this.createBannerTexture('Kofi + Abénah', 'Un pont vers l’avenir', ['#bb0000', '#f59e0b', '#008751'], 'bars');

    const plaqueGeo = new THREE.BoxGeometry(2.5, 0.9, 0.08);
    this.cakePlaqueKenya = new THREE.Mesh(plaqueGeo, new THREE.MeshStandardMaterial({ map: kenyaTex, roughness: 0.5 }));
    this.cakePlaqueKenya.position.set(-4.1, 0.65, 0);
    this.cakePlaqueNigeria = new THREE.Mesh(plaqueGeo, new THREE.MeshStandardMaterial({ map: nigeriaTex, roughness: 0.5 }));
    this.cakePlaqueNigeria.position.set(4.1, 0.65, 0);
    this.cakePlaqueUnion = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.85, 0.08),
      new THREE.MeshStandardMaterial({ map: unionTex, roughness: 0.5 }),
    );
    this.cakePlaqueUnion.position.set(0, 1.45, 1.48);

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.15);
    heartShape.bezierCurveTo(0, 0.45, -0.45, 0.45, -0.45, 0.12);
    heartShape.bezierCurveTo(-0.45, -0.2, 0, -0.4, 0, -0.55);
    heartShape.bezierCurveTo(0, -0.4, 0.45, -0.2, 0.45, 0.12);
    heartShape.bezierCurveTo(0.45, 0.45, 0, 0.45, 0, 0.15);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
    });
    heartGeo.center();
    const heartMat = new THREE.MeshPhysicalMaterial({ color: 0xe11d48, roughness: 0.25, clearcoat: 0.9 });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(0, 3.05, 0);

    this.cakeGroup.add(
      tier1,
      tier2,
      tier3,
      rib1,
      rib2,
      this.cakePlaqueKenya,
      this.cakePlaqueNigeria,
      this.cakePlaqueUnion,
      heartMesh,
    );
    cakeWrapper.add(this.cakeGroup);

    this.disposableResources.push(
      tier1Geo,
      tier1Mat,
      tier2Geo,
      tier2Mat,
      tier3Geo,
      tier3Mat,
      this.ribMat,
      rib1Geo,
      rib2Geo,
      plaqueGeo,
      heartGeo,
      heartMat,
    );
    this.registerPart('cake', cakeWrapper, [0, 3.8, 0]);

    // 5. TEST LOAD: UP TO 8 BI-METALLIC 1 EUR COINS
    const coinsWrapper = new THREE.Group();
    const outerCoinGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.13, 28);
    const innerCoinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.138, 24);
    this.disposableResources.push(outerCoinGeo, innerCoinGeo);

    for (let i = 0; i < 8; i++) {
      const singleCoin = new THREE.Group();
      const brass = new THREE.Mesh(outerCoinGeo, brassRingMat);
      const nickel = new THREE.Mesh(innerCoinGeo, nickelCoreMat);
      singleCoin.add(brass, nickel);
      const basePos: [number, number, number] = [i % 2 === 0 ? 0.04 : -0.04, 2.7 + i * 0.14, 0];
      singleCoin.position.set(...basePos);
      this.coinsGroup.add(singleCoin);
      this.coinMeshes.push(singleCoin);
      this.coinBaseLocalPos.push(basePos);
    }
    coinsWrapper.add(this.coinsGroup);
    this.registerPart('coins', coinsWrapper, [0, 5.4, 0]);
  }

  private buildStressFlows(): void {
    const leftFlexCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.2, 0),
      new THREE.Vector3(-2.5, 0.5, 0),
      new THREE.Vector3(-5.8, 0.25, 0),
      new THREE.Vector3(-7.6, -0.2, 0),
      new THREE.Vector3(-7.6, -3.8, 0),
    ]);
    const rightFlexCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.2, 0),
      new THREE.Vector3(2.5, 0.5, 0),
      new THREE.Vector3(5.8, 0.25, 0),
      new THREE.Vector3(7.6, -0.2, 0),
      new THREE.Vector3(7.6, -3.8, 0),
    ]);

    const tubeMatL = new THREE.MeshBasicMaterial({ color: 0xe11d48, transparent: true, opacity: 0.45 });
    const tubeMatR = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.45 });
    const geoL = new THREE.TubeGeometry(leftFlexCurve, 36, 0.055, 8, false);
    const geoR = new THREE.TubeGeometry(rightFlexCurve, 36, 0.055, 8, false);
    this.flowGroup.add(new THREE.Mesh(geoL, tubeMatL), new THREE.Mesh(geoR, tubeMatR));

    const dotGeo = new THREE.SphereGeometry(0.16, 12, 10);
    const dotMatL = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const dotMatR = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.disposableResources.push(tubeMatL, tubeMatR, geoL, geoR, dotGeo, dotMatL, dotMatR);

    for (let i = 0; i < 4; i++) {
      const mL = new THREE.Mesh(dotGeo, dotMatL);
      const mR = new THREE.Mesh(dotGeo, dotMatR);
      this.flowGroup.add(mL, mR);
      this.flowParticles.push({ mesh: mL, curve: leftFlexCurve, offset: i * 0.25, speed: 0.34 });
      this.flowParticles.push({ mesh: mR, curve: rightFlexCurve, offset: i * 0.25 + 0.12, speed: 0.34 });
    }
  }

  private buildDimensionsGuide(): void {
    this.spanLabelSprite = this.createDimensionSprite('Portée : 18 cm', '#0f172a');
    this.spanLabelSprite.position.set(0, -3.25, 3.0);
    this.widthLabelSprite = this.createDimensionSprite('Largeur ≥ 5 cm', '#1e293b');
    this.widthLabelSprite.position.set(8.8, 1.5, 2.8);
    this.dimensionsGroup.add(this.spanLabelSprite, this.widthLabelSprite);
  }

  public syncBridgeConfiguration(
    deckProfile: DeckProfile,
    reinforcement: ReinforcementType,
    spanCm: 18 | 22,
    coinCount: number,
    deflectionMm: number,
    testStatus: 'idle' | 'running' | 'passed' | 'collapsed',
    coinOffsetCm = 0,
    pillarMismatchMm = 0,
  ): void {
    this.currentDeckProfile = deckProfile;
    this.currentCoinOffsetCm = coinOffsetCm;

    const halfSpan = spanCm === 22 ? 9.1 : 7.4;
    this.leftPillarsGroup.position.x = -halfSpan;
    this.rightPillarsGroup.position.x = halfSpan;
    if (this.spanMarkerMesh) {
      this.spanMarkerMesh.scale.x = spanCm === 22 ? 1.24 : 1.0;
    }
    if (this.rightFrontPillar) {
      this.rightFrontPillar.position.y = -2.0 - pillarMismatchMm * 0.085;
    }

    if (spanCm !== this.currentSpanCm && this.spanLabelSprite) {
      this.currentSpanCm = spanCm;
      this.dimensionsGroup.remove(this.spanLabelSprite);
      this.spanLabelSprite = this.createDimensionSprite(`Portée : ${spanCm} cm`, spanCm === 22 ? '#b45309' : '#0f172a');
      this.spanLabelSprite.position.set(0, -3.25, 3.0);
      this.dimensionsGroup.add(this.spanLabelSprite);
    }

    const showWalls = deckProfile !== 'flat';
    const wallScaleY = deckProfile === 'ufold_tall' ? 1.38 : 1.0;
    if (this.deckLeftWall && this.deckRightWall && this.deckLeftFlange && this.deckRightFlange) {
      this.deckLeftWall.visible = showWalls;
      this.deckRightWall.visible = showWalls;
      this.deckLeftFlange.visible = showWalls;
      this.deckRightFlange.visible = showWalls;

      this.deckLeftWall.scale.y = wallScaleY;
      this.deckRightWall.scale.y = wallScaleY;
      this.deckLeftWall.position.y = 0.625 * wallScaleY;
      this.deckRightWall.position.y = 0.625 * wallScaleY;
      this.deckLeftFlangePivot.position.y = 1.25 * wallScaleY;
      this.deckRightFlangePivot.position.y = 1.25 * wallScaleY;
    }

    this.accordionGroup.visible = reinforcement === 'accordion';
    if (this.flatReinforceMesh) {
      this.flatReinforceMesh.visible = reinforcement === 'flat_sheet';
    }

    this.coinMeshes.forEach((m, idx) => {
      m.visible = idx < coinCount;
      if (!this.isPhysicsActive) {
        const base = this.coinBaseLocalPos[idx];
        m.position.set(base[0], base[1], base[2] + coinOffsetCm * 0.85);
        m.rotation.set(0, 0, 0);
      }
    });

    if (!this.isPhysicsActive) {
      const rawDeflect = testStatus === 'collapsed' ? Math.max(deflectionMm, 38) : deflectionMm;
      this.targetDeflection = THREE.MathUtils.clamp(rawDeflect * 0.065, 0, 2.8);
      // Slight lateral roll if pillar mismatch or off-center load
      this.deckContainer.rotation.x = THREE.MathUtils.clamp(
        coinOffsetCm * 0.04 + pillarMismatchMm * 0.015,
        -0.25,
        0.25,
      );
    }
  }

  private applyOrigamiFold(fold: number): void {
    // 0 = unfolded flat on horizontal plane; 1 = 90deg upright walls + 90deg inward top flange
    const wallTilt = (1 - fold) * (Math.PI * 0.5);
    this.deckLeftPivot.rotation.x = -wallTilt;
    this.deckRightPivot.rotation.x = wallTilt;

    const flangeTilt = (1 - fold) * (Math.PI * 0.45);
    this.deckLeftFlangePivot.rotation.x = -flangeTilt;
    this.deckRightFlangePivot.rotation.x = flangeTilt;
  }

  private applyDeckDeformation(sag: number): void {
    if (this.deckFloorGeo && this.deckFloorBasePos && this.deckFloorColors) {
      const posAttr = this.deckFloorGeo.attributes.position as THREE.BufferAttribute;
      const colAttr = this.deckFloorGeo.attributes.color as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const halfSpan = this.currentSpanCm === 22 ? 9.1 : 7.8;

      for (let i = 0; i < arr.length; i += 3) {
        const bx = this.deckFloorBasePos[i];
        const by = this.deckFloorBasePos[i + 1];
        const normX = THREE.MathUtils.clamp(Math.abs(bx) / halfSpan, 0, 1);
        const curve = Math.cos(normX * Math.PI * 0.5);
        arr[i + 1] = by - sag * curve * curve;

        if (this.showHeatmap) {
          const stress = THREE.MathUtils.clamp(curve * (0.35 + sag * 0.42), 0, 1);
          if (stress < 0.5) {
            _tmpColor.lerpColors(_colorA, _colorB, stress * 2);
          } else {
            _tmpColor.lerpColors(_colorB, _colorC, (stress - 0.5) * 2);
          }
          this.deckFloorColors[i] = _tmpColor.r;
          this.deckFloorColors[i + 1] = _tmpColor.g;
          this.deckFloorColors[i + 2] = _tmpColor.b;
        } else {
          this.deckFloorColors[i] = 1;
          this.deckFloorColors[i + 1] = 1;
          this.deckFloorColors[i + 2] = 1;
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      this.deckFloorGeo.computeVertexNormals();
    }

    if (!this.isPhysicsActive) {
      this.cakeGroup.position.set(0, -sag * 0.95, 0);
      this.cakeGroup.rotation.set(this.currentCoinOffsetCm * 0.03, 0, 0);
      this.coinsGroup.position.set(0, -sag * 0.95, 0);
      this.coinsGroup.rotation.set(0, 0, 0);
    }
  }

  public setTheme(theme: 'dark' | 'light'): void {
    const isDark = theme === 'dark';
    const bgHex = isDark ? 0x0b1220 : 0xf4f1ea;
    this.scene.background = new THREE.Color(bgHex);
    this.scene.fog = new THREE.FogExp2(bgHex, isDark ? 0.013 : 0.011);

    if (this.tableMat) {
      this.tableMat.color.setHex(isDark ? 0x162032 : 0xe7e2d8);
      this.tableMat.roughness = isDark ? 0.82 : 0.9;
      this.tableMat.metalness = isDark ? 0.12 : 0.03;
      this.tableMat.needsUpdate = true;
    }
    if (this.lightGrid) this.lightGrid.visible = !isDark;
    if (this.darkGrid) this.darkGrid.visible = isDark;

    if (this.hemiLight) {
      this.hemiLight.color.setHex(isDark ? 0xe0f2fe : 0xfef3c7);
      this.hemiLight.groundColor.setHex(isDark ? 0x1e293b : 0x94a3b8);
      this.hemiLight.intensity = isDark ? 0.72 : 0.85;
    }
    if (this.keyLight) {
      this.keyLight.intensity = isDark ? 2.25 : 2.1;
    }
    if (this.rimLight) {
      this.rimLight.color.setHex(isDark ? 0x38bdf8 : 0xbae6fd);
      this.rimLight.intensity = isDark ? 1.45 : 1.15;
    }
    this.renderer.toneMappingExposure = isDark ? 1.02 : 1.06;
  }

  public setShowFlows(visible: boolean): void {
    this.flowGroup.visible = visible;
  }

  public setShowStressHeatmap(enabled: boolean): void {
    this.showHeatmap = enabled;
    this.paperMat.vertexColors = enabled;
    this.paperMat.needsUpdate = true;
    this.applyDeckDeformation(this.currentDeflection);
  }

  public setXrayDeck(enabled: boolean): void {
    this.paperMat.transparent = enabled;
    this.paperMat.opacity = enabled ? 0.34 : 1.0;
    this.paperMat.depthWrite = !enabled;
    this.paperMat.needsUpdate = true;

    this.paperEdgeMat.transparent = enabled;
    this.paperEdgeMat.opacity = enabled ? 0.42 : 1.0;
    this.paperEdgeMat.needsUpdate = true;
  }

  public setShowDimensions(enabled: boolean): void {
    this.dimensionsGroup.visible = enabled;
  }

  public setFoldProgress(percent: number): void {
    this.targetFold = THREE.MathUtils.clamp(percent / 100, 0, 1);
  }

  public updateCulturalBranding(
    theme: CulturalTheme3D,
    kenyaText: string,
    nigeriaText: string,
  ): void {
    const kSub = kenyaText.trim() ? kenyaText.trim().split('(')[0] : 'Mandazi · Cardamome';
    const nSub = nigeriaText.trim() ? nigeriaText.trim().split('(')[0] : 'Chin Chin · Zobo';

    if (this.cakePlaqueKenya) {
      const mat = this.cakePlaqueKenya.material as THREE.MeshStandardMaterial;
      mat.map = this.createBannerTexture('KENYA', kSub, ['#111827', '#bb0000', '#006600'], 'diamonds');
      mat.needsUpdate = true;
    }
    if (this.cakePlaqueNigeria) {
      const mat = this.cakePlaqueNigeria.material as THREE.MeshStandardMaterial;
      mat.map = this.createBannerTexture('NIGERIA', nSub, ['#008751', '#ffffff', '#008751'], 'waves');
      mat.needsUpdate = true;
    }
    if (this.ribMat) {
      this.ribMat.color.setHex(
        theme === 'kenya' ? 0xb91c1c : theme === 'nigeria' ? 0x059669 : 0xd97706,
      );
    }
  }

  public async startPhysicsDrop(cfg: PhysicsBridgeConfig): Promise<void> {
    this.isPhysicsActive = true;
    this.lastPhysicsResult = 'running';
    this.callbacks.onPhysicsUpdate?.('running', 'Initialisation physique Jolt WASM…');
    try {
      await this.physicsWorld.startDropSimulation(cfg);
      this.callbacks.onPhysicsUpdate?.('running', 'Chute physique Jolt active…');
    } catch {
      this.isPhysicsActive = false;
      this.callbacks.onPhysicsUpdate?.('idle', 'Erreur initialisation Jolt WASM');
    }
  }

  public resetPhysicsDrop(): void {
    this.isPhysicsActive = false;
    this.lastPhysicsResult = 'idle';
    this.physicsWorld.clearBodies();
    this.cakeGroup.position.set(0, 0, 0);
    this.cakeGroup.rotation.set(0, 0, 0);
    this.coinsGroup.position.set(0, 0, 0);
    this.coinsGroup.rotation.set(0, 0, 0);
    this.coinMeshes.forEach((m, idx) => {
      const b = this.coinBaseLocalPos[idx];
      m.position.set(b[0], b[1], b[2] + this.currentCoinOffsetCm * 0.85);
      m.rotation.set(0, 0, 0);
    });
    this.applyDeckDeformation(this.targetDeflection);
    this.callbacks.onPhysicsUpdate?.('idle', 'Maquette réinitialisée');
  }

  public setIsolateStructure(isolate: boolean): void {
    const cakeEntry = this.partGroups['cake'];
    const coinsEntry = this.partGroups['coins'];
    if (cakeEntry) cakeEntry.group.visible = !isolate;
    if (coinsEntry) coinsEntry.group.visible = !isolate;
  }

  public setExplodeFactor(factor: number): void {
    this.targetExplode = THREE.MathUtils.clamp(factor, 0, 1);
  }

  public setCameraPreset(preset: BridgeCameraPreset): void {
    const cfg = CAMERA_PRESETS[preset];
    this.camTargetPos.set(...cfg.pos);
    this.camLookTarget.set(...cfg.target);
    this.isCameraTransitioning = true;
  }

  public captureSnapshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public captureExplodedSnapshot(): string {
    const prevExplode = this.currentExplode;
    for (const key of Object.keys(this.partGroups)) {
      const item = this.partGroups[key];
      item.group.position.copy(item.basePos).add(item.explodeOffset);
    }
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    for (const key of Object.keys(this.partGroups)) {
      const item = this.partGroups[key];
      _vec3.copy(item.explodeOffset).multiplyScalar(prevExplode);
      item.group.position.copy(item.basePos).add(_vec3);
    }
    this.renderer.render(this.scene, this.camera);
    return dataUrl;
  }

  private handleClick = (event: MouseEvent): void => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.clickableMeshes, false);
    if (hits.length > 0) {
      const key = hits[0].object.userData.partKey as string | undefined;
      if (key && this.callbacks.onSelectPart) {
        this.callbacks.onSelectPart(key);
      }
    }
  };

  private handlePointerMove = (event: MouseEvent): void => {
    const now = performance.now();
    if (now - this.lastHoverCheck < 50) return;
    this.lastHoverCheck = now;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.clickableMeshes, false);
    this.renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
  };

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
    this.callbacks.onContextLost?.(true);
  };

  private handleContextRestored = (): void => {
    this.callbacks.onContextLost?.(false);
  };

  private handleResize(): void {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth, 320);
    const height = Math.max(this.container.clientHeight, 320);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private startLoop(): void {
    const tick = () => {
      if (this.disposed) return;
      const dt = Math.min(this.clock.getDelta(), 0.1);

      // Step JoltPhysics when active
      if (this.isPhysicsActive) {
        const snap = this.physicsWorld.step(dt);
        if (snap) {
          this.currentDeflection = THREE.MathUtils.clamp(snap.centerSag * 1.4, 0, 3.6);
          this.applyDeckDeformation(this.currentDeflection);

          // Apply real cake & coin rigid body transforms (cake Jolt center is +1.48 above base)
          this.cakeGroup.quaternion.set(
            snap.cakeQuat[0],
            snap.cakeQuat[1],
            snap.cakeQuat[2],
            snap.cakeQuat[3],
          );
          _vec3.set(0, -1.48, 0).applyQuaternion(this.cakeGroup.quaternion);
          this.cakeGroup.position.set(
            snap.cakePos[0] + _vec3.x,
            snap.cakePos[1] + _vec3.y,
            snap.cakePos[2] + _vec3.z,
          );

          snap.coinTransforms.forEach((ct, i) => {
            const coin = this.coinMeshes[i];
            if (coin) {
              coin.position.set(ct.pos[0], ct.pos[1], ct.pos[2]);
              coin.quaternion.set(ct.quat[0], ct.quat[1], ct.quat[2], ct.quat[3]);
            }
          });

          if (snap.result !== this.lastPhysicsResult) {
            this.lastPhysicsResult = snap.result;
            this.callbacks.onPhysicsUpdate?.(snap.result, snap.statusLabel);
          }
        }
      } else {
        if (Math.abs(this.currentDeflection - this.targetDeflection) > 0.001) {
          this.currentDeflection = THREE.MathUtils.damp(
            this.currentDeflection,
            this.targetDeflection,
            8,
            dt,
          );
          this.applyDeckDeformation(this.currentDeflection);
        }
      }

      // Smooth origami fold animation
      if (Math.abs(this.currentFold - this.targetFold) > 0.001) {
        this.currentFold = THREE.MathUtils.damp(this.currentFold, this.targetFold, 8, dt);
        this.applyOrigamiFold(this.currentFold);
      }

      // Smooth exponential damping on exploded view
      if (Math.abs(this.currentExplode - this.targetExplode) > 0.001) {
        this.currentExplode = THREE.MathUtils.damp(this.currentExplode, this.targetExplode, 7, dt);
        for (const key of Object.keys(this.partGroups)) {
          const item = this.partGroups[key];
          _vec3.copy(item.explodeOffset).multiplyScalar(this.currentExplode);
          item.group.position.copy(item.basePos).add(_vec3);
        }
      }

      // Smooth camera transition
      if (this.isCameraTransitioning) {
        const lambda = 6.5;
        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.camTargetPos.x, lambda, dt);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.camTargetPos.y, lambda, dt);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.camTargetPos.z, lambda, dt);
        this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.camLookTarget.x, lambda, dt);
        this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.camLookTarget.y, lambda, dt);
        this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.camLookTarget.z, lambda, dt);

        if (
          this.camera.position.distanceTo(this.camTargetPos) < 0.04 &&
          this.controls.target.distanceTo(this.camLookTarget) < 0.04
        ) {
          this.isCameraTransitioning = false;
        }
      }

      if (this.flowGroup.visible) {
        const elapsed = this.clock.elapsedTime;
        for (const fp of this.flowParticles) {
          const t = (elapsed * fp.speed + fp.offset) % 1;
          fp.curve.getPointAt(t, _vec3);
          fp.mesh.position.copy(_vec3);
        }
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(() => {
          if (!this.disposed) this.frameId = requestAnimationFrame(tick);
        });
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };
    this.frameId = requestAnimationFrame(tick);
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl.fenceSync) {
      window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        window.setTimeout(cb, 80);
      }
    };
    window.setTimeout(poll, 5);
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.physicsWorld.dispose();
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener('click', this.handleClick);
    this.renderer.domElement.removeEventListener('pointermove', this.handlePointerMove);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);
    this.controls.dispose();
    this.pmremGenerator.dispose();
    for (const res of this.disposableResources) {
      res.dispose();
    }
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
