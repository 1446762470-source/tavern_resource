// 综漫春物 一键配置 — 粘贴到 Tavern Helper 脚本并运行一次即可
(async function () {
  'use strict';

  // ===== 1. 配置浮窗手机脚本 =====
  await updateScriptTreesWith(
    (trees) => {
      // 检查是否已存在
      const hasScript = trees.some(
        (t) => t.type === 'script' && t.name === '浮窗手机',
      );
      if (hasScript) return trees;

      trees.push({
        type: 'script',
        enabled: true,
        name: '浮窗手机',
        id: 'float-phone-' + Date.now(),
        content: `(function(){var s=document.createElement('script');s.src='http://localhost:6622/综漫春物/脚本/浮窗手机/loader.js';s.onerror=function(){window.parent.toastr.error('浮窗手机加载失败，确认 HTTP 服务器已启动')};document.head.appendChild(s)})();`,
        info: '综漫春物悬浮手机',
        button: { enabled: false, buttons: [] },
        data: {},
        export_with: { data: false, button: false },
      });
      return trees;
    },
    { type: 'character' },
  );

  // ===== 2. 配置状态栏正则 =====
  await updateTavernRegexesWith(
    (regexes) => {
      const hasRegex = regexes.some((r) => r.script_name === '[界面]状态栏');
      if (hasRegex) return regexes;

      regexes.push({
        id: 'status-bar-' + Date.now(),
        script_name: '[界面]状态栏',
        enabled: true,
        find_regex: '<StatusPlaceHolderImpl/>',
        replace_string:
          '<body>\n<script>\n$(\'body\').load(\'http://localhost:6622/综漫春物/界面/状态栏/index.html\')\n</script>\n</body>',
        trim_strings: [],
        source: { user_input: false, ai_output: true, slash_command: false, world_info: false },
        destination: { display: true, prompt: false },
        run_on_edit: true,
        min_depth: null,
        max_depth: null,
      });
      return regexes;
    },
    { type: 'character' },
  );

  // ===== 3. 配置状态栏 =====
  await updateTavernRegexesWith(
    (regexes) => {
      const hasFold = regexes.some((r) => r.script_name === '[折叠]状态思考');
      if (hasFold) return regexes;

      regexes.push({
        id: 'fold-think-' + Date.now(),
        script_name: '[折叠]状态思考',
        enabled: true,
        find_regex: '<status_think>[\\s\\S]*?</status_think>',
        replace_string: '',
        trim_strings: [],
        source: { user_input: false, ai_output: true, slash_command: false, world_info: false },
        destination: { display: true, prompt: false },
        run_on_edit: true,
        min_depth: null,
        max_depth: null,
      });
      return regexes;
    },
    { type: 'character' },
  );

  window.parent.toastr.success('综漫春物配置完成！浮窗手机 + 状态栏已就绪', '✅');

  // 运行一次后自毁
  var selfScript = getScriptTrees({ type: 'character' }).find(function (t) {
    return t.type === 'script' && t.name === '一键配置';
  });
  if (selfScript) {
    await updateScriptTreesWith(
      function (trees) {
        return trees.filter(function (t) { return t !== selfScript; });
      },
      { type: 'character' },
    );
  }
})();
