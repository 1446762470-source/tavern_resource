<template>
  <div class="phone-frame" :class="{ 'phone-mobile': isMobile }">
    <div class="phone-screen">
      <!-- 状态栏 -->
      <div class="status-bar">
        <span class="signal">::::</span>
        <span class="time">{{ timeStr }}</span>
        <span class="battery">▮▮▮</span>
      </div>

      <!-- 主屏幕 -->
      <div v-if="currentApp === null" class="home-screen">
        <div class="app-grid">
          <div class="app-icon" @click="openApp('character')">
            <div class="icon-bg bg-pink">
              <span class="icon-emoji">🎭</span>
            </div>
            <span class="app-label">角色档案</span>
          </div>
          <div
            v-for="i in 5"
            :key="i"
            class="app-icon app-icon--empty"
          >
            <div class="icon-bg bg-gray"></div>
          </div>
        </div>
      </div>

      <!-- 应用 -->
      <div v-else class="app-screen">
        <div class="app-header">
          <button class="back-btn" @click="currentApp = null">←</button>
          <span class="app-title">{{ appTitle }}</span>
          <span class="app-header-spacer"></span>
        </div>
        <div class="app-content">
          <CharacterArchive v-if="currentApp === 'character'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import CharacterArchive from './apps/CharacterArchive.vue';

const currentApp = ref<string | null>(null);

const appTitle = computed(() => {
  const titles: Record<string, string> = { character: '角色档案' };
  return titles[currentApp.value!] || '';
});

function openApp(app: string) {
  currentApp.value = app;
}

// 响应式检测
const isMobile = ref(window.parent.innerWidth < 768);
window.parent.addEventListener('resize', () => {
  isMobile.value = window.parent.innerWidth < 768;
});

// 时钟
const now = ref(new Date());
let clockTimer: ReturnType<typeof setInterval>;

const timeStr = computed(() => {
  const h = now.value.getHours().toString().padStart(2, '0');
  const m = now.value.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
});

onMounted(() => {
  clockTimer = setInterval(() => (now.value = new Date()), 10000);
});

onUnmounted(() => {
  clearInterval(clockTimer);
});
</script>

<style scoped>
/* ===== Phone Frame ===== */
.phone-frame {
  width: 320px;
  height: 540px;
  background: #1a1a1e;
  border-radius: 28px;
  padding: 12px;
  box-shadow: 0 0 0 2px #2a2a2e, 0 8px 32px rgba(0, 0, 0, 0.5);
  user-select: none;
}

/* 移动端 */
.phone-mobile {
  width: 85vw;
  height: 85vh;
  max-width: 420px;
  border-radius: 32px;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: #0f0f13;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.phone-mobile .phone-screen {
  border-radius: 24px;
}

/* ===== Status Bar ===== */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px 4px;
  color: #6b6b7b;
  font-size: 11px;
  flex-shrink: 0;
}

.phone-mobile .status-bar {
  font-size: 13px;
  padding: 12px 20px 6px;
}

.signal { letter-spacing: -1px; }
.time { font-weight: 600; color: #9b9bab; }
.battery { letter-spacing: -1px; color: #4ade80; }

/* ===== Home Screen ===== */
.home-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px 16px;
  width: 100%;
  max-width: 260px;
}

.phone-mobile .app-grid {
  gap: 32px 24px;
  max-width: 320px;
}

.app-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.15s;
}

.app-icon:hover { transform: scale(1.08); }
.app-icon:active { transform: scale(0.95); }
.app-icon--empty { cursor: default; opacity: 0.2; }

.icon-bg {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-mobile .icon-bg {
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.icon-emoji { font-size: 26px; line-height: 1; }
.phone-mobile .icon-emoji { font-size: 30px; }

.bg-pink { background: linear-gradient(135deg, #ec4899, #f472b6); }
.bg-gray { background: #1e1e28; }

.app-label {
  font-size: 11px;
  color: #9b9bab;
  text-align: center;
}

.phone-mobile .app-label { font-size: 13px; }

/* ===== App Screen ===== */
.app-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-bottom: 1px solid #1e1e28;
  flex-shrink: 0;
}

.phone-mobile .app-header { padding: 10px 16px; }

.back-btn {
  background: none;
  border: none;
  color: #f472b6;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.back-btn:hover { background: #1e1e28; }
.phone-mobile .back-btn { font-size: 20px; }

.app-title {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #d1d1db;
}

.phone-mobile .app-title { font-size: 16px; }

.app-header-spacer { width: 32px; }

.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-content::-webkit-scrollbar { width: 3px; }
.app-content::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
</style>
