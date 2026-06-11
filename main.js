let scene, camera, renderer;
let clickable = [];
let isNight = false;
const labels = [];

init();
animate();

function init(){
  const canvas = document.getElementById("bg");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 25, 80);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 11, 24);

  renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x2c5b35, 1.7);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(12, 20, 8);
  scene.add(sun);

  makeWorld();
  makeLabels();
  setupMouseControls();
  setupClicks();

  document.getElementById("closeBtn").onclick = closePanel;
  document.getElementById("modalClose").onclick = () => document.getElementById("imageModal").style.display = "none";
  document.getElementById("nightBtn").onclick = toggleNight;

  setTimeout(()=>{document.getElementById("loader").style.display="none";}, 700);
  window.addEventListener("resize", onResize);
}

function makeWorld(){
  // Ocean
  const ocean = new THREE.Mesh(
    new THREE.CylinderGeometry(55,55,1,96),
    new THREE.MeshStandardMaterial({color:0x0b8ec7, roughness:.48, metalness:.02})
  );
  ocean.position.y = -3.8;
  scene.add(ocean);

  // Island layers
  const sand = new THREE.Mesh(new THREE.CylinderGeometry(16,18,2.1,80), new THREE.MeshStandardMaterial({color:0xf0c36a, roughness:.9}));
  sand.position.y = -2;
  scene.add(sand);

  const grass = new THREE.Mesh(new THREE.CylinderGeometry(14,15.5,1.05,80), new THREE.MeshStandardMaterial({color:0x29a64a, roughness:.85}));
  grass.position.y = -0.75;
  scene.add(grass);

  // House
  const house = new THREE.Group();
  const base = mesh(new THREE.BoxGeometry(5,3.2,4.4), 0xc58a4a);
  base.position.y = 1.15;
  const roof = mesh(new THREE.ConeGeometry(4.3,2.4,4), 0x7b2d26);
  roof.rotation.y = Math.PI/4;
  roof.position.y = 3.9;
  const door = mesh(new THREE.BoxGeometry(1.15,1.9,.18), 0x4a2418);
  door.position.set(0,.45,2.25);
  house.add(base, roof, door);
  house.position.set(0,0,0);
  scene.add(house);
  markClickable(base, "about");
  markClickable(door, "about");

  // Project laptop
  const laptop = new THREE.Group();
  const lapBase = mesh(new THREE.BoxGeometry(3.2,.22,2.1), 0x141922);
  const screen = mesh(new THREE.BoxGeometry(3.1,2,.18), 0x0b1220);
  screen.position.set(0,1.15,-.95);
  screen.rotation.x = -0.25;
  const glow = mesh(new THREE.BoxGeometry(2.65,1.55,.05), 0x00c8ff, true);
  glow.position.set(0,1.15,-1.055);
  glow.rotation.x = -0.25;
  laptop.add(lapBase, screen, glow);
  laptop.position.set(8,.35,1.8);
  laptop.rotation.y = -0.7;
  scene.add(laptop);
  markClickable(screen, "projects");
  markClickable(glow, "projects");

  // Certificate museum
  const museum = new THREE.Group();
  const wall = mesh(new THREE.BoxGeometry(6,3.5,.35), 0xd9b34c);
  wall.position.y = 1.8;
  const frame1 = makeFrame(-1.9,2.0,.25);
  const frame2 = makeFrame(0,2.0,.25);
  const frame3 = makeFrame(1.9,2.0,.25);
  museum.add(wall, frame1, frame2, frame3);
  museum.position.set(-8,0,1.5);
  museum.rotation.y = 0.5;
  scene.add(museum);
  markClickable(wall, "certificates");
  markClickable(frame1, "certificates");
  markClickable(frame2, "certificates");
  markClickable(frame3, "certificates");

  // Contact booth
  const booth = new THREE.Group();
  const pole = mesh(new THREE.CylinderGeometry(.6,.6,3.5,24), 0x1565c0);
  pole.position.y = 1.5;
  const top = mesh(new THREE.SphereGeometry(1.15,24,16), 0x21d4fd);
  top.position.y = 3.4;
  booth.add(pole, top);
  booth.position.set(0,0,-9);
  scene.add(booth);
  markClickable(pole,"contact");
  markClickable(top,"contact");

  // Skill forest trees
  for(let i=0;i<10;i++){
    const a = (i/10)*Math.PI*2;
    const r = 10.7 + (i%2)*1.2;
    const tree = makeTree();
    tree.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
    scene.add(tree);
    markClickable(tree.children[1],"skills");
  }

  // Boat entry
  const boat = new THREE.Group();
  const hull = mesh(new THREE.BoxGeometry(4,.7,1.2), 0x6d3b16);
  hull.position.y = -2.7;
  const sail = mesh(new THREE.ConeGeometry(1.2,2.3,3), 0xffffff);
  sail.position.set(.5,-1.15,0);
  sail.rotation.z = -0.25;
  boat.add(hull,sail);
  boat.position.set(0,0,18);
  scene.add(boat);

  addFloatingStars();
}

