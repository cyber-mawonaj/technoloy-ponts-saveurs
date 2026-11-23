# Rapport de passation technique et pédagogique — Application web « Lunettes connectées à l'IA » (Cycle 4)

Ce document synthétise les objectifs pédagogiques, les invariants métier, l'architecture logicielle actuelle et la feuille de route d'amélioration de l'application web **« Lunettes connectées à l'IA »** (TechnoLOY — Technologie Cycle 4, Guadeloupe). Il est conçu pour permettre à un autre LLM ou développeur de reprendre le projet sans perte de contexte ni régression fonctionnelle.

---

## 1. Finalité et contexte pédagogique du projet

L'application accompagne un kit pédagogique complet (v1.0 consolidée et v2.1 fusionnée) destiné aux enseignants et aux élèves de **5e, 4e et 3e** dans le cadre du **programme officiel de Technologie du Cycle 4 (BO n° 9 du 29 février 2024, MENE2402802A)**.

* **Fil conducteur (situation-problème unique sur 3 ans)** : Monsieur Loyalle, dirigeant d'une entreprise fictive de voitures volantes hybrides, confie aux élèves (en posture d'ingénieurs) la conception d'un prototype de lunettes connectées apportant une aide visuelle et auditive aux ouvriers des sections fabrication et réparation.


* **Double public** :
* **Élèves (collège France / Guadeloupe)** : manipuler, simuler des circuits et capteurs, tester des logiques par blocs, observer des échanges réseau MQTT, compléter des fiches imprimables en A4 et réviser le cycle 4.


* **Enseignants (souvent non spécialistes réseau/Linux)** : disposer d'un guide pas à pas prêt à l'emploi (fiches T1 à T15), de commandes copiables en un clic pour Windows 11 / PuTTY / Thonny, de tableaux comparatifs de matériel et des corrigés expliqués.





### Progression spiralaire couverte par l'application

| Niveau | Durée | Sous-problématique élève | Compétences & activités clés | Matériel de référence |
| --- | --- | --- | --- | --- |
| **5e** | 4 × 55 min

 | Faire fonctionner un premier prototype et alerter un ouvrier.

 | Identifier les 8 fonctions (*teardown*) et interacteurs ; monter la maquette ; modifier un seuil de luminosité (50 → 80) en blocs ; réparer une panne simple (fil du buzzer débranché).

 | `micro:bit V2` + `Shield Grove` (capteur luminosité, LED, buzzer) ; endoscope USB-C en observation collective.

 |
| **4e** | 5 × 55 min

 | Ajouter une alerte de sécurité automatique et relier le prototype au réseau.

 | Chaîne d'information (*acquérir, traiter, communiquer, restituer*) ; distinction information/énergie ; comparatif `ESP32-CAM` vs endoscope ; découverte MQTT ; protocole de dépannage méthodique.

 | `micro:bit` (maquette blocs) ; nœuds Wi-Fi préprogrammés (`ESP32-C3`, `ESP-12F/OLED`, `Pico W`) ; `Raspberry Pi 400` (broker Mosquitto).

 |
| **3e** | 6 × 55 min

 | Faire dialoguer les lunettes avec le service de décision du serveur de l'atelier.

 | Cahier des charges ; comparaison d'architectures (A vs B) ; algorithme ; IHM structurée en blocs personnalisés (`VEILLE`, `FABRICATION`, `REPARATION`, `ALERTE`/`RAS`) ; protocole de 5 essais (délai moyen, taux de réussite) ; critique de l'IA (faux positifs, faux négatifs, biais).

 | Idem 4e + script serveur de décision simulée (`T14 — ia_atelier.py`) ; console `PuTTY` en observation.

 |

---

## 2. Invariants pédagogiques et contraintes métier (règles à ne jamais enfreindre)

Tout LLM qui fait évoluer cette application doit impérativement respecter les règles suivantes issues des décisions d'architecture du kit :

1. **Programmation élève exclusivement par blocs** : les élèves travaillent uniquement en blocs (`mBlock` ou `MakeCode` en plan B) et ne saisissent jamais de code MicroPython. Le MicroPython ne doit apparaître qu'en **équivalent de lecture** (repliable ou annoté « lecture enseignant »).


