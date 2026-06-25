// 我的日常 一键配置 — 粘贴到 Tavern Helper 脚本并运行一次即可
(async function () {
  'use strict';

  // ===== 配置开场设定正则 =====
  await updateTavernRegexesWith(
    (regexes) => {
      const hasRegex = regexes.some((r) => r.script_name === '[界面]开场设定');
      if (hasRegex) return regexes;

      regexes.push({
        id: 'opening-setup-' + Date.now(),
        script_name: '[界面]开场设定',
        enabled: true,
        find_regex: '<OpeningSetup/>',
        replace_string:
          '<body>\n<script>\n$(\'body\').load(\'http://localhost:6622/我的日常/界面/开场设定/index.html\')\n</script>\n</body>',
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

  window.parent.toastr.success('我的日常 — 开场设定界面配置完成！', '✅');

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
