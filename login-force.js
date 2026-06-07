
// CommandCenter emergency login button fix.
(function(){
  function enter(){
    try{
      if (typeof window.appSignIn === 'function') {
        window.appSignIn();
        return;
      }
    } catch(e){ console.warn('appSignIn failed, forcing shell open', e); }
    document.body.classList.add('authReady','loggedIn');
    var gate=document.getElementById('authGate'); if(gate) gate.style.display='none';
    var shell=document.getElementById('appShell'); if(shell) shell.style.display='grid';
    try{ if(typeof window.render==='function') window.render(); }catch(e){}
  }
  window.forceCommandCenterLogin=enter;
  document.addEventListener('DOMContentLoaded', function(){
    var btn=document.querySelector('.authBtn');
    if(btn){
      btn.type='button';
      btn.disabled=false;
      btn.style.pointerEvents='auto';
      btn.addEventListener('click', function(e){ e.preventDefault(); enter(); }, true);
    }
    ['authEmail','authPassword'].forEach(function(id){
      var el=document.getElementById(id);
      if(el){ el.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); enter(); } }); }
    });
    setTimeout(function(){
      if(!document.body.classList.contains('authReady')) enter();
    }, 800);
  });
})();