2. **Honnêteté technique sur l'IA** : le script serveur `T14` (`if distance < seuil`) est une **règle de décision automatique simulée**, jamais une véritable IA. L'interface doit maintenir cette distinction explicite.


3. **Séparation stricte des rôles matériels** :
* Le **Raspberry Pi 400** (point d'accès / broker Mosquitto / script T14) est réservé à l'enseignant.


* Les cartes Wi-Fi (`ESP32`, `ESP32-C3`, `ESP-12F/ESP8266`, `Pico W`) sont des **nœuds préprogrammés par l'enseignant** ; seule la `micro:bit` est la cible de programmation par blocs des élèves.


* Mentionner les mises en garde matérielles : l'`ESP8266EX` est en fin de vie (*not recommended for new designs*) et l'indice `IP67` ou la prise USB-C d'un endoscope ne garantissent pas la norme `UVC`.




4. **Coexistence maîtrisée des deux variantes d'architecture (v1.0 vs v2.1)** :
* **Réseau** : l'application doit permettre de basculer entre le **point d'accès dédié isolé `ReseauAtelier**` en bande 2,4 GHz forcée (`10.42.0.1` via `nmcli` ou `192.168.4.1` via `hostapd`, fiche T3bis v2.1) et le **réseau local de la salle** (`192.168.1.50`, décision D1 v1.0).


* **Topics MQTT** : bascule entre `atelier/poste1/*` (v2.1) et `atelier/lunettes/*` (v1.0).




5. **Sécurité et droit à l'image** : alimentation 5 V USB uniquement, maquette non certifiée EPI, port MQTT `1883` strictement local avec `allow_anonymous false`, aucun mot de passe réel en clair dans les vues ou impressions destinées aux élèves.


6. **Différenciation EBEP (Dys, dyspraxie, TDAH, TSA, UPE2A)** : mode d'accessibilité intégré (police sans empattement agrandie, interligne aéré, contraste élevé, réduction de la charge cognitive, mode silencieux pour le buzzer).


7. **Zéro perte de données & impression A4** :
* Fiche d'identité élève séparant le **Niveau scolaire** (menu déroulant `5e` / `4e` / `3e` qui pilote l'affichage des activités) et la **Classe** (champ texte libre) + Nom, Prénom, Groupe, Date.
* Sauvegarde automatique continue en local (`localStorage`) pour éviter tout stress lié à un rechargement accidentel sur PC ou smartphone.
* Mise en page `@media print` au format **A4** sans coupure d'éléments.



---

## 3. Architecture technique actuelle et choix de librairies

L'application est conçue comme un **fichier HTML autonome** (utilisable en local sur les postes Windows 11 du collège ou hébergé sur le serveur web local du Raspberry Pi 400 sur le port `8080`, fiche T4).

### Stack validée (après retours terrain)

| Librairie / Techno | Rôle dans l'application | Justification du choix |
| --- | --- | --- |
| **Three.js (r128)** | Vue 3D procédurale haute précision des lunettes et de la maquette (`micro:bit V2`, matrice 5×5 SMD, broches dorées, `Shield Grove`, prises JST à détrompeurs, `ESP32-CAM`, capteurs, buzzer, overlay AR). | Rendu 3D fidèle, léger, sans dépendance à des fichiers `.glb` bloqués par CORS en mode `file://`. |
| **SVG natif** | 1) Banc de câblage électronique interactif (Module 2).<br>

<br>2) Dessin technique en 3 vues normalisées avec cartouche NF EN ISO 7200 (Module 1). | Remplace **PixiJS** (retiré suite à des bugs d'écran noir WebGL sur certains postes). Garantit une netteté vectorielle parfaite à l'écran et à l'impression PDF A4. |
| **Cytoscape.js (v3.28.1)** | 1) Algorigrammes / logigrammes dynamiques réactifs aux capteurs (Module 2).<br>

<br>2) Topologie réseau local & flux MQTT animés (Module 3). | Remplace **d3-org-chart** (retiré). Une seule librairie de graphes robuste pour les organigrammes logiques et les architectures réseau. |
| **Web Audio API** | Synthèse sonore des bips du buzzer piézoélectrique. | Zéro dépendance externe, contrôle instantané du volume et coupure en mode EBEP. |
| **Tailwind CSS** | Mise en forme responsive (PC, tablette, smartphone), thème EBEP et règles d'impression. | Développement rapide et cohérent sans fichier CSS séparé. |

