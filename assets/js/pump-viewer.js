import * as THREE from './vendor/three.module.min.js';

// Original procedural visual study, inspired by the code-native img2threejs approach.
// The geometry is illustrative, not a manufacturer's engineering/CAD specification.
const host = document.querySelector('[data-pump-viewer]');
if (host) {
  try { buildViewer(host); } catch (error) { host.classList.add('is-failed'); console.warn('Pump viewer unavailable; retaining product image.', error); }
}
function buildViewer(host) {
  const viewport = host.querySelector('.pump-viewport');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33,1,.1,60);
  camera.position.set(-4.6,3.2,7.5);
  camera.lookAt(0,.45,0);
  scene.add(new THREE.HemisphereLight(0xfff9eb,0x7e8587,3));
  const key = new THREE.DirectionalLight(0xffead5,5);
  key.position.set(-3,6,5);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;
  key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.03;
  key.shadow.radius=4;scene.add(key);
  const fill = new THREE.DirectionalLight(0xdbe8ff,3);fill.position.set(3,2,-4);scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff,2);rim.position.set(-4,1,-3);scene.add(rim);
  const material=(color,metalness=.4,roughness=.35)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const paint=material(0xa94931,.32,.38), dark=material(0x364343,.55,.32), silver=material(0xbac0bd,.85,.23), black=material(0x202728,.3,.55), brass=material(0xb48a42,.72,.29);
  const root=new THREE.Group();scene.add(root);
  const base=new THREE.Group(), pump=new THREE.Group(), motor=new THREE.Group(), coupling=new THREE.Group();
  root.add(base,pump,motor,coupling);
  function mesh(group,geometry,mat,x,y,z) {const obj=new THREE.Mesh(geometry,mat);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;group.add(obj);return obj;}
  function box(group,w,h,d,mat,x,y,z){return mesh(group,new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
  function cylinder(group,r,len,mat,x,y,z,axis='x',segments=64){const obj=mesh(group,new THREE.CylinderGeometry(r,r,len,segments),mat,x,y,z);if(axis==='x')obj.rotation.z=Math.PI/2;if(axis==='z')obj.rotation.x=Math.PI/2;return obj;}
  function ring(group,outer,inner,depth,mat,x,y,z,axis='x') {
    const shape=new THREE.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);
    const hole=new THREE.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);
    const obj=mesh(group,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:2,steps:1,curveSegments:48}),mat,x,y,z);
    if(axis==='x')obj.rotation.y=Math.PI/2;if(axis==='y')obj.rotation.x=-Math.PI/2;
    return obj;
  }
  function bolts(group,x,y,z,r,axis='x',count=8){for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const dy=axis==='x'?Math.cos(a)*r:0;const dx=axis==='y'?Math.cos(a)*r:0;const dz=Math.sin(a)*r;cylinder(group,.048,.06,silver,x+dx,y+dy,z+dz,axis,6);}}
  // Machined skid, mounting feet, and anchor bolts.
  box(base,4.8,.14,1.65,dark,0,-.6,0);
  for(const z of [-.67,.67])box(base,4.65,.16,.13,black,0,-.75,z);
  for(const x of [-2.05,2.05])for(const z of [-.65,.65]){cylinder(base,.075,.04,silver,x,-.51,z,'y',6);}
  for(const x of [-1.25,1.15])for(const z of [-.45,.45]) {box(base,.48,.28,.22,dark,x,-.4,z);cylinder(base,.055,.08,silver,x,-.22,z,'y',6);}
  // Cast pump volute; axis through the coupling and motor.
  cylinder(pump,.71,.62,paint,-1.23,.32,0);
  cylinder(pump,.64,.12,paint,-1.61,.32,0);
  cylinder(pump,.48,.13,dark,-.87,.32,0);
  cylinder(pump,.26,.4,dark,-.65,.32,0);
  bolts(pump,-1.7,.32,0,.56);
  // Front inlet: open bore, machined lip, bolt circle, recessed dark interior.
  cylinder(pump,.29,.5,paint,-1.98,.32,0);
  ring(pump,.48,.23,.12,paint,-2.32,.32,0);
  ring(pump,.3,.225,.025,silver,-2.35,.32,0);
  cylinder(pump,.22,.015,black,-2.03,.32,0);
  bolts(pump,-2.36,.32,0,.38);
  // Vertical discharge with a visible hollow flange.
  cylinder(pump,.23,.59,paint,-1.13,1.05,0,'y');
  ring(pump,.4,.18,.12,paint,-1.13,1.34,0,'y');
  ring(pump,.255,.18,.025,silver,-1.13,1.47,0,'y');
  cylinder(pump,.175,.02,black,-1.13,1.22,0,'y');bolts(pump,-1.13,1.5,0,.32,'y',6);
  // Cast reinforcing ribs and a brass drain plug.
  for(const z of [-.42,.42])box(pump,.45,.4,.1,paint,-1.22,-.2,z);
  cylinder(pump,.075,.09,brass,-1.2,-.27,.61,'z',6);
  // Visible steel coupling, keyed shaft and safety collar.
  cylinder(coupling,.12,.95,silver,-.18,.32,0);
  cylinder(coupling,.25,.16,brass,-.23,.32,0);
  cylinder(coupling,.25,.15,dark,.02,.32,0);
  cylinder(coupling,.22,.08,black,-.1,.32,0);
  // Motor body, individual cooling fins, end cap and fan grille.
  cylinder(motor,.51,1.65,dark,1.2,.32,0);
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const fin=box(motor,1.45,.08,.055,dark,1.18,.32+Math.cos(a)*.53,Math.sin(a)*.53);fin.rotation.x=a;}
  cylinder(motor,.57,.11,dark,.35,.32,0);
  cylinder(motor,.55,.2,dark,2.05,.32,0);
  cylinder(motor,.48,.02,black,2.16,.32,0);
  for(const r of [.15,.26,.37,.47])ring(motor,r,r-.022,.022,silver,2.18,.32,0);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const spoke=box(motor,.025,.94,.018,dark,2.22,.32,0);spoke.rotation.x=a;}
  bolts(motor,.27,.32,0,.45,'x',6);
  box(motor,.62,.22,.55,dark,1.1,.96,0);
  box(motor,.67,.055,.59,black,1.1,1.1,0);
  cylinder(motor,.08,.12,brass,.75,.98,0);
  box(motor,.42,.17,.022,silver,1.15,.48,.555);
  for(let i=0;i<4;i++)box(motor,.31,.012,.025,black,1.15,.53-i*.032,.57);
  const floor=mesh(scene,new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.14}),0,-.845,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  // One restrained settling movement, then no ongoing motion or interaction.
  const finalYaw=-.35;
  let visible=true,frame=0,elapsed=0,last=0,settled=reduced.matches;
  root.rotation.y=settled?finalYaw:finalYaw-.18;
  function render(time){
    frame=0;
    if(!visible||document.hidden)return;
    if(!settled){
      elapsed+=last?Math.min(time-last,50):0;
      const progress=Math.min(elapsed/1200,1);
      root.rotation.y=finalYaw-.18*Math.pow(1-progress,3);
      settled=progress===1;
    }
    last=time;
    renderer.render(scene,camera);
    if(!settled)frame=requestAnimationFrame(render);
  }
  function request(){if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(render);}}
  function resize(){
    const w=viewport.clientWidth,h=viewport.clientHeight;
    renderer.setSize(w,h);camera.aspect=w/h;
    camera.position.set(-4.6,3.2,7.5).multiplyScalar(w<600?1.02:.88);
    camera.lookAt(0,.25,0);camera.updateProjectionMatrix();request();
  }
  viewport.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  resize();renderer.render(scene,camera);host.classList.add('is-ready');
  new ResizeObserver(resize).observe(viewport);
  new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(!visible){cancelAnimationFrame(frame);frame=0;}else request();
  }).observe(host);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;}else request();
  });
  const finish=()=>{settled=true;root.rotation.y=finalYaw;request();};
  document.addEventListener('keydown',finish,{once:true});
  reduced.addEventListener('change',finish);
  renderer.domElement.addEventListener('webglcontextlost',event=>{
    event.preventDefault();visible=false;cancelAnimationFrame(frame);
    renderer.domElement.hidden=true;host.classList.remove('is-ready');host.classList.add('is-failed');
  });
}
