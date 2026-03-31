/**
 * main.js — Missão Espacial 3D com Three.js
 *
 * Controles de câmera (comportamento orbital — você navega pela cena):
 *   Arrastar (btn esquerdo) → rotacionar câmera em órbita
 *   Arrastar (btn direito)  → pan (mover ponto de interesse)
 *   Scroll                  → zoom
 *
 * Cena:
 *   - Cubo central com anéis orbitais
 *   - 4 foguetes orbitando em trajetórias diferentes
 *   - Planeta com anéis + lua em órbita
 *   - 22 asteroides espalhados
 *   - 900 estrelas + neblosas coloridas
 *   - 100 partículas flutuantes
 *   - 3 luzes coloridas animadas
 */

/* ── Renderer ── */
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

/* ── Cena ── */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03020a);
scene.fog = new THREE.FogExp2(0x03020a, 0.018);

/* ── Câmera perspectiva ── */
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(8, 5, 14);

/* ── Iluminação ── */
scene.add(new THREE.AmbientLight(0x0a0520, 2));
const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
sun.position.set(20, 30, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.001;
scene.add(sun);
const pl1 = new THREE.PointLight(0x6633ff, 5, 40); scene.add(pl1);
const pl2 = new THREE.PointLight(0xff3388, 4, 30); scene.add(pl2);
const pl3 = new THREE.PointLight(0x00eeff, 3, 25); scene.add(pl3);

/* ── Estrelas ── */
const starArr = new Float32Array(900 * 3);
for (let i = 0; i < 900 * 3; i++) starArr[i] = (Math.random() - 0.5) * 260;
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.75 })));

/* ── Neblosas ── */
[
  [0x220033, [-30, 10, -60], 18],
  [0x001133, [40, -5, -80], 22],
  [0x330011, [0, 20, -100], 30],
  [0x002211, [-50, 0, -40], 15],
].forEach(([col, pos, sz]) => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(sz, 8, 8),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.07, side: THREE.BackSide })
  );
  m.position.set(...pos);
  scene.add(m);
});

/* ── Cubo central ── */
const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(cubeGeo, new THREE.MeshPhongMaterial({
  color: 0x2233aa, specular: 0x8866ff, shininess: 120, transparent: true, opacity: 0.85,
}));
cube.castShadow = true;
scene.add(cube);
cube.add(new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeo), new THREE.LineBasicMaterial({ color: 0xaa88ff })));
cube.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), new THREE.MeshBasicMaterial({ color: 0x3311aa, transparent: true, opacity: 0.18, side: THREE.BackSide })));

/* ── Anéis do cubo ── */
const ringsGroup = new THREE.Group();
scene.add(ringsGroup);
[[3.2, 0x6633ff, Math.PI / 6], [3.9, 0x33aaff, Math.PI / 3], [4.6, 0xff3388, Math.PI / 2.2]].forEach(([r, col, tx]) => {
  const pts = [];
  for (let i = 0; i <= 128; i++) { const a = i / 128 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.3 }));
  ring.rotation.x = tx;
  ringsGroup.add(ring);
});

/* ── Foguetes ── */
function makeRocket(scale, bodyCol) {
  const g = new THREE.Group();
  g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 1.1 * scale, 10), new THREE.MeshPhongMaterial({ color: bodyCol, specular: 0xffffff, shininess: 90 }))));
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18 * scale, 0.5 * scale, 10), new THREE.MeshPhongMaterial({ color: 0xeeeeff, shininess: 60 }));
  nose.position.y = 0.8 * scale; g.add(nose);
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05 * scale, 0.3 * scale, 0.24 * scale), new THREE.MeshPhongMaterial({ color: bodyCol }));
    const a = i / 3 * Math.PI * 2;
    fin.position.set(Math.cos(a) * 0.21 * scale, -0.38 * scale, Math.sin(a) * 0.21 * scale);
    fin.rotation.y = a; g.add(fin);
  }
  const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.13 * scale, 0.38 * scale, 8), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.9 }));
  f1.position.y = -0.72 * scale; f1.rotation.z = Math.PI; g.add(f1);
  const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.08 * scale, 0.6 * scale, 8), new THREE.MeshBasicMaterial({ color: 0xffee00, transparent: true, opacity: 0.7 }));
  f2.position.y = -1.0 * scale; f2.rotation.z = Math.PI; g.add(f2);
  return g;
}

const rockets = [
  { col: 0xccddff, r: 9,  speed: 0.007, phase: 0,   tilt: 0.35,  yOff: 2    },
  { col: 0xff9966, r: 13, speed: 0.004, phase: 2.1,  tilt: -0.5,  yOff: -1.5 },
  { col: 0x99ffcc, r: 7,  speed: 0.011, phase: 4.2,  tilt: 1.0,   yOff: 1    },
  { col: 0xffaaff, r: 16, speed: 0.003, phase: 1.0,  tilt: 0.2,   yOff: -3   },
].map(d => { const mesh = makeRocket(1.0, d.col); scene.add(mesh); return { ...d, mesh, angle: d.phase }; });

/* ── Planeta ── */
const planet = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), new THREE.MeshPhongMaterial({ color: 0x1133aa, specular: 0x334488, shininess: 40 }));
planet.position.set(-18, 4, -22);
scene.add(planet);
[4.8, 5.5, 6.1].forEach((r, i) => {
  const pts = [];
  for (let j = 0; j <= 128; j++) { const a = j / 128 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: [0x8899cc, 0x6677aa, 0x445588][i], transparent: true, opacity: [0.55, 0.38, 0.25][i] }));
  ring.rotation.x = 0.3;
  planet.add(ring);
});

