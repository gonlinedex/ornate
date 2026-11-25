import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { BUSINESS_INFO, HERO_MEDIA } from '../data/ornateCatalog';
import { HeroScrollworkCorner } from './IronworkMotifs';

type FinishId = 'graphite' | 'obsidian' | 'pewter';

interface FinishPreset {
  id: FinishId;
  label: string;
  swatch: string;
  frameColor: number;
  frameRoughness: number;
  frameMetalness: number;
  scrollColor: number;
  scrollRoughness: number;
  scrollMetalness: number;
}

const FINISH_PRESETS: Record<FinishId, FinishPreset> = {
  graphite: {
    id: 'graphite',
    label: 'Graphite Satin',
    swatch: '#2A313A',
    frameColor: 0x1e242c,
    frameRoughness: 0.56,
    frameMetalness: 0.86,
    scrollColor: 0x454f5b,
    scrollRoughness: 0.24,
    scrollMetalness: 0.94,
  },
  obsidian: {
    id: 'obsidian',
    label: 'Forged Obsidian',
    swatch: '#14171B',
    frameColor: 0x121519,
    frameRoughness: 0.64,
    frameMetalness: 0.78,
    scrollColor: 0x2c333c,
    scrollRoughness: 0.28,
    scrollMetalness: 0.9,
  },
  pewter: {
    id: 'pewter',
    label: 'Brushed Pewter',
    swatch: '#57626E',
    frameColor: 0x353d47,
    frameRoughness: 0.48,
    frameMetalness: 0.9,
    scrollColor: 0x7b8794,
    scrollRoughness: 0.2,
    scrollMetalness: 0.96,
  },
};

// Scratch objects pre-allocated outside animation loops (Zero GC in rAF)
const _dummy = new THREE.Object3D();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
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

function createForgedIronMaps(maxAnisotropy: number) {
  const size = 256;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Subtle hammered iron peen marks + brushed vertical grain
  for (let i = 0; i < 650; i++) {
    const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * size;
    const y = (Math.sin(i * 78.233) * 0.5 + 0.5) * size;
    const r = 1.5 + ((i * 17) % 6);
    const v = 108 + ((i * 31) % 38);
    bCtx.fillStyle = `rgb(${v},${v},${v})`;
    bCtx.beginPath();
    bCtx.arc(x, y, r, 0, Math.PI * 2);
    bCtx.fill();
  }
  bCtx.strokeStyle = 'rgba(210,210,210,0.08)';
  bCtx.lineWidth = 1;
  for (let x = 0; x < size; x += 3) {
    bCtx.beginPath();
    bCtx.moveTo(x, 0);
    bCtx.lineTo(x, size);
    bCtx.stroke();
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 6);
  bumpMap.anisotropy = maxAnisotropy;

  return { bumpMap };
}

