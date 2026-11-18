(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.getElementById('particles');
  const ctx = canvas?.getContext('2d', { alpha: true });
  let width = 0, height = 0, dots = [], frame = 0, visible = !document.hidden;
  let mouseX = -1000, mouseY = -1000;
  const rand = (a,b) => Math.random()*(b-a)+a;
  function resize() {
    if (!ctx) return;
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.min(width < 650 ? 30 : 65,Math.round(width*height/20000));
    dots = Array.from({length:count},()=>({x:rand(0,width),y:rand(0,height),r:rand(.55,1.6),speed:rand(.08,.32),phase:rand(0,6.28),alpha:rand(.18,.65)}));
    if (reduced.matches) draw(false);
  }
  function draw(move = true) {
    if (!ctx) return;
    ctx.clearRect(0,0,width,height);
    dots.forEach(dot => {
      if(move){dot.y-=dot.speed;dot.phase+=.012;if(dot.y < -4){dot.y=height+4;dot.x=rand(0,width)}}
      const alpha=dot.alpha*(.75+.25*Math.sin(dot.phase));
      ctx.beginPath();ctx.fillStyle='rgba(177,190,255,'+alpha+')';ctx.arc(dot.x,dot.y,dot.r,0,Math.PI*2);ctx.fill();
    });
  }
  function animate() {if(!visible || reduced.matches)return;draw();frame=requestAnimationFrame(animate)}
  function start(){cancelAnimationFrame(frame);if(visible && !reduced.matches)animate();else draw(false)}
  let resizeTimeout;
  addEventListener('resize',()=>{clearTimeout(resizeTimeout);resizeTimeout=setTimeout(()=>{resize();start()},140)},{passive:true});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;start()});
  reduced.addEventListener?.('change',start);
  resize();start();

  const glow=document.getElementById('cursor-glow');
  if(matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced.matches) {
    addEventListener('pointermove',e=>{
      mouseX=e.clientX;mouseY=e.clientY;
      if(glow){glow.style.opacity='1';glow.style.left=mouseX+'px';glow.style.top=mouseY+'px'}
    },{passive:true});
    document.querySelectorAll('.social-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const rect=card.getBoundingClientRect();
        card.style.setProperty('--mx',e.clientX-rect.left+'px');
        card.style.setProperty('--my',e.clientY-rect.top+'px');
      },{passive:true});
    });
    const avatar=document.getElementById('avatar-scene');
    avatar?.addEventListener('pointermove',e=>{
      const rect=avatar.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width-.5,y=(e.clientY-rect.top)/rect.height-.5;
      avatar.style.transform='translateY(-4px) rotateY('+x*10+'deg) rotateX('+(-y*10)+'deg)';
      avatar.style.animationPlayState='paused';
    },{passive:true});
    avatar?.addEventListener('pointerleave',()=>{avatar.style.transform='';avatar.style.animationPlayState='running'});
  }

  document.getElementById('year').textContent=String(new Date().getFullYear());
  let toastTimer;
  function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500)}
  document.getElementById('share-btn')?.addEventListener('click',async()=>{
    try {
      if(navigator.clipboard && isSecureContext) await navigator.clipboard.writeText(location.href);
      else {
        const field=document.createElement('textarea');field.value=location.href;field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();const copied=document.execCommand('copy');field.remove();if(!copied)throw Error('not copied');
      }
      toast('Ссылка скопирована');
    } catch(e){toast('Не удалось скопировать ссылку')}
  });
})();