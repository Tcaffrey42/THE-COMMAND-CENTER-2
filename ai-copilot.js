(function(){
  'use strict';
  const COPILOT_ID = 'ccAiCopilotPanel';

  function textFrom(el){
    return (el && el.innerText ? el.innerText : document.body.innerText || '').replace(/\s+/g,' ').trim();
  }

  function findWorkOrderContext(start){
    const selectors = ['.modal','.drawer','.work-order-modal','.wo-modal','.ticket-modal','.work-order-detail','.work-order-card','.ticket-card','[data-workorder-id]','[data-wo-id]'];
    let node = start;
    while(node && node !== document.body){
      if(node.matches && selectors.some(sel => { try { return node.matches(sel); } catch(e){ return false; } })) return node;
      node = node.parentElement;
    }
    const visibleDialogs = Array.from(document.querySelectorAll('.modal,.drawer,[role="dialog"],[aria-modal="true"]'))
      .filter(x => x.offsetParent !== null || getComputedStyle(x).position === 'fixed');
    return visibleDialogs[visibleDialogs.length-1] || document.body;
  }

  function detectTrade(t){
    const s=t.toLowerCase();
    if(/hvac|rtu|a\/c|ac |air condition|cooling|heat/.test(s)) return 'HVAC';
    if(/plumb|toilet|sink|leak|water|drain/.test(s)) return 'Plumbing';
    if(/electric|outlet|breaker|lighting|lights|power/.test(s)) return 'Electrical';
    if(/door|lock|glass|entry|hinge/.test(s)) return 'Doors / Glass';
    if(/roof|ceiling|leak/.test(s)) return 'Roofing';
    return 'General Facilities';
  }

  function priority(t){
    const s=t.toLowerCase();
    let score=0, reasons=[];
    [['emergency',3],['closed',3],['flood',3],['fire',3],['smoke',3],['no power',3],['safety',3],['customer',2],['sales floor',2],['leak',2],['hot',2],['hvac',2],['urgent',2],['sla',2],['overdue',2],['approval',1],['vendor',1],['eta',1]].forEach(([k,v])=>{ if(s.includes(k)){ score+=v; reasons.push(k); }});
    if(score>=6) return {level:'CRITICAL', reasons};
    if(score>=3) return {level:'HIGH', reasons};
    if(score>=1) return {level:'MEDIUM', reasons};
    return {level:'STANDARD', reasons:['limited risk indicators found']};
  }

  function summarize(t){
    const trade=detectTrade(t), p=priority(t);
    return `Work Order Summary:\n\nTrade detected: ${trade}\nRecommended priority: ${p.level}\n\nThis work order should be reviewed for site impact, vendor ETA, SLA exposure, approval status, and whether the issue is affecting customer-facing operations.\n\nRecommended next step:\nConfirm current vendor status, documented ETA, and whether escalation or approval is needed today.`;
  }

  function vendor(t){
    const trade=detectTrade(t);
    return `Suggested Vendor / Dispatch:\n\nRecommended trade: ${trade}\nDispatch approach: send to the strongest available ${trade} vendor for this market based on SLA performance, response time, completion history, and location coverage.\n\nVendor instructions:\nPlease confirm receipt, earliest ETA, assigned technician, diagnosis requirements, photo requirements, and whether parts or approval are needed.`;
  }

  function drafts(t){
    const trade=detectTrade(t), p=priority(t);
    return `Draft Client Update:\n\nWe are actively reviewing this ${trade} work order and coordinating the next step with the appropriate service provider. We will confirm vendor availability, expected timing, and any approval requirements as soon as possible.\n\nDraft Vendor Message:\n\nPlease confirm receipt of this work order, earliest available ETA, technician assignment, and any materials or approvals needed to complete service. Priority is currently listed as ${p.level}.\n\nDraft Internal Note:\n\nAI Copilot review completed. Validate vendor ETA, SLA status, operational impact, and approval requirements.`;
  }

  function escalation(t){
    const p=priority(t);
    const flags = [];
    const s=t.toLowerCase();
    if(/sla|overdue|late|aging|72|48|24/.test(s)) flags.push('SLA breach / aging ticket risk');
    if(/approval|estimate|quote|proposal/.test(s)) flags.push('Approval delay risk');
    if(/closed|customer|sales floor|safety|emergency|no power|leak|flood|hot/.test(s)) flags.push('Operational impact risk');
    if(/repeat|again|same issue|history/.test(s)) flags.push('Repeat failure risk');
    if(!flags.length) flags.push('No major escalation flags detected from visible text');
    return `Escalation Check:\n\nPriority: ${p.level}\n\nFlags:\n• ${flags.join('\n• ')}\n\nRecommendation:\n${p.level === 'CRITICAL' || p.level === 'HIGH' ? 'Escalate now if there is no confirmed ETA, owner, or next action documented.' : 'Monitor and confirm the next documented action so this does not age into an SLA issue.'}`;
  }

  function run(type, root){
    const out = root.querySelector('.cc-ai-output');
    const ctx = findWorkOrderContext(root);
    const t = textFrom(ctx);
    const p = priority(t);
    const map = {
      summary: summarize(t),
      priority: `Recommended Priority: ${p.level}\n\nReason indicators found:\n• ${p.reasons.slice(0,8).join('\n• ')}\n\nRecommended action:\nConfirm owner, vendor ETA, SLA status, and next action today.`,
      vendor: vendor(t),
      draft: drafts(t),
      escalation: escalation(t)
    };
    out.innerText = map[type] || summarize(t);
  }

  function createPanel(target){
    const existing = document.getElementById(COPILOT_ID);
    if(existing) existing.remove();
    const panel = document.createElement('div');
    panel.id = COPILOT_ID;
    panel.className = 'cc-ai-panel';
    panel.innerHTML = `
      <div class="cc-ai-panel-header"><h3>AI Work Order Copilot</h3><span class="cc-ai-small">Demo intelligence • safe add-on</span></div>
      <div class="cc-ai-actions">
        <button data-ai="summary">Summarize</button>
        <button data-ai="priority">Recommend Priority</button>
        <button data-ai="vendor">Suggest Vendor/Dispatch</button>
        <button data-ai="draft">Draft Updates</button>
        <button data-ai="escalation">Flag Escalations</button>
        <button class="secondary" data-ai="copy">Copy Output</button>
      </div>
      <div class="cc-ai-output">Select an AI action to analyze the visible work order details.</div>`;
    panel.addEventListener('click', function(e){
      const b=e.target.closest('button[data-ai]'); if(!b) return;
      const type=b.getAttribute('data-ai');
      if(type==='copy'){
        const txt=panel.querySelector('.cc-ai-output').innerText;
        navigator.clipboard && navigator.clipboard.writeText(txt);
        b.innerText='Copied'; setTimeout(()=>b.innerText='Copy Output',1200); return;
      }
      run(type, panel);
    });
    target.appendChild(panel);
  }

  function addFloatingButton(){
    if(document.getElementById('ccAiCopilotFloatingBtn')) return;
    const btn=document.createElement('button');
    btn.id='ccAiCopilotFloatingBtn';
    btn.className='cc-ai-copilot-btn';
    btn.type='button';
    btn.textContent='Ask AI';
    btn.style.position='fixed'; btn.style.right='22px'; btn.style.bottom='22px'; btn.style.zIndex='9998';
    btn.addEventListener('click',()=>createPanel(findWorkOrderContext(btn)));
    document.body.appendChild(btn);
  }

  function init(){
    try { addFloatingButton(); } catch(e) { console.warn('AI Copilot add-on skipped:', e); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
