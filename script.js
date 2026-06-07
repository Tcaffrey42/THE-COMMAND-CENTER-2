let currentWorkOrder = null;

function getWorkOrderData(card) {
  if (!card) return null;

  return {
    id: card.querySelector('.wo-id')?.innerText?.trim() || 'Unknown WO',
    title: card.querySelector('h2')?.innerText?.trim() || 'Untitled Work Order',
    description: card.querySelector('.wo-description')?.innerText?.trim() || 'No description available.',
    trade: card.dataset.trade || 'General Maintenance',
    priority: card.dataset.priority || 'Review Needed',
    age: Number(card.dataset.age || 0),
    location: card.dataset.location || 'Unknown Location',
    asset: card.dataset.asset || 'Unknown Asset',
    status: card.dataset.status || 'Unknown Status'
  };
}

function openAICopilot(button) {
  currentWorkOrder = button.closest('.work-order-card') || button.closest('.ticket-card') || button.closest('.wo-card');
  const wo = getWorkOrderData(currentWorkOrder);

  document.getElementById('aiCopilotModal').classList.remove('hidden');
  document.getElementById('aiTicketContext').innerText = wo
    ? `${wo.id} • ${wo.location} • ${wo.trade} • ${wo.status}`
    : 'AI Copilot ready.';

  document.getElementById('aiOutput').innerText =
    'AI Copilot ready. Select an action to analyze this work order.';
}

function closeAICopilot() {
  document.getElementById('aiCopilotModal').classList.add('hidden');
}

function runAI(type) {
  const output = document.getElementById('aiOutput');
  const wo = getWorkOrderData(currentWorkOrder);

  if (!wo) {
    output.innerText = 'No work order selected. Open a ticket and click Ask AI.';
    return;
  }

  const isCritical = wo.priority.toLowerCase().includes('critical') || wo.age >= 72 || /power|outage|not cooling|closed|emergency/i.test(wo.description);
  const recommendedPriority = isCritical ? 'CRITICAL / HIGH' : wo.priority.toUpperCase();
  const escalationFlags = [];

  if (wo.age >= 72) escalationFlags.push('SLA breach risk: ticket is open 72+ hours');
  if (/outage|not cooling|power|emergency|closed/i.test(wo.description)) escalationFlags.push('Operational impact detected');
  if (/estimate|approval|pending/i.test(wo.description + ' ' + wo.status)) escalationFlags.push('Approval or estimate delay risk');
  if (/ETA not confirmed|not confirmed/i.test(wo.description)) escalationFlags.push('Vendor ETA missing');
  if (escalationFlags.length === 0) escalationFlags.push('No severe escalation flags detected yet');

  const vendorByTrade = {
    HVAC: 'Primary HVAC vendor with same-day response capability',
    Plumbing: 'Primary plumbing vendor with confirmed ETA requirement',
    Electrical: 'Emergency electrical vendor / licensed electrician dispatch',
    General: 'Best available vendor by location and SLA score'
  };

  const responses = {
    summary:
`Work Order Summary:

${wo.id} at ${wo.location} involves ${wo.title.toLowerCase()}.

Details:
${wo.description}

Current status:
${wo.status}

Recommended next step:
Confirm vendor ETA, approval status, and whether this issue is impacting store operations.`,

    priority:
`Recommended Priority: ${recommendedPriority}

Reason:
• Trade: ${wo.trade}
• Asset: ${wo.asset}
• Ticket age: ${wo.age} hours
• Current status: ${wo.status}
• Business impact: ${isCritical ? 'Likely operational impact' : 'Monitor and confirm impact'}

Recommended action:
${isCritical ? 'Escalate today and push for immediate vendor action.' : 'Keep active, confirm ETA, and watch SLA clock.'}`,

    vendor:
`Suggested Vendor / Dispatch:

Recommended dispatch:
${vendorByTrade[wo.trade] || vendorByTrade.General}

Dispatch instructions:
• Confirm receipt immediately
• Require ETA
• Request diagnostic notes and photos
• Ask for repair vs replace guidance if cost is significant
• Update the client after vendor confirmation`,

    draft:
`Draft Client Update:

We are actively managing ${wo.id} for ${wo.location}. The current issue is ${wo.title.toLowerCase()}. We are confirming vendor timing, next steps, and any approval requirements. We will provide another update once the service window or resolution path is confirmed.

Draft Vendor Message:

Please confirm receipt of ${wo.id}, earliest ETA, technician assignment, and whether any materials or approvals are needed. This ticket is currently marked ${wo.priority} priority and needs a clear next action documented.`,

    escalation:
`Escalation Check:

${escalationFlags.map(flag => '• ' + flag).join('\n')}

Recommendation:
${isCritical ? 'Escalate to operations/client team now. Do not let this sit without a confirmed ETA or approval decision.' : 'No emergency escalation yet, but keep the ticket moving and confirm vendor response.'}`
  };

  output.innerText = responses[type];
}

window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') closeAICopilot();
});
