<template>
  <div class="tattered-page">
    <!-- 撕边装饰 -->
    <div class="page-edge page-edge--top"></div>

    <div class="page-content">
      <!-- 标签导航 -->
      <div class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 内容 -->
      <div class="tab-content">
        <WorldTab v-if="activeTab === 'world'" />
        <ProtagonistTab v-else-if="activeTab === 'protagonist'" />
        <CharacterTab v-else-if="activeTab === 'characters'" />
      </div>
    </div>

    <!-- 撕边装饰 -->
    <div class="page-edge page-edge--bottom"></div>

    <!-- 墨渍 -->
    <div class="ink-stain ink-stain--1"></div>
    <div class="ink-stain ink-stain--2"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WorldTab from './components/WorldTab.vue';
import ProtagonistTab from './components/ProtagonistTab.vue';
import CharacterTab from './components/CharacterTab.vue';

const tabs = [
  { id: 'world' as const, label: '世界' },
  { id: 'protagonist' as const, label: '主角' },
  { id: 'characters' as const, label: '角色' },
];

const activeTab = ref<string>('characters');
</script>

<style lang="scss" scoped>
/* ===== 残破书页 ===== */
.tattered-page {
  max-width: 640px;
  margin: 0 auto;
  position: relative;
  background: linear-gradient(
    175deg,
    #f5e6c8 0%,
    #efe0bf 15%,
    #e8d5a8 40%,
    #f0ddb5 60%,
    #e6d2a6 85%,
    #dfc99a 100%
  );
  border: 1px solid rgba(139, 90, 43, 0.25);
  box-shadow:
    2px 3px 8px rgba(60, 30, 10, 0.3),
    inset 0 0 60px rgba(139, 90, 43, 0.08),
    0 0 0 8px #f5e6c8,
    0 0 0 9px rgba(139, 90, 43, 0.15),
    0 0 0 11px #efe0bf,
    0 0 0 12px rgba(139, 90, 43, 0.1);
  font-family: 'Georgia', 'Noto Serif SC', 'SimSun', serif;
  color: #2c1810;
  font-size: 13px;
  line-height: 1.6;
}

/* 撕边 */
.page-edge {
  height: 6px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: -5px;
    right: -5px;
    height: 12px;
    background:
      radial-gradient(ellipse at 15% 0%, transparent 40%, #f5e6c8 41%),
      radial-gradient(ellipse at 35% 100%, transparent 35%, #efe0bf 36%),
      radial-gradient(ellipse at 55% 0%, transparent 45%, #f5e6c8 46%),
      radial-gradient(ellipse at 75% 100%, transparent 30%, #efe0bf 31%),
      radial-gradient(ellipse at 90% 0%, transparent 50%, #f5e6c8 51%);
  }
}

.page-content {
  padding: 10px 16px 14px;
}

/* 标签导航 */
.tab-nav {
  display: flex;
  gap: 2px;
  margin-bottom: 12px;
  border-bottom: 1px dashed rgba(139, 90, 43, 0.3);
  padding-bottom: 8px;
}

.tab-btn {
  padding: 4px 14px;
  border: none;
  background: transparent;
  color: #6b4d3a;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
  position: relative;

  &:hover {
    color: #2c1810;
    background: rgba(139, 90, 43, 0.08);
  }

  &.active {
    color: #2c1810;
    font-weight: 700;

    &::after {
      content: '';
      position: absolute;
      bottom: -9px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 5px solid rgba(139, 90, 43, 0.4);
    }
  }
}

.tab-content {
  min-height: 80px;
}

/* 墨渍 */
.ink-stain {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.06;
  background: radial-gradient(circle, #2c1810 0%, transparent 70%);

  &--1 {
    width: 40px;
    height: 30px;
    bottom: 12px;
    right: 20px;
    transform: rotate(-15deg);
  }

  &--2 {
    width: 25px;
    height: 20px;
    top: 30px;
    left: 16px;
    transform: rotate(10deg);
  }
}
</style>
