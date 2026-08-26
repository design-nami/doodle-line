import fs from 'node:fs';
import vm from 'node:vm';

const sourcePath = 'index.html';
const outputPath = 'index-v2.html';
const reportPath = 'REFACTOR_REPORT.md';
let html = fs.readFileSync(sourcePath, 'utf8');
const changes = [];

function replaceOne(pattern, replacement, label) {
  const source = typeof pattern === 'string' ? pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : pattern.source;
  const flags = typeof pattern === 'string' ? 'g' : (pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const matches = [...html.matchAll(new RegExp(source, flags))];
  if (matches.length !== 1) throw new Error(`${label}: expected 1 match, found ${matches.length}`);
  html = html.replace(pattern, replacement);
  changes.push(label);
}

function removeScript(id) {
  const safe = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  replaceOne(new RegExp(`<script id=["']${safe}["']>[\\s\\S]*?<\\/script>\\s*`), '', `remove ${id}`);
}
function removeStyle(id) {
  const safe = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  replaceOne(new RegExp(`<style id=["']${safe}["']>[\\s\\S]*?<\\/style>\\s*`), '', `remove ${id}`);
}

replaceOne('<title>Doodle Line</title>', '<title>Doodle Line — V2 prototype</title>', 'prototype title');

replaceOne(
  /    <button class="sidebtn eraser" id="eraserBtn">[\s\S]*?<button id="saveLink" class="save-link" type="button" aria-label="らくがきをダウンロード">らくがきをダウンロード<\/button>/,
`    <div class="utilitygrid" id="utilitygrid" aria-label="編集ツール">
      <button class="sidebtn eraser" id="eraserBtn" type="button"><span>Erase<br>けす</span></button>
      <button class="sidebtn back" id="backBtn" type="button"><span>Back<br>もどる</span></button>
      <button class="sidebtn clear" id="clearBtn" type="button"><span>Clear<br>クリア</span></button>
      <button class="sidebtn save" id="saveLink" type="button" aria-label="らくがきをダウンロード"><span>Save<br>ほぞん</span></button>
    </div>`,
  'square utility grid markup'
);

const uiCss = `
<style id="doodle-line-v2-ui">
:root{--tool-size:72px;--tool-gap:10px;--tool-right:20px;--tool-width:calc(var(--tool-size)*2 + var(--tool-gap))}
html,body{overflow:hidden;min-height:100%}body{min-height:100vh!important}
.utilitygrid{position:fixed;z-index:1002;top:74px;right:var(--tool-right);display:grid;grid-template-columns:repeat(2,var(--tool-size));grid-auto-rows:var(--tool-size);gap:var(--tool-gap);width:var(--tool-width)}
.utilitygrid .sidebtn,#saveLink.sidebtn{position:relative!important;inset:auto!important;width:var(--tool-size)!important;height:var(--tool-size)!important;margin:0;padding:0;border:1px solid #000;border-radius:0!important;background:#fff;color:#000;text-decoration:none;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:auto!important}
.utilitygrid .sidebtn span{font:400 13px/1.35 "Yu Gothic UI","Yu Gothic",Meiryo,sans-serif}
.thumbbar{position:fixed!important;z-index:905;top:248px!important;right:var(--tool-right)!important;bottom:18px;width:var(--tool-width);overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;padding:0 0 2px}.thumbbar::-webkit-scrollbar{display:none}
.thumbgrid{display:grid!important;grid-template-columns:repeat(2,var(--tool-size))!important;grid-auto-rows:var(--tool-size);gap:var(--tool-gap)!important;width:var(--tool-width)}
.thumb{width:var(--tool-size)!important;height:var(--tool-size)!important;border-radius:0!important;box-sizing:border-box}.thumb.active{outline:4px solid var(--accent)!important;outline-offset:-4px}
.thumb[data-seat^="H"]::after{content:"new";position:absolute;right:4px;bottom:3px;font:400 9px/1 system-ui,sans-serif;letter-spacing:.04em;background:rgba(255,255,255,.82)}
.pill,.tagline{right:var(--tool-right)!important}#mobile-note{display:none!important}
@media(max-height:520px){:root{--tool-size:60px;--tool-gap:8px}.utilitygrid{top:58px}.thumbbar{top:194px!important}.pill{top:8px}.tagline{top:31px}}
</style>`;
replaceOne('</head>', `${uiCss}\n</head>`, 'two-column square UI');

replaceOne(
  /const seatOrder = \[[^\n]+\];/,
  'const seatOrder = ["A1","A2","A3","B4","B5","B6","C7","C8","C9","D10","D11","D12","E13","E14","E15","F16","F17","F18","G19","G20","G21","H22","H23","H24","H25","H26","H27"];',
  '27 brush seats'
);

replaceOne(
  '  "G21": "brush.sprinkle_oval"\n};',
`  "G21": "brush.sprinkle_oval",
  "H22": "brush.v2_echo",
  "H23": "brush.v2_wave",
  "H24": "brush.v2_beads",
  "H25": "brush.v2_weave",
  "H26": "brush.v2_sparks",
  "H27": "brush.v2_blocks"
};`,
  'six candidate seat mappings'
);

replaceOne(
  /('brush\.seg_wander':\s*\{ params:\{\.\.\.p\(B\), width:\{min:1,max:1\}, rseg:\{ pitch:40, lenScale:3\.6, fracMin:0\.5, fracMax:0\.6667, stepMul:0\.35 \}\}\})\n\};\n    \}\)\(\);/,
