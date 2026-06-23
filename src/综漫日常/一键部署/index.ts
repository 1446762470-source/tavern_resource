(async () => {
  const LOADER = 'http://localhost:6622/综漫春物/脚本/浮窗手机/loader.js';
  const UI = 'http://localhost:6622/综漫春物/界面/状态栏/index.html';
  const WB_URL = 'http://localhost:6622/综漫日常/综漫日常.json';
  const CARD_CSS = '<style>.tarot-card-bar{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin:12px 0}.tarot-card{background:linear-gradient(175deg,#1a1025 0%,#221535 40%,#1e1230 100%);border:2px solid #6b21a8;border-radius:12px;padding:14px;position:relative;overflow:hidden;box-shadow:0 0 20px rgba(107,33,168,0.25),0 4px 12px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.03)}.tarot-card::before{content:"";position:absolute;inset:6px;border:1px solid rgba(168,85,247,0.25);border-radius:8px;pointer-events:none}.tarot-card::after{content:"✦ ◇ ✦ ◇ ✦";position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:8px;color:rgba(168,85,247,0.2);letter-spacing:6px;white-space:nowrap}.tarot-card-name{font-size:15px;font-weight:700;color:#d8b4fe;text-align:center;margin:16px 0 8px;letter-spacing:2px}.tarot-card-quality{font-size:10px;color:#a78bfa;text-align:center;letter-spacing:1px;margin-bottom:4px}.tarot-card-type{font-size:10px;color:#8b5cf6;text-align:center;margin-bottom:8px;padding:2px 12px;border:1px solid rgba(139,92,246,0.3);border-radius:10px;display:inline-block;width:fit-content;margin-inline:auto}.tarot-card-desc{font-size:11px;color:#a8a0b8;text-align:center;line-height:1.6;margin-top:8px;font-style:italic}.tarot-card-bar .tarot-card{animation:cardReveal .6s ease-out}@keyframes cardReveal{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}</style>';

  // 1. 世界书
  try {
    const resp = await fetch(WB_URL);
    const raw = await resp.json();
    const wbEntries = Object.keys(raw.entries).map(uid => {
      const e = raw.entries[uid];
      return {
        uid: e.uid || +uid, name: e.comment || '', enabled: !e.disable,
        strategy: { type: e.constant ? 'constant' as const : e.selective ? 'selective' as const : 'constant' as const, keys: e.key || [], keys_secondary: { logic: 'and_any' as const, keys: e.keysecondary || [] }, scan_depth: (e.scanDepth ?? 'same_as_global') as any },
        position: { type: (e.position === 0 ? 'before_character_definition' : e.position === 1 ? 'after_character_definition' : e.position === 2 ? 'before_example_messages' : e.position === 3 ? 'after_example_messages' : e.position === 4 ? 'before_author_note' : 'at_depth') as any, role: (e.role === 0 ? 'system' : e.role === 1 ? 'assistant' : 'user') as any, depth: e.depth ?? 0, order: e.order ?? 14720 },
        content: e.content || '', probability: e.probability ?? 100,
        recursion: { prevent_incoming: e.excludeRecursion ?? false, prevent_outgoing: e.preventRecursion ?? false, delay_until: e.delayUntilRecursion ?? null },
        effect: { sticky: e.sticky ?? null, cooldown: e.cooldown ?? null, delay: e.delay ?? null },
      };
    });
    await createOrReplaceWorldbook('综漫日常', wbEntries, { render: 'immediate' });
    try { await rebindCharWorldbooks('current', { primary: '综漫日常', additional: [] }); } catch (_) {}
  } catch (e) { console.error('[setup] 世界书:', e); }

  // 2. 浮窗手机
  try {
    await updateScriptTreesWith(trees => {
      trees = trees.filter((t: any) => t.name !== '浮窗手机');
      trees.push({ type: 'script' as any, enabled: true, name: '浮窗手机', id: 'float-phone-' + Date.now(), content: `(function(){var s=document.createElement('script');s.src='${LOADER}';s.onerror=function(){window.parent.toastr.error('浮窗手机加载失败')};document.head.appendChild(s)})();`, info: '综漫日常', button: { enabled: false, buttons: [] }, data: {}, export_with: { data: false, button: false } } as any);
      return trees;
    }, { type: 'character' });
  } catch (e) { console.error('[setup] 浮窗手机:', e); }

  // 3. 正则
  try {
    await updateTavernRegexesWith((regexes: any[]) => {
      regexes = regexes.filter((r: any) => r.script_name !== '[界面]状态栏' && !r.script_name.startsWith('[界面]卡牌'));

      regexes.push({ id: 'status-bar-1', script_name: '[界面]状态栏', enabled: true, find_regex: '<StatusPlaceHolderImpl/>', replace_string: `<body>\n<script>\n$('body').load('${UI}')\n</script>\n</body>`, trim_strings: [], source: { user_input: false, ai_output: true, slash_command: false, world_info: false }, destination: { display: true, prompt: false }, run_on_edit: true, min_depth: null, max_depth: null });

      regexes.push({ id: 'cb-open', script_name: '[界面]卡牌栏-开', enabled: true, find_regex: '<card_bar>', replace_string: CARD_CSS + '<div class="tarot-card-bar">', trim_strings: [], source: { user_input: false, ai_output: true, slash_command: false, world_info: false }, destination: { display: true, prompt: false }, run_on_edit: true, min_depth: null, max_depth: null });
      regexes.push({ id: 'cb-close', script_name: '[界面]卡牌栏-关', enabled: true, find_regex: '</card_bar>', replace_string: '</div>', trim_strings: [], source: { user_input: false, ai_output: true, slash_command: false, world_info: false }, destination: { display: true, prompt: false }, run_on_edit: true, min_depth: null, max_depth: null });

      var tags: Record<string, string> = { '<卡牌>': '<div class="tarot-card">', '</卡牌>': '</div>', '<名称>': '<div class="tarot-card-name">', '</名称>': '</div>', '<品质>': '<div class="tarot-card-quality">', '</品质>': '</div>', '<类型>': '<div class="tarot-card-type">', '</类型>': '</div>', '<简介>': '<div class="tarot-card-desc">', '</简介>': '</div>' };
      Object.entries(tags).forEach(([tag, html]) => {
        var n = tag.replace(/[<>\/]/g, '');
        regexes.push({ id: 'cb-' + n, script_name: '[界面]卡牌-' + (tag.startsWith('</') ? '闭' : '开') + '-' + n, enabled: true, find_regex: tag, replace_string: html, trim_strings: [], source: { user_input: false, ai_output: true, slash_command: false, world_info: false }, destination: { display: true, prompt: false }, run_on_edit: true, min_depth: null, max_depth: null });
      });

      return regexes;
    }, { type: 'character' });
  } catch (e) { console.error('[setup] 正则:', e); }

  window.parent.toastr.success('综漫日常 部署完成！', '✅');
})();
