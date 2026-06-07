/* CommandCenter V2.16 - Supabase Auth + User Roles
   Uses your existing Supabase project from env.js:
   window.COMMANDCENTER_ENV = { SUPABASE_URL, SUPABASE_ANON_KEY }
*/
(function(){
 const cfg=window.COMMANDCENTER_ENV||{};
 const hasSupabase=!!(window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
 const sb=hasSupabase ? window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY) : null;
 const ROLE_NAV={
  admin:['*'],
  executive:['warroom','amdashboard','dashboard','locations','heatmap','proposals','approvals','assets','vendors','copilot','executive','cfo','projects','reports','documents','settings'],
  facility_manager:['warroom','amdashboard','dashboard','workorders','pm','dispatch','escalations','sla','locations','heatmap','proposals','approvals','assets','vendors','copilot','projects','reports','documents'],
  vendor:['workorders','dispatch','sla','documents'],
  technician:['workorders','dispatch','locations','assets','documents'],
  client:['dashboard','workorders','locations','proposals','approvals','documents','copilot']
 };
 const ROLE_ACTIONS={
  createWO:['admin','facility_manager','client'],
  createProposal:['admin','facility_manager'],
  exportData:['admin','executive','facility_manager'],
  manageUsers:['admin']
 };
 function normRole(v){
  const r=String(v||'client').toLowerCase().replace(/\s+/g,'_').replace(/[^a-z_]/g,'');
  if(['admin','owner','account_executive'].includes(r))return 'admin';
  if(['operator','facility_manager','fm','account_manager','trade_lead'].includes(r))return 'facility_manager';
  if(['executive','finance','cfo','read_only','readonly'].includes(r))return 'executive';
  if(['vendor','vendor_portal_user'].includes(r))return 'vendor';
  if(['technician','tech'].includes(r))return 'technician';
  return 'client';
 }
 function roleLabel(r){return ({admin:'Admin',executive:'Executive',facility_manager:'Facility Manager',vendor:'Vendor',technician:'Technician',client:'Client'})[r]||'Client'}
 function allowed(pageId){
  const role=window.ccAuth?.role||'client';
  const list=ROLE_NAV[role]||ROLE_NAV.client;
  return list.includes('*')||list.includes(pageId);
 }
 function can(action){
  const role=window.ccAuth?.role||'client';
  return (ROLE_ACTIONS[action]||[]).includes(role);
 }
 function showAuth(){
  document.body.classList.add('ccAuthLocked');
  if(document.getElementById('ccAuthOverlay'))return;
  const div=document.createElement('div');
  div.id='ccAuthOverlay';div.className='ccAuthOverlay';
  div.innerHTML=`<div class="ccAuthCard"><img src="./cc-commandcenter-stacked.png" alt="CC CommandCenter"><h2>Secure Login</h2><p>Sign into CommandCenter with your Supabase user account. Roles control the modules and actions each user can access.</p><div class="ccAuthError" id="ccAuthError"></div><form class="ccAuthForm" id="ccAuthForm"><input id="ccAuthEmail" type="email" placeholder="Email" autocomplete="email" required><input id="ccAuthPassword" type="password" placeholder="Password" autocomplete="current-password" required><button class="btn dark" type="submit">Login</button></form><div class="ccAuthHelp">Supabase connected: <b>${hasSupabase?'Yes':'No — add URL + anon key in env.js'}</b></div></div>`;
  document.body.appendChild(div);
  document.getElementById('ccAuthForm').addEventListener('submit',async e=>{
   e.preventDefault();
   const err=document.getElementById('ccAuthError');err.style.display='none';
   if(!sb){err.textContent='Supabase keys are missing in env.js.';err.style.display='block';return;}
   const email=document.getElementById('ccAuthEmail').value.trim();
   const password=document.getElementById('ccAuthPassword').value;
   const {data,error}=await sb.auth.signInWithPassword({email,password});
   if(error){err.textContent=error.message;err.style.display='block';return;}
   await loadProfile(data.session?.user);
  });
 }
 async function loadProfile(user){
  if(!user){showAuth();return;}
  let profile={email:user.email,full_name:user.user_metadata?.full_name||user.email,role:'client',status:'Active'};
  try{
   const {data,error}=await sb.from('profiles').select('*').eq('id',user.id).maybeSingle();
   if(!error && data) profile={...profile,...data};
  }catch(e){console.warn('profiles lookup skipped',e)}
  // Fallback for the existing prototype app_users table if profiles has not been created yet.
  try{
   if((!profile.role || profile.role==='client') && window.db?.users){
    const local=(window.db.users||[]).find(u=>String(u.email||u.name||'').toLowerCase()===String(user.email||'').toLowerCase());
    if(local) profile={...profile,full_name:local.name||profile.full_name,role:local.access||local.role||profile.role,status:local.status||profile.status};
   }
  }catch(e){}
  const role=normRole(profile.role||profile.access);
  window.ccAuth={user,profile,role,roleLabel:roleLabel(role),allowed,can};
  localStorage.setItem('commandCenterLoggedUser',profile.full_name||profile.email||user.email);
  document.body.classList.remove('ccAuthLocked');
  document.getElementById('ccAuthOverlay')?.remove();
  applyRoleGate();
  toast(`Logged in as ${roleLabel(role)}`);
 }
 function applyRoleGate(){
  const auth=window.ccAuth;if(!auth)return;
  const controls=document.querySelector('.controls');
  if(controls && !document.getElementById('ccUserBar')){
   const bar=document.createElement('div');bar.id='ccUserBar';bar.className='ccUserBar';
   bar.innerHTML=`<span class="ccRoleBadge">🔐 <span id="ccUserName"></span> · <span id="ccRoleName"></span></span><button class="btn" type="button" onclick="ccLogout()">Logout</button>`;
   controls.prepend(bar);
  }
  document.getElementById('ccUserName').textContent=auth.profile.full_name||auth.profile.email||auth.user.email;
  document.getElementById('ccRoleName').textContent=auth.roleLabel;
  const fakeUser=document.getElementById('loginUserSelect'); if(fakeUser) fakeUser.style.display='none';
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('ccHiddenByRole',!allowed(b.dataset.id)));
  document.querySelectorAll('button[onclick="openWOForm()"],button[onclick="addWO()"],button[onclick^="openWOForm"]').forEach(b=>b.classList.toggle('ccHiddenByRole',!can('createWO')));
  document.querySelectorAll('button[onclick="openProposalForm()"],button[onclick="addProposal()"],button[onclick^="openProposalForm"]').forEach(b=>b.classList.toggle('ccHiddenByRole',!can('createProposal')));
  document.querySelectorAll('button[onclick="exportData()"]').forEach(b=>b.classList.toggle('ccHiddenByRole',!can('exportData')));
  const active=document.querySelector('.page.active')?.id;
  if(active && !allowed(active)){
   const first=[...document.querySelectorAll('.page')].find(p=>allowed(p.id));
   if(first && typeof setPage==='function') setPage(first.id);
  }
  const usersPage=document.getElementById('users');
  if(usersPage && !can('manageUsers') && usersPage.classList.contains('active')){
   usersPage.innerHTML='<div class="ccAccessDenied"><h3>Access Restricted</h3><p class="muted">Only Admin users can manage users and roles.</p></div>';
  }
 }
 window.ccLogout=async function(){try{if(sb)await sb.auth.signOut()}catch(e){} window.ccAuth=null; showAuth();};
 const oldSetPage=window.setPage;
 window.setPage=function(id){
  if(window.ccAuth && !allowed(id)){toast('Access restricted for '+window.ccAuth.roleLabel);return;}
  oldSetPage(id); setTimeout(applyRoleGate,0);
 };
 const oldRender=window.render;
 if(typeof oldRender==='function') window.render=function(){oldRender();setTimeout(applyRoleGate,0)};
 async function boot(){
  if(!sb){showAuth();return;}
  const {data}=await sb.auth.getSession();
  if(data?.session?.user) await loadProfile(data.session.user); else showAuth();
  sb.auth.onAuthStateChange((_event,session)=>{ if(session?.user) loadProfile(session.user); else showAuth(); });
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50)); else setTimeout(boot,50);
})();