`$1,
 'brush.sprinkle_oval':{params:{...p(B),width:{min:1,max:1},spacingPx:14,ellip:{rx:8,ry:4,spread:48,minGap:14}}},
 'brush.v2_echo':{params:{...p(B),width:{min:1,max:1},echo:{offset:8}}},
 'brush.v2_wave':{params:{...p(B),width:{min:1.5,max:1.5},spacingPx:5,wave:{amplitude:10,frequency:0.55}}},
 'brush.v2_beads':{params:{...p(B),width:{min:1,max:1},spacingPx:18,beads:{small:2.5,large:6}}},
 'brush.v2_weave':{params:{...p(B),width:{min:1,max:1},spacingPx:14,weave:{length:14}}},
 'brush.v2_sparks':{params:{...p(B),width:{min:1,max:1},spacingPx:24,sparks:{radiusMin:3,radiusMax:8}}},
 'brush.v2_blocks':{params:{...p(B),width:{min:1,max:1},spacingPx:19,blocks:{sizeMin:5,sizeMax:13}}}
};
    })();`,
  'candidate brush registry and missing G21 config'
);

replaceOne(
  /    \/\/ Seat\/Brush\n    let activeSeatIdx=0;\n    const seatToBrush = \{[\s\S]*?\n\};/,
`    // Seat/Brush — one canonical map
    let activeSeatIdx=0;
    const seatToBrush=FIXED_SEAT_TO_BRUSH;`,
  'single seat map'
);

replaceOne(
  /    const UNDO_MAX=20; const undoStack=\[\];[\s\S]*?    function restoreSnapshot\(\)\{[^\n]+\}/,
`    const UNDO_MAX_BYTES=96*1024*1024;
    const undoStack=[]; let undoBytes=0;
    function updateBackEnabled(){const b=document.getElementById('backBtn');if(b)b.disabled=(undoStack.length===0)}
    function _makeSnapshot(){try{const off=document.createElement('canvas');off.width=cvs.width;off.height=cvs.height;off._dpr=dpr;off._bytes=off.width*off.height*4;const g=off.getContext('2d');g.setTransform(1,0,0,1,0,0);g.drawImage(cvs,0,0);return off}catch(e){return null}}
    function pushSnapshot(){const s=_makeSnapshot();if(!s)return false;const bytes=s._bytes||0;while(undoStack.length&&undoBytes+bytes>UNDO_MAX_BYTES){const old=undoStack.shift();undoBytes-=old._bytes||0}if(bytes>UNDO_MAX_BYTES)return false;undoStack.push(s);undoBytes+=bytes;updateBackEnabled();return true}
    function paintSnapshot(s){if(!s)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);resetStrokeState(ctx);ctx.fillStyle='#fff';ctx.fillRect(0,0,cvs.width,cvs.height);const k=dpr/(s._dpr||dpr);ctx.drawImage(s,0,0,s.width,s.height,0,0,s.width*k,s.height*k);ctx.restore()}
    function restoreSnapshot(){if(!undoStack.length)return;const s=undoStack.pop();undoBytes-=s._bytes||0;paintSnapshot(s);updateBackEnabled()}`,
  'memory-bounded Undo'
);