### Cartographie des 7 onglets fonctionnels

1. **Découverte & Teardown 3D** : fil rouge de M. Loyalle, scène `Three.js` (modes assemblé/éclaté, 4 zooms macro, simulation AR, test d'alerte 3D), tableau interactif des 8 fonctions du poster et **dessin technique en 3 vues avec cartouche** synchronisé avec l'identité de l'élève (options : vue d'ensemble, vue éclatée, dessins de définition des composants).


2. **Labo Électronique, Blocs & Logigramme** : banc de câblage SVG interactif (changement de carte par niveau, curseurs de luminosité/distance, simulation de panne du buzzer au clic), blocs `mBlock` paramétrables, équivalent MicroPython repliable, algorigramme `Cytoscape.js` surlignant la branche active en temps réel, et passerelles vers des simulateurs externes (`Velxio`, `Bredbord`).
3. **Réseau, MQTT & IA** : sélecteur d'architecture réseau (`AP 10.42.0.1` vs `LAN 192.168.1.50`) et de convention de topics, graphe réseau `Cytoscape.js`, double console interactive **PuTTY (SSH/Broker) + CMD Windows/DOS** exécutant la règle `T14`, **fiche récapitulative Mosquitto MQTT (M. Rousset — Lycée Charles Coeffin, Baie-Mahault)** et tableur de protocole d'essais 3e (calcul automatique de la moyenne des délais et du taux de réussite).


4. **Fiches Élèves (5e / 4e / 3e)** : activités complètes à remplir en ligne avec persistance, auto-évaluation et interrupteur « Mode Corrigé Enseignant ».


5. **Comparatifs Matériel & Logiciels** : tableaux comparatifs (caméras, 6 cartes programmables, 4 logiciels) alignés sur le kit consolidé.


6. **Guide Enseignant (T1 à T15)** : tutoriels pas à pas avec boutons de copie sécurisés, checklist de préparation `T13` et dépannage rapide.


7. **Révision Technologie Cycle 4** : accès direct vers les ressources officielles de l'Académie de Bordeaux (`[https://sequences.sti-ac-bordeaux.fr/#ressources](https://sequences.sti-ac-bordeaux.fr/#ressources)`), synthèse des 3 thèmes du BO 2024 et glossaire interactif filtrable.



---

## 4. Feuille de route et pistes d'amélioration pour le prochain LLM

Pour faire passer l'application d'un prototype pédagogique fonctionnel à un outil de référence durable en laboratoire de technologie, voici les axes d'évolution prioritaires :

### A. Simulation électronique réelle et CAO PCB

* **Câblage fil-à-fil avec vérification électrique** : faire évoluer le banc SVG actuel vers un véritable espace de câblage inspiré de **Bredbord** (`[github.com/qs-1/bredbord](https://github.com/qs-1/bredbord)`) ou **Velxio** (`[github.com/davidmonterocrespo24/velxio](https://github.com/davidmonterocrespo24/velxio)`), permettant à l'élève de brancher lui-même les fils Grove/GPIO et de détecter automatiquement les erreurs réelles (fil inversé entrée/sortie, court-circuit 5V/GND, mauvais port analogique/numérique).
* **Intégration de schémas normalisés LibrePCB** : exploiter des exports SVG/schémas issus de **LibrePCB** (`[github.com/LibrePCB/LibrePCB](https://github.com/LibrePCB/LibrePCB)`) pour les dessins de définition électronique et le brochage exact des cartes (`ESP32-C3`, `ESP-12F + OLED I2C`, `Pico W`).



### B. Éditeur de blocs interactif (Blockly)

* Remplacer les blocs `mBlock` actuellement représentés en HTML paramétrable par une instance légère de **Google Blockly** : l'élève assemble réellement ses blocs (`SI`, `<`, `seuil`, `LED`, `buzzer`), ce qui met à jour dynamiquement l'exécution sur le circuit SVG, le chemin actif dans l'algorigramme `Cytoscape.js` et le panneau de lecture MicroPython.

### C. Modèles 3D hybrides (Procédural + `.glb`)

