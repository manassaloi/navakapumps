import * as THREE from './vendor/three.module.min.js';

// Original visual approximations of the three catalogue silhouettes, not CAD models.
function makePump(kind) {
  const group = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({color:kind===0?0x326775:kind===1?0x248975:0x284b80,metalness:.38,roughness:.33});
  const metal = new THREE.MeshStandardMaterial({color:0xbdc5c8,metalness:.8,roughness:.25});
  const dark = new THREE.MeshStandardMaterial({color:0x20292d,metalness:.25,roughness:.5});
  const brass = new THREE.MeshStandardMaterial({color:0xb69853,metalness:.7,roughness:.3});
  function part(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);group.add(m);return m;}
  function box(w,h,d,x,y,z,mat=paint){return part(new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
  function cyl(r,len,x,y,z,mat=paint,axis='x',segments=48){const m=part(new THREE.CylinderGeometry(r,r,len,segments),mat,x,y,z);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;return m;}
  function flange(r,bore,len,x,y,z,axis='x') {
    const profile=new THREE.Shape();profile.absarc(0,0,r,0,Math.PI*2,false);
    const hole=new THREE.Path();hole.absarc(0,0,bore,0,Math.PI*2,true);profile.holes.push(hole);
    const m=part(new THREE.ExtrudeGeometry(profile,{depth:len,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2,curveSegments:40}),paint,x,y,z);
    if(axis==='x')m.rotation.y=Math.PI/2;if(axis==='y')m.rotation.x=-Math.PI/2;
    // Visible inset bore and metal fasteners, with no technical claims.
    cyl(bore*.95,.02,x+(axis==='x'?.1:0),y-(axis==='y'?.1:0),z,dark,axis);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;
      cyl(.042,.04,x+(axis==='y'?Math.cos(a)*r*.78:-.025),y+(axis==='x'?Math.cos(a)*r*.78:len+.015),z+Math.sin(a)*r*.78,metal,axis,6);
    }
  }
  function foot(x,w=.38){box(w,.18,1,x,-.68,0);box(w*.65,.38,.58,x,-.48,0);for(const z of [-.39,.39])cyl(.045,.025,x,-.57,z,metal,'y',6);}
  if(kind===0) {
    // Centrifugal casing, axial inlet, vertical discharge, bearing housing and shaft.
    cyl(.7,.58,-.38,0,0);cyl(.64,.1,-.72,0,0);
    cyl(.29,.45,-.99,0,0);flange(.46,.22,.1,-1.28,0,0);
    cyl(.21,.52,-.31,.77,0,paint,'y');flange(.35,.16,.1,-.31,1.02,0,'y');
    cyl(.38,.24,.04,0,0);cyl(.23,.68,.5,0,0);cyl(.3,.1,.9,0,0);
    cyl(.09,.52,1.19,0,0,metal);box(.32,.035,.06,1.22,.095,0,brass);
    foot(-.4,.5);foot(.55,.34);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;cyl(.048,.06,-.79,Math.cos(a)*.54,Math.sin(a)*.54,metal,'x',6);}
    for(const z of [-.38,.38])box(.4,.36,.08,-.32,-.43,z);
  } else if(kind===1) {
    // Long progressive-cavity stator, tie rods, inlet body and top outlet.
    cyl(.24,2.15,-.67,0,0);flange(.4,.18,.1,-1.84,0,0);
    cyl(.28,.13,-1.51,0,0);cyl(.32,.7,.73,0,0);
    flange(.34,.17,.08,.38,0,0);
    cyl(.18,.45,.7,.38,0,paint,'y');flange(.38,.13,.09,.7,.61,0,'y');
    cyl(.28,.19,1.23,0,0,brass);cyl(.3,.68,1.65,0,0);cyl(.15,.22,2.09,0,0,metal);
    for(const y of [-.2,.2])for(const z of [-.2,.2]){cyl(.025,2.08,-.65,y,z,metal);cyl(.045,.065,-1.73,y,z,metal,'x',6);}
    foot(-1.36,.3);foot(.7,.38);foot(1.8,.28);
  } else {
    // Compact twin-lobe gear housing, front mounting plate and projecting drive shaft.
    cyl(.43,1.12,.12,.18,0);cyl(.4,1.12,.12,-.26,0);
    box(.15,1.22,1,-.51,-.02,0);box(.13,1.08,.88,.73,-.02,0);
    cyl(.27,.13,-.65,.15,0);cyl(.11,.75,-1.02,.15,0,metal);box(.4,.04,.07,-1.12,.265,0,metal);
    cyl(.24,.3,.1,.05,.48,paint,'z');
    const port=part(new THREE.TorusGeometry(.17,.05,12,40),metal,.1,.05,.68);
    cyl(.125,.02,.1,.05,.67,dark,'z');
    cyl(.17,.22,.73,.25,.37,brass,'z',6);
    box(1.4,.15,1.08,.1,-.79,0);box(.4,.3,.18,-.29,-.59,.35);box(.4,.3,.18,.5,-.59,.35);
    for(const y of [-.48,.47])for(const z of [-.37,.37])cyl(.06,.05,-.62,y,z,metal,'x',6);
    for(const x of [-.4,.58])for(const z of [-.39,.39])cyl(.048,.04,x,-.69,z,metal,'y',6);
  }
  return group;
}

function mount(host) {
  let renderer;
  try {
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
    const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff8ed,0x6d7985,3));
    const key=new THREE.DirectionalLight(0xfff2dd,4);key.position.set(-3,5,6);scene.add(key);
    const fill=new THREE.DirectionalLight(0xdceaff,3);fill.position.set(3,2,-4);scene.add(fill);
    const model=makePump(Number(host.dataset.productModel));scene.add(model);
    model.rotation.y=-.12;
    const camera=new THREE.PerspectiveCamera(32,1,.1,40);
    const bounds=new THREE.Box3().setFromObject(model), center=bounds.getCenter(new THREE.Vector3());
    model.position.sub(center);
    function render(){
      const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
      renderer.setSize(w,h);camera.aspect=w/h;
      const size=bounds.getSize(new THREE.Vector3());
      const radius=size.length()/2;
      const halfFov=Math.min(Math.atan(Math.tan(Math.PI*32/360)*camera.aspect),Math.PI*32/360);
      const distance=radius/Math.sin(halfFov)*.72;
      camera.position.set(-.65,.42,1).normalize().multiplyScalar(distance);
      camera.lookAt(0,0,0);camera.updateProjectionMatrix();renderer.render(scene,camera);
    }
    renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
    render();host.classList.add('model-ready');
    new ResizeObserver(render).observe(host);
    renderer.domElement.addEventListener('webglcontextlost',event=>{
      event.preventDefault();renderer.domElement.hidden=true;host.classList.remove('model-ready');
    });
  } catch(error) { renderer?.dispose();renderer?.domElement.remove();console.warn('Product illustration unavailable; retaining photo.',error); }
}
// Instantiate near the viewport; static scenes render only on load and resize.
const hosts=document.querySelectorAll('[data-product-model]');
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){observer.unobserve(entry.target);mount(entry.target);}}),{rootMargin:'200px'});
  hosts.forEach(host=>observer.observe(host));
}else hosts.forEach(mount);
