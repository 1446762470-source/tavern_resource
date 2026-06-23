import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import './style.scss';

const $p = window.parent.$;
const pDoc = window.parent.document;
const pWin = window.parent;
const isMobile = pWin.innerWidth < 768;

// ===== 注入悬浮球到主页面 =====
  const ballSize = isMobile ? 52 : 48;
  const $ball = $p(`
    <div id="float-phone-ball" style="
      position:fixed;bottom:${isMobile ? '120px' : '100px'};right:${isMobile ? '16px' : '24px'};
      width:${ballSize}px;height:${ballSize}px;border-radius:50%;
      background:linear-gradient(135deg,#ec4899,#a855f7);
      box-shadow:0 4px 16px rgba(236,72,153,0.35);cursor:move;
      z-index:9998;display:flex;align-items:center;justify-content:center;
      user-select:none;touch-action:none;
    "><span style="font-size:${isMobile ? '22px' : '20px'};pointer-events:none">📱</span>
    </div>
  `);
  $p('body').append($ball);

  // ===== 注入手机容器到主页面 =====
  const $container = $p(`
    <div id="float-phone-container" style="display:none;">
      <div id="float-phone-app"></div>
    </div>
  `);
  $p('body').append($container);

  // ===== 挂载 Vue 应用到主页面容器 =====
  const app = createApp(App);
  app.use(createPinia());
  app.mount('#float-phone-app');

  // ===== 切换手机显示 =====
  let visible = false;
  const $phone = $p('#float-phone-container');

  $ball.on('click', (e: JQuery.ClickEvent) => {
    if (dragFlag) return;
    visible = !visible;
    $phone.toggle(visible);
  });

  // ===== 点击外部关闭 =====
  $p(pDoc).on('click', (e: JQuery.ClickEvent) => {
    if (!visible) return;
    if (!$(e.target).closest('#float-phone-container').length && !$(e.target).closest('#float-phone-ball').length) {
      visible = false;
      $phone.hide();
    }
  });

  // ===== 统一拖拽（鼠标 + 触屏） =====
  let dragging = false, sx = 0, sy = 0, sl = 0, st = 0, moved = false;
  let dragFlag = false;

  function startDrag(e: MouseEvent | TouchEvent) {
    dragging = true; moved = false;
    const pt = 'touches' in e ? e.touches[0] : e;
    sx = pt.clientX; sy = pt.clientY;
    const r = $ball[0]!.getBoundingClientRect();
    sl = r.left; st = r.top;
    $ball.css('transition', 'none');
    e.preventDefault();
  }

  function moveDrag(e: MouseEvent | TouchEvent) {
    if (!dragging) return;
    const pt = 'touches' in e ? e.touches[0] : e;
    const dx = pt.clientX - sx, dy = pt.clientY - sy;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
    const pw = pWin.innerWidth, ph = pWin.innerHeight;
    $ball.css({ left: Math.min(pw - ballSize - 8, Math.max(0, sl + dx)), top: Math.min(ph - ballSize - 8, Math.max(0, st + dy)), right: 'auto', bottom: 'auto' });
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    $ball.css('transition', '');
    dragFlag = moved;
    if (moved) setTimeout(() => { dragFlag = false; }, 300);
  }

  $ball[0]!.addEventListener('mousedown', startDrag);
  pDoc.addEventListener('mousemove', moveDrag);
  pDoc.addEventListener('mouseup', endDrag);
  $ball[0]!.addEventListener('touchstart', startDrag, { passive: false });
  pDoc.addEventListener('touchmove', moveDrag, { passive: false });
  pDoc.addEventListener('touchend', endDrag);

  // PC hover
  if (!isMobile) {
    $ball.on('mouseenter', function () { $p(this).css('transform', 'scale(1.1)'); });
    $ball.on('mouseleave', function () { $p(this).css('transform', 'scale(1)'); });
  }