/* ── Lua ── */
const moon = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), new THREE.MeshPhongMaterial({ color: 0x888899, shininess: 5 }));
scene.add(moon);

/* ── Asteroides ── */
const asteroids = [];
for (let i = 0; i < 22; i++) {
  const s = Math.random() * 0.45 + 0.1;
  const ast = new THREE.Mesh(new THREE.SphereGeometry(s, 6, 6), new THREE.MeshPhongMaterial({ color: 0x665544, shininess: 4 }));
  const ang = Math.random() * Math.PI * 2, rad = Math.random() * 14 + 7;
  ast.position.set(Math.cos(ang) * rad, (Math.random() - 0.5) * 9, Math.sin(ang) * rad - 4);
  ast.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
  scene.add(ast);
  asteroids.push({ mesh: ast, ry: (Math.random() - 0.5) * 0.014, rz: (Math.random() - 0.5) * 0.009 });
}

/* ── Partículas ── */
const PC = 100;
const partGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PC * 3);
const pVel = [];
for (let i = 0; i < PC; i++) {
  pPos[i*3] = (Math.random()-.5)*30; pPos[i*3+1] = (Math.random()-.5)*20; pPos[i*3+2] = (Math.random()-.5)*30;
  pVel.push({ x: (Math.random()-.5)*0.005, y: Math.random()*0.006+0.001, z: (Math.random()-.5)*0.005 });
}
partGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
scene.add(new THREE.Points(partGeo, new THREE.PointsMaterial({ color: 0x8866ff, size: 0.07, transparent: true, opacity: 0.75 })));

/* ── Controles da câmera ── */
let theta = 0.4, phi = 1.1, radius = 16, panX = 0, panY = 0;
function updateCam() {
  camera.position.set(panX + radius*Math.sin(phi)*Math.sin(theta), panY + radius*Math.cos(phi), radius*Math.sin(phi)*Math.cos(theta));
  camera.lookAt(panX, panY, 0);
}
updateCam();

let isDown = false, isRight = false, lx = 0, ly = 0;
canvas.addEventListener('mousedown', e => { isDown=true; isRight=e.button===2; lx=e.clientX; ly=e.clientY; document.body.style.cursor='grabbing'; });
canvas.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('mouseup', () => { isDown=false; document.body.style.cursor='default'; });
window.addEventListener('mousemove', e => {
  if (!isDown) return;
  const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
  if (isRight) { panX-=dx*0.02; panY+=dy*0.02; }
  else { theta-=dx*0.007; phi=Math.max(0.05,Math.min(Math.PI-0.05,phi+dy*0.007)); }
  updateCam();
});
canvas.addEventListener('wheel', e => { radius=Math.max(4,Math.min(60,radius+e.deltaY*0.03)); updateCam(); e.preventDefault(); }, { passive:false });

window.addEventListener('resize', () => { camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); });

/* ── Loop ── */
const camPosEl = document.getElementById('camPos');
let t = 0;
function animate() {
  requestAnimationFrame(animate); t += 0.016;

  cube.position.y = Math.sin(t*0.4)*0.15;
  ringsGroup.rotation.y = t*0.05;
  ringsGroup.children[0].rotation.z = t*0.12;
  ringsGroup.children[1].rotation.z = -t*0.08;
  ringsGroup.children[2].rotation.x += 0.0004;

  rockets.forEach(d => {
    d.angle += d.speed;
    d.mesh.position.set(Math.cos(d.angle)*d.r, d.yOff+Math.sin(d.angle*1.5)*0.9, Math.sin(d.angle)*d.r);
    d.mesh.rotation.y = Math.atan2(-Math.sin(d.angle), Math.cos(d.angle)) + Math.PI/2;
    d.mesh.rotation.z = d.tilt*0.4;
    const ch = d.mesh.children;
    if (ch[4]) ch[4].material.opacity = 0.7+Math.sin(t*9+d.phase)*0.3;
    if (ch[5]) ch[5].material.opacity = 0.5+Math.sin(t*11+d.phase)*0.35;
  });

  planet.rotation.y = t*0.012;
  moon.position.set(-18+Math.cos(t*0.13)*7, 4+Math.sin(t*0.09)*2, -22+Math.sin(t*0.13)*7);
  moon.rotation.y = t*0.05;

  asteroids.forEach(a => { a.mesh.rotation.y+=a.ry; a.mesh.rotation.z+=a.rz; });

  pl1.position.set(Math.sin(t*0.32)*14, 4, Math.cos(t*0.32)*14);
  pl2.position.set(Math.cos(t*0.21)*12, -2, Math.sin(t*0.21)*12);
  pl3.position.set(Math.sin(t*0.17)*10, Math.cos(t*0.28)*6+4, -10);

  for (let i=0; i<PC; i++) {
    pPos[i*3]+=pVel[i].x; pPos[i*3+1]+=pVel[i].y; pPos[i*3+2]+=pVel[i].z;
    if (pPos[i*3+1]>14) { pPos[i*3+1]=-12; pPos[i*3]=(Math.random()-.5)*30; pPos[i*3+2]=(Math.random()-.5)*30; }
  }
  partGeo.attributes.position.needsUpdate = true;

  const p = camera.position;
  camPosEl.textContent = `câmera (${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}) | dist ${radius.toFixed(1)} | FOV 60°`;
  renderer.render(scene, camera);
}
animate();