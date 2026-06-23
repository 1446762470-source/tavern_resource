// 浮窗手机 v2 — 暗金塔罗风格
(function () {
  'use strict';
  var $P = window.parent.$;
  var PD = window.parent.document;
  var PW = window.parent;
  var IS_MOBILE = PW.innerWidth < 768;

  // 配色
  var C = {
    bg:     '#12100e',
    card:   '#1a1714',
    gold:   '#c9a84c',
    gold2:  '#b8942e',
    goldDim:'#6b5b3a',
    cream:  '#e8dcc8',
    cream2: '#bfb09a',
    muted:  '#7a7262',
    barBg:  '#25221c',
    pink:   '#c9a84c',
    blue:   '#7a9ec9',
    green:  '#8ab87a',
    purple: '#b89ac9',
  };

  function h(tag, attrs, kids) {
    var el = PD.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'style') Object.assign(el.style, attrs[k]);
      else if (k === 'on') Object.keys(attrs[k]).forEach(function (ev) { el.addEventListener(ev, attrs[k][ev]); });
      else if (k === 'html') el.innerHTML = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    if (kids) kids.forEach(function (c) { el.appendChild(typeof c === 'string' ? PD.createTextNode(c) : c); });
    return el;
  }

  function css(el, obj) { Object.assign(el.style, obj); }

  // ===== 初始化 =====
  console.info('[浮窗手机] 初始化...');

  // MVU 自检
  var mvuOk = false;
  try {
    if (typeof Mvu !== 'undefined' && Mvu.getMvuData) {
      var td = Mvu.getMvuData({ type: 'message', message_id: -1 });
      var sd = _ && _.get(td, 'stat_data');
      var arch = sd && sd.角色档案;
      if (arch && Object.keys(arch).length > 0) { mvuOk = true; }
    }
  } catch (e) {}
  if (!mvuOk) PW.toastr.info('MVU 未连接，显示模拟数据', '🔮');

  // --- 悬浮球（暗金魔眼） ---
  var ballSize = IS_MOBILE ? 52 : 48;
  var ball = h('div', { id: 'float-phone-ball', style: {
    position: 'fixed', bottom: IS_MOBILE ? '120px' : '100px', right: IS_MOBILE ? '16px' : '24px',
    width: ballSize + 'px', height: ballSize + 'px', borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #d4af37, #8b6914, #3d2b00)',
    boxShadow: '0 0 20px rgba(201,168,76,0.4), 0 0 60px rgba(180,140,40,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
    cursor: 'move', zIndex: '9998',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
    border: '2px solid rgba(201,168,76,0.5)',
  }, html: '<span style="font-size:' + (IS_MOBILE ? '22px' : '20px') + ';pointer-events:none;filter:drop-shadow(0 0 4px rgba(201,168,76,0.6))">🔮</span>' });
  PD.body.appendChild(ball);

  // --- 拖拽 ---
  var dragging = false, dSX = 0, dSY = 0, dSL = 0, dST = 0, moved = false, dragFlag = false;
  function startDrag(e) {
    dragging = true; moved = false;
    var pt = e.touches ? e.touches[0] : e;
    dSX = pt.clientX; dSY = pt.clientY;
    var r = ball.getBoundingClientRect(); dSL = r.left; dST = r.top;
    ball.style.transition = 'none'; e.preventDefault();
  }
  function moveDrag(e) {
    if (!dragging) return;
    var pt = e.touches ? e.touches[0] : e;
    var dx = pt.clientX - dSX, dy = pt.clientY - dSY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
    var w = PW.innerWidth, h = PW.innerHeight;
    css(ball, { left: Math.min(w - ballSize - 8, Math.max(0, dSL + dx)) + 'px',
                top: Math.min(h - ballSize - 8, Math.max(0, dST + dy)) + 'px',
                right: 'auto', bottom: 'auto' });
  }
  function endDrag() {
    if (!dragging) return; dragging = false; ball.style.transition = '';
    dragFlag = moved; if (moved) setTimeout(function () { dragFlag = false; }, 300);
  }
  ball.addEventListener('mousedown', startDrag);
  ball.addEventListener('touchstart', startDrag, { passive: false });
  PD.addEventListener('mousemove', moveDrag); PD.addEventListener('mouseup', endDrag);
  PD.addEventListener('touchmove', moveDrag, { passive: false }); PD.addEventListener('touchend', endDrag);
  if (!IS_MOBILE) {
    ball.addEventListener('mouseenter', function () { ball.style.transform = 'scale(1.1)'; ball.style.boxShadow = '0 0 30px rgba(201,168,76,0.6), 0 0 80px rgba(180,140,40,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'; });
    ball.addEventListener('mouseleave', function () { ball.style.transform = 'scale(1)'; ball.style.boxShadow = '0 0 20px rgba(201,168,76,0.4), 0 0 60px rgba(180,140,40,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'; });
  }

  // ===== 手机 UI =====
  var phoneVisible = false;
  var currentApp = null;
  var clockTimer = null;

  function buildPhone() {
    var isM = IS_MOBILE;
    var frameW = isM ? '85vw' : '320px';
    var frameH = isM ? '85vh' : '540px';

    // 遮罩
    var overlay = h('div', { id: 'fp-overlay', style: {
      position: 'fixed', inset: '0', zIndex: '9999',
      background: 'rgba(8,6,4,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }});

    // 手机框 — 暗金塔罗边框
    var phone = h('div', { style: {
      width: frameW, height: frameH, maxWidth: isM ? '420px' : 'none',
      background: C.bg, borderRadius: isM ? '28px' : '24px', padding: '3px',
      boxShadow: '0 0 30px rgba(201,168,76,0.25), 0 0 80px rgba(0,0,0,0.6), 0 0 0 2px ' + C.goldDim,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }});

    // 装饰边框
    var innerBorder = h('div', { style: {
      position: 'absolute', inset: '5px', borderRadius: isM ? '24px' : '20px',
      border: '1px solid rgba(201,168,76,0.2)', pointerEvents: 'none', zIndex: '1',
    }});
    phone.appendChild(innerBorder);

    // 屏幕
    var screen = h('div', { style: {
      flex: '1', background: C.bg, borderRadius: isM ? '24px' : '20px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: '2',
      fontFamily: "'Cormorant Garamond','Georgia','Noto Serif SC','SimSun',serif",
    }});

    // 顶部神秘符号装饰
    var mysticLine = h('div', { style: {
      textAlign: 'center', padding: isM ? '3px' : '2px', flexShrink: '0',
      color: C.goldDim, fontSize: isM ? '11px' : '9px', letterSpacing: '8px',
    } }, ['✦ ◇ ✦ ◇ ✦']);
    screen.appendChild(mysticLine);

    // 状态栏
    var statusBar = h('div', { style: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: isM ? '6px 20px' : '4px 16px', color: C.muted, fontSize: isM ? '12px' : '10px', flexShrink: '0',
    }});
    statusBar.appendChild(h('span', { style: { color: C.goldDim } }, ['☾']));
    var timeEl = h('span', { id: 'fp-time', style: { fontWeight: '600', color: C.gold, letterSpacing: '1px' } });
    statusBar.appendChild(timeEl);
    statusBar.appendChild(h('span', { style: { color: C.goldDim } }, ['☀']));
    screen.appendChild(statusBar);

    // 主屏幕
    var homeScreen = h('div', { id: 'fp-home', style: {
      flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }});
    var appGrid = h('div', { style: {
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: isM ? '28px 20px' : '22px 14px', maxWidth: isM ? '300px' : '240px', width: '100%',
    }});
    appGrid.appendChild(makeAppIcon('🎭', '命运之轮', 'linear-gradient(135deg, #c9a84c, #8b6914)', function () { openApp('character'); }));
    appGrid.appendChild(makeAppIcon('📅', '时空之书', 'linear-gradient(135deg, #7a9ec9, #4a6a8a)', function () { openApp('calendar'); }));
    appGrid.appendChild(makeAppIcon('🃏', '命运抽卡', 'linear-gradient(135deg, #6b21a8, #a855f7)', function () { openApp('gacha'); }));
    for (var i = 0; i < 3; i++) {
      appGrid.appendChild(h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: '0.15' } }, [
        h('div', { style: { width: isM ? '56px' : '48px', height: isM ? '56px' : '48px', borderRadius: '12px', border: '1px solid ' + C.goldDim, background: 'transparent' } }),
      ]));
    }
    homeScreen.appendChild(appGrid);

    // 应用屏幕
    var appScreen = h('div', { id: 'fp-app-screen', style: {
      flex: '1', display: 'none', flexDirection: 'column', overflow: 'hidden',
    }});
    var appHeader = h('div', { style: {
      display: 'flex', alignItems: 'center', padding: isM ? '8px 16px' : '5px 12px',
      borderBottom: '1px solid ' + C.barBg, flexShrink: '0', gap: '8px',
    }});
    var backBtn = h('button', { html: '◂', style: {
      background: 'none', border: '1px solid ' + C.goldDim, color: C.gold, borderRadius: '50%',
      width: isM ? '30px' : '26px', height: isM ? '30px' : '26px', cursor: 'pointer',
      fontSize: isM ? '16px' : '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }, on: { click: function () { openApp(null); } } });
    var appTitle = h('span', { id: 'fp-app-title', style: {
      flex: '1', textAlign: 'center', fontSize: isM ? '15px' : '13px', fontWeight: '600', color: C.gold, letterSpacing: '2px',
    }});
    appHeader.appendChild(backBtn); appHeader.appendChild(appTitle);
    appHeader.appendChild(h('span', { style: { width: isM ? '30px' : '26px' } }));
    var appContent = h('div', { id: 'fp-app-content', style: { flex: '1', overflowY: 'auto', overflowX: 'hidden' }});
    appScreen.appendChild(appHeader); appScreen.appendChild(appContent);

    screen.appendChild(homeScreen);
    screen.appendChild(appScreen);
    phone.appendChild(screen);
    overlay.appendChild(phone);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) closePhone(); });
    overlay._closePhone = closePhone;
    return overlay;
  }

  function makeAppIcon(emoji, label, bg, onClick) {
    var isM = IS_MOBILE;
    var size = isM ? '56px' : '48px';
    return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', cursor: 'pointer' }, on: { click: onClick } }, [
      h('div', { style: {
        width: size, height: size, borderRadius: '14px',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}, [ h('span', { style: { fontSize: isM ? '26px' : '22px', lineHeight: '1' } }, [emoji]) ]),
      h('span', { style: { fontSize: isM ? '11px' : '10px', color: C.cream2, letterSpacing: '1px' } }, [label]),
    ]);
  }

  function lighten(hex) {
    var r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    r = Math.min(255, r + 50); g = Math.min(255, g + 35); b = Math.min(255, b + 25);
    return '#' + [r,g,b].map(function (v) { return v.toString(16).padStart(2,'0'); }).join('');
  }

  // ===== 应用切换 =====
  function openApp(app) {
    currentApp = app;
    var home = PD.getElementById('fp-home');
    var appScreen = PD.getElementById('fp-app-screen');
    var appTitle = PD.getElementById('fp-app-title');
    var appContent = PD.getElementById('fp-app-content');
    if (!home || !appScreen || !appTitle || !appContent) return;
    if (app === null) { home.style.display = ''; appScreen.style.display = 'none'; }
    else { home.style.display = 'none'; appScreen.style.display = '';
      var titles = { character: '命运之轮', calendar: '时空之书', gacha: '命运抽卡' };
      appTitle.textContent = titles[app] || ''; renderApp(app, appContent); }
  }

  function renderApp(app, container) { container.innerHTML = '';
    if (app === 'character') renderCharacterArchive(container);
    if (app === 'calendar') renderCalendar(container);
    if (app === 'gacha') renderGacha(container); }

  // ===== 角色档案 =====
  function renderCharacterArchive(container) {
    var chars = getCharData();
    var isM = PW.innerWidth < 768;

    if (chars.length === 0) {
      container.appendChild(h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', color: C.muted, textAlign: 'center' } }, [
        h('div', { style: { fontSize: '40px', marginBottom: '12px', opacity: '0.5' } }, ['🃏']),
        h('div', { style: { fontSize: isM ? '14px' : '12px', color: C.cream2 } }, ['命运之轮尚未转动']),
        h('div', { style: { fontSize: isM ? '11px' : '10px', color: C.goldDim, marginTop: '4px' } }, ['与角色结缘后将显露命运的轨迹']),
      ]));
      return;
    }

    var list = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px' } });
    chars.forEach(function (c) { list.appendChild(buildCharCard(c)); });
    container.appendChild(list);
  }

  function getCharData() {
    try {
      if (typeof Mvu !== 'undefined' && Mvu.getMvuData) {
        var td = Mvu.getMvuData({ type: 'message', message_id: -1 });
        var sd = _ && _.get(td, 'stat_data');
        var archive = sd && sd.角色档案;
        if (archive && typeof archive === 'object') {
          return Object.entries(archive).map(function (e) { var s = e[1] || {}; return { name: e[0], affection: Number(s.好感度)||0, 了解度: Number(s.了解度)||0, 自我理解度: Number(s.自我理解度)||0, 灵魂共鸣度: Number(s.灵魂共鸣度)||0, relation: s.关系||'陌生人' }; })
            .sort(function (a, b) { if (a.affection === 0 && b.affection !== 0) return 1; if (b.affection === 0 && a.affection !== 0) return -1; return b.affection - a.affection; });
        }
      }
    } catch (e) {}
    return getMockData();
  }

  function getMockData() { return [
    { name: '雪之下雪乃', affection: 245, 了解度: 68, 自我理解度: 82, 灵魂共鸣度: 35, relation: '挚友' },
    { name: '由比滨结衣', affection: 180, 了解度: 45, 自我理解度: 30, 灵魂共鸣度: 0, relation: '朋友' },
    { name: '雪之下阳乃', affection: 60, 了解度: 20, 自我理解度: 55, 灵魂共鸣度: 0, relation: '陌生人' },
  ]; }

  function affColor(v) {
    if (v === 0) return C.muted; if (v <= 100) return '#9a9a8a';
    if (v <= 200) return C.green; if (v <= 300) return C.blue;
    if (v <= 400) return C.purple; return C.gold;
  }

  function buildCharCard(c) {
    var isM = PW.innerWidth < 768;
    var ac = affColor(c.affection);

    var card = h('div', { style: {
      background: C.card, borderRadius: '8px', padding: isM ? '12px' : '10px', cursor: 'pointer',
      border: '1px solid ' + C.barBg, transition: 'border-color 0.3s, box-shadow 0.3s',
    }});
    card.addEventListener('mouseenter', function () { card.style.borderColor = C.goldDim; card.style.boxShadow = '0 0 12px rgba(201,168,76,0.1)'; });
    card.addEventListener('mouseleave', function () { card.style.borderColor = C.barBg; card.style.boxShadow = 'none'; });

    var row = h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } });

    // 头像 — 塔罗边框
    var avatarSize = isM ? '38px' : '34px';
    row.appendChild(h('div', { style: {
      width: avatarSize, height: avatarSize, borderRadius: '50%', flexShrink: '0',
      border: '2px solid ' + ac, background: C.barBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: ac, fontSize: isM ? '14px' : '12px', fontWeight: '700',
    } }, [c.name[0]]));

    var info = h('div', { style: { flex: '1', minWidth: '0' } });
    info.appendChild(h('div', { style: { fontSize: isM ? '13px' : '12px', fontWeight: '600', color: C.cream, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, [c.name]));

    var relColor = c.relation.indexOf('恋')>-1||c.relation.indexOf('爱')>-1 ? C.gold : c.relation.indexOf('挚')>-1||c.relation.indexOf('亲')>-1 ? C.purple : c.relation.indexOf('朋')>-1||c.relation.indexOf('同')>-1 ? C.blue : C.muted;
    info.appendChild(h('span', { style: { fontSize: isM ? '10px' : '9px', padding: '1px 6px', borderRadius: '3px', background: C.barBg, color: relColor, marginTop: '3px', display: 'inline-block', letterSpacing: '1px' } }, [c.relation]));

    row.appendChild(info);

    // 好感度
    row.appendChild(h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: '0' } }, [
      h('div', { style: { fontSize: isM ? '18px' : '16px', fontWeight: '700', color: ac, lineHeight: '1', fontVariantNumeric: 'tabular-nums' } }, [String(c.affection)]),
      h('div', { style: { fontSize: isM ? '9px' : '8px', color: C.goldDim, marginTop: '2px', letterSpacing: '1px' } }, ['羁绊']),
    ]));

    var arrow = h('span', { style: { fontSize: '11px', color: C.goldDim, transition: 'transform 0.2s', flexShrink: '0' } }, ['▸']);
    row.appendChild(arrow);
    card.appendChild(row);

    // 羁绊条
    card.appendChild(h('div', { style: { marginTop: '7px', height: '2px', background: C.barBg, borderRadius: '1px', overflow: 'hidden' } }, [
      h('div', { style: { width: (c.affection / 500 * 100) + '%', height: '100%', borderRadius: '1px', background: 'linear-gradient(90deg, transparent, ' + ac + ')', transition: 'width 0.8s ease' } }),
    ]));

    // 详情
    var detail = h('div', { style: { marginTop: '8px', paddingTop: '8px', borderTop: '1px solid ' + C.barBg, display: 'none', flexDirection: 'column', gap: '5px' } });
    [
      { l: '了解', v: c.了解度, m: 100, cl: C.blue },
      { l: '自我', v: c.自我理解度, m: 100, cl: C.purple },
      { l: '共鸣', v: c.灵魂共鸣度, m: 100, cl: c.灵魂共鸣度 > 0 ? C.gold : C.barBg, locked: c.灵魂共鸣度 === 0 },
    ].forEach(function (s) {
      detail.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
        h('span', { style: { fontSize: isM ? '10px' : '9px', color: C.goldDim, width: '28px', textAlign: 'right', flexShrink: '0' } }, [s.l]),
        h('div', { style: { flex: '1', height: '3px', background: C.barBg, borderRadius: '2px', overflow: 'hidden' } }, [
          h('div', { style: { width: s.locked ? '100%' : (s.v / s.m * 100) + '%', height: '100%', background: s.locked ? C.barBg : s.cl, borderRadius: '2px', transition: 'width 0.8s ease' } }),
        ]),
        h('span', { style: { fontSize: isM ? '10px' : '9px', color: s.locked ? C.goldDim : C.cream2, width: '36px', textAlign: 'right', flexShrink: '0' } }, [s.locked ? '封印' : s.v + '/' + s.m]),
      ]));
    });
    card.appendChild(detail);

    card.addEventListener('click', function () {
      if (detail.style.display === 'none') { detail.style.display = ''; card.style.borderColor = C.goldDim; card.style.boxShadow = '0 0 12px rgba(201,168,76,0.1)'; }
      else { detail.style.display = 'none'; card.style.borderColor = C.barBg; card.style.boxShadow = 'none'; }
    });
    return card;
  }

  // ===== 日历 =====
  function renderCalendar(container) {
    var wd = getWorldData();
    var isM = PW.innerWidth < 768;
    var dp = (wd.date || '2012-04-08').split('-');
    var year = parseInt(dp[0])||2012, month = parseInt(dp[1])||4, day = parseInt(dp[2])||8;

    var wrapper = h('div', { style: { padding: isM ? '14px' : '10px' } });

    // 标题
    var header = h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: isM ? '14px' : '10px' } });
    header.appendChild(h('span', { style: { fontSize: isM ? '17px' : '15px', fontWeight: '700', color: C.cream, letterSpacing: '1px' } }, [year + ' 年  ' + month + ' 月']));
    header.appendChild(h('span', { style: { fontSize: isM ? '20px' : '18px', fontWeight: '700', color: C.gold } }, [String(day)]));
    wrapper.appendChild(header);

    // 星期头
    var weekDays = ['日','一','二','三','四','五','六'];
    var weekRow = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px' } });
    weekDays.forEach(function (d) { weekRow.appendChild(h('span', { style: { textAlign: 'center', fontSize: isM ? '10px' : '9px', color: C.goldDim, padding: '4px 0', letterSpacing: '1px' } }, [d])); });
    wrapper.appendChild(weekRow);

    // 日期格
    var firstDay = new Date(year, month - 1, 1).getDay();
    var daysInMonth = new Date(year, month, 0).getDate();
    var grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' } });
    for (var i = 0; i < firstDay; i++) grid.appendChild(h('div'));
    for (var d = 1; d <= daysInMonth; d++) {
      var isToday = d === day;
      grid.appendChild(h('div', { style: {
        textAlign: 'center', padding: isM ? '6px 0' : '5px 0', borderRadius: '4px',
        fontSize: isM ? '12px' : '11px', color: isToday ? C.bg : C.cream2,
        background: isToday ? C.gold : 'transparent', fontWeight: isToday ? '700' : 'normal',
      } }, [String(d)]));
    }
    wrapper.appendChild(grid);

    // 底部信息
    var info = h('div', { style: { marginTop: isM ? '14px' : '10px', padding: isM ? '10px' : '8px', background: C.card, borderRadius: '8px', border: '1px solid ' + C.barBg, display: 'flex', flexWrap: 'wrap', gap: isM ? '12px' : '8px' } });
    [
      { l: '季', v: wd.season||'春', c: C.green },
      { l: '天', v: wd.weather||'晴', c: C.gold },
      { l: '时', v: wd.timeSlot||'上午', c: C.blue },
      { l: '地', v: wd.location||'总武高中', c: C.purple },
    ].forEach(function (x) {
      info.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, [
        h('span', { style: { fontSize: isM ? '10px' : '9px', color: C.goldDim } }, [x.l]),
        h('span', { style: { fontSize: isM ? '12px' : '11px', fontWeight: '600', color: x.c } }, [x.v]),
      ]));
    });
    wrapper.appendChild(info);
    container.appendChild(wrapper);
  }

  function getWorldData() {
    try {
      if (typeof Mvu !== 'undefined' && Mvu.getMvuData) {
        var td = Mvu.getMvuData({ type: 'message', message_id: -1 });
        var sd = _ && _.get(td, 'stat_data'); var ws = sd && sd.世界状态;
        if (ws) return { date: (ws.时间&&ws.时间.日期)||'', timeSlot: (ws.时间&&ws.时间.当前片段)||'', season: ws.季节||'', weather: ws.天气||'', location: ws.地点||'' };
      }
    } catch (e) {}
    return {};
  }

  // ===== 命运抽卡 =====
  function renderGacha(container) {
    var isM = PW.innerWidth < 768;
    var balance = getBalance();
    var cards = getCardBackpack();

    // 余额
    var balanceRow = h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isM ? '12px 4px' : '8px 4px', borderBottom: '1px solid ' + C.barBg } });
    balanceRow.appendChild(h('span', { style: { fontSize: isM ? '12px' : '11px', color: C.cream2, letterSpacing: '1px' } }, ['当前资产']));
    balanceRow.appendChild(h('span', { style: { fontSize: isM ? '16px' : '14px', fontWeight: '700', color: C.gold } }, ['¥' + balance.toLocaleString()]));
    container.appendChild(balanceRow);

    // 概率盘
    var wheelWrap = h('div', { style: { display: 'flex', justifyContent: 'center', padding: isM ? '16px 0' : '12px 0' } });
    var wheelSize = isM ? 160 : 130;
    var wheel = h('div', { style: {
      width: wheelSize + 'px', height: wheelSize + 'px', borderRadius: '50%', position: 'relative',
      background: 'conic-gradient(from -90deg, #a78bfa 0deg ' + (360*0.22) + 'deg, #60a5fa ' + (360*0.22) + 'deg ' + (360*0.57) + 'deg, #f472b6 ' + (360*0.57) + 'deg ' + (360*0.85) + 'deg, #f87171 ' + (360*0.85) + 'deg ' + (360*0.96) + 'deg, #fbbf24 ' + (360*0.96) + 'deg 360deg)',
      boxShadow: '0 0 20px rgba(168,85,247,0.3), 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      border: '3px solid #4a1a6b',
    }});
    var wheelInner = h('div', { style: {
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      width: '50%', height: '50%', borderRadius: '50%', background: C.bg,
      border: '2px solid #4a1a6b', display: 'flex', alignItems: 'center', justifyContent: 'center',
    } });
    wheelInner.appendChild(h('span', { style: { fontSize: isM ? '20px' : '17px' } }, ['🃏']));
    wheel.appendChild(wheelInner);
    wheelWrap.appendChild(wheel);
    container.appendChild(wheelWrap);

    // 图例
    var legend = h('div', { style: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: isM ? '8px' : '6px', padding: '0 4px 8px' } });
    [
      { c: '#a78bfa', t: '物品 22%' },
      { c: '#60a5fa', t: '事件 35%' },
      { c: '#f472b6', t: '角色 28%' },
      { c: '#f87171', t: '灾难 11%' },
      { c: '#fbbf24', t: '命运 4%' },
    ].forEach(function (x) {
      legend.appendChild(h('span', { style: { fontSize: isM ? '10px' : '9px', color: C.cream2, display: 'flex', alignItems: 'center', gap: '4px' } }, [
        h('span', { style: { width: '8px', height: '8px', borderRadius: '2px', background: x.c, display: 'inline-block', flexShrink: '0' } }),
        (' ' + x.t),
      ]));
    });
    container.appendChild(legend);

    // 抽卡按钮
    var btnRow = h('div', { style: { display: 'flex', gap: '8px', padding: '4px' } });
    var singleBtn = h('button', { style: {
      flex: '1', padding: isM ? '10px' : '8px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #6b21a8',
      background: 'linear-gradient(180deg, rgba(107,33,168,0.3), rgba(107,33,168,0.1))',
      color: '#c084fc', fontSize: isM ? '13px' : '12px', fontWeight: '600', letterSpacing: '1px',
      boxShadow: '0 2px 8px rgba(107,33,168,0.2)',
    }, html: '单抽 ¥50,000', on: { click: function () { doDraw(1); } } });
    var multiBtn = h('button', { style: {
      flex: '1', padding: isM ? '10px' : '8px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #6b21a8',
      background: 'linear-gradient(180deg, rgba(168,85,247,0.4), rgba(168,85,247,0.15))',
      color: '#d8b4fe', fontSize: isM ? '13px' : '12px', fontWeight: '600', letterSpacing: '1px',
      boxShadow: '0 2px 12px rgba(168,85,247,0.3)',
    }, html: '五连抽 ¥250,000', on: { click: function () { doDraw(5); } } });
    btnRow.appendChild(singleBtn); btnRow.appendChild(multiBtn);
    container.appendChild(btnRow);

    // 卡牌仓库
    var whTitle = h('div', { style: { fontSize: isM ? '12px' : '11px', color: C.gold, padding: isM ? '12px 4px 4px' : '10px 4px 4px', letterSpacing: '2px', borderTop: '1px solid ' + C.barBg, marginTop: '8px' } }, ['✦ 卡牌仓库']);
    container.appendChild(whTitle);

    if (cards.length === 0) {
      container.appendChild(h('div', { style: { textAlign: 'center', padding: '20px', color: C.muted, fontSize: isM ? '12px' : '11px' } }, ['尚未获得任何卡牌']));
    } else {
      var whList = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px' } });
      cards.forEach(function (c) {
        whList.appendChild(h('div', { style: {
          background: C.card, borderRadius: '6px', padding: isM ? '8px 10px' : '6px 8px',
          border: '1px solid ' + C.barBg, fontSize: isM ? '11px' : '10px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        } }, [
          h('span', { style: { color: C.cream } }, [c.name || c]),
          h('span', { style: { color: C.goldDim } }, [c.quality || '']),
        ]));
      });
      container.appendChild(whList);
    }
  }

  function getBalance() {
    try {
      if (typeof Mvu !== 'undefined' && Mvu.getMvuData) {
        var td = Mvu.getMvuData({ type: 'message', message_id: -1 });
        var sd = _ && _.get(td, 'stat_data');
        return Number(sd && sd.主角 && sd.主角.余额) || 50000;
      }
    } catch (e) {}
    return 50000;
  }

  function getCardBackpack() {
    try {
      if (typeof Mvu !== 'undefined' && Mvu.getMvuData) {
        var td = Mvu.getMvuData({ type: 'message', message_id: -1 });
        var sd = _ && _.get(td, 'stat_data');
        var bp = sd && sd.主角 && sd.主角.卡牌背包;
        if (Array.isArray(bp)) return bp.map(function (c) { return typeof c === 'string' ? { name: c } : c; });
      }
    } catch (e) {}
    return [];
  }

  function doDraw(count) {
    var bal = getBalance();
    var cost = count === 5 ? 250000 : 50000;
    if (bal < cost) {
      window.parent.toastr.warning('命运之力不足，需要 ¥' + cost.toLocaleString(), '🃏');
      return;
    }
    var msg = count === 5 ? '命运祈愿，五连抽！' : '命运祈愿，单抽！';
    var $textarea = PW.$ && PW.$('#send_textarea');
    if ($textarea && $textarea.length) {
      $textarea.val(msg).trigger('input');
      PW.$('#send_but').click();
    } else {
      window.parent.toastr.info('请在聊天框输入：' + msg, '🃏');
    }
  }

  // ===== 打开/关闭 =====
  function openPhone() {
    if (phoneVisible) return; phoneVisible = true;
    var container = PD.getElementById('fp-phone-root');
    if (!container) { container = h('div', { id: 'fp-phone-root' }); container.appendChild(buildPhone()); PD.body.appendChild(container); }
    container.style.display = ''; openApp(null); updateClock(); clockTimer = setInterval(updateClock, 10000);
  }

  function closePhone() { phoneVisible = false;
    var c = PD.getElementById('fp-phone-root'); if (c) c.style.display = 'none';
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } currentApp = null; }

  function updateClock() { var el = PD.getElementById('fp-time'); if (el) { var n = new Date(); el.textContent = String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0'); } }

  // ===== 悬浮球点击 =====
  ball.addEventListener('click', function () { if (dragFlag) return; phoneVisible ? closePhone() : openPhone(); });
  console.info('[浮窗手机] 初始化完成');
})();