function createLimestoneMaps(maxAnisotropy: number) {
  const size = 256;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const ctx = albedoCanvas.getContext('2d')!;

  ctx.fillStyle = '#3b4148';
  ctx.fillRect(0, 0, size, size);

  // Subtle dressed limestone blocks & mineral grain
  const rows = 4;
  const rowH = size / rows;
  for (let r = 0; r < rows; r++) {
    const shade = 52 + ((r * 7) % 12);
    ctx.fillStyle = `rgb(${shade},${shade + 4},${shade + 9})`;
    ctx.fillRect(0, r * rowH + 2, size, rowH - 3);
    ctx.fillStyle = '#20252b';
    ctx.fillRect(0, r * rowH, size, 2);
  }
  for (let i = 0; i < 1200; i++) {
    const x = ((i * 73) % size);
    const y = ((i * 197) % size);
    const tone = 44 + ((i * 29) % 30);
    ctx.fillStyle = `rgba(${tone},${tone + 3},${tone + 6},0.28)`;
    ctx.fillRect(x, y, 2, 2);
  }

  const colorMap = new THREE.CanvasTexture(albedoCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(1, 2);
  colorMap.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(albedoCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(1, 2);
  bumpMap.anisotropy = maxAnisotropy;

  return { colorMap, bumpMap };
}

function createSeamGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const gradX = ctx.createLinearGradient(0, 0, 64, 0);
  gradX.addColorStop(0, 'rgba(227, 234, 241, 0)');
  gradX.addColorStop(0.38, 'rgba(214, 224, 236, 0.28)');
  gradX.addColorStop(0.5, 'rgba(248, 244, 234, 0.96)');
  gradX.addColorStop(0.62, 'rgba(214, 224, 236, 0.28)');
  gradX.addColorStop(1, 'rgba(227, 234, 241, 0)');
  ctx.fillStyle = gradX;
  ctx.fillRect(0, 0, 64, 256);

  // Soft vertical fade top & bottom
  ctx.globalCompositeOperation = 'destination-in';
  const gradY = ctx.createLinearGradient(0, 0, 0, 256);
  gradY.addColorStop(0, 'rgba(255,255,255,0)');
  gradY.addColorStop(0.12, 'rgba(255,255,255,0.95)');
  gradY.addColorStop(0.88, 'rgba(255,255,255,0.95)');
  gradY.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradY;
  ctx.fillRect(0, 0, 64, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(5, 8, 12, 0.72)');
  grad.addColorStop(0.55, 'rgba(5, 8, 12, 0.34)');
  grad.addColorStop(1, 'rgba(5, 8, 12, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/**
 * Evaluates the sweeping architectural arch height for a gate leaf where
 * u = 0 is the outer hinge stile and u = 1 is the center meeting stile.
 */
function archHeightAt(u: number): number {
  const outerH = 2.52;
  const centerPeak = 3.24;
  // Graceful S-curve arch rising smoothly toward the central meeting stiles
  const eased = u * u * (3 - 2 * u);
  return outerH + (centerPeak - outerH) * eased;
}

/**
 * Builds one ornate wrought-iron gate leaf rooted at local x = 0 (hinge barrel)
 * extending along +X (dir = +1 for left leaf) or -X (dir = -1 for right leaf).
 */
function buildGateLeaf(
  dir: 1 | -1,
  leafWidth: number,
  frameMat: THREE.MeshPhysicalMaterial,
  scrollMat: THREE.MeshPhysicalMaterial,
  finialGeo: THREE.LatheGeometry,
  collarGeo: THREE.SphereGeometry,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const leaf = new THREE.Group();
  const outerH = archHeightAt(0);
  const innerH = archHeightAt(1);
  const frameDepth = 0.085;
  const stileW = 0.095;
  const midX = dir * (leafWidth * 0.5);

  // 1. Outer hanging stile (at hinge axis x = dir * 0.05)
  const outerStileGeo = new THREE.BoxGeometry(stileW, outerH, frameDepth);
  disposables.push(outerStileGeo);
  const outerStile = new THREE.Mesh(outerStileGeo, frameMat);
  outerStile.position.set(dir * (stileW * 0.5), outerH * 0.5 + 0.08, 0);
  outerStile.castShadow = true;
  outerStile.receiveShadow = true;
  leaf.add(outerStile);

  // 2. Inner meeting stile (tallest vertical edge at x = dir * leafWidth)
  const innerStileGeo = new THREE.BoxGeometry(stileW, innerH, frameDepth);
  disposables.push(innerStileGeo);
  const innerStile = new THREE.Mesh(innerStileGeo, frameMat);
  innerStile.position.set(dir * (leafWidth - stileW * 0.5), innerH * 0.5 + 0.08, 0);
  innerStile.castShadow = true;
  innerStile.receiveShadow = true;
  leaf.add(innerStile);

  // 3. Bottom structural rail + bevelled forged kickplate panel
  const bottomRailGeo = new THREE.BoxGeometry(leafWidth, 0.1, frameDepth);
  disposables.push(bottomRailGeo);
  const bottomRail = new THREE.Mesh(bottomRailGeo, frameMat);
  bottomRail.position.set(midX, 0.13, 0);
  bottomRail.castShadow = true;
  leaf.add(bottomRail);

  // Recessed kickplate panel (extruded with crisp bevel)
  const kickW = leafWidth - stileW * 2 - 0.04;
  const kickH = 0.54;
  const kickShape = new THREE.Shape();
  kickShape.moveTo(-kickW / 2, -kickH / 2);
  kickShape.lineTo(kickW / 2, -kickH / 2);
  kickShape.lineTo(kickW / 2, kickH / 2);
  kickShape.lineTo(-kickW / 2, kickH / 2);
  kickShape.closePath();

  const kickGeo = new THREE.ExtrudeGeometry(kickShape, {
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
  });
  kickGeo.center();
  disposables.push(kickGeo);
  const kickPanel = new THREE.Mesh(kickGeo, frameMat);
  kickPanel.position.set(midX, 0.48, 0);
  kickPanel.castShadow = true;
  kickPanel.receiveShadow = true;
  leaf.add(kickPanel);

  // Mid lock rail & decorative frieze rails
  const railHeights = [0.8, 1.08, 2.08];
  const railGeo = new THREE.BoxGeometry(leafWidth - stileW * 0.8, 0.055, frameDepth * 0.78);
  disposables.push(railGeo);
  for (const ry of railHeights) {
    const rail = new THREE.Mesh(railGeo, frameMat);
    rail.position.set(midX, ry, 0);
    rail.castShadow = true;
    leaf.add(rail);
  }

  // 4. Sweeping double arched top rail (TubeGeometry along smooth arch curve)
  const archPtsUpper: THREE.Vector3[] = [];
  const archPtsLower: THREE.Vector3[] = [];
  const samples = 24;
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const x = dir * (stileW * 0.4 + u * (leafWidth - stileW * 0.8));
    const y = archHeightAt(u) + 0.06;
    archPtsUpper.push(new THREE.Vector3(x, y, 0));
    archPtsLower.push(new THREE.Vector3(x, y - 0.24, 0));
  }
  const upperCurve = new THREE.CatmullRomCurve3(archPtsUpper);
  const lowerCurve = new THREE.CatmullRomCurve3(archPtsLower);

  const upperArchGeo = new THREE.TubeGeometry(upperCurve, 32, 0.036, 10, false);
  const lowerArchGeo = new THREE.TubeGeometry(lowerCurve, 32, 0.022, 8, false);
  disposables.push(upperArchGeo, lowerArchGeo);

  const upperArch = new THREE.Mesh(upperArchGeo, frameMat);
  upperArch.castShadow = true;
  const lowerArch = new THREE.Mesh(lowerArchGeo, scrollMat);
  leaf.add(upperArch, lowerArch);

  // 5. Instanced vertical forged pickets + turned spearhead finials + forged collars
  const picketCount = 11;
  const picketBaseGeo = new THREE.BoxGeometry(0.026, 1, 0.026);
  disposables.push(picketBaseGeo);
  const picketInst = new THREE.InstancedMesh(picketBaseGeo, frameMat, picketCount);
  picketInst.castShadow = true;

  const finialInst = new THREE.InstancedMesh(finialGeo, scrollMat, picketCount);
  const collarInst = new THREE.InstancedMesh(collarGeo, scrollMat, picketCount * 2);

  let collarIdx = 0;
  for (let i = 0; i < picketCount; i++) {
    const u = (i + 1) / (picketCount + 1);
    const x = dir * (stileW + u * (leafWidth - stileW * 2));
    const topY = archHeightAt(u) + 0.05;
    const botY = 0.8;
    const h = topY - botY;

    _dummy.position.set(x, botY + h * 0.5, 0);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.set(1, h, 1);
    _dummy.updateMatrix();
    picketInst.setMatrixAt(i, _dummy.matrix);

    // Turned forged finial rising above the top arch rail
    _dummy.position.set(x, topY + 0.04, 0);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    finialInst.setMatrixAt(i, _dummy.matrix);

    // Decorative forged collars at frieze band
    _dummy.position.set(x, 0.94, 0);
    _dummy.scale.set(1, 0.72, 1);
    _dummy.updateMatrix();
    collarInst.setMatrixAt(collarIdx++, _dummy.matrix);

    _dummy.position.set(x, topY - 0.12, 0);
    _dummy.scale.set(0.85, 0.65, 0.85);
    _dummy.updateMatrix();
    collarInst.setMatrixAt(collarIdx++, _dummy.matrix);
  }
  picketInst.instanceMatrix.needsUpdate = true;
  picketInst.computeBoundingSphere();
  finialInst.instanceMatrix.needsUpdate = true;
  finialInst.computeBoundingSphere();
  collarInst.instanceMatrix.needsUpdate = true;
  collarInst.computeBoundingSphere();
  leaf.add(picketInst, finialInst, collarInst);

  // 6. Hand-forged C-scroll & S-scroll filigree ironwork (TubeGeometry)
  const addScrollCurve = (pts: [number, number][], radius = 0.015) => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([px, py]) => new THREE.Vector3(px, py, 0)));
    const geo = new THREE.TubeGeometry(curve, 24, radius, 8, false);
    disposables.push(geo);
    const mesh = new THREE.Mesh(geo, scrollMat);
    mesh.castShadow = true;
    leaf.add(mesh);
  };

  // Frieze row of S-scrolls between y = 0.80 and y = 1.08
  const scrollCells = 5;
  const usableW = leafWidth - stileW * 2 - 0.08;
  const cellW = usableW / scrollCells;
  for (let c = 0; c < scrollCells; c++) {
    const cx = dir * (stileW + 0.04 + (c + 0.5) * cellW);
    const half = cellW * 0.42;
    addScrollCurve(
      [
        [cx - dir * half, 0.99],
        [cx - dir * (half * 0.45), 1.04],
        [cx, 0.94],
        [cx + dir * (half * 0.45), 0.84],
        [cx + dir * half, 0.89],
      ],
      0.013
    );
  }

  // Sweeping upper arch ornamental S-scrolls
  for (let c = 0; c < 4; c++) {
    const u0 = 0.12 + c * 0.2;
    const u1 = u0 + 0.16;
    const uMid = (u0 + u1) * 0.5;
    const x0 = dir * (stileW + u0 * (leafWidth - stileW * 2));
    const xM = dir * (stileW + uMid * (leafWidth - stileW * 2));
    const x1 = dir * (stileW + u1 * (leafWidth - stileW * 2));
    const y0 = archHeightAt(u0) - 0.08;
    const yM = archHeightAt(uMid) - 0.12;
    const y1 = archHeightAt(u1) - 0.08;
    addScrollCurve(
      [
        [x0, y0 - 0.07],
        [x0 + dir * 0.05, y0 + 0.03],
        [xM, yM],
        [x1 - dir * 0.05, y1 - 0.14],
        [x1, y1 - 0.04],
      ],
      0.014
    );
  }

  // Graceful signature central volute scroll near meeting stile
  const vx = dir * (leafWidth - 0.36);
  addScrollCurve(
    [
      [vx + dir * 0.24, 1.98],
      [vx + dir * 0.06, 1.92],
      [vx - dir * 0.12, 1.72],
      [vx - dir * 0.08, 1.46],
      [vx + dir * 0.08, 1.38],
      [vx + dir * 0.18, 1.5],
      [vx + dir * 0.08, 1.6],
    ],
    0.019
  );
  addScrollCurve(
    [
      [vx + dir * 0.24, 1.16],
      [vx + dir * 0.04, 1.24],
      [vx - dir * 0.08, 1.42],
    ],
    0.016
  );

  // 7. Crown crest volute at center peak
  const peakX = dir * (leafWidth - stileW * 0.5);
  addScrollCurve(
    [
      [peakX, innerH + 0.05],
      [peakX, innerH + 0.24],
      [peakX - dir * 0.11, innerH + 0.28],
      [peakX - dir * 0.16, innerH + 0.18],
      [peakX - dir * 0.09, innerH + 0.13],
    ],
    0.018
  );

  // 8. Forged lockbox escutcheon plate & brushed latch handle near center seam
  const lockBoxGeo = new THREE.BoxGeometry(0.16, 0.34, 0.098);
  const handleGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.14, 10);
  disposables.push(lockBoxGeo, handleGeo);

  const lockBox = new THREE.Mesh(lockBoxGeo, frameMat);
  lockBox.position.set(dir * (leafWidth - 0.12), 1.34, 0);
  leaf.add(lockBox);

  const handle = new THREE.Mesh(handleGeo, scrollMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(dir * (leafWidth - 0.16), 1.34, 0.07);
  leaf.add(handle);

  // 9. Heavy-duty 3-knuckle barrel hinges along outer hanging stile
  const hingeGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.18, 12);
  disposables.push(hingeGeo);
  for (const hy of [0.56, 2.22]) {
    const hinge = new THREE.Mesh(hingeGeo, scrollMat);
    hinge.position.set(0, hy, 0);
    leaf.add(hinge);
  }

  return leaf;
}

