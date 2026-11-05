(() => {
  const chinese = {
    'SEE IT IN ACTION': '观看演示',
    'From a question,': '从一个问题，',
    'to a grounded answer.': '到有据可循的答案。',
    'Watch DocMosaic navigate a document, gather evidence, and reason through an answer in one walkthrough.': '通过一次完整演示，看看 DocMosaic 如何定位页面、收集证据，并逐步推理出答案。',
    'Start with a question about your document.': '从一个关于文档的问题开始。',
    'Follow the agent as it locates relevant pages.': '跟随智能体定位相关页面。',
    'Inspect the text, tables, and visual evidence it collects.': '查阅收集到的文字、表格与视觉证据。',
    'See tool calls and calculations as the answer takes shape.': '查看工具调用与计算，了解答案如何形成。',
    'Trace the final answer back to its supporting sources.': '沿着最终答案，回到支撑它的原始来源。',
    'DocMosaic / Product walkthrough': 'DocMosaic / 产品操作演示',
    'DEMO': '演示',
    'DocMosaic document agent walkthrough': 'DocMosaic 文档智能体操作演示',
    'DocMosaic · Beyond the document. Intelligence in motion.': 'DocMosaic · 超越文档，让智能流动。',
    'Explore the knowledge within your documents. Connect agentic reasoning, visual exploration, and model training to turn complex pages into insights you can trace, question, and build on.': '探索文档深处的知识。连接智能体推理、可视化探索与模型训练，将复杂页面化为可追溯、可探究、可复用的洞见。',
    'Skip to content': '跳到正文',
    'Product navigation': '产品导航',
    'Back to DataMosaic': '返回 DataMosaic 主页',
    'Framework': '框架',
    'Overview': '概览',
    'AGENTIC ORCHESTRATION IN ACTION': '智能体协作编排演示',
    'FOLLOW THE EVIDENCE': '跟随证据探索',
    'DocMosaic agentic orchestration demo': 'DocMosaic 智能体协作编排演示',
    'DocMosaic interaction workflow demo': 'DocMosaic 交互工作流演示',
    'Your browser does not support HTML video.': '你的浏览器不支持 HTML 视频播放。',
    'Demo': '演示',
    'Research': '研究论文',
    'Results': '评测结果',
    'RESULTS': '评测结果',
    'The results behind the reasoning.': '用结果，检验推理。',
    'Reported performance across long-document benchmarks, from frontier models to compact agents.': '从前沿大模型到轻量智能体，查看多个长文档基准上的已报告表现。',
    'Results view': '结果视图',
    'Overall results': '总体结果',
    'Full results': '完整结果',
    'System group': '系统分组',
    'All systems': '全部系统',
    'Direct / OCR': '直接输入 / OCR',
    'Agentic Framework': '智能体框架',
    'Loading results…': '正在加载结果…',
    'Benchmark results table. Scroll horizontally for all metrics.': '基准结果表，可横向滚动查看全部指标。',
    'Reported benchmark results': '已报告的基准测试结果',
    'DocPilot and DocMosaic refer to the same project. DocPilot is the name used in the research paper and the results above. Published results; evaluation settings may differ. Missing results are shown as —. DocPilot reports DocBench, not LongDocURL.': 'DocPilot 与 DocMosaic 是同一项目，研究论文及上表中的评测结果沿用 DocPilot 名称。已公开报告的结果，评测设置可能不同。未报告的结果显示为 —。DocPilot 报告 DocBench，未报告 LongDocURL。',
    'Acc = accuracy; F1 = answer F1; LasJ = LLM-as-a-judge. TXT / LAY / CHA / TAB / FIG / UNA = text / layout / chart / table / figure / unanswerable.': 'Acc = 准确率；F1 = 答案 F1；LasJ = 大模型裁判评分。TXT / LAY / CHA / TAB / FIG / UNA = 文字 / 版式 / 图表 / 表格 / 图像 / 无法回答。',
    'DOCUMENT INTELLIGENCE, ORCHESTRATED': '让智能协作，读懂文档',
    'Beyond the document.': '超越文档。',
    'Intelligence in motion.': '让智能流动。',
    'Explore the knowledge within your documents. DocMosaic connects agentic reasoning, visual exploration, and model training, turning complex pages into insights you can trace, question, and build on.': '探索文档深处的知识。DocMosaic 连接智能体推理、可视化探索与模型训练，将复杂页面化为可追溯、可探究、可复用的洞见。',
    'Get Started': '开始使用',
    'More Details': '了解更多',
    'Paper': '论文',
    'DocMosaic product introduction': 'DocMosaic 产品介绍视频',
    'DOCMOSAIC / PRODUCT INTRODUCTION': 'DOCMOSAIC / 产品介绍',
    'ONE WORKSPACE.': '一个工作空间。',
    'FOUR CONNECTED IDEAS.': '四种相互连接的能力。',
    'Environment': '文档环境',
    'Explore multimodal documents': '探索多模态文档',
    'THE ENVIRONMENT': '多模态文档环境',
    'Multimodal Document Environment': '多模态文档环境',
    'One document. Multiple views. Every detail connected.': '一份文档，多种视图，每处细节相互连接。',
    'DocMosaic connects the big picture with the details that matter. Document overviews, page thumbnails, original page images, and structured elements share the same document and page identifiers, so agents can move from a global view to precise evidence.': 'DocMosaic 将全局视野与关键细节连接起来。文档概览、页面缩略图、原始页面图像与结构化元素共享一致的文档和页码标识，让智能体从整体定位到精确证据。',
    'See the whole document': '纵览整份文档',
    'Scan numbered page thumbnails in a compact overview to find promising pages.': '通过概览中的编号缩略图，快速定位可能相关的页面。',
    'Look closer': '深入页面细节',
    'Switch from lightweight thumbnails to original page images for visual inspection.': '从轻量缩略图切换至原始页面图像，查阅视觉细节。',
    'Access the elements': '访问结构化元素',
    'Read text, tables, figures, and formulas with their layout and source locations preserved.': '读取文字、表格、图像与公式，同时保留版式和原始位置。',
    'A SHARED MULTIMODAL DOCUMENT SPACE': '统一的多模态文档空间',
    '01 / ENVIRONMENT': '01 / 文档环境',
    'Source document': '来源文档',
    'Doc overview': '文档概览',
    'Find the right page': '定位相关页面',
    'Six numbered page thumbnails. Page 06 is highlighted and linked to the page view.': '六张带编号的页面缩略图，其中第 06 页被选中，并与页面视图对应。',
    'Numbered thumbnails': '带页码的缩略图',
    'Page view': '页面视图',
    'Inspect the detail': '查阅页面细节',
    'Page 06 with text, a chart, and a table highlighted at their original locations.': '第 06 页的文字、图表和表格在原始位置上以边界框标出。',
    'Thumbnail ↔ original image': '缩略图 ↔ 原始图像',
    'Layout & elements': '版式与元素',
    'Read the evidence': '读取具体证据',
    'Text': '文字',
    'Table': '表格',
    'Image': '图像',
    'Chart': '图表',
    'Formula': '公式',
    'Layout': '版式',
    'Content · type · position': '内容 · 类型 · 位置',
    'Shared document & page IDs': '共享文档与页码标识',
    'From a global overview to source-grounded evidence.': '从全局概览，深入有来源可循的证据。',
    'Orchestrate': '协作编排',
    'Coordinate specialized agents': '调度各有所长的智能体',
    'Interact': '交互探索',
    'Explore every source': '深入每一处信息来源',
    'Distill': '能力蒸馏',
    'Train document capabilities': '训练文档理解能力',
    'THE FRAMEWORK': '智能体框架',
    'Agentic Orchestration': '智能体协作编排',
    'One question. The right agents. A connected investigation.': '一个问题，协同的智能体，一条连贯的探索路径。',
    'DocMosaic breaks a document task into focused steps. A coordinating agent chooses what to inspect next, delegates to specialized tools, and refines the workflow as evidence arrives.': 'DocMosaic 将文档任务拆解为目标明确的步骤。协调智能体选择下一步的探索方向，调度专用工具，并随着证据积累不断调整工作流。',
    'Navigate & retrieve': '导航与检索',
    'Locate relevant pages, passages, tables, and figures.': '定位相关页面、段落、表格与图像。',
    'Inspect & compute': '查阅与计算',
    'Read visual details and calculate from collected evidence.': '解读视觉细节，基于收集到的证据完成计算。',
    'Check & refine': '检查与改进',
    'Assess what is known and continue searching when evidence is incomplete.': '评估已有信息，在证据不足时继续检索。',
    'A question flows through an orchestrator to navigation, visual inspection, and computation tools; collected evidence informs the next step.': '问题经编排器分发至导航、视觉查阅和计算工具，收集到的证据决定下一步行动。',
    'A TASK-DRIVEN AGENT WORKFLOW': '任务驱动的智能体工作流',
    '02 / ORCHESTRATE': '02 / 协作编排',
    'YOUR QUESTION': '你的问题',
    'What changed, and where is the evidence?': '发生了什么变化？证据在哪里？',
    'Orchestrator': '编排器',
    'Plan · delegate · refine': '规划 · 分工 · 改进',
    'Task + state': '任务 + 状态',
    'Navigator': '导航智能体',
    'Find the right pages': '找到相关页面',
    'Inspector': '查阅智能体',
    'Read visual evidence': '解读视觉证据',
    'Solver': '求解智能体',
    'Compute & compare': '计算与比较',
    'Collected evidence': '收集证据',
    'Informs the next step': '指引下一步行动',
    'THE EXPERIENCE': '交互体验',
    'Interaction Workflow': '交互工作流',
    'Ask naturally. Explore visually. Stay close to the source.': '自然提问，可视探索，始终贴近信息来源。',
    'Bring your documents into a shared reading space. Follow the agent’s investigation, inspect its supporting evidence, and move between an answer and the page that supports it.': '将文档带入统一的阅读空间。跟随智能体的探索过程，查阅支撑答案的证据，在答案与来源页面之间自由切换。',
    'Ask across documents': '跨文档提问',
    'Investigate questions that span pages and files.': '探索跨越多个页面和文件的问题。',
    'Follow the investigation': '跟随探索过程',
    'See the steps and tools used to gather evidence.': '查看收集证据所用的步骤与工具。',
    'Return to the source': '回到信息来源',
    'Open cited pages and inspect the relevant content in context.': '打开引用页面，在上下文中查阅相关内容。',
    'An illustrative reading workspace connects a document page with highlighted evidence to an agent answer with source references.': '阅读工作空间示意：高亮证据的文档页面与带有来源引用的智能体答案相互连接。',
    'QUESTION → INVESTIGATION → EVIDENCE': '问题 → 探索 → 证据',
    '03 / INTERACT': '03 / 交互探索',
    'Document workspace': '文档工作空间',
    'SOURCE DOCUMENT': '来源文档',
    'A closer look at the source': '深入查阅原始文档',
    'Compare the findings across these pages.': '比较这些页面中的发现。',
    'Inspect relevant evidence': '查阅相关证据',
    'An answer you can explore.': '一个可以深入探索的答案。',
    'Read the explanation, then follow each source reference back to the document.': '阅读解释，再沿着每条来源引用回到原始文档。',
    'E1 · Page 6 ↗': 'E1 · 第 6 页 ↗',
    'E2 · Page 18 ↗': 'E2 · 第 18 页 ↗',
    'Illustrative workspace · every reference leads back to its source': '工作空间示意 · 每条引用都指向原始来源',
    'THE LEARNING PATH': '模型学习路径',
    'From LLM to SLM': '从大模型到小模型',
    'Let capable models teach. Let compact models take the next step.': '让强大的模型传授经验，让轻量模型接棒。',
    'Use strong multimodal models to produce document-solving trajectories, then train smaller models on individual abilities and complete workflows. Keep the connection between the question, the action, and its evidence.': '利用强大的多模态模型生成文档求解轨迹，再从单项能力与完整工作流两个层面训练小模型，保留问题、行动与证据之间的联系。',
    'Collect expert trajectories': '收集专家轨迹',
    'Capture tool use, document navigation, and evidence-grounded reasoning.': '记录工具使用、文档导航及基于证据的推理过程。',
    'Train focused capabilities': '训练专项能力',
    'Learn individual document skills and end-to-end task execution.': '学习单项文档技能与端到端任务执行。',
    'Serve compact models': '部署轻量模型',
    'Deploy trained models through vLLM for a self-hosted document agent.': '通过 vLLM 部署训练后的模型，构建自主托管的文档智能体。',
    'A capable multimodal LLM generates expert trajectories. Ability and workflow training transfer those capabilities to a compact document agent.': '多模态大模型生成专家轨迹，通过能力训练和工作流训练，将能力传递给轻量文档智能体。',
    'CAPTURE THE WORKFLOW. TRANSFER THE SKILL.': '记录工作流，传递技能。',
    '04 / DISTILL': '04 / 能力蒸馏',
    'TEACHER': '教师模型',
    'Multimodal LLM': '多模态大模型',
    'Navigate · inspect · reason · use tools': '导航 · 查阅 · 推理 · 使用工具',
    'EXPERT TRAJECTORY': '专家轨迹',
    'Question': '问题',
    'Action': '行动',
    'Evidence': '证据',
    'Answer': '答案',
    'Ability training': '能力训练',
    'Workflow training': '工作流训练',
    'STUDENT': '学生模型',
    'Compact document agent': '轻量文档智能体',
    'Trained capabilities · self-hosted inference': '专项能力训练 · 自主托管推理',
    'Evaluate accuracy, tool use, and evidence grounding for your task.': '围绕你的任务评估准确率、工具使用与证据支撑。',
    'Back to DataMosaic ↗': '返回 DataMosaic ↗',
    'Back to top ↑': '返回顶部 ↑',
  };

  // Keep the same text-node translation and language preference as DBMosaic.
  const bindings = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, [data-language]')) continue;
    const original = node.nodeValue;
    const key = original.trim();
    if (Object.hasOwn(chinese, key)) bindings.push({ node, original, key });
  }
  const attributes = [];
  document.querySelectorAll('[aria-label], [alt], meta[name="description"]').forEach(element => {
    if (element.matches('[data-language]')) return;
    for (const attribute of ['aria-label', 'alt', 'content']) {
      const original = element.getAttribute(attribute);
      if (Object.hasOwn(chinese, original)) attributes.push({ element, attribute, original });
    }
  });
  function setLanguage(next, persist = true) {
    const language = next === 'zh' ? 'zh' : 'en';
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    bindings.forEach(({ node, original, key }) => {
      node.nodeValue = language === 'zh' ? original.replace(key, chinese[key]) : original;
    });
    attributes.forEach(({ element, attribute, original }) => {
      element.setAttribute(attribute, language === 'zh' ? chinese[original] : original);
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
    if (persist) {
      try { localStorage.setItem('datamosaic-language', language); } catch { /* Use the current language when storage is unavailable. */ }
    }
  }
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
  let initial = 'en';
  try { initial = localStorage.getItem('datamosaic-language') || initial; } catch { /* Use English by default. */ }
  setLanguage(initial, false);
})();
