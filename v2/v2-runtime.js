(function(){
'use strict';
const CANDIDATES=[
  {id:'echo',label:'parallel echo'},
  {id:'wave',label:'wave'},
  {id:'beads',label:'beads'},
  {id:'weave',label:'weave'},
  {id:'sparks',label:'sparks'},
  {id:'blocks',label:'blocks'}
];
let active=null,stroke=null,undo=[];
function onReady(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
function dprOf(c){const r=c.getBoundingClientRect();return r.width?c.width/r.width:1;}
function snapshot(c){const o=document.createElement('canvas');o.width=c.width;o.height=c.height;o._dpr=dprOf(c);o.getContext('2d').drawImage(c,0,0);return o;}
function restore(c,o){if(!o)return;const g=c.getContext('2d'),d=dprOf(c),s=d/(o._dpr||d);g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(o,0,0,o.width,o.height,0,0,o.width*s,o.height*s);g.restore();}
function point(c,e){const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function thumbData(id){const o=document.createElement('canvas');o.width=72;o.height=72;const g=o.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,72,72);g.strokeStyle='#000';g.fillStyle='#000';g.lineWidth=1;const line=(x1,y1,x2,y2)=>{g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();};
if(id==='echo'){line(12,27,60,27);line(12,36,60,36);line(12,45,60,45);}else if(id==='wave'){g.beginPath();for(let x=10;x<=62;x+=2){const y=36+Math.sin((x-10)*.24)*10;x===10?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}else if(id==='beads'){for(let x=14,i=0;x<=58;x+=11,i++){g.beginPath();g.arc(x,36,i%2?6:2.5,0,Math.PI*2);i%2?g.stroke():g.fill();}}else if(id==='weave'){for(let x=16,i=0;x<=56;x+=10,i++)line(x-5,36+(i%2?-7:7),x+5,36+(i%2?7:-7));}else if(id==='sparks'){for(const [x,y] of [[22,26],[47,39],[28,53]]){line(x-5,y,x+5,y);line(x,y-5,x,y+5);}}else{for(let x=14,i=0;x<=56;x+=14,i++){const s=i%2?12:6;g.strokeRect(x-s/2,36-s/2,s,s);}}return o.toDataURL();}
function addCandidateButtons(grid){for(const item of CANDIDATES){const b=document.createElement('button');b.type='button';b.className='thumb';b.dataset.v2Brush=item.id;b.dataset.seat='H-'+item.id;b.setAttribute('aria-label',item.label);b.title=item.label;b.style.backgroundImage='url('+thumbData(item.id)+')';grid.appendChild(b);}}
function markActive(grid,button){grid.querySelectorAll('.thumb').forEach(n=>n.classList.remove('active'));button.classList.add('active');}
function eachPoint(a,b,state,spacing,visit){const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy);if(!(dist>0))return;const ux=dx/dist,uy=dy/dist;let remain=dist,local=0,resid=state.resid||spacing;while(remain>=resid){local+=resid;visit(a.x+ux*local,a.y+uy*local,ux,uy,state.index++);remain-=resid;resid=spacing;}state.resid=resid-remain;}
function drawSegment(c,a,b,state){const g=c.getContext('2d'),d=dprOf(c),dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy);if(!(dist>0))return;const ux=dx/dist,uy=dy/dist,nx=-uy,ny=ux;g.save();g.setTransform(d,0,0,d,0,0);g.strokeStyle='#000';g.fillStyle='#000';g.lineCap='round';g.lineJoin='round';
if(state.id==='echo'){g.lineWidth=1;for(const n of [-8,0,8]){g.beginPath();g.moveTo(a.x+nx*n,a.y+ny*n);g.lineTo(b.x+nx*n,b.y+ny*n);g.stroke();}}
else if(state.id==='wave'){eachPoint(a,b,state,5,(x,y,px,py,i)=>{const q={x:x-py*Math.sin(i*.55)*10,y:y+px*Math.sin(i*.55)*10};if(state.prev){g.lineWidth=1.5;g.beginPath();g.moveTo(state.prev.x,state.prev.y);g.lineTo(q.x,q.y);g.stroke();}state.prev=q;});}
else if(state.id==='beads'){eachPoint(a,b,state,18,(x,y,_px,_py,i)=>{const r=i%2?6:2.5;g.beginPath();g.arc(x,y,r,0,Math.PI*2);i%2?g.stroke():g.fill();});}
else if(state.id==='weave'){eachPoint(a,b,state,14,(x,y,px,py,i)=>{const sign=i%2?1:-1,ax=(px-py*sign)/Math.SQRT2,ay=(py+px*sign)/Math.SQRT2,L=14;g.lineWidth=1;g.beginPath();g.moveTo(x-ax*L/2,y-ay*L/2);g.lineTo(x+ax*L/2,y+ay*L/2);g.stroke();});}
else if(state.id==='sparks'){eachPoint(a,b,state,24,(x,y,_px,_py,i)=>{const r=3+((i*7)%10)/9*5;g.lineWidth=1;g.beginPath();g.moveTo(x-r,y);g.lineTo(x+r,y);g.moveTo(x,y-r);g.lineTo(x,y+r);g.moveTo(x-r*.55,y-r*.55);g.lineTo(x+r*.55,y+r*.55);g.stroke();});}
else if(state.id==='blocks'){eachPoint(a,b,state,19,(x,y,px,py,i)=>{const s=5+((i*5)%8)/7*8;g.save();g.translate(x,y);g.rotate(Math.atan2(py,px));g.strokeRect(-s/2,-s/2,s,s);g.restore();});}
g.restore();}
function exportPng(c){const out=document.createElement('canvas');out.width=c.width;out.height=c.height;const g=out.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,out.width,out.height);g.drawImage(c,0,0);out.toBlob(blob=>{if(!blob)return;const n=new Date(),pad=v=>String(v).padStart(2,'0'),stamp=n.getFullYear()+pad(n.getMonth()+1)+pad(n.getDate())+'_'+pad(n.getHours())+pad(n.getMinutes())+pad(n.getSeconds()),url=URL.createObjectURL(blob),a=document.createElement('a');a.download='doodle-line_'+stamp+'.png';a.href=url;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');}
onReady(function(){const c=document.getElementById('c'),grid=document.getElementById('thumbgrid'),save=document.getElementById('saveLink'),back=document.getElementById('backBtn'),clear=document.getElementById('clearBtn'),eraser=document.getElementById('eraserBtn');if(!c||!grid)return;addCandidateButtons(grid);
grid.addEventListener('click',e=>{const b=e.target.closest('.thumb');if(!b)return;if(b.dataset.v2Brush){e.preventDefault();e.stopImmediatePropagation();active=b.dataset.v2Brush;markActive(grid,b);}else active=null;},true);
c.addEventListener('pointerdown',e=>{if(!active){try{c.setPointerCapture(e.pointerId);}catch(_){}undo.length=0;return;}e.preventDefault();e.stopImmediatePropagation();try{c.setPointerCapture(e.pointerId);}catch(_){}const snap=snapshot(c);undo.push(snap);while(undo.length>4)undo.shift();stroke={id:active,pointerId:e.pointerId,last:point(c,e),resid:0,index:0,prev:null,snapshot:snap};},true);
c.addEventListener('pointermove',e=>{if(!stroke||e.pointerId!==stroke.pointerId)return;e.preventDefault();e.stopImmediatePropagation();const p=point(c,e);drawSegment(c,stroke.last,p,stroke);stroke.last=p;},true);
const end=e=>{if(!stroke||e.pointerId!==stroke.pointerId)return;e.preventDefault();e.stopImmediatePropagation();const id=stroke.pointerId;stroke=null;try{if(c.hasPointerCapture(id))c.releasePointerCapture(id);}catch(_){}};
c.addEventListener('pointerup',end,true);c.addEventListener('pointercancel',e=>{if(!stroke||e.pointerId!==stroke.pointerId)return;e.preventDefault();e.stopImmediatePropagation();restore(c,stroke.snapshot);undo.pop();stroke=null;},true);
if(save)save.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();exportPng(c);},true);
if(back)back.addEventListener('click',e=>{if(!undo.length)return;e.preventDefault();e.stopImmediatePropagation();restore(c,undo.pop());},true);
if(clear)clear.addEventListener('click',()=>{undo.length=0;},true);if(eraser)eraser.addEventListener('click',()=>{active=null;},true);
let resizeSnap=null,timer=0;window.addEventListener('resize',()=>{if(!resizeSnap)resizeSnap=snapshot(c);clearTimeout(timer);timer=setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{restore(c,resizeSnap);resizeSnap=null;})),80);},{capture:true,passive:true});
});
})();
