/* Chapter cursors: keep native pointers on touch devices and in essay dialogs. */
(()=>{
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const icon=document.createElement('div');icon.id='chapter-cursor';icon.setAttribute('aria-hidden','true');document.body.append(icon);
 const art={
 create:'<path fill="#c8b9de" d="M24 3 45 15 24 28 3 15Z"/><path fill="#a8c9d2" d="M3 15v24l21 12V28Z"/><path fill="#dac9e4" d="M24 28v23l21-12V15Z"/><path fill="#eee0ef" d="M10 12h7v5h-7zm14-4h7v5h-7zm0 25h7v7h-7z"/><path fill="#83aab6" d="M6 26h7v7H6zm9 10h7v7h-7z"/>',
 chances:'<ellipse cx="24" cy="34" rx="14" ry="11" fill="#d4afc3"/><g fill="#c89daf"><ellipse cx="8" cy="22" rx="6" ry="8" transform="rotate(-25 8 22)"/><ellipse cx="19" cy="12" rx="6" ry="8"/><ellipse cx="32" cy="12" rx="6" ry="8"/><ellipse cx="43" cy="23" rx="6" ry="8" transform="rotate(25 43 23)"/></g><path d="M18 35q6 6 12 0" fill="none" stroke="#fff4f8" stroke-width="2"/>',
 care:'<path d="M25 46C-9 25 4 1 20 12l5 5 5-5C46 1 59 25 25 46Z" fill="#f4dea0" stroke="#c5a86b" stroke-width="1.5"/><path d="M10 20q0-6 6-5" fill="none" stroke="#fffbea" stroke-width="3" stroke-linecap="round"/>',
 contact:'<g fill="#b96b8299" stroke="#782d49" stroke-width="1"><ellipse cx="15" cy="21" rx="14" ry="5" transform="rotate(28 15 21)"/><ellipse cx="37" cy="21" rx="14" ry="5" transform="rotate(-28 37 21)"/><ellipse cx="15" cy="30" rx="12" ry="4" transform="rotate(-18 15 30)"/><ellipse cx="37" cy="30" rx="12" ry="4" transform="rotate(18 37 30)"/></g><path d="M26 16v32" stroke="#72263e" stroke-width="4" stroke-linecap="round"/><circle cx="26" cy="13" r="4" fill="#72263e"/>'};
 let x=0,y=0,lastX=0,lastY=0,active=false,chapter='',stamp=0;
 const sections=['hello','create','chances','care','contact'].map(id=>document.getElementById(id));
 function update(){
  if(!active||!fine.matches){document.body.classList.remove('custom-pointer');icon.hidden=true;return;}
  document.body.classList.add('custom-pointer');
  const chosen=sections.filter(s=>s.getBoundingClientRect().top<=innerHeight*.45).pop()||sections[0];
  const modal=document.querySelector('dialog[open]');
  const motionPaused=document.body.classList.contains('paused');
  const next=modal?'care':chosen.id==='hello'&&motionPaused?'hello-paused':chosen.id;
  if(icon.parentElement!==(modal||document.body))(modal||document.body).append(icon);
  if(next!==chapter){chapter=next;icon.innerHTML=chapter==='hello-paused'?'<img src="assets/caduceus-chrome.png" alt="" draggable="false">':art[chapter]?`<svg viewBox="0 0 52 54">${art[chapter]}</svg>`:'';}
  icon.hidden=chapter==='hello';icon.style.transform=`translate3d(${x}px,${y}px,0)`;
 }
 window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;active=true;x=e.clientX;y=e.clientY;update();
  const dx=x-lastX,dy=y-lastY,now=performance.now();
  if(chapter==='contact'&&fine.matches&&!document.body.classList.contains('paused')&&now-stamp>65&&Math.hypot(dx,dy)>2){
   const ripple=document.createElement('i');ripple.className='cursor-wake';ripple.setAttribute('aria-hidden','true');ripple.style.left=x+'px';ripple.style.top=y+'px';ripple.style.setProperty('--angle',Math.atan2(dy,dx)*180/Math.PI+'deg');document.body.append(ripple);ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});stamp=now;
  }lastX=x;lastY=y;
 },{passive:true});
 window.addEventListener('scroll',update,{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{active=false;update();});
 window.addEventListener('blur',()=>{active=false;update();});fine.addEventListener('change',update);
 let pauseState=document.body.classList.contains('paused');
 new MutationObserver(()=>{const next=document.body.classList.contains('paused');if(next!==pauseState){pauseState=next;update();}}).observe(document.body,{attributes:true,attributeFilter:['class']});
 new MutationObserver(update).observe(document.getElementById('essay-reader'),{attributes:true,attributeFilter:['open']});
})();
