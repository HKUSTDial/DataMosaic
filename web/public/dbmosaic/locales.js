(() => {
  // Translate text nodes, not HTML, so links, code and event handlers stay intact.
  const english = {
    'DBMosaic · 从文档到数据库': 'DBMosaic · From documents to databases',
    'DBMosaic 把非结构化文档做成守得住关系约束的数据库。抽取、校验、修复形成闭环。VLDB 2026。': 'DBMosaic turns unstructured documents into databases that respect relational constraints. A closed loop of extraction, verification and repair. VLDB 2026.',
    '跳到正文': 'Skip to content',
    'DBMosaic 品牌动画': 'DBMosaic brand animation',
    'DBMosaic：让文档中的信息汇聚为结构化数据': 'DBMosaic: bringing information from documents into structured data',
    'DBMosaic 首页': 'DBMosaic home',
    '导航': 'Menu',
    '打开导航': 'Open navigation',
    '关闭导航': 'Close navigation',
    '主导航': 'Main navigation',
    '核心能力': 'Capabilities',
    '工作原理': 'How it works',
    '研究论文': 'Research',
    '演示': 'Demo',
    '让抽取遇见关系语义': 'Extraction meets relational semantics',
    '从文档': 'From documents ',
    '到': 'to ',
    '数据库': 'databases',
    '从非结构化文档到关系数据库。DBMosaic 将抽取、校验与修复连接成闭环，让每一条记录有据可循，让每一段关系经得起检验。': 'From unstructured documents to relational databases. DBMosaic connects extraction, verification and repair in a closed loop, grounding every record in its source and checking every relationship.',
    '观看系统演示': 'Watch the demo',
    '快速开始': 'Get started',
    '开源研究': 'Open research',
    '约束驱动': 'Constraint-driven',
    '模型可插拔': 'Pluggable models',
    '文档经过抽取、校验与修复，形成关系数据库的概念示意': 'Conceptual illustration of documents becoming a relational database through extraction, verification and repair',
    '抽取': 'Extract',
    '校验': 'Verify',
    '修复': 'Repair',
    '概念示意 / RELATIONAL DATABASE': 'CONCEPT / RELATIONAL DATABASE',
    '模式感知': 'Schema-guided extraction',
    '交互可控': 'Interactive control',
    '观看产品短片': 'Watch the product film',
    '把文档做成数据库': 'Turning documents into databases',
    'DBMosaic 产品介绍': 'DBMosaic product introduction',
    '向下探索': 'Explore',
    '不止抽取。': 'Beyond extraction. ',
    '更让数据成立。': 'Built for integrity.',
    '五个智能体，': 'Five agents, ',
    '跑完同一条闭环。': 'one closed loop.',
    '文档、模式和约束一起进入。编排器调度实体抽取、关系抽取、约束校验和数据修复；违规只回到出错的部分，直到数据库满足约束。': 'Documents, a schema and constraints enter together. The orchestrator runs entity extraction, relationship extraction, constraint verification and repair; only the parts tied to a violation are revisited, until the database satisfies the constraints.',
    '按信号调度另外四个智能体，留下每一轮快照，直到交出最终数据库。': 'Dispatch the other four agents through signals, keep a snapshot of each round, and deliver the final database.',
    '对照模式，从文档里找出实体和属性，写成能放进表里的记录。': 'Read the documents against the schema, and turn entities and attributes into records that fit the tables.',
    '在实体之间补上模式要求的关系，让外键和引用对得上。': 'Add the relationships the schema requires, so foreign keys and references line up.',
    '用 MCP 插件检查结构、类型、取值、引用和时间，把违规标出来。': 'Check structure, types, values, references and time with MCP plugins, and flag each violation.',
    '只对违规涉及的部分重新抽取，不把整批文档重跑一遍。': 'Re-extract only the parts tied to a violation, without rerunning the whole document collection.',
    '输入是文档，加上一份带约束的 ER 模式。输出不是一段被塞进表里的文本，而是一份结构成立的数据库。': 'Start with documents and an ER schema with constraints. Get a structurally valid database, with records that fit the schema and relationships that hold together.',
    '按模式抽取': 'Schema-aware extraction',
    '模式里写着完整性约束和业务约束。抽取出的记录要能放进这套结构，而不是先生成、再指望它对得上。': 'Integrity and business constraints are part of the schema. Extracted records are built to fit that structure from the start.',
    '闭环修正': 'Closed-loop repair',
    '抽取、校验、修复循环执行。外键断裂这类违规被标出来之后，只对出错的部分重新抽取。': 'Extraction, verification and repair run in a loop. When violations such as broken foreign keys are detected, only the affected parts are re-extracted.',
    '语义一致性': 'Semantic consistency',
    '文档里本来就含糊的地方，和可以改回来的抽取错误，是两件事。不是每一处不一致都该被强行修平。': 'Distinguish ambiguity in the source from correctable extraction errors. Preserve uncertainty where forcing consistency would distort the document.',
    '可插拔约束': 'Pluggable constraints',
    '第三方抽取器、领域校验器和自定义修复算子，通过 MCP（Multi-Constraint-Plugin）注册表接进来。': 'Connect third-party extractors, domain-specific validators and custom repair operators through the MCP (Multi-Constraint-Plugin) registry.',
    '全栈界面': 'An interactive workspace',
    '在界面里上传文档，用表单或自然语言定义模式，看着智能体循环跑完，再检查并导出得到的数据库。': 'Upload documents, define a schema with forms or natural language, follow the agent loop, then inspect and export the resulting database.',
    '每一步，': 'Every step. ',
    '都有约束可循。': 'Grounded in constraints.',
    '输入文档': 'Documents',
    '输出数据库': 'Database',
    '从文档、模式和约束出发，经编排器驱动抽取、校验与修复，得到满足约束的数据库': 'From documents, a schema and constraints, the orchestrator drives extraction, verification and repair to produce a database that satisfies the constraints.',
    '输入': 'Input',
    '输出': 'Output',
    '文档 F': 'Documents F',
    '模式 E': 'Schema E',
    '约束 Σ': 'Constraints Σ',
    '编排器': 'Orchestrator',
    '实体抽取': 'Entity Extractor',
    '关系抽取': 'Relationship Extractor',
    '约束校验': 'Constraint Verifier',
    '数据修复': 'Data Fixer',
    '接口服务': 'Interface Service',
    '数据库 D |= Σ': 'Database D |= Σ',
    '编排器按信号推动整条链路。校验报出的违规进入修复，修复后再回到记忆里的快照，直到得到最终的数据库实例。': 'The orchestrator drives the pipeline through signals. Detected violations enter the repair loop, and updated snapshots are retained until the final database instance is produced.',
    '文档进入': 'DOCUMENTS IN',
    '数据库离开': 'DATABASE OUT',
    '以目标模式为指引，从文档中识别实体、属性与关系。': 'Identify entities, attributes and relationships in documents, guided by the target schema.',
    'MCP 插件逐项检查结构、取值、引用和时间等约束。': 'MCP plugins check structural, value, reference, temporal and other constraints.',
    '针对违规做定向再抽取，而不是把整批文档重跑一遍。': 'Re-extract the parts associated with a violation without rerunning the entire document collection.',
    '编排': 'Orchestrate',
    '信号驱动闭环，写入快照，交出最终数据库实例。': 'Coordinate the loop through signals, save snapshots and deliver the final database instance.',
    '发现违规 → 定向修复 → 再次校验': 'Detect violations → Targeted repair → Verify again',
    '持续迭代，直到交付': 'Iterate toward the final database',
    '校验插件': 'Validation plugins',
    '结构': 'Structure',
    '类型': 'Types',
    '取值': 'Values',
    '逻辑': 'Logic',
    '格式': 'Formats',
    '时间': 'Time',
    '引用': 'References',
    '聚合': 'Aggregation',
    '数据质量': 'Quality',
    '支持通过 Web 界面完成工作流，也可作为独立 Python 库集成进现有系统。': 'Run the workflow in the web interface or integrate it into an existing system as a standalone Python library.',
    '从文档，': 'From your documents',
    '返回 DataMosaic 主页': 'Back to DataMosaic',
    '到可用的数据库。': 'to a database you can use.',
    '下面这段大约一分多钟，对应界面里的一次完整操作：选文档、给模式、看闭环、查结果。': 'This one-minute walkthrough follows the complete workflow: select documents, define a schema, watch the loop and explore the results.',
    '在文档库里选中这次要处理的文件。': 'Select the files to process from the document library.',
    '用表单、JSON 或自然语言给出模式和指令。': 'Define the schema and instructions using forms, JSON or natural language.',
    '选定模型，以及串行、并行或自动的运行方式。': 'Choose a model and a sequential, parallel or automatic execution mode.',
    '开始后，抽取、校验和修复的步骤实时展开。': 'Follow extraction, verification and repair as they unfold in real time.',
    '完成后查看快照、违规与修复，并导出数据库。': 'Review snapshots, violations and repairs, then export the database.',
    '以研究为基石。': 'Grounded in research. ',
    'Zhengxuan Zhang, Zhuowen Liang, Jiazhuo Chen, Haixun Wang, Nan Tang. 页码 2522–2535.': 'Zhengxuan Zhang, Zhuowen Liang, Jiazhuo Chen, Haixun Wang, Nan Tang. Pages 2522–2535.',
    '阅读研究论文': 'Read the research paper',
    'Zhengxuan Zhang, Zhuowen Liang, Haixun Wang, Nan Tang. 页码 4570–4573.': 'Zhengxuan Zhang, Zhuowen Liang, Haixun Wang, Nan Tang. Pages 4570–4573.',
    '阅读演示论文': 'Read the demo paper',
    '在本机跑起来': 'Run it locally',
    '需要 Python 3.8+、Node.js 18+，以及一把大模型密钥：OpenAI 兼容接口、DeepSeek，或通义千问 / DashScope。以下命令在': 'You need Python 3.8+, Node.js 18+ and an API key for an OpenAI-compatible service, DeepSeek or Qwen / DashScope. Run these commands in the ',
    '目录中执行。': ' directory.',
    '安装 Python 依赖': 'Install Python dependencies',
    '虚拟环境建在仓库根目录。': 'Create the virtual environment in the repository root.',
    '填写密钥': 'Configure API keys',
    '复制示例文件后改成自己的密钥。仓库只带示例，不带': 'Copy the example file and add your own keys. The repository includes the example, but not ',
    '。': '.',
    '启动后端': 'Start the backend',
    'REST 在': 'REST is available at ',
    '，实时信号在': ', with real-time signals at ',
    '启动前端': 'Start the frontend',
    '另开一个终端。浏览器打开': 'Open another terminal. Then visit ',
    '在 Windows 上激活虚拟环境用': 'On Windows, activate the virtual environment with ',
    '。启动脚本是 shell，也可以直接用上面每一段里的手动命令。': '. The startup scripts use a shell; you can also run the manual commands shown above.',
    '四个数据集上的评测': 'Evaluate on four datasets',
    '全系统评测和只调用大模型的基线是两条命令。指标是 Precision、Recall、F1，以及 0–100 的 LLM-Score。对照结果写在仓库的': 'Run the full system and the LLM-only baseline with separate commands. Metrics include Precision, Recall, F1 and LLM-Score (0–100). Comparison results are available in ',
    '金融': 'Finance',
    '法律': 'Legal',
    '论文': 'Research papers',
    '学生': 'Students',
    '参数': 'Parameter',
    '含义': 'Description',
    'FinanceDB、PaperDB、StudentDB 或 LegalDB': 'FinanceDB, PaperDB, StudentDB or LegalDB',
    '数据集中的案例，例如 case1': 'A case in the dataset, such as case1',
    '模型名，例如 gpt-4o、claude-3-5-sonnet、qwen2.5-72b-instruct': 'A model name, such as gpt-4o, claude-3-5-sonnet or qwen2.5-72b-instruct',
    '自定义本次输出的运行标识': 'A custom identifier for this evaluation run',
    '里还有一组模式变更实验，覆盖字段的新增、删除和更新。': ' also contains schema evolution experiments covering field additions, removals and updates.',
    '如果这篇工作对你有用': 'Cite this work',
    '复制 BibTeX': 'Copy BibTeX',
    '返回顶部': 'Back to top',
    '暂停动画 Ⅱ': 'Pause Ⅱ',
    '播放动画 ▷': 'Play ▷',
    '暂停演示动画': 'Pause the demo animation',
    '播放演示动画': 'Play the demo animation',
    '复制 ↗': 'Copy ↗',
    '复制第 {n} 段命令': 'Copy command block {n}',
    '已复制到剪贴板': 'Copied to clipboard',
    '已选中文本，请按 Ctrl+C 或 ⌘C 复制': 'Text selected. Press Ctrl+C or ⌘C to copy'
  };
  const bindings = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, pre, [data-language]')) continue;
    const original = node.nodeValue;
    const key = original.trim();
    if (Object.hasOwn(english, key)) bindings.push({ node, original, key });
  }
  const attributeBindings = [];
  document.querySelectorAll('[aria-label], [alt], meta[name="description"]').forEach(element => {
    if (element.matches('[data-language]')) return;
    ['aria-label', 'alt', 'content'].forEach(attribute => {
      const original = element.getAttribute(attribute);
      if (original && Object.hasOwn(english, original)) attributeBindings.push({ element, attribute, original });
    });
  });
  let language = 'en';
  const t = (key, values = {}) => {
    let value = language === 'en' ? (english[key] ?? key) : key;
    Object.entries(values).forEach(([name, replacement]) => { value = value.replaceAll(`{${name}}`, replacement); });
    return value;
  };
  function setLanguage(next, persist = true) {
    language = next === 'en' ? 'en' : 'zh';
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    bindings.forEach(({ node, original, key }) => {
      node.nodeValue = language === 'en' ? original.replace(key, english[key]) : original;
    });
    attributeBindings.forEach(({ element, attribute, original }) => element.setAttribute(attribute, t(original)));
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    if (persist) {
      try { localStorage.setItem('datamosaic-language', language); } catch { /* Private or file-based browsing can disable storage. */ }
    }
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  }
  window.i18n = { t, setLanguage, get language() { return language; } };
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
  let initial = 'en';
  try { initial = localStorage.getItem('datamosaic-language') || initial; } catch { /* Use English by default. */ }
  setLanguage(initial, false);
})();