export const HeroGateScene: React.FC = () => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [webglReady, setWebglReady] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [gateTargetOpen, setGateTargetOpen] = useState(true);
  const [finish, setFinish] = useState<FinishId>('graphite');
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);

  // Refs bridging React controls to the stable Three.js instance
  const controllerRef = useRef<{
    replay: () => void;
    setOpen: (open: boolean) => void;
    setFinish: (preset: FinishId) => void;
  } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReduced = mq.matches;
    setReducedMotion(prefersReduced);
    if (prefersReduced) {
      setRevealProgress(1);
    }

    const mount = canvasMountRef.current;
    if (!mount) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglReady(false);
      setRevealProgress(1);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    mount.innerHTML = '';
    mount.appendChild(canvas);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebglReady(false);
      setRevealProgress(1);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x101419, 0.022);

    // Mandatory studio environment map via RoomEnvironment on every device
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 60);
    camera.position.set(0, 1.92, 7.6);
    camera.lookAt(0, 1.72, 0);
    renderer.setSize(width, height, false);

    // Balanced 3-point warm/cool studio lighting rig (<= 3 shadow casters)
    const hemiLight = new THREE.HemisphereLight(0x9bb5d1, 0x11161c, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe9cf, 2.2);
    keyLight.position.set(4.5, 6.2, 5.8);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 22;
      keyLight.shadow.camera.left = -5.5;
      keyLight.shadow.camera.right = 5.5;
      keyLight.shadow.camera.top = 5.5;
      keyLight.shadow.camera.bottom = -1.5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Cool platinum rim light catching forged metal scroll edges
    const rimLight = new THREE.DirectionalLight(0xcfe0f5, 1.45);
    rimLight.position.set(-4.8, 3.8, -3.2);
    scene.add(rimLight);

    // Studio softbox edge light for metallic specular highlights (skipped on software GL)
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xe4edf7, 2.2, 5.5, 1.4);
      softbox.position.set(0, 4.2, 3.5);
      softbox.lookAt(0, 1.8, 0);
      scene.add(softbox);
    }

    // Procedural materials & textures (zero external URLs)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const { bumpMap: ironBump } = createForgedIronMaps(maxAniso);
    const { colorMap: stoneColor, bumpMap: stoneBump } = createLimestoneMaps(maxAniso);
    const seamGlowTex = createSeamGlowTexture();
    const contactShadowTex = createContactShadowTexture();

    const initialPreset = FINISH_PRESETS.graphite;
    const frameMaterial = new THREE.MeshPhysicalMaterial({
      color: initialPreset.frameColor,
      roughness: initialPreset.frameRoughness,
      metalness: initialPreset.frameMetalness,
      bumpMap: ironBump,
      bumpScale: 0.015,
      clearcoat: 0.16,
      clearcoatRoughness: 0.45,
    });

    const scrollMaterial = new THREE.MeshPhysicalMaterial({
      color: initialPreset.scrollColor,
      roughness: initialPreset.scrollRoughness,
      metalness: initialPreset.scrollMetalness,
      bumpMap: ironBump,
      bumpScale: 0.008,
      clearcoat: 0.38,
      clearcoatRoughness: 0.22,
    });

    const stoneMaterial = new THREE.MeshStandardMaterial({
      map: stoneColor,
      bumpMap: stoneBump,
      bumpScale: 0.025,
      roughness: 0.88,
      metalness: 0.04,
    });

    const disposables: Array<{ dispose: () => void }> = [
      ironBump,
      stoneColor,
      stoneBump,
      seamGlowTex,
      contactShadowTex,
      frameMaterial,
      scrollMaterial,
      stoneMaterial,
      envRT,
    ];

    // Root architectural gate assembly (shifted right on wide desktop so text on left stays 100% unobstructed)
    const assembly = new THREE.Group();
    scene.add(assembly);

    const LEAF_WIDTH = 2.48;
    const HALF_OPENING = LEAF_WIDTH + 0.03;

    // Grounded radial contact shadow beneath threshold & piers
    const shadowPlaneGeo = new THREE.PlaneGeometry(8.8, 3.2);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    disposables.push(shadowPlaneGeo, shadowPlaneMat);
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, 0.02, -0.35);
    assembly.add(shadowPlane);

    // Cut-Limestone Gate Piers (composite 4-part masonry pillars)
    const pierShaftGeo = new THREE.BoxGeometry(0.76, 2.86, 0.76);
    const pierPlinthGeo = new THREE.BoxGeometry(0.88, 0.24, 0.88);
    const pierNeckGeo = new THREE.BoxGeometry(0.82, 0.09, 0.82);

    // Chamfered capstone via ExtrudeGeometry
    const capShape = new THREE.Shape();
    capShape.moveTo(-0.46, -0.46);
    capShape.lineTo(0.46, -0.46);
    capShape.lineTo(0.46, 0.46);
    capShape.lineTo(-0.46, 0.46);
    capShape.closePath();
    const capGeo = new THREE.ExtrudeGeometry(capShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.045,
      bevelSegments: 2,
    });
    capGeo.rotateX(Math.PI / 2);
    capGeo.center();
    disposables.push(pierShaftGeo, pierPlinthGeo, pierNeckGeo, capGeo);

    for (const side of [-1, 1] as const) {
      const pier = new THREE.Group();
      pier.position.set(side * (HALF_OPENING + 0.42), 0, 0);

      const plinth = new THREE.Mesh(pierPlinthGeo, stoneMaterial);
      plinth.position.y = 0.12;
      plinth.receiveShadow = true;

      const shaft = new THREE.Mesh(pierShaftGeo, stoneMaterial);
      shaft.position.y = 1.55;
      shaft.castShadow = true;
      shaft.receiveShadow = true;

      const neck = new THREE.Mesh(pierNeckGeo, frameMaterial);
      neck.position.y = 2.98;

      const cap = new THREE.Mesh(capGeo, stoneMaterial);
      cap.position.y = 3.12;
      cap.castShadow = true;

      pier.add(plinth, shaft, neck, cap);
      assembly.add(pier);
    }

    // Shared turned spearhead finial (LatheGeometry) & forged collar
    const finialPts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.022, 0.015),
      new THREE.Vector2(0.014, 0.04),
      new THREE.Vector2(0.036, 0.095),
      new THREE.Vector2(0.018, 0.15),
      new THREE.Vector2(0.0, 0.21),
    ];
    const finialGeo = new THREE.LatheGeometry(finialPts, 10);
    const collarGeo = new THREE.SphereGeometry(0.032, 10, 8);
    disposables.push(finialGeo, collarGeo);

    // Left & Right Hinge Pivots (placed accurately at the outer edges of the opening)
    const leftPivot = new THREE.Group();
    leftPivot.position.set(-HALF_OPENING, 0, 0);
    const leftLeaf = buildGateLeaf(1, LEAF_WIDTH, frameMaterial, scrollMaterial, finialGeo, collarGeo, disposables);
    leftPivot.add(leftLeaf);

    const rightPivot = new THREE.Group();
    rightPivot.position.set(HALF_OPENING, 0, 0);
    const rightLeaf = buildGateLeaf(-1, LEAF_WIDTH, frameMaterial, scrollMaterial, finialGeo, collarGeo, disposables);
    rightPivot.add(rightLeaf);

    assembly.add(leftPivot, rightPivot);

    // Fine vertical line of warm-platinum light glowing between the closed leaves
    const seamGeo = new THREE.PlaneGeometry(0.28, 3.35);
    const seamMat = new THREE.MeshBasicMaterial({
      map: seamGlowTex,
      transparent: true,
      opacity: prefersReduced ? 0 : 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(seamGeo, seamMat);
    const seamLightPlane = new THREE.Mesh(seamGeo, seamMat);
    seamLightPlane.position.set(0, 1.72, -0.05);
    assembly.add(seamLightPlane);

    // Responsive framing so gate opens cleanly in the architectural right/center on desktop
    // and sits framed above copy on mobile without clipping piers.
    const updateResponsiveFraming = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      if (w >= 1120) {
        assembly.position.set(1.05, -0.15, 0);
        assembly.scale.setScalar(1.0);
        camera.position.set(0, 1.88, 7.65);
        camera.lookAt(0.42, 1.66, 0);
      } else if (w >= 768) {
        assembly.position.set(0.55, -0.08, 0);
        assembly.scale.setScalar(0.92);
        camera.position.set(0, 1.9, 8.2);
        camera.lookAt(0.22, 1.66, 0);
      } else {
        assembly.position.set(0, 0.38, 0);
        assembly.scale.setScalar(0.76);
        camera.position.set(0, 1.85, 8.95);
        camera.lookAt(0, 1.5, 0);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    updateResponsiveFraming();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Animation & On-Demand Render State
    const MAX_SWING_RAD = THREE.MathUtils.degToRad(66);
    const OPEN_DURATION = 2.05; // ~2 seconds signature swing
    const INITIAL_HOLD = 0.24; // Brief closed beat showing fine line of light

    let currentProgress = prefersReduced ? 1 : 0;
    let targetProgress = prefersReduced ? 1 : 1;
    let animating = !prefersReduced;
    let animMode: 'intro' | 'damp' = prefersReduced ? 'damp' : 'intro';
    let introElapsed = 0;
    let lastTimestamp = performance.now();
    let lastReportedPct = prefersReduced ? 100 : 0;

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    const applyGatePose = (p: number) => {
      const clamped = THREE.MathUtils.clamp(p, 0, 1);
      const angle = clamped * MAX_SWING_RAD;
      // Inward swing toward -Z
      leftPivot.rotation.y = angle;
      rightPivot.rotation.y = -angle;

      // Fine line of light gleams intensely when closed, fades softly as leaves part
      const seamFactor = Math.max(0, 1 - clamped * 2.6);
      seamMat.opacity = seamFactor * 0.94;
      seamLightPlane.scale.x = 0.7 + seamFactor * 0.6;
      seamLightPlane.visible = seamFactor > 0.01;

      const pct = Math.round(clamped * 100);
      if (Math.abs(pct - lastReportedPct) >= 2 || pct === 0 || pct === 100) {
        lastReportedPct = pct;
        setRevealProgress(clamped);
      }
    };

    applyGatePose(currentProgress);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function stepAndRender(now: number) {
      if (disposed) return;
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      if (animating) {
        if (animMode === 'intro') {
          introElapsed += dt;
          if (introElapsed <= INITIAL_HOLD) {
            currentProgress = 0;
          } else {
            const t = Math.min((introElapsed - INITIAL_HOLD) / OPEN_DURATION, 1);
            // Weighted physical ease-out (heavy iron momentum)
            currentProgress = 1 - Math.pow(1 - t, 3.2);
            if (t >= 1) {
              currentProgress = 1;
              animating = false;
            }
          }
        } else {
          currentProgress = THREE.MathUtils.damp(currentProgress, targetProgress, 4.2, dt);
          if (Math.abs(currentProgress - targetProgress) < 0.002) {
            currentProgress = targetProgress;
            animating = false;
          }
        }
        applyGatePose(currentProgress);
      }

      renderer.render(scene, camera);
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        renderDirty = false;
        stepAndRender(now);
        const done = () => {
          if (disposed) return;
          renderBusy = false;
          if (animating || renderDirty) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    // Trigger initial render (either 2s intro sequence or static reduced-motion open frame)
    lastTimestamp = performance.now();
    requestRender();

    // Bridge React controls without tearing down WebGL
    controllerRef.current = {
      replay: () => {
        if (mq.matches) {
          currentProgress = 1;
          targetProgress = 1;
          animating = false;
          applyGatePose(1);
          requestRender();
          return;
        }
        currentProgress = 0;
        targetProgress = 1;
        introElapsed = 0;
        animMode = 'intro';
        animating = true;
        lastTimestamp = performance.now();
        setGateTargetOpen(true);
        applyGatePose(0);
        requestRender();
      },
      setOpen: (open: boolean) => {
        targetProgress = open ? 1 : 0;
        setGateTargetOpen(open);
        if (mq.matches) {
          currentProgress = targetProgress;
          animating = false;
          applyGatePose(currentProgress);
        } else {
          animMode = 'damp';
          animating = true;
          lastTimestamp = performance.now();
        }
        requestRender();
      },
      setFinish: (presetId: FinishId) => {
        const p = FINISH_PRESETS[presetId];
        frameMaterial.color.setHex(p.frameColor);
        frameMaterial.roughness = p.frameRoughness;
        frameMaterial.metalness = p.frameMetalness;
        scrollMaterial.color.setHex(p.scrollColor);
        scrollMaterial.roughness = p.scrollRoughness;
        scrollMaterial.metalness = p.scrollMetalness;
        requestRender();
      },
    };

    const handleResize = () => {
      updateResponsiveFraming();
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  const handleFinishSelect = (id: FinishId) => {
    setFinish(id);
    controllerRef.current?.setFinish(id);
  };

  const handleToggleGate = () => {
    const next = !gateTargetOpen;
    controllerRef.current?.setOpen(next);
  };

  const handleReplay = () => {
    controllerRef.current?.replay();
  };

  // Smooth veil lifting behind the wrought-iron gate as leaves swing inward
  const backdropOpacity = reducedMotion || !webglReady ? 1 : 0.28 + revealProgress * 0.72;

  return (
    <section
      id="top"
      aria-label="Ornate Iron Decor Hero"
      className="relative w-full min-h-[100svh] lg:h-[100svh] lg:min-h-[700px] lg:max-h-[960px] overflow-hidden bg-[#101419] flex flex-col justify-end lg:justify-center"
    >
      {/* Layer 1: Still Architectural Estate Courtyard Revealed Behind the Swinging Gate */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#101419]">
        <img
          src={webglReady ? HERO_MEDIA.courtyardImage : HERO_MEDIA.fallbackGateImage}
          alt={webglReady ? HERO_MEDIA.courtyardAlt : HERO_MEDIA.fallbackGateAlt}
          referrerPolicy="no-referrer"
          fetchPriority="high"
          style={{ opacity: backdropOpacity }}
          className="w-full h-full object-cover object-center transition-opacity duration-300"
        />
        {/* Subtle left-side architectural contrast scrim protecting headline & CTA legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#101419]/94 via-[#101419]/62 to-[#101419]/24 lg:via-[#101419]/52"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#101419] via-[#101419]/30 to-[#101419]/55"
        />
      </div>

      {/* Layer 2: Dedicated Isolated WebGL Canvas Container for 3D Double-Leaf Gate */}
      {webglReady && (
        <div
          ref={canvasMountRef}
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none"
        />
      )}

      {/* Layer 3: Subtle Forged Scrollwork Corner Vignette Silhouette */}
      <HeroScrollworkCorner className="hidden md:block absolute top-20 left-6 z-20 w-36 h-36 text-[#D6DCE2]/45 pointer-events-none" />
      <HeroScrollworkCorner
        flipX
        className="hidden md:block absolute top-20 right-6 z-20 w-36 h-36 text-[#D6DCE2]/45 pointer-events-none"
      />

      {/* Layer 4: Protected Editorial Hero Copy (Available Immediately from Frame 0, Never Crossed by Gate) */}
      <div className="relative z-20 max-w-[1360px] w-full mx-auto px-5 sm:px-8 pt-28 pb-28 lg:py-24">
        <div className="max-w-[540px]">
          <p className="text-[0.8125rem] text-[#A5B0BC] tracking-[0.04em] mb-4 flex items-center gap-2.5">
            <span>Woodbridge, Ontario</span>
            <span aria-hidden="true" className="text-[#D6DCE2]/40">
              ·
            </span>
            <span>Toronto, Vaughan &amp; GTA</span>
          </p>

          <h1 className="font-display text-[clamp(2.5rem,4.6vw,4.15rem)] leading-[1.04] font-medium tracking-[-0.01em] text-[#EDF2F7] mb-5">
            Architectural ironwork forged to frame the threshold.
          </h1>

          <p className="text-[0.975rem] sm:text-[1.05rem] leading-[1.65] text-[#C4CED8] max-w-[48ch] mb-8">
            Bespoke wrought-iron driveway gates, pedestrian gates, metal and fiber-laser railings,
            and privacy screens—drafted, fabricated, and installed by our Woodbridge workshop.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#enquiry"
              className="inline-flex items-center justify-center px-6 py-3.5 text-[0.875rem] font-medium tracking-[0.02em] text-[#101419] bg-[#D6DCE2] hover:bg-[#EDF2F7] transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              Request Project Consultation
            </a>
            <a
              href="#collections"
              className="inline-flex items-center justify-center px-5 py-3.5 text-[0.875rem] font-normal text-[#D6DCE2] border border-[#D6DCE2]/24 bg-[#101419]/80 hover:border-[#D6DCE2]/55 hover:text-white transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              Explore Collections
            </a>
          </div>

          <div className="mt-8 pt-5 border-t border-[#D6DCE2]/14 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem] text-[#A5B0BC] tabular-nums">
            <span>{BUSINESS_INFO.verifiedProof.clients}</span>
            <span aria-hidden="true" className="text-[#D6DCE2]/35">
              ·
            </span>
            <span>{BUSINESS_INFO.verifiedProof.rating}</span>
            <span aria-hidden="true" className="text-[#D6DCE2]/35">
              ·
            </span>
            <a
              href={BUSINESS_INFO.phoneHref}
              className="text-[#D6DCE2] hover:text-white transition-colors"
            >
              {BUSINESS_INFO.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* Layer 5: Compact Collapsible Bottom Control Dock (Solid rgba surface, zero backdrop-filter over WebGL) */}
      {webglReady && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[94vw]">
          <button
            type="button"
            onClick={() => setControlsCollapsed((prev) => !prev)}
            aria-expanded={!controlsCollapsed}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-[0.75rem] text-[#A5B0BC] hover:text-[#E6ECF2] bg-[#141920]/95 border border-b-0 border-[#D6DCE2]/15 transition-colors whitespace-nowrap"
          >
            {controlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Gate Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>

          {!controlsCollapsed && (
            <div
              role="region"
              aria-label="Interactive 3D gate controls"
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 bg-[#141920]/95 border border-[#D6DCE2]/16 text-[0.75rem] text-[#D6DCE2]"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleGate}
                  className="px-3 py-1.5 bg-[#1F262E] hover:bg-[#2A333E] border border-[#D6DCE2]/16 text-[#E6ECF2] transition-colors whitespace-nowrap shrink-0"
                >
                  {gateTargetOpen ? 'Close Gate' : 'Open Gate'}
                </button>
                {!reducedMotion && (
                  <button
                    type="button"
                    onClick={handleReplay}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#191F25] hover:bg-[#242C35] border border-[#D6DCE2]/14 text-[#A5B0BC] hover:text-[#E6ECF2] transition-colors whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </button>
                )}
              </div>

              <span aria-hidden="true" className="hidden sm:block h-4 w-px bg-[#D6DCE2]/16" />

              <div className="flex items-center gap-2">
                <span className="text-[#A5B0BC] whitespace-nowrap">Finish:</span>
                {(Object.keys(FINISH_PRESETS) as FinishId[]).map((id) => {
                  const preset = FINISH_PRESETS[id];
                  const active = finish === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleFinishSelect(id)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'border-[#D6DCE2]/65 bg-[#232B34] text-[#EDF2F7]'
                          : 'border-[#D6DCE2]/14 bg-[#191F25] text-[#A5B0BC] hover:text-[#D6DCE2]'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="w-2.5 h-2.5 rounded-full border border-[#D6DCE2]/35 shrink-0"
                        style={{ backgroundColor: preset.swatch }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
