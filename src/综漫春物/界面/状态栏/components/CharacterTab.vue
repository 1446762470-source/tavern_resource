<template>
  <div class="character-tab">
    <div v-if="chars.length === 0" class="empty">
      尚未有人走进你的故事...
    </div>

    <div v-for="c in chars" :key="c.name" class="char-row">
      <div class="char-name">{{ c.name }}</div>
      <div class="char-bar-wrap">
        <div class="char-bar">
          <div
            class="char-fill"
            :style="{
              width: (c.好感度 / 500 * 100) + '%',
              background: fillColor(c.好感度),
            }"
          ></div>
        </div>
      </div>
      <div class="char-val" :style="{ color: valColor(c.好感度) }">
        {{ c.好感度 }}
      </div>
      <span class="char-rel" :style="{ color: relColor(c.关系) }">
        {{ c.关系 }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

interface CharEntry {
  name: string;
  好感度: number;
  关系: string;
}

const chars = computed<CharEntry[]>(() => {
  const archive = store.data.value?.角色档案 ?? {};
  return Object.entries(archive)
    .map(([name, s]: [string, any]) => ({
      name,
      好感度: Number(s.好感度) || 0,
      关系: s.关系 || '陌生人',
    }))
    .filter(c => c.好感度 > 0)
    .sort((a, b) => b.好感度 - a.好感度);
});

function valColor(v: number): string {
  if (v <= 100) return '#5b6b4b';
  if (v <= 200) return '#4a6b3a';
  if (v <= 300) return '#3a5a5a';
  if (v <= 400) return '#6b4a6b';
  return '#8b3a3a';
}

function fillColor(v: number): string {
  if (v <= 100) return 'linear-gradient(90deg, #7a9a6a, #8ab87a)';
  if (v <= 200) return 'linear-gradient(90deg, #5a8a4a, #7ab86a)';
  if (v <= 300) return 'linear-gradient(90deg, #4a7a7a, #6aa8a8)';
  if (v <= 400) return 'linear-gradient(90deg, #8a5a8a, #b87ab8)';
  return 'linear-gradient(90deg, #a85a5a, #c87a6a)';
}

function relColor(rel: string): string {
  if (rel.includes('恋') || rel.includes('爱')) return '#8b3a3a';
  if (rel.includes('挚') || rel.includes('亲')) return '#6b4a6b';
  if (rel.includes('朋') || rel.includes('同')) return '#4a6b6b';
  return '#7a5c4a';
}
</script>

<style lang="scss" scoped>
.char-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px dotted rgba(139, 90, 43, 0.1);

  &:last-child { border-bottom: none; }
}

.char-name {
  width: 64px;
  font-size: 12px;
  font-weight: 600;
  color: #2c1810;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.char-bar-wrap { flex: 1; }

.char-bar {
  height: 5px;
  background: rgba(139, 90, 43, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.char-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

.char-val {
  width: 32px;
  font-size: 12px;
  font-weight: 700;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.char-rel {
  width: 40px;
  font-size: 10px;
  text-align: right;
  flex-shrink: 0;
  font-style: italic;
}

.empty {
  text-align: center;
  color: #7a5c4a;
  font-size: 12px;
  font-style: italic;
  padding: 12px 0;
}
</style>