function makeFrame(x,y,z){
  const f = mesh(new THREE.BoxGeometry(1.35,1,.12), 0xffffff);
  const b = mesh(new THREE.BoxGeometry(1.55,1.2,.08), 0x4b2a12);
  const g = new THREE.Group();
  g.add(b,f); f.position.z=.08; g.position.set(x,y,z);
  return g;
}

function makeTree(){
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(.25,.35,2.1,16), 0x7a4b22);
  trunk.position.y = .6;
  const leaves = mesh(new THREE.SphereGeometry(1.05,18,14), 0x0d7a32);
  leaves.position.y = 1.9;
  g.add(trunk, leaves);
  return g;
}

function mesh(geo,color,emissive=false){
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color,
    roughness:.65,
    emissive: emissive ? color : 0x000000,
    emissiveIntensity: emissive ? .65 : 0
  }));
}

function markClickable(obj,type){
  obj.userData.type = type;
  clickable.push(obj);
}

function makeLabels(){
  addLabel("🏠 About Me", 0, 5.6, 0);
  addLabel("💻 Projects", 8, 3.2, 1.8);
  addLabel("🏆 Certificates", -8, 4.1, 1.5);
  addLabel("📞 Contact", 0, 4.9, -9);
  addLabel("🌴 Skills", 9.5, 3.2, -6.5);
}

function addLabel(text,x,y,z){
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,.55)";
  ctx.roundRect?.(18,18,476,90,24);
  ctx.fill();
  ctx.font = "bold 36px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(text,256,74);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({map:tex, transparent:true});
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(x,y,z);
  sprite.scale.set(5.2,1.3,1);
  scene.add(sprite);
  labels.push(sprite);
}

function addFloatingStars(){
  for(let i=0;i<90;i++){
    const star = mesh(new THREE.SphereGeometry(.035,8,8), 0xffffff, true);
    star.position.set((Math.random()-.5)*70, Math.random()*25+8, (Math.random()-.5)*70);
    scene.add(star);
  }
}

let down=false,lastX=0,lastY=0;
function setupMouseControls(){
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown",e=>{down=true;lastX=e.clientX;lastY=e.clientY;});
  window.addEventListener("pointerup",()=>down=false);
  window.addEventListener("pointermove",e=>{
    if(!down) return;
    const dx = e.clientX-lastX;
    const dy = e.clientY-lastY;
    lastX=e.clientX; lastY=e.clientY;
    rotateCamera(dx*.006, dy*.003);
  });
  window.addEventListener("wheel",e=>{
    camera.position.multiplyScalar(e.deltaY>0?1.08:.92);
    camera.position.clampLength(12,40);
  }, {passive:true});
}

