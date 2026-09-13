'use strict';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduce.matches;
const toggle=document.querySelector('#motion-toggle');
function setMotion(){document.body.classList.toggle('paused',paused);toggle.textContent=paused?'Enable motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));requestFrame();}
toggle.addEventListener('click',()=>{paused=!paused;setMotion();});
reduce.addEventListener('change',()=>{paused=reduce.matches;setMotion();});

// Two original portraits, animated with vanilla JavaScript and CSS opacity.
const portrait=document.querySelector('#portrait');
const portraitLeft=document.querySelector('#portrait-left');
let lastFrameTime=0,directionAnchor=null,horizontalIntent=0;
const hero=document.querySelector('.hero-track'),staff=document.querySelector('#staff'),heroCopy=document.querySelector('.hero-copy'),stage=document.querySelector('.portrait-stage'),note=document.querySelector('.hero-note'),caption=document.querySelector('.staff-caption'),heroFooter=document.querySelector('.hero-footer');
const snake=document.querySelector('#snake'),cheetah=document.querySelector('#cheetah'),chance=document.querySelector('#chances'),create=document.querySelector('#create'),drop=document.querySelector('.droplet'),pond=document.querySelector('.pond');
// Animate the supplied silver-snake artwork as a flexible ribbon along its body.
// The original image remains the fallback when WebGL is unavailable.
let drawSnake=null;
function setupSnake(){
 const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');
 const gl=c.getContext('webgl',{alpha:true,premultipliedAlpha:false});if(!gl)return;
 const vs='attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
 const fs='precision mediump float;varying vec2 uv;uniform sampler2D art;uniform float phase;uniform float amount;void main(){vec2 q=uv;q.x+=sin(uv.y*15.-phase)*.022*sin(uv.y*3.14159)*amount;gl_FragColor=texture2D(art,q);}';
 try{const prog=gl.createProgram();for(const [type,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))return;gl.attachShader(prog,s);}gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return;gl.useProgram(prog);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,snake);c.width=snake.naturalWidth;c.height=snake.naturalHeight;gl.viewport(0,0,c.width,c.height);const phase=gl.getUniformLocation(prog,'phase'),amount=gl.getUniformLocation(prog,'amount');
 c.style.cssText='position:sticky;top:13vh;width:90%;height:76vh;object-fit:contain;display:block;';
 snake.after(c);snake.style.display='none';
 drawSnake=(p)=>{if(innerWidth<600){c.style.width='180%';c.style.marginLeft='-40%';c.style.height='65vh';c.style.top='15vh';}else{c.style.width='90%';c.style.marginLeft='0';c.style.height='76vh';c.style.top='13vh';}gl.uniform1f(phase,p*18);gl.uniform1f(amount,paused?0:1);gl.drawArrays(gl.TRIANGLES,0,6);};drawSnake(0);
 c.addEventListener('webglcontextlost',()=>{c.remove();snake.style.display='';drawSnake=null;});
 }catch{c.remove();snake.style.display='';}
}
if(snake.complete&&snake.naturalWidth)setupSnake();else snake.addEventListener('load',setupSnake,{once:true});
let expressionTarget=0;
let pointer={x:innerWidth*.49,y:innerHeight*.36},current={...pointer},gaze={x:0,y:0},touched=false,frame=0,expressionBlend=0;
const fine=matchMedia('(pointer:fine)');
window.addEventListener('pointermove',e=>{if(!fine.matches||paused)return;pointer={x:e.clientX,y:e.clientY};
 // Require a deliberate horizontal gesture. Mostly vertical motion never
 // accumulates enough sideways drift to unexpectedly change the wink.
 if(directionAnchor!==null){
   const dx=e.clientX-directionAnchor.x,dy=e.clientY-directionAnchor.y;
   if(Math.abs(dx)>Math.abs(dy)*1.5){
     if(Math.sign(dx)!==Math.sign(horizontalIntent))horizontalIntent=0;
     horizontalIntent+=dx;
     if(Math.abs(horizontalIntent)>=48){expressionTarget=horizontalIntent<0?1:0;horizontalIntent=0;}
   }else if(Math.abs(dy)>1){horizontalIntent=0;}
 }
 directionAnchor={x:e.clientX,y:e.clientY};
 touched=true;requestFrame();},{passive:true});
