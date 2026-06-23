<template>
  <div class="char-archive">
    <!-- Loading -->
    <div v-if="!store" class="loading">加载中...</div>

    <!-- Empty -->
    <div v-else-if="sortedChars.length === 0" class="empty">
      <div class="empty-icon">📭</div>
      <div class="empty-text">还没有角色登场</div>
      <div class="empty-hint">与角色互动后将自动记录</div>
    </div>

    <!-- List -->
    <div v-else class="char-list">
      <div
        v-for="char in sortedChars"
        :key="char.name"
        class="char-card"
        :class="{ expanded: expanded === char.name }"
        @click="toggle(char.name)"
      >
        <!-- Header row -->
        <div class="char-row">
          <div class="char-avatar" :style="{ background: avatarColor(char.affection) }">
            {{ char.name[0] }}
          </div>
          <div class="char-info">
            <div class="char-name">{{ char.name }}</div>
            <div class="char-meta">
              <span class="char-relation" :class="relationClass(char.relation)">
                {{ char.relation }}
              </span>
            </div>
          </div>
          <div class="char-affection">
            <span class="affection-num" :style="{ color: affectionColor(char.affection) }">
              {{ char.affection }}
            </span>
            <span class="affection-label">好感</span>
          </div>
          <span class="expand-arrow" :class="{ open: expanded === char.name }">▸</span>
        </div>

        <!-- Affection bar -->
        <div class="affection-bar-wrap">
          <div class="affection-bar">
            <div
              class="affection-fill"
              :style="{
                width: (char.affection / 500) * 100 + '%',
                background: affectionGradient(char.affection),
              }"
            ></div>
          </div>
        </div>

        <!-- Expanded detail -->
        <div v-if="expanded === char.name" class="char-detail">
          <div class="stat-row">
            <span class="stat-label">了解度</span>
            <div class="stat-bar">
              <div class="stat-fill stat-fill--blue" :style="{ width: (char.了解度 / 100) * 100 + '%' }"></div>
            </div>
            <span class="stat-num">{{ char.了解度 }}/100</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">自我理解度</span>
            <div class="stat-bar">
              <div class="stat-fill stat-fill--purple" :style="{ width: (char.自我理解度 / 100) * 100 + '%' }"></div>
            </div>
            <span class="stat-num">{{ char.自我理解度 }}/100</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">灵魂共鸣度</span>
            <div class="stat-bar">
              <div
                class="stat-fill"
                :class="char.灵魂共鸣度 > 0 ? 'stat-fill--gold' : 'stat-fill--locked'"
                :style="{ width: (char.灵魂共鸣度 / 100) * 100 + '%' }"
              ></div>
            </div>
            <span class="stat-num" :class="{ locked: char.灵魂共鸣度 === 0 }">
              {{ char.灵魂共鸣度 > 0 ? char.灵魂共鸣度 + '/100' : '未解锁' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const expanded = ref<string | null>(null);

interface CharEntry {
  name: string;
  affection: number;
  relation: string;
  了解度: number;
  自我理解度: number;
  灵魂共鸣度: number;
}

const sortedChars = computed<CharEntry[]>(() => {
  const raw = store?.data?.角色档案;
  if (!raw) return [];
  return Object.entries(raw)
    .map(([name, stats]) => ({
      name,
      affection: stats.好感度 ?? 0,
      relation: stats.关系 ?? '陌生人',
      了解度: stats.了解度 ?? 0,
      自我理解度: stats.自我理解度 ?? 0,
      灵魂共鸣度: stats.灵魂共鸣度 ?? 0,
    }))
    .sort((a, b) => {
      // Zero-affection chars at bottom
      if (a.affection === 0 && b.affection !== 0) return 1;
      if (b.affection === 0 && a.affection !== 0) return -1;
      return b.affection - a.affection;
    });
});

function toggle(name: string) {
  expanded.value = expanded.value === name ? null : name;
}

function affectionColor(val: number): string {
  if (val === 0) return '#52525b';
  if (val <= 100) return '#9ca3af';
  if (val <= 200) return '#4ade80';
  if (val <= 300) return '#60a5fa';
  if (val <= 400) return '#c084fc';
  return '#f472b6';
}

function affectionGradient(val: number): string {
  if (val === 0) return '#3f3f46';
  if (val <= 100) return 'linear-gradient(90deg, #52525b, #9ca3af)';
  if (val <= 200) return 'linear-gradient(90deg, #22c55e, #4ade80)';
  if (val <= 300) return 'linear-gradient(90deg, #3b82f6, #60a5fa)';
  if (val <= 400) return 'linear-gradient(90deg, #a855f7, #c084fc)';
  return 'linear-gradient(90deg, #ec4899, #f472b6)';
}

function avatarColor(val: number): string {
  if (val === 0) return '#3f3f46';
  if (val <= 100) return '#52525b';
  if (val <= 200) return '#22c55e';
  if (val <= 300) return '#3b82f6';
  if (val <= 400) return '#a855f7';
  return '#ec4899';
}

function relationClass(relation: string): string {
  const r = relation.toLowerCase();
  if (r.includes('恋') || r.includes('爱')) return 'rel-love';
  if (r.includes('挚') || r.includes('亲')) return 'rel-close';
  if (r.includes('朋') || r.includes('同')) return 'rel-friend';
  return 'rel-neutral';
}
</script>

<style scoped>
.char-archive {
  padding: 8px;
  min-height: 200px;
}

.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: #6b6b7b;
  text-align: center;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  color: #9b9bab;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 11px;
  color: #52525b;
}

/* Character card */
.char-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.char-card {
  background: #18181b;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.char-card:hover {
  background: #1e1e24;
}

.char-card.expanded {
  background: #1e1e24;
}

/* Row */
.char-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.char-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.char-info {
  flex: 1;
  min-width: 0;
}

.char-name {
  font-size: 13px;
  font-weight: 600;
  color: #d1d1db;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.char-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.char-relation {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.rel-love { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
.rel-close { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
.rel-friend { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
.rel-neutral { background: rgba(107, 107, 123, 0.15); color: #9b9bab; }

.char-affection {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.affection-num {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.affection-label {
  font-size: 9px;
  color: #52525b;
  margin-top: 2px;
}

.expand-arrow {
  font-size: 12px;
  color: #52525b;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.expand-arrow.open {
  transform: rotate(90deg);
}

/* Affection bar */
.affection-bar-wrap {
  margin-top: 8px;
}

.affection-bar {
  height: 3px;
  background: #27272a;
  border-radius: 2px;
  overflow: hidden;
}

.affection-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

/* Detail */
.char-detail {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid #27272a;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 10px;
  color: #71717a;
  width: 56px;
  flex-shrink: 0;
  text-align: right;
}

.stat-bar {
  flex: 1;
  height: 4px;
  background: #27272a;
  border-radius: 2px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.stat-fill--blue { background: #60a5fa; }
.stat-fill--purple { background: #c084fc; }
.stat-fill--gold { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.stat-fill--locked { background: #3f3f46; width: 100% !important; }

.stat-num {
  font-size: 10px;
  color: #9b9bab;
  width: 40px;
  flex-shrink: 0;
  text-align: right;
}

.stat-num.locked {
  color: #52525b;
  font-size: 9px;
}
</style>