* Conserver la génération procédurale `Three.js` en mode hors-ligne par défaut, mais ajouter un chargeur optionnel **`GLTFLoader` + `DRACOLoader**` capable de charger les vrais modèles CAO (`.glb` issus de KiCad/FreeCAD/Seeed Studio) lorsque l'application est servie depuis le Raspberry Pi 400 (`[http://10.42.0.1:8080/models/](http://10.42.0.1:8080/models/)`).



### D. Enrichissement du module Réseau / MQTT

* **Intégration complète de la fiche M. Rousset (Lycée Charles Coeffin)** : dès réception du document source par l'utilisateur, aligner mot pour mot les exemples de commandes Windows/DOS (`mosquitto_pub.exe`, `mosquitto_sub.exe`, options `-h`, `-p`, `-t`, `-m`, `-u`, `-P`, `-v`, `-r`) et les scénarios d'expérimentation dans le simulateur de terminal.
* **Connexion WebSocket réelle (option enseignant)** : ajouter un mode optionnel *« Broker réel »* (via `mqtt.js` sur WebSocket port `9001` de Mosquitto) permettant à l'application projetée au tableau d'afficher en direct les vrais messages envoyés par les cartes `ESP32` / `Pico W` des élèves en salle.

### E. Qualité logicielle, impression PDF et export enseignant

* **Pagination A4 stricte** : injecter automatiquement le bandeau d'identité élève (Nom, Prénom, Niveau, Classe, Groupe, Date) en haut de chaque page A4 imprimée et vérifier avec des tests CSS que les graphes `Cytoscape.js` et la vue `Three.js` sont convertis en images statiques (`toDataURL()`) juste avant `window.print()`.
* **Export de rendu élève** : ajouter un bouton permettant à l'élève d'exporter son travail (réponses, mesures 3e, captures) en un fichier JSON ou PDF unique à déposer sur l'ENT / Pronote.
* **Industrialisation du code** : si l'application continue de grossir, migrer le fichier monolithique vers une architecture modulaire (par exemple **Svelte + Vite + `vite-plugin-singlefile**`) afin de conserver un livrable final en un seul fichier HTML tout en éliminant les risques de régressions de syntaxe (`SyntaxError`, `ReferenceError`) grâce au typage et aux tests automatisés (Playwright).

---

## 5. Bloc de reprise rapide (à copier-coller pour le prochain LLM)

```text
Contexte : Tu reprends le développement de l'application web éducative « Lunettes connectées à l'IA » (TechnoLOY — Technologie Cycle 4, 5e/4e/3e, France / Guadeloupe, BO n° 9 du 29/02/2024).

Règles métier strictes :
1. Les élèves programment exclusivement par blocs (mBlock / MakeCode), jamais en MicroPython (qui reste en lecture seule).
2. Seule la carte micro:bit V2 + Shield Grove est cible de programmation élève ; les cartes Wi-Fi (ESP32, ESP32-C3, ESP-12F/ESP8266, Pico W) et le Raspberry Pi 400 (broker Mosquitto + script T14) sont préparés par l'enseignant.
3. Le script serveur T14 est une décision automatique simulée (règle de seuil), jamais présentée comme une vraie IA.
4. Maintenir la bascule entre AP dédié ReseauAtelier (10.42.0.1, 2,4 GHz forcé) / LAN salle (192.168.1.50) et topics atelier/poste1/* ou atelier/lunettes/*.
5. Conserver la fiche élève persistante (localStorage) avec Niveau scolaire séparé de la Classe libre, le mode EBEP (Dys/TSA/silencieux) et l'impression A4 propre.

Contraintes techniques :
- Librairies autorisées : Three.js, Cytoscape.js, SVG natif, Tailwind CSS, Web Audio API (et éventuellement Blockly, Velxio, Bredbord, schémas LibrePCB).
- Librairies retirées (ne pas réintroduire) : PixiJS, d3-org-chart.
- Vérifier systématiquement l'absence d'erreurs JS (SyntaxError / ReferenceError) et le rendu visuel de chaque onglet avant de livrer.

Objectif de cette session : [Décrire ici l'amélioration précise souhaitée parmi la feuille de route].

```

Ce rapport et ce bloc de passation regroupent l'ensemble des choix pédagogiques, techniques et ergonomiques validés jusqu'ici afin que toute reprise par un autre LLM reste strictement alignée avec les attentes du créateur du kit et les contraintes du collège.
