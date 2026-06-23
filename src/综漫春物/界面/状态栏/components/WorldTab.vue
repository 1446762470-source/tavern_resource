<template>
  <div class="world-tab">
    <div class="info-grid">
      <div class="info-item">
        <span class="info-key">日期</span>
        <span class="info-val">{{ ws.时间.日期 || '—' }}</span>
      </div>
      <div class="info-item">
        <span class="info-key">时段</span>
        <span class="info-val">{{ ws.时间.当前片段 || '—' }}</span>
      </div>
      <div class="info-item">
        <span class="info-key">季节</span>
        <span class="info-val season">{{ ws.季节 || '—' }}</span>
      </div>
      <div class="info-item">
        <span class="info-key">天气</span>
        <span class="info-val weather">{{ ws.天气 || '—' }}</span>
      </div>
      <div class="info-item wide">
        <span class="info-key">地点</span>
        <span class="info-val location">{{ ws.地点 || '—' }}</span>
      </div>
      <div class="info-item wide" v-if="ws.当前卷数">
        <span class="info-key">卷数</span>
        <span class="info-val volume">{{ ws.当前卷数 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const ws = computed(() => store.data.value?.世界状态 ?? {} as any);
</script>

<style lang="scss" scoped>
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 3px 0;
  border-bottom: 1px dotted rgba(139, 90, 43, 0.15);

  &.wide {
    grid-column: 1 / -1;
  }
}

.info-key {
  font-size: 11px;
  color: #7a5c4a;
  flex-shrink: 0;
}

.info-val {
  font-size: 12px;
  font-weight: 600;
  color: #2c1810;
  text-align: right;

  &.season { color: #5b8c3e; }
  &.weather { color: #b8860b; }
  &.location { color: #6b4d3a; }
  &.volume { color: #8b4513; font-style: italic; }
}
</style>
