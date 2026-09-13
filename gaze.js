// Warp only the open eye interior in each original portrait. Eyelids,
// the closed eye, hair and face retain their original positions.
(() => {
 const base=document.querySelector('#portrait'),left=document.querySelector('#portrait-left');
 const stage=document.querySelector('.portrait-stage');
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
 canvas.id='portrait-gaze';stage.append(canvas);
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false});
 if(!gl)return;
 const vertex=`attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;
 const fragment=`precision mediump float;
 varying vec2 uv;uniform sampler2D rightPhoto;uniform sampler2D leftPhoto;
 uniform float blend;uniform float vertical;
 vec2 track(vec2 center,vec2 radius){
   vec2 d=(uv-center)/radius;
   float interior=1.-smoothstep(.30,1.,dot(d,d));
   return uv-vec2(0.,vertical*.0055*interior);
 }
 void main(){
   vec4 a=texture2D(rightPhoto,track(vec2(.410,.479),vec2(.047,.022)));
   vec4 b=texture2D(leftPhoto,track(vec2(.615,.464),vec2(.048,.023)));
   gl_FragColor=mix(a,b,blend);
 }`;
 function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Gaze shader');return s;}
 function init(){
  if(!base.naturalWidth||!left.naturalWidth||window.drawPortrait)return;
  try{
   const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
   [base,left].forEach((img,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.uniform1i(gl.getUniformLocation(program,i?'leftPhoto':'rightPhoto'),i);});
   canvas.width=base.naturalWidth;canvas.height=base.naturalHeight;gl.viewport(0,0,canvas.width,canvas.height);
   const blend=gl.getUniformLocation(program,'blend'),vertical=gl.getUniformLocation(program,'vertical');
   window.drawPortrait=(mix,y)=>{gl.uniform1f(blend,mix);gl.uniform1f(vertical,y);gl.drawArrays(gl.TRIANGLES,0,6);};
   window.drawPortrait(0,0);stage.classList.add('vertical-gaze-ready');
  }catch{stage.classList.remove('vertical-gaze-ready');}
 }
 base.addEventListener('load',init);left.addEventListener('load',init);init();
 canvas.addEventListener('webglcontextlost',()=>{window.drawPortrait=null;stage.classList.remove('vertical-gaze-ready');});
})();