replaceOne(
  /    function resize\(\)\{[\s\S]*?    addEventListener\('resize', resize, \{passive:true\}\); resize\(\);/,
`    function resize(){
      const previous=(cvs.width&&cvs.height)?_makeSnapshot():null;
      const cssW=Math.max(1,innerWidth),cssH=Math.max(1,innerHeight),MAX_PIXELS=16*1024*1024;
      dpr=Math.max(1,Math.min(2,devicePixelRatio||1,Math.sqrt(MAX_PIXELS/(cssW*cssH))));
      cvs.style.width=cssW+'px';cvs.style.height=cssH+'px';cvs.width=Math.floor(cssW*dpr);cvs.height=Math.floor(cssH*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      ov.style.width=cvs.style.width;ov.style.height=cvs.style.height;ov.width=cvs.width;ov.height=cvs.height;ovctx.setTransform(dpr,0,0,dpr,0,0);clearOverlay();fillWhite();if(previous)paintSnapshot(previous);updateBackEnabled();layoutThumbbar();
    }
    let resizeFrame=0;addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(resize)},{passive:true});resize();`,
  'single resize pipeline'
);

replaceOne(
  /    function layoutThumbbar\(\)\{[\s\S]*?\n\}\n\n    \/\* removed duplicate updateTaglineSizes \*\//,
`    function layoutThumbbar(){/* CSS-driven in V2 */}

    /* removed duplicate updateTaglineSizes */`,
  'remove listener multiplication and JS positioning'
);

replaceOne(
  /      switch\(base\)\{\n          case 'brush\.vStripesD12':[\s\S]*?case 'brush\.bigDotF18_72':[^\n]+\n/,
`      switch(base){
        case 'brush.vStripesD12':for(let x=16;x<=56;x+=10)line(x,14,x,58,1);break;
        case 'brush.sprinkle_cross':for(let y=20;y<=52;y+=16){line(20,y,28,y,1);line(24,y-4,24,y+4,1);line(44,y,52,y,1);line(48,y-4,48,y+4,1)}break;
        case 'brush.seg_wander':line(14,18,42,30,1);line(30,46,58,18,1);line(16,54,48,50,1);break;
        case 'brush.bigDotF18_72':g.beginPath();g.arc(36,36,17,0,Math.PI*2);g.stroke();break;
`,
  'safe thumbnail fallbacks'
);

replaceOne(
`        case 'brush.hatch_slash':
          g.lineCap='butt';
          for(let y=pad; y<H-pad; y+=10){ line(pad,y,pad+16,y-16,1); }
          break;
        default: dots(8); break;`,
`        case 'brush.hatch_slash':g.lineCap='butt';for(let y=pad;y<H-pad;y+=10)line(pad,y,pad+16,y-16,1);break;
        case 'brush.v2_echo':line(12,28,60,28,1);line(12,36,60,36,1);line(12,44,60,44,1);break;
        case 'brush.v2_wave':g.beginPath();for(let x=10;x<=62;x+=2){const y=36+Math.sin((x-10)*.24)*10;x===10?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();break;
        case 'brush.v2_beads':for(let x=14,i=0;x<=58;x+=11,i++){g.beginPath();g.arc(x,36,i%2?6:2.5,0,Math.PI*2);i%2?g.stroke():g.fill()}break;
        case 'brush.v2_weave':for(let x=16,i=0;x<=56;x+=10,i++)line(x-5,36+(i%2?-7:7),x+5,36+(i%2?7:-7),1);break;
        case 'brush.v2_sparks':for(const [x,y] of [[22,26],[47,39],[28,53]]){line(x-5,y,x+5,y,1);line(x,y-5,x,y+5,1)}break;
        case 'brush.v2_blocks':for(let x=14,i=0;x<=56;x+=14,i++){const s=i%2?12:6;g.strokeRect(x-s/2,36-s/2,s,s)}break;
        default:dots(8);break;`,
  'candidate thumbnails'
);

replaceOne(
  /    function attachSeatHandlers\(btn, seatIdx\)\{[\s\S]*?\n    \}/,
`    function attachSeatHandlers(btn,seatIdx){btn.addEventListener('click',()=>setActiveSeat(seatIdx))}`,
  'one brush activation event'
);

replaceOne(
  '          let i=1; while(i<n && cumD[i]<s) i++;',
  '          let lo=1,hi=n-1;while(lo<hi){const mid=(lo+hi)>>1;if(cumD[mid]<s)lo=mid+1;else hi=mid}const i=lo;',
  'binary-search path sampling'
);

const engine = `
    function forEachV2Point(a,b,cfg,key,spacing,visit){
      ensureBrushState(cfg);const S=cfg._state,tick=window.__strokeTick|0,tk=key+'Tick',rk=key+'Resid',ik=key+'Index';
      if(S[tk]!==tick){S[tk]=tick;S[rk]=spacing;S[ik]=0;delete S[key+'Prev']}
      const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy);if(!(dist>0))return;const ux=dx/dist,uy=dy/dist;let remain=dist,local=0,resid=Math.max(.001,S[rk]||spacing);
      while(remain>=resid){local+=resid;visit(a.x+ux*local,a.y+uy*local,ux,uy,S[ik]++,S);remain-=resid;resid=spacing}S[rk]=resid-remain;
    }
    function drawV2CandidateSegment(base,a,b){
      const cfg=currentCfg();if(!cfg||!a||!b)return;const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy);if(!(dist>0))return;const ux=dx/dist,uy=dy/dist,nx=-uy,ny=ux;
      ctx.save();resetStrokeState(ctx);ctx.strokeStyle='#000';ctx.fillStyle='#000';
      if(base==='brush.v2_echo'){const o=cfg.echo?.offset||8;ctx.lineWidth=1;for(const n of [-o,0,o]){ctx.beginPath();ctx.moveTo(a.x+nx*n,a.y+ny*n);ctx.lineTo(b.x+nx*n,b.y+ny*n);ctx.stroke()}}
      else if(base==='brush.v2_wave'){const amp=cfg.wave?.amplitude||10,freq=cfg.wave?.frequency||.55;forEachV2Point(a,b,cfg,'v2wave',cfg.spacingPx||5,(x,y,px,py,i,S)=>{const qx=x-py*Math.sin(i*freq)*amp,qy=y+px*Math.sin(i*freq)*amp,prev=S.v2wavePrev;if(prev){ctx.lineWidth=cfg.width?.min||1.5;ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(qx,qy);ctx.stroke()}S.v2wavePrev={x:qx,y:qy}})}
      else if(base==='brush.v2_beads'){const small=cfg.beads?.small||2.5,large=cfg.beads?.large||6;forEachV2Point(a,b,cfg,'v2beads',cfg.spacingPx||18,(x,y,_x,_y,i)=>{const r=i%2?large:small;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);i%2?(ctx.lineWidth=1,ctx.stroke()):ctx.fill()})}
      else if(base==='brush.v2_weave'){const len=cfg.weave?.length||14;forEachV2Point(a,b,cfg,'v2weave',cfg.spacingPx||14,(x,y,px,py,i)=>{const s=i%2?1:-1,ax=(px-py*s)/Math.SQRT2,ay=(py+px*s)/Math.SQRT2;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-ax*len/2,y-ay*len/2);ctx.lineTo(x+ax*len/2,y+ay*len/2);ctx.stroke()})}
      else if(base==='brush.v2_sparks'){const opt=cfg.sparks||{};forEachV2Point(a,b,cfg,'v2sparks',cfg.spacingPx||24,(x,y,_x,_y,i)=>{const r=(opt.radiusMin||3)+((i*7)%10)/9*((opt.radiusMax||8)-(opt.radiusMin||3));ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.moveTo(x-r*.55,y-r*.55);ctx.lineTo(x+r*.55,y+r*.55);ctx.stroke()})}
      else if(base==='brush.v2_blocks'){const opt=cfg.blocks||{};forEachV2Point(a,b,cfg,'v2blocks',cfg.spacingPx||19,(x,y,px,py,i)=>{const min=opt.sizeMin||5,max=opt.sizeMax||13,s=min+((i*5)%8)/7*(max-min);ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(py,px));ctx.lineWidth=1;ctx.strokeRect(-s/2,-s/2,s,s);ctx.restore()})}
      ctx.restore();
    }
`;
replaceOne('function drawSegment(a,b){', `${engine}\nfunction drawSegment(a,b){`, 'candidate brush engine');
replaceOne(
`        // ---- immediate 系 ----
        switch(base){`,
`        // ---- immediate 系 ----
        if(base.indexOf('brush.v2_')===0){drawV2CandidateSegment(base,a,b);return}
        switch(base){`,
  'candidate brush route'
);

replaceOne(
  /    \/\/ 入力\n[\s\S]*?\n    \/\/ サイドボタン/,
`    // 入力 — one active pointer with pointer capture
    let activePointerId=null,strokeSnapshotPushed=false,lastInputPoint=null;
    function inputPoint(e){const r=cvs.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now(),p:e.pressure>0?e.pressure:.5}}
    function beginStroke(e){if(activePointerId!==null||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();activePointerId=e.pointerId;try{cvs.setPointerCapture(e.pointerId)}catch(_){}window.__strokeTick=((window.__strokeTick|0)+1)|0;resetStrokeState(ctx);resetStrokeState(ovctx);drawing=true;pts.length=0;clearOverlay();const first=inputPoint(e);pts.push(first);lastInputPoint=first;strokeSnapshotPushed=false;__drawIndex=0;__rafPending=false;const cfg=currentCfg();ensureBrushState(cfg);if(cfg&&cfg._state){const S=cfg._state;S.occSnow=new Map();S.bigDotsCenters=[];S.snowPhase=0;S.snowDistAcc=0;S.snowTotal=0;S.snowP=.4+Math.random()*.1;S.bigDotsDist=0;S.spraySide=Math.random()<.5?1:-1;S.hatchResid=0;S.hatchAlt=0;if(S.segOut){S.segOut.remain=0;S.segOut.alt=0;S.segOut.acc=0}}}
    function moveStroke(e){if(!drawing||e.pointerId!==activePointerId)return;e.preventDefault();const p=inputPoint(e),dx=lastInputPoint?p.x-lastInputPoint.x:0,dy=lastInputPoint?p.y-lastInputPoint.y:0,cfg=currentCfg(),thin=cfg&&cfg.width&&cfg.width.min<=2;if(thin&&currentSeat().charAt(0)!=='E'&&dx*dx+dy*dy<1.5625)return;if(!strokeSnapshotPushed)strokeSnapshotPushed=pushSnapshot();pts.push(p);lastInputPoint=p;if(!__rafPending){__rafPending=true;requestAnimationFrame(__flushDraw)}}
    function endStroke(e,cancelled){if(activePointerId===null||(e&&e.pointerId!=null&&e.pointerId!==activePointerId))return;if(cancelled){__rafPending=false;drawing=false;pts=[];clearOverlay();if(strokeSnapshotPushed)restoreSnapshot()}else{if(e&&drawing){const p=inputPoint(e),prev=pts[pts.length-1];if(!prev||Math.hypot(p.x-prev.x,p.y-prev.y)>.01)pts.push(p)}__flushDraw();finish()}try{if(cvs.hasPointerCapture(activePointerId))cvs.releasePointerCapture(activePointerId)}catch(_){}activePointerId=null;strokeSnapshotPushed=false;lastInputPoint=null}
    cvs.addEventListener('pointerdown',beginStroke,{passive:false});cvs.addEventListener('pointermove',moveStroke,{passive:false});cvs.addEventListener('pointerup',e=>endStroke(e,false));cvs.addEventListener('pointercancel',e=>endStroke(e,true));cvs.addEventListener('lostpointercapture',e=>{if(drawing)endStroke(e,true)});addEventListener('blur',()=>{if(drawing)endStroke(null,true)});

    // サイドボタン`,
  'pointer capture and cancellation'
);

replaceOne(
  /      if\(saveLink\)  saveLink\.addEventListener\('click', function\(\)\{[\s\S]*?\n\}\);;/,
`      if(saveLink)saveLink.addEventListener('click',()=>{try{const out=document.createElement('canvas');out.width=cvs.width;out.height=cvs.height;const g=out.getContext('2d');g.setTransform(1,0,0,1,0,0);g.fillStyle='#fff';g.fillRect(0,0,out.width,out.height);g.drawImage(cvs,0,0);out.toBlob(blob=>{if(!blob)return console.error('PNG save failed: empty Blob');const now=new Date(),ts=now.getFullYear()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0')+'_'+String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0')+String(now.getSeconds()).padStart(2,'0'),url=URL.createObjectURL(blob),a=document.createElement('a');a.download='doodle-line_'+ts+'.png';a.href=url;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)},'image/png')}catch(e){console.error('PNG save failed:',e)}});`,
  'asynchronous PNG export'
);

for (const id of ['resize-preserve-251105n','rootfix-seat-brush-mode-251105n','save-move-under-G-251105q','TaglineInit_251108ad','ErowBypass_251108ad']) removeScript(id);
for (const id of ['save-link-fixed-251105o','save-under-grid-251105q']) removeStyle(id);

replaceOne(/<script>\ndocument\.addEventListener\('DOMContentLoaded', function\(\)\{\n  var el = document\.getElementById\('saveLink'\)[\s\S]*?<\/script>\s*/, '', 'remove save position patch');
replaceOne(/<script>\ndocument\.addEventListener\('DOMContentLoaded', function\(\)\{\n  requestAnimationFrame\(\(\)=>\{[\s\S]*?<\/script>\s*/, '', 'remove side position patch');
replaceOne('<footer class="microfoot" id="microfoot">© Doodle Line — Code as Touch prototype by nami</footer>', '<footer class="microfoot" id="microfoot">© Doodle Line — Code as Touch by nami / V2 test build</footer>', 'prototype footer');

const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i][1],{filename:`index-v2-${i+1}.js`});
for(const [label,re] of [['27 seats',/"H27"/],['two columns',/grid-template-columns:repeat\(2,var\(--tool-size\)\)/],['capture',/setPointerCapture/],['Blob export',/toBlob/],['Undo cap',/UNDO_MAX_BYTES/],['new brushes',/drawV2CandidateSegment/]])if(!re.test(html))throw new Error('verification failed: '+label);
for(const forbidden of ['EventTarget.prototype.addEventListener','resize-preserve-251105n','rootfix-seat-brush-mode-251105n','save-move-under-G-251105q'])if(html.includes(forbidden))throw new Error('obsolete code remains: '+forbidden);

fs.writeFileSync(outputPath,html);
fs.writeFileSync(reportPath,`# Doodle Line V2 prototype\n\nGenerated from \`index.html\`; the public \`main\` branch and original file remain unchanged.\n\n## Implemented\n\n${changes.map(x=>'- '+x).join('\n')}\n\n## Brush inventory\n\n- Existing brushes retained: 21\n- New candidates: 6\n- Total: 27\n\nCandidates: Echo, Wave, Beads, Weave, Sparks, Blocks.\n\n## Verification\n\n- Every inline JavaScript block parses successfully.\n- Critical pointer, resize, Undo, save, registry, and event-listener fixes are included.\n- Obsolete patch scripts are absent.\n\n## Not changed yet\n\n- Final tuning of the original 21 brush appearances.\n- Final selection of four to six candidates.\n- Production deployment to \`main\`.\n`);
console.log(`Built ${outputPath}: ${html.length} bytes; ${scripts.length} scripts`);