function rotateCamera(dx,dy){
  const target = new THREE.Vector3(0,0,0);
  const offset = camera.position.clone().sub(target);
  const sph = new THREE.Spherical().setFromVector3(offset);
  sph.theta -= dx;
  sph.phi += dy;
  sph.phi = Math.max(.45, Math.min(1.35, sph.phi));
  camera.position.copy(new THREE.Vector3().setFromSpherical(sph).add(target));
  camera.lookAt(target);
}

function setupClicks(){
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  window.addEventListener("click", e=>{
    if(down) return;
    mouse.x = (e.clientX/window.innerWidth)*2-1;
    mouse.y = -(e.clientY/window.innerHeight)*2+1;
    ray.setFromCamera(mouse,camera);
    const hit = ray.intersectObjects(clickable, true)[0];
    if(hit) openSection(hit.object.userData.type);
  });
}

function openSection(type){
  if(type==="about") return showPanel("🏠 About Me", `
    <img class="profile" src="${portfolioData.about.photo}" onerror="this.style.display='none'">
    <div class="card"><h3>${portfolioData.about.name}</h3>
    <p>${portfolioData.about.degree} - ${portfolioData.about.year}</p>
    <p>${portfolioData.about.college}</p><p>📍 ${portfolioData.about.location}</p>
    <p>🎯 ${portfolioData.about.goal}</p></div>
    <p>${portfolioData.about.intro}</p>
  `);

 if(type==="skills") return showPanel("🌴 Skills Forest", 
  <div class="badges">${portfolioData.skills.map(s=>'<span class="badge">${s}</span>).join("")}</div>
');

  if(type==="projects") return showPanel("💻 Project Lab", portfolioData.projects.map(p=>`
    <div class="card"><h3>${p.name}</h3>
    ${p.github?`<a href="${p.github}" target="_blank">GitHub</a>`:""}
    ${p.live?`<a href="${p.live}" target="_blank">Live Demo</a>`:""}
    </div>`).join(""));

  if(type==="certificates") return showPanel("🏆 Certificate Museum", `
    <div class="cert-grid">${portfolioData.certificates.map(c=>`
      <div class="card cert" onclick="openImage('${c.img}')">
        <img src="${c.img}" onerror="this.style.display='none'">
        <strong>${c.title}</strong>
      </div>`).join("")}</div>
  `);

  if(type==="contact") return showPanel("📞 Contact Booth", `
    <div class="card"><h3>Email</h3><a href="mailto:${portfolioData.contact.email}">${portfolioData.contact.email}</a></div>
    <div class="card"><h3>GitHub</h3><a target="_blank" href="${portfolioData.contact.github}">${portfolioData.contact.github}</a></div>
    <div class="card"><h3>LinkedIn</h3><a target="_blank" href="${portfolioData.contact.linkedin}">LinkedIn Profile</a></div>
  `);
}

function showPanel(title, html){
  document.getElementById("panelTitle").innerHTML = title;
  document.getElementById("panelContent").innerHTML = html;
  document.getElementById("panel").style.display = "block";
}
function closePanel(){ document.getElementById("panel").style.display = "none"; }
function openImage(src){
  document.getElementById("modalImage").src = src;
  document.getElementById("imageModal").style.display = "grid";
}
window.openImage = openImage;

function toggleNight(){
  isNight = !isNight;
  scene.background = new THREE.Color(isNight ? 0x081026 : 0x87ceeb);
  scene.fog.color = new THREE.Color(isNight ? 0x081026 : 0x87ceeb);
  document.getElementById("nightBtn").innerText = isNight ? "☀️ Day" : "🌙 Night";
}

function animate(){
  requestAnimationFrame(animate);
  const t = performance.now()*.001;
  camera.lookAt(0,0,0);
  labels.forEach((l,i)=>{ l.position.y += Math.sin(t+i)*.002; });
  renderer.render(scene,camera);
}

function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
