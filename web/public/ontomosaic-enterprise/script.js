(() => {
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu-toggle');
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

  const board = document.querySelector('.workflow-board');
  if (board) {
    const lab = document.createElement('div');
    lab.className = 'process-lab';
    lab.innerHTML = `
      <div class="lab-toolbar"><div><span class="lab-kicker">ONTOLOGY COMPILER / LIVE TRACE</span><strong>From workflow language to enterprise ontology.</strong></div><div class="lab-metrics"><span><b>03</b> WORKFLOWS</span><span><b>12</b> SOURCES</span><span class="lab-status"><i></i> SIMULATING</span></div></div>
      <div class="build-phases" aria-label="Ontology compilation phases"><strong class="phase-heading">ONTOLOGY COMPILATION PIPELINE</strong><div class="phase-track"><span class="phase-input is-done"><b>01</b> COMPILE EACH WORKFLOW</span><i>→</i><button class="phase-button" data-stage="3"><b>02</b> MERGE ALL WORKFLOWS</button><i>→</i><button class="phase-button" data-stage="4"><b>03</b> VALIDATE ONTOLOGY</button><i>→</i><button class="phase-button" data-stage="5"><b>04</b> PUBLISH ONTOLOGY</button></div></div><div class="workflow-overview" aria-label="Input workflows"><span class="input-heading">INPUT WORKFLOWS · 03 SOURCES</span><div class="input-card is-active"><b>INPUT 01</b><span>Invoice approval</span><small>Finance workflow</small><i>queued for compilation</i></div><div class="input-card"><b>INPUT 02</b><span>Vendor onboarding</span><small>Procurement workflow</small><i>queued for compilation</i></div><div class="input-card"><b>INPUT 03</b><span>PO change request</span><small>Operations workflow</small><i>queued for compilation</i></div></div>
      <div class="trace-scene">
        <div class="trace-source"><span class="source-kicker">WORKFLOW TASK DESCRIPTION</span><strong class="source-title">Invoice approval</strong><small class="source-subtitle">“An analyst checks the invoice, then routes it to the budget owner.”</small><div class="source-document"><i class="task-line task-line-one">When an invoice arrives, the AP analyst checks the vendor and amount.</i><i class="task-line task-line-two">If the amount exceeds $10,000, the budget owner must approve it before payment.</i><i class="task-line task-line-three">After approval, the invoice is posted to SAP and the requester is notified in Slack.</i><span class="scan-beam"></span></div><div class="extracted"><span>EXTRACTED FROM THIS TASK</span><div class="extract-concepts"><b>vendor</b><b>invoice</b><b>budget owner</b></div><div class="extract-actions"><b>check</b><b>approve</b><b>post</b><b>notify</b></div></div></div>
        <div class="trace-graph"><div class="graph-heading"><span>ONTOLOGY IN BUILD <em>AUTO-LAYOUT GRAPH · CLICK TO INSPECT</em></span><small class="graph-state">DRAFT / 01</small></div><div class="graph-network"><div class="cy-graph" aria-label="Interactive ontology graph"></div></div><div class="graph-schema"><span>TYPE</span><b class="schema-type">InvoiceApproval</b><span>PROPERTIES</span><b class="schema-properties">amount · status · owner · source</b></div><div class="action-rail"><span>ACTION SET</span><button class="action-one" data-action="check">CHECK</button><button class="action-two" data-action="approve">APPROVE</button><button class="action-three" data-action="post">POST</button><button class="action-four" data-action="notify">NOTIFY</button></div><div class="action-detail"><span class="detail-label">SELECTED ACTION</span><strong class="detail-action">Approve invoice</strong><dl><dt>GUARD</dt><dd class="detail-guard">amount &gt; $10,000 AND vendor.status = active</dd><dt>EFFECT</dt><dd class="detail-effect">invoice.approved = true</dd><dt>WRITES</dt><dd class="detail-writes">Approval → Invoice.approval_status</dd></dl></div></div>
        <div class="trace-evidence"><span class="evidence-kicker">EVIDENCE REPLAY</span><strong class="evidence-title">Systems and documents</strong><div class="evidence-list"><span><b>SAP</b> invoice.amount</span><span><b>Drive</b> AP-policy.pdf</span><span><b>Slack</b> approval-log</span><span><b>CRM</b> vendor.status</span></div><div class="provenance"><span>PROVENANCE</span><b class="provenance-copy">AP-policy.pdf · §4.2 · budget owner approval</b></div><div class="evidence-result">✓ <span>workflow replay matches</span></div></div>
      </div>
      <div class="trace-foot"><span class="trace-step">01 / SCAN WORKFLOW</span><span class="trace-copy">Read the language of work. Extract concepts, actions and their first connections.</span></div>`;
    board.parentNode.insertBefore(lab, board);
    board.remove();
    const inputCards = [...lab.querySelectorAll('.input-card')];
    const phaseButtons = [...lab.querySelectorAll('.phase-button')];
    const phaseInput = lab.querySelector('.phase-input');
    const states = [
      { title: 'Invoice approval', subtitle: '“An analyst checks the invoice, then routes it to the budget owner.”', task: ['When an invoice arrives, the AP analyst checks the vendor and amount.', 'If the amount exceeds $10,000, the budget owner must approve it before payment.', 'After approval, the invoice is posted to SAP and the requester is notified in Slack.'], concepts: ['vendor', 'invoice', 'budget owner'], actions: ['check', 'approve', 'post', 'notify'], graph: ['VENDOR', 'INVOICE', 'OWNER', 'APPROVAL', 'SAP'], state: 'DRAFT / 01', step: '01 / SCAN WORKFLOW', copy: 'Read the task description. Extract concepts, actions and their first connections.', detail: ['Approve invoice', 'amount > $10,000 AND vendor.status = active', 'invoice.approved = true', 'Approval → Invoice.approval_status'], schema: ['InvoiceApproval', 'amount · status · owner · source'], provenance: 'AP-policy.pdf · §4.2 · budget owner approval' },
      { title: 'Vendor onboarding', subtitle: '“Procurement collects tax forms, verifies the vendor, then opens an account.”', task: ['Procurement collects a W-9 and bank details from a new vendor.', 'The compliance analyst verifies the tax ID before the vendor is activated.', 'The approved vendor is opened in SAP and shared with the buying team.'], concepts: ['vendor', 'tax form', 'account'], actions: ['collect', 'verify', 'activate', 'share'], graph: ['VENDOR', 'TAX FORM', 'ACCOUNT', 'VERIFY', 'SAP'], state: 'MERGE / 02', step: '02 / SCAN WORKFLOW', copy: 'Scan a second workflow. Shared concepts begin to merge into the same ontology.', detail: ['Activate vendor', 'tax_id present AND bank_account verified', 'vendor.status = active', 'Vendor → Account.vendor_id'], schema: ['VendorOnboarding', 'tax_id · status · account_id'], provenance: 'W-9.pdf · vendor.status · compliance-log' },
      { title: 'PO change request', subtitle: '“A requester changes the order, the manager reviews it, and finance records the delta.”', task: ['A requester changes the quantity on an open purchase order.', 'The manager reviews the reason and approves the requested delta.', 'Finance records the change and synchronizes the new amount to the ERP.'], concepts: ['requester', 'purchase order', 'delta'], actions: ['change', 'review', 'record', 'sync'], graph: ['REQUESTER', 'PURCHASE ORDER', 'DELTA', 'REVIEW', 'ERP'], state: 'MERGE / 03', step: '03 / MERGE GRAPHS', copy: 'A third workflow adds new edges. Three graphs become one shared action model.', detail: ['Record PO delta', 'manager.approved = true AND order.status = open', 'purchase_order.amount += delta', 'ChangeRequest → PurchaseOrder.amount'], schema: ['POChange', 'delta · approver · timestamp'], provenance: 'ERP.order_log · manager.approved · finance-ledger' },
      { title: 'Unified workflow graph', subtitle: '“Three workflows now share one graph of objects, actions and writes.”', task: ['Merge invoice, vendor and purchase order into shared identities.', 'Resolve repeated actions into reusable guards and effects.', 'Connect every workflow write to the system of record it updates.'], concepts: ['vendor', 'invoice', 'purchase order', 'owner'], actions: ['merge', 'normalize', 'link', 'write'], graph: ['VENDOR', 'INVOICE', 'ORDER', 'OWNER', 'SYSTEM'], state: 'MERGED / 04', step: '02 / MERGE ALL WORKFLOWS', copy: 'All workflow graphs and action sets are merged into one shared operating model.', detail: ['Normalize shared identity', 'same entity.id AND source.trusted = true', 'vendor.id = canonical_vendor.id', 'Workflow → Shared object'], schema: ['EnterpriseGraph', 'identity · action · system_ref'], provenance: '3 workflows · 12 sources · 31 merged concepts' },
      { title: 'Replay & debug', subtitle: '“Replay systems and documents to find and repair missing edges.”', task: ['Replay invoice.amount from SAP against the approval policy.', 'Compare vendor.status in CRM with the onboarding decision log.', 'Flag a missing owner edge, repair it, and run the workflow again.'], concepts: ['amount', 'status', 'owner'], actions: ['read', 'compare', 'flag', 'repair'], graph: ['AMOUNT', 'STATUS', 'OWNER', 'POLICY', 'LOG'], state: 'VERIFY / 05', step: '03 / VALIDATE ONTOLOGY', copy: 'Read fields, documents and logs. Re-simulate the workflows until the graph holds.', detail: ['Repair owner edge', 'log.actor = budget_owner AND evidence.confidence > 0.9', 'approval.owner = log.actor', 'Approval → Owner.id'], schema: ['ValidationRun', 'source · actor · confidence'], provenance: 'SAP.invoice.amount · Slack.approval-log · CRM.vendor.status' },
      { title: 'Enterprise ontology', subtitle: '“A shared layer that every workflow can read from and write back to.”', task: ['Invoice, vendor and purchase order now share stable identities.', 'Actions resolve to reusable policies, owners and system writes.', 'Every new workflow can query the graph and add evidence back to it.'], concepts: ['vendor', 'invoice', 'purchase order', 'owner'], actions: ['query', 'decide', 'write', 'learn'], graph: ['VENDOR', 'INVOICE', 'ORDER', 'OWNER', 'SYSTEM'], state: 'READY / 06', step: '04 / PUBLISH ONTOLOGY', copy: 'The ontology is ready: grounded in evidence, reusable across every workflow.', detail: ['Write shared context', 'evidence.confidence ≥ 0.98 AND source.trusted = true', 'ontology.version = 1.0', 'Workflow → Ontology → System'], schema: ['EnterpriseOntology', 'identity · policy · provenance'], provenance: '3 workflows · 12 sources · 47 validated edges' },
    ];
    let stage = 0;
    let cy = null;
    const graphEdges = [['n0','n1','requires'],['n0','n2','owned_by'],['n1','n3','subject'],['n2','n3','owner'],['n3','n4','writes_to']];
    function renderGraph(data) {
      if (!window.cytoscape) return;
      const container = lab.querySelector('.cy-graph');
      const labels = data.graph;
      const elements = [...labels.map((label, i) => ({ data: { id: `n${i}`, label, kind: i === 3 ? 'decision' : i === 4 ? 'system' : 'object' } })), ...graphEdges.map(([source, target, label], i) => ({ data: { id: `e${i}`, source, target, label } }))];
      if (cy) cy.destroy();
      cy = window.cytoscape({ container, elements, layout: { name: 'cose', animate: true, padding: 24, idealEdgeLength: 78, nodeRepulsion: 6500, gravity: 0.5 }, style: [
        { selector: 'node', style: { 'label': 'data(label)', 'font-family': 'Cascadia Code, Consolas, monospace', 'font-size': 8, 'color': '#c6d9ea', 'text-wrap': 'ellipsis', 'text-max-width': 72, 'text-valign': 'center', 'text-halign': 'center', 'background-color': '#1a3b59', 'border-color': '#668bac', 'border-width': 1, 'shape': 'round-rectangle', 'width': 64, 'height': 28 } },
        { selector: 'node[kind = "decision"]', style: { 'background-color': '#493b70', 'border-color': '#ae93df', 'color': '#eee7ff' } },
        { selector: 'node[kind = "system"]', style: { 'background-color': '#194a4a', 'border-color': '#65b9ad', 'color': '#d8fff5' } },
        { selector: 'edge', style: { 'label': 'data(label)', 'font-family': 'Cascadia Code, Consolas, monospace', 'font-size': 7, 'color': '#91afc9', 'text-background-color': '#102a44', 'text-background-opacity': 1, 'text-background-padding': 2, 'curve-style': 'bezier', 'line-color': '#5f85a5', 'target-arrow-color': '#8ab2c9', 'target-arrow-shape': 'triangle', 'width': 1, 'opacity': .9 } },
        { selector: 'node.is-selected', style: { 'background-color': '#286b66', 'border-color': '#9bede0', 'color': '#effffc', 'width': 78, 'height': 34, 'font-size': 9, 'border-width': 2 } },
        { selector: 'edge.is-selected', style: { 'line-color': '#9bede0', 'target-arrow-color': '#9bede0', 'width': 2 } }
      ] });
      cy.on('tap', 'node', event => { const node = event.target; showSelection(node.data('label'), nodeMetaFor(node.data('label')), 'SELECTED NODE'); node.addClass('is-selected'); });
      cy.on('tap', 'edge', event => { const edge = event.target; showSelection(edge.data('label'), [edge.data('label') + ' is satisfied by replay evidence', 'relationship becomes reusable context', edge.data('source') + ' → ' + edge.data('target')], 'SELECTED EDGE'); edge.addClass('is-selected'); });
    }
    function nodeMetaFor(label) { return ['identity resolved from workflow evidence', 'properties and state become queryable', label + ' → shared ontology']; }
    function setStage(next) {
      stage = next;
      const data = states[stage];
      lab.dataset.stage = String(stage);
      inputCards.forEach((card, index) => { const active = index === stage && stage < 3; card.classList.toggle('is-active', active); card.querySelector('i').textContent = active ? 'currently compiling' : stage >= 3 ? 'compiled ✓' : 'queued for compilation'; });
      phaseButtons.forEach((button) => button.classList.toggle('is-active', Number(button.dataset.stage) === stage));
      phaseInput?.classList.toggle('is-active', stage < 3);
      lab.querySelector('.build-phases')?.classList.toggle('is-processing', stage >= 3);
      lab.querySelector('.source-title').textContent = data.title;
      lab.querySelector('.source-subtitle').textContent = data.subtitle;
      lab.querySelector('.source-kicker').textContent = stage >= 3 ? (stage === 3 ? 'MERGED WORKFLOW INPUT' : stage === 4 ? 'EVIDENCE REPLAY INPUT' : 'PUBLISHED ONTOLOGY') : 'WORKFLOW TASK DESCRIPTION';
      lab.querySelectorAll('.task-line').forEach((line, index) => {
        line.textContent = data.task[index];
        line.classList.remove('is-scanning');
        void line.offsetWidth;
        window.setTimeout(() => line.classList.add('is-scanning'), index * 260);
      });
      lab.querySelector('.extract-concepts').innerHTML = data.concepts.map(item => `<b>${item}</b>`).join('');
      lab.querySelector('.extract-actions').innerHTML = data.actions.map(item => `<b>${item}</b>`).join('');
      renderGraph(data);
      ['action-one', 'action-two', 'action-three', 'action-four'].forEach((className, index) => { lab.querySelector(`.${className}`).textContent = data.actions[index]; });
      lab.querySelector('.graph-state').textContent = data.state;
      lab.querySelector('.detail-label').textContent = 'SELECTED ACTION';
      lab.querySelector('.detail-action').textContent = data.detail[0];
      lab.querySelector('.detail-guard').textContent = data.detail[1];
      lab.querySelector('.detail-effect').textContent = data.detail[2];
      lab.querySelector('.detail-writes').textContent = data.detail[3];
      lab.querySelector('.schema-type').textContent = data.schema[0];
      lab.querySelector('.schema-properties').textContent = data.schema[1];
      lab.querySelector('.provenance-copy').textContent = data.provenance;
      lab.querySelector('.trace-step').textContent = data.step;
      lab.querySelector('.trace-copy').textContent = data.copy;
    }
    const nodeMeta = {
      vendor: ['Business object', 'identity · status · tax_id', 'vendor.status = active', 'Vendor → Account.vendor_id'],
      invoice: ['Business object', 'amount · approval_status · source', 'invoice.amount > 0', 'Invoice → SAP.invoice'],
      owner: ['Role / actor', 'id · team · authority', 'owner.is_authorized = true', 'Owner → Approval.owner'],
      approval: ['Decision object', 'status · owner · timestamp', 'policy.conditions = satisfied', 'Approval → Invoice.approval_status'],
      sap: ['System of record', 'system · object_id · sync_state', 'source.trusted = true', 'SAP → workflow context']
    };
    function showSelection(title, values, kind) {
      cy?.elements().removeClass('is-selected');
      lab.querySelector('.detail-label').textContent = kind;
      lab.querySelector('.detail-action').textContent = title;
      lab.querySelector('.detail-guard').textContent = values[0];
      lab.querySelector('.detail-effect').textContent = values[1];
      lab.querySelector('.detail-writes').textContent = values[2];
      lab.querySelectorAll('.graph-node,.edge-label,.action-rail button').forEach(item => item.classList.remove('is-selected'));
    }
    lab.querySelectorAll('.graph-node').forEach(node => node.addEventListener('click', () => {
      node.classList.add('is-selected');
      showSelection(node.textContent, nodeMeta[node.dataset.node] || ['entity discovered in task language', 'properties resolved from evidence', 'writes back to shared ontology'], 'SELECTED NODE');
      node.classList.add('is-selected');
    }));
    const edgeMeta = {
      'vendor-invoice': ['vendor.id is present', 'invoice.vendor_id = vendor.id', 'Invoice.vendor_id'],
      'vendor-owner': ['vendor onboarding is approved', 'vendor.owner_id = owner.id', 'Vendor.owner_id'],
      'invoice-approval': ['invoice.amount exceeds policy threshold', 'approval.subject_id = invoice.id', 'Approval.subject_id'],
      'owner-approval': ['owner is authorized for the amount', 'approval.owner = owner.id', 'Approval.owner_id'],
      'approval-sap': ['approval.status = approved', 'sap.invoice.approval_status = approved', 'SAP.invoice.approval_status']
    };
    lab.querySelectorAll('[data-edge]').forEach(edge => edge.addEventListener('click', () => {
      edge.classList.add('is-selected');
      const key = edge.dataset.edge;
      showSelection(edge.textContent || key.replace('-', ' → '), edgeMeta[key] || ['edge validated by replay', 'relationship becomes reusable', 'ontology relationship'], 'SELECTED EDGE');
      edge.classList.add('is-selected');
    }));
    lab.querySelectorAll('.action-rail button').forEach(action => action.addEventListener('click', () => {
      action.classList.add('is-selected');
      const data = states[stage];
      showSelection(action.textContent, [data.detail[1], data.detail[2], data.detail[3]], 'SELECTED ACTION');
      action.classList.add('is-selected');
    }));
    setStage(0);
    phaseButtons.forEach(button => button.addEventListener('click', () => setStage(Number(button.dataset.stage))));
    let timer = window.setInterval(() => setStage((stage + 1) % states.length), 4700);
    lab.addEventListener('mouseenter', () => window.clearInterval(timer));
    lab.addEventListener('mouseleave', () => { timer = window.setInterval(() => setStage((stage + 1) % states.length), 4700); });
  }

  const closing = document.querySelector('.closing');
  if (closing) {
    closing.className = 'connect-work';
    closing.id = 'connect';
    closing.innerHTML = `<div class="wrap connect-inner"><div class="connect-heading"><p class="kicker">04 / CONNECT THE WORK</p><h2 data-zh="让每个工作流都成为可观测、可询问、可行动的系统。" data-en="Make every workflow observable, queryable, and actionable.">Make every workflow observable, queryable, and actionable.</h2><p data-zh="Ontology layer 把分析、决策和员工行动连接到同一份实时上下文中。" data-en="The ontology layer connects analysis, decisions, and employee action to the same live context.">The ontology layer connects analysis, decisions, and employee action to the same live context.</p></div><div class="connect-cases"><article class="connect-case case-replay"><span class="case-number">01 / OBSERVE</span><div class="case-icon">↻</div><h3>Workflow Replay &amp; Profiling</h3><p>Replay 1.2M purchase approvals as a living execution graph. See exactly where work waits, branches, and breaks.</p><div class="case-metric"><b>−37%</b><span>avoidable approval latency</span></div><div class="case-flow"><i>REQUEST</i><i>→</i><i class="hot">POLICY GATE</i><i>→</i><i>ERP WRITE</i></div><div class="case-alert">⚠ 184 instances bypassed the preferred owner path <strong>Inspect path ↗</strong></div></article><article class="connect-case case-bi"><span class="case-number">02 / ASK</span><div class="case-icon">⌁</div><h3>Interactive BI for Workflow Instances</h3><p>Ask a business question in plain language. The graph traces the answer from an executive metric to the exact instances and decisions.</p><div class="case-query">“Why did EMEA renewals slip this week?”<strong>→ 62 late instances · 4 shared blockers</strong></div><div class="case-breakdown"><span><b>41%</b> legal review</span><span><b>33%</b> pricing exception</span><span><b>26%</b> missing owner</span></div></article><article class="connect-case case-agent"><span class="case-number">03 / ACT</span><div class="case-icon">✦</div><h3>Personal Work Agents</h3><p>An employee’s agent sees the same ontology, but only the context and actions they are allowed to use.</p><div class="agent-command"><span>FINANCE OWNER / LIVE QUEUE</span><b>“Prepare the next 5 approvals.”</b><small>Agent found 3 policy matches · 1 missing document · 1 escalation</small><i>REVIEW CONTEXT <em>→</em> WRITE DECISION</i></div></article><article class="connect-case case-more"><span class="case-number">04 / EXTEND</span><div class="case-icon">＋</div><h3>From One Workflow to an Operating System</h3><p>Reuse the same objects, guards, and actions to launch new applications without rebuilding the business model each time.</p><div class="case-tags"><span>CONTROL TOWER</span><span>COMPLIANCE RADAR</span><span>FORECAST ENGINE</span><span>AI COPILOT</span></div><div class="case-deploy"><b>47</b><span>reusable actions now available across teams</span></div><a href="#demo">Open the operating view ↗</a></article></div></div>`;
  }

  const nodes = [...document.querySelectorAll('[data-zh][data-en]')];
  const buttons = [...document.querySelectorAll('[data-language]')];
  function setLanguage(language) {
    const key = language === 'en' ? 'en' : 'zh';
    document.documentElement.lang = key === 'en' ? 'en' : 'zh-CN';
    nodes.forEach(node => { node.textContent = node.dataset[key]; });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === key)));
    if (menu) menu.textContent = key === 'en' ? 'Menu ☰' : '导航 ☰';
    try { localStorage.setItem('ontomosaic-enterprise-language-v2', key); } catch { /* private browsing */ }
  }
  buttons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  let language = 'en';
  try { language = localStorage.getItem('ontomosaic-enterprise-language-v2') || language; } catch { /* default language */ }
  setLanguage(language);
})();