window.addEventListener('scroll',requestFrame,{passive:true});
window.addEventListener('resize',()=>{if(!touched)pointer={x:innerWidth*.49,y:innerHeight*.36};requestFrame();},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestFrame();});
function requestFrame(){if(!frame)frame=requestAnimationFrame(render);}
function render(now=performance.now()){const dt=Math.min(50,Math.max(0,now-lastFrameTime||16.67));lastFrameTime=now;frame=0;if(document.hidden)return;
 const w=innerWidth,h=innerHeight,y=scrollY,mobile=w<600;
 const p=clamp(y/Math.max(1,hero.offsetHeight-h));
 const landing=smooth(.05,.63,p),depart=smooth(.84,1,p);
 const target=paused||!fine.matches?{x:w*.51,y:h*.48}:pointer;
 current.x=target.x;current.y=target.y;
 document.body.classList.toggle('hero-cursor-active',p<.05&&!paused);
 const sx=current.x*(1-landing)+w*(mobile?.72:.62)*landing;
 const sy=current.y*(1-landing)+h*(mobile?.61:.48)*landing;
 const size=(mobile?54:78)+(mobile?278:536)*landing;
 staff.style.width=size+'px';staff.style.transform=`translate(${sx-size*.5}px,${sy-size*.75}px)`;
 staff.style.opacity=String((.53+.47*landing)*(1-depart));
 staff.style.visibility=y>hero.offsetHeight?'hidden':'visible';
 staff.style.filter=`drop-shadow(0 ${10*landing}px ${12*landing}px #6e879633)`;
 const fade=smooth(.03,.36,p);
 heroCopy.style.opacity=String(1-fade);heroCopy.style.transform=`translateY(${-45*fade}px)`;
 heroCopy.style.visibility=fade===1?'hidden':'visible';
 // Restore the established portrait placement; cursor affects expression only.
 stage.style.opacity=String(1-smooth(.14,.61,p));
 stage.style.transform=`translate(${paused?0:90*landing}px,${paused?0:25*landing}px) scale(${1-.05*landing})`;
 stage.style.visibility=p>=.61?'hidden':'visible';
 if(!paused)expressionBlend+=(expressionTarget-expressionBlend)*(1-Math.exp(-dt/55));
 portraitLeft.style.opacity=String(expressionBlend);
 const faceBounds=stage.getBoundingClientRect();
 const openEyeY=faceBounds.top+faceBounds.height*(.479*(1-expressionBlend)+.464*expressionBlend);
 const verticalTarget=paused||!fine.matches||!touched?0:clamp((pointer.y-openEyeY)/Math.max(100,h*.35),-1,1);
 gaze.y+=(verticalTarget-gaze.y)*(1-Math.exp(-dt/90));
 if(window.drawPortrait)window.drawPortrait(expressionBlend,paused?0:gaze.y);
 note.style.opacity=String(1-fade);heroFooter.style.opacity=String(1-fade);
 caption.style.opacity=String(smooth(.25,.48,p)*(1-smooth(.75,1,p)));caption.style.transform=`translateY(${22*(1-landing)}px)`;
 const cp=clamp((y-create.offsetTop+h*.5)/create.offsetHeight);
 if(drawSnake)drawSnake(cp);
 snake.style.transform=paused?'none':`translate(${Math.sin(cp*8)*10}px,${Math.sin(cp*5)*15}px) rotate(${Math.sin(cp*7)*3}deg)`;
 const qp=clamp((y-chance.offsetTop+h*.4)/chance.offsetHeight);
 cheetah.style.transform=paused?'none':`translateY(${Math.sin(qp*4)*-12}px) scale(${1+qp*.035})`;
 const drect=document.querySelector('.tear-bridge').getBoundingClientRect();const dp=smooth(h*.8,-100,drect.top);
 drop.style.transform=`translateY(${paused?0:dp*115}px) rotate(-35deg)`;
 const prect=pond.getBoundingClientRect();const pp=clamp((h-prect.top)/(h+prect.height));
 pond.querySelectorAll('.ripple').forEach((el,i)=>{el.style.transform=`translate(-50%,-50%) scale(${paused?1:.75+pp*(.45+i*.12)})`;});
 if(window.renderJourney)window.renderJourney({w,h,y,p,paused,sx,sy,size,cp,qp,now:performance.now()});
 if(!paused&&y<hero.offsetHeight)requestFrame();
}
setMotion();
