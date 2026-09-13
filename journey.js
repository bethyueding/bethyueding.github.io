'use strict';
// One persistent scene layer carries the staff's own snake into the work chapter,
// then carries the cheetah's tear all the way to the pond. Scroll is the timeline.
(()=>{
 const C=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const S=(a,b,v)=>{const t=C((v-a)/(b-a));return t*t*(3-2*t);};
 const L=(a,b,t)=>a+(b-a)*t;
 const el=document.createElement('canvas');el.id='journey-canvas';el.setAttribute('aria-hidden','true');document.body.append(el);
 const gl=el.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true});if(!gl){el.remove();return;}
 const vs=`attribute vec2 p;attribute vec2 tex;attribute float edge;uniform vec2 viewport;varying vec2 uv;varying float ribbonEdge;varying vec2 screenUv;void main(){uv=tex;screenUv=p/viewport;ribbonEdge=edge;gl_Position=vec4(p/viewport*vec2(2.,-2.)+vec2(-1.,1.),0.,1.);}`;
 const fs=`precision mediump float;varying vec2 uv;varying float ribbonEdge;varying vec2 screenUv;uniform vec4 textBox;uniform float time;uniform float wingFocus;uniform sampler2D image;uniform sampler2D clean;uniform float opacity;uniform float mode;uniform float uncoil;uniform float crystal;
 float wing(vec2 q){float outside=abs(q.x-.5);float bottom=.319;return smoothstep(.022,.034,outside)*(1.-smoothstep(bottom-.003,bottom+.003,q.y));}
 void main(){vec4 color=texture2D(image,uv);if(mode>5.5){float e=ribbonEdge;float shine=pow(max(0.,1.-abs(e+.24)*2.3),9.);float metal=.42+.35*cos(e*4.2)+shine*.35;vec3 silver=vec3(metal,metal+.018,metal+.04);color=vec4(silver,1.-smoothstep(.86,1.,abs(e)));}else if(mode>0.5&&mode<1.5){color.a*=1.-wing(uv);}else if(mode>1.5&&mode<3.5){float exterior=smoothstep(.16,.47,abs(uv.x-.5));float haze=0.;vec2 drift=vec2(sin(uv.y*39.+time*.35),cos(uv.x*27.-time*.27))*.009*exterior;for(int k=0;k<8;k++){float angle=float(k)*.785398;vec2 off=vec2(cos(angle),sin(angle))*.039;haze+=texture2D(image,uv+off+drift).a/8.;}float smoke=.55+.45*sin(uv.x*41.+sin(uv.y*33.)+time*.3);float fade=mix(1.,.06,exterior*wingFocus);float original=color.a;color.rgb=mix(color.rgb,vec3(.76,.73,.94),exterior*.72*wingFocus);color.a=max(original*fade,haze*exterior*.52*smoke*wingFocus);float legible=smoothstep(textBox.x-.025,textBox.x+.025,screenUv.x)*(1.-smoothstep(textBox.z-.025,textBox.z+.025,screenUv.x))*smoothstep(textBox.y-.025,textBox.y+.025,screenUv.y)*(1.-smoothstep(textBox.w-.025,textBox.w+.025,screenUv.y));color.a*=1.-legible*.92*wingFocus;color.a*=wing(uv);color.a*=mode<2.5?1.-step(.5,uv.x):step(.5,uv.x);}else if(mode>3.5&&mode<4.5){float patch=1.-smoothstep(.55,1.,length((uv-vec2(.329,.126))/vec2(.023,.025)));color.rgb=mix(color.rgb,texture2D(clean,uv).rgb,patch);float zone=(1.-smoothstep(.045,.075,abs(uv.x-.348)))*smoothstep(.095,.112,uv.y)*(1.-smoothstep(.180,.195,uv.y));float dark=1.-smoothstep(.13,.34,dot(color.rgb,vec3(.299,.587,.114)));float sweep=1.-smoothstep(crystal*.115+.100,crystal*.115+.112,uv.y);float facets=fract(floor(uv.x*320.)*.37+floor(uv.y*380.)*.63);vec3 pastel=mix(vec3(.39,.56,.77),vec3(.78,.64,.9),facets);pastel+=pow(facets,8.)*.23;color.rgb=mix(color.rgb,pastel,zone*dark*sweep*crystal);}else if(mode>4.5){color.a*=1.-smoothstep(.82,1.,abs(ribbonEdge));float macro=smoothstep(.78,1.,uncoil);vec2 tile=uv*vec2(130.,170.);tile.x+=mod(floor(tile.y),2.)*.5;float scaleLine=smoothstep(.40,.49,length(fract(tile)-.5));color.rgb=mix(color.rgb,mix(vec3(.83,.83,.91),vec3(.67,.72,.84),scaleLine),macro*.6);}gl_FragColor=vec4(color.rgb,color.a*opacity);}`;
 let program;
 try{program=gl.createProgram();for(const [type,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error('Scene shader');gl.attachShader(program,sh);}gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Scene program');}catch{el.remove();return;}
 gl.useProgram(program);gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 for(const [name,count,offset] of [['p',2,0],['tex',2,8],['edge',1,16]]){const at=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,count,gl.FLOAT,false,20,offset);}
 const uniforms={};for(const name of ['viewport','image','clean','opacity','mode','uncoil','crystal','textBox','time','wingFocus'])uniforms[name]=gl.getUniformLocation(program,name);
 gl.uniform1i(uniforms.image,0);gl.uniform1i(uniforms.clean,1);
 const textures={};
 function load(name,url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);textures[name]={texture,img};resolve();};img.onerror=reject;img.src=url;});}
 function quad(x,y,w,h){return [x,y,0,0,0,x+w,y,1,0,0,x,y+h,0,1,0,x,y+h,0,1,0,x+w,y,1,0,0,x+w,y+h,1,1,0];}
 function draw(vertices,name,mode=0,opacity=1){if(opacity<=0||!textures[name])return;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[name].texture);gl.uniform1f(uniforms.mode,mode);gl.uniform1f(uniforms.opacity,C(opacity));gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,vertices.length/5);}
 function wings(x,y,size,side,time,paused,spread=1){const verts=[],pivotX=x+size*.5,pivotY=y+size*.23,flutter=paused?0:Math.sin(time*.0033),scale=1-Math.abs(flutter)*.12,tilt=flutter*.075;for(let iy=0;iy<8;iy++){for(let ix=0;ix<8;ix++){const points=[];for(const [dx,dy] of [[0,0],[1,0],[0,1],[0,1],[1,0],[1,1]]){const u=(ix+dx)/8,v=(iy+dy)/8,px=x+size*u,py=y+size*v;points.push(pivotX+(px-pivotX)*scale*spread,pivotY+(py-pivotY)*(1+(spread-1)*.10)-Math.abs(px-pivotX)*tilt,u,v,0);}verts.push(...points);}}return verts;}
 const cat=document.querySelector('#cheetah'),eyeTrack=document.querySelector('#eye-journey'),care=document.querySelector('#care'),pond=document.querySelector('.pond'),chance=document.querySelector('#chances');
 const topOf=(node,y)=>node.getBoundingClientRect().top+y;
 function contained(rect){const ratio=1024/1536;let width=rect.width,height=width/ratio;if(height>rect.height){height=rect.height;width=height*ratio;}return {x:rect.left+(rect.width-width)/2,y:rect.top+(rect.height-height)/2,w:width,h:height};}
 let lastWidth=0,lastHeight=0;
 function render(st){const {w,h,y,p,paused,sx,sy,size,cp,now}=st;
 if(lastWidth!==w||lastHeight!==h){const dpr=Math.min(devicePixelRatio||1,2);el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);gl.viewport(0,0,el.width,el.height);lastWidth=w;lastHeight=h;}
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(uniforms.viewport,w,h);gl.uniform1f(uniforms.crystal,0);
 const work=document.querySelector('#create'),workTop=topOf(work,y);
 const workProgress=C((y-workTop)/Math.max(1,work.offsetHeight-h));
 const u=C(S(.28,1,p)*.85+workProgress*1.2),left=sx-size*.5,top=sy-size*.5;
 gl.uniform1f(uniforms.uncoil,u);
 if(p<1&&!paused){const focus=S(.12,.50,p),spread=L(1,1.35,focus);const box=document.querySelector('.staff-caption').getBoundingClientRect();gl.uniform4f(uniforms.textBox,box.left/w,box.top/h,(box.left+box.width)/w,(box.top+box.height)/h);gl.uniform1f(uniforms.time,paused?0:now*.001);gl.uniform1f(uniforms.wingFocus,focus);const op=(.7+.3*focus)*(1-S(.68,.90,p));draw(wings(left,top,size,-1,now,paused,spread),'staff',2,op);draw(wings(left,top,size,1,now,paused,spread),'staff',3,op);draw(quad(left,top,size,size),'staff',1,op);}
 work.style.setProperty('--scale-wash','0');
 const visible=paused?1:S(-.2,.02,workProgress);
 work.querySelector('.chapter-intro').style.opacity=String(visible);
 // The complete symbol echoes into depth, then each intact copy visits a card.
 const phase=C((y-(workTop-h*1.13))/Math.max(1,h*1.34));
 const cards=[...work.querySelectorAll('.work-card')];
 const destinations=cards.map(card=>{card.style.transform='none';return card.getBoundingClientRect();});
 // Paint rear copies first, keeping the original in the foreground.
 for(const i of [2,0,1]){
   const front=i===1,depth=front?1:i===0?.77:.61;
   const split=S(0,.27,phase),flight=S(.20+i*.055,.84+i*.055,phase);
   const reveal=paused?1:S(.68,.98,flight),card=cards[i],dest=destinations[i];
   card.style.opacity=String(reveal);card.style.visibility=reveal===0?'hidden':'visible';
   card.style.transform=`translateY(${(1-reveal)*14}px)`;
   if(!paused&&phase>0&&flight<1){
     const initial=Math.min(w*.48,h*.77),z=L(1,depth,split);
     const startX=w*(w<600?.72:.62)+(i-1)*initial*.22*split;
     const startY=h*.48-(1-depth)*initial*.30*split;
     const scale=L(initial*z,Math.min(dest.width*.60,220),flight);
     const cx=L(startX,dest.left+dest.width*.5,flight);
     const cy=L(startY,dest.top+dest.height*.38,flight)-Math.sin(flight*Math.PI)*h*.07;
     const alpha=(front?1:.40)*S(0,front?.10:.20,phase)*(1-S(.60,1,flight));
     draw(quad(cx-scale*.5,cy-scale*.5,scale,scale),'staff',0,alpha);
   }
 }
 // The camera begins on the same displayed cheetah, then tracks its actual eye
 // and black tear line. Geometry is derived from the on-page artwork bounds.
 const trackTop=topOf(eyeTrack,y),start=trackTop-h,span=eyeTrack.offsetHeight,t=C((y-start)/span);
 const stage=cat.parentElement,stageRect=stage.getBoundingClientRect(),catRect=cat.getBoundingClientRect();
 const origin=contained(catRect);let camera={...origin};
 if(y>=start){
   const stageDoc=stageRect.top+y;
   const launchTop=w<600?stageDoc-start:Math.min(Math.max(stageDoc-start,h*.10),stageDoc+stageRect.height-start-catRect.height);
   const launch=contained({left:catRect.left,top:launchTop,width:catRect.width,height:catRect.height});
   const zoom=S(0,.48,t),scale=L(1,w<600?3.5:4.5,zoom),follow=S(.43,.78,t);
   const focusX=L(.330,.342,follow),focusY=L(.096,.187,follow);
   const targetX=w*(w<600?.50:.48),targetY=h*.45;
   const anchorX=L(launch.x+focusX*launch.w,targetX,zoom),anchorY=L(launch.y+focusY*launch.h,targetY,zoom);
   camera={x:anchorX-focusX*launch.w*scale,y:anchorY-focusY*launch.h*scale,w:launch.w*scale,h:launch.h*scale};
 }
 const catVisible=stageRect.top<h&&y<start+span*1.07;
 const fade=1-S(.83,1,t);
 if(catVisible){cat.style.opacity='0';gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textures.clean.texture);gl.uniform1f(uniforms.crystal,S(.52,.84,t));draw(quad(camera.x,camera.y,camera.w,camera.h),'cat',4,fade);}else cat.style.opacity='';
 eyeTrack.querySelector('p').style.opacity=String(S(.65,.86,t)*(1-S(.95,1,t)));
 // One continuous drop rolls down the margin, then falls into the pond.
 const pondRect=pond.getBoundingClientRect(),pondTop=pondRect.top+y,waterDoc=pondTop+pondRect.height*.55;
 // Delay impact until the water surface reaches the viewport midpoint.
 const careTop=topOf(care,y),impactAt=waterDoc-h*.50;
 const marginTravelEnd=waterDoc-h*.92;
 const travel=C((y-careTop+h*.35)/Math.max(1,marginTravelEnd-careTop+h*.35));
 const chin={x:camera.x+camera.w*.342,y:camera.y+camera.h*.187};
 const transfer=S(.78,1,t);
 const marginX=w*(w<700?.965:.965)+Math.sin(travel*Math.PI*3)*Math.min(7,w*.008);
 const rollAt=scroll=>h*(.78+.03*C((scroll-careTop+h*.35)/Math.max(1,marginTravelEnd-careTop+h*.35))**2);
 const rollingY=rollAt(y);
 const waterX=pondRect.left+pondRect.width*.5,waterY=waterDoc-y;
 let dx=L(chin.x,marginX,transfer),dy=L(chin.y,rollingY,transfer);
 // Turn exactly when the falling drop meets the final note's pushpin.
 const lastNote=document.querySelector('.singing-tile:last-child');
 const journal=document.querySelector('.journal');
 const pinDoc=lastNote?topOf(lastNote,y)-7:careTop+care.offsetHeight-h*.5;
 let lo=careTop-h,hi=careTop+care.offsetHeight;
 for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(mid+rollAt(mid)<pinDoc)lo=mid;else hi=mid;}
 const turnAt=(lo+hi)/2;
 const paperBottom=journal?journal.getBoundingClientRect().bottom+y:careTop+care.offsetHeight;
 const centerAt=Math.max(turnAt+h*.25,paperBottom-h*.86);
 if(y>=turnAt){
   const turn=S(turnAt,centerAt,y);
   dx=L(marginX,waterX,turn);dy=L(rollAt(turnAt),h*.86,turn);
 }
 if(y>=centerAt){
   const fall=C((y-centerAt)/Math.max(1,impactAt-centerAt));
   // The drop scrolls with the page, then accelerates toward the water.
   // This preserves its position at the handoff without an upward snap.
   const releaseDoc=centerAt+h*.86;
   dx=waterX;dy=releaseDoc-y+(waterDoc-releaseDoc)*fall*fall;
 }
 const grow=S(.66,.82,t),impact=S(impactAt,impactAt+h*.16,y);
 const dropSize=(w<700?26:44)*grow*(1-impact);
 if(dropSize>0){draw(quad(dx-dropSize*.5,dy-dropSize*.72,dropSize,dropSize*1.5),'tear',0,grow*(1-impact));}
 const ringProgress=S(impactAt,impactAt+h*.45,y);
 pond.querySelectorAll('.ripple').forEach((r,i)=>{const spread=C(ringProgress*1.7-i*.15);r.style.transform=`translate(-50%,-50%) scale(${L(.08,1.18,spread)})`;r.style.opacity=String(ringProgress===0?.16:Math.max(.18,1-spread*.72));});
 if(impact>0&&impact<1){for(let i=0;i<5;i++){const theta=(i/4)*Math.PI,dist=Math.sin(impact*Math.PI)*(w<600?38:65),s=7*(1-impact);draw(quad(waterX+Math.cos(theta)*dist-s/2,waterY-Math.sin(theta)*dist*.65,s,s*1.5),'tear',0,(1-impact)*.6);}}
 }
 Promise.all([load('staff','assets/caduceus-chrome.png'),load('cat','assets/cheetah.png'),load('clean','assets/cheetah-clean.png'),load('tear','assets/crystal-tear.png')]).then(()=>{document.body.classList.add('journey-ready');window.renderJourney=render;requestFrame();}).catch(()=>{el.remove();});
 el.addEventListener('webglcontextlost',()=>{window.renderJourney=null;document.body.classList.remove('journey-ready');cat.style.opacity='';});
})();
