<template>
  <div class="protagonist-tab">
    <div class="info-grid">
      <div class="info-item">
        <span class="info-key">姓名</span>
        <span class="info-val name">{{ mc.姓名 || 'User' }}</span>
      </div>
      <div class="info-item">
        <span class="info-key">余额</span>
        <span class="info-val balance">¥{{ (mc.余额 || 0).toLocaleString() }}</span>
      </div>
    </div>

    <!-- 背包 -->
    <div class="section" v-if="mc.背包 && mc.背包.length">
      <div class="section-title">随身物品</div>
      <div class="item-list">
        <span v-for="(item, i) in mc.背包" :key="i" class="item-tag">{{ item }}</span>
      </div>
    </div>

    <!-- 卡牌背包 -->
    <div class="section" v-if="mc.卡牌背包 && mc.卡牌背包.length">
      <div class="section-title">命运卡牌</div>
      <div class="item-list">
        <span v-for="(card, i) in mc.卡牌背包" :key="i" class="item-tag card-tag">{{ card }}</span>
      </div>
    </div>

    <div class="empty" v-if="!hasItems">
      暂无物品
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const mc = computed(() => store.data.value?.主角 ?? ({} as any));
const hasItems = computed(() => (mc.value.背包?.length || 0) + (mc.value.卡牌背包?.length || 0) > 0);
</script>

<style lang="scss" scoped>
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 3px 0;
  border-bottom: 1px dotted rgba(139, 90, 43, 0.15);
}

.info-key {
  font-size: 11px;
  color: #7a5c4a;
}

.info-val {
  font-size: 12px;
  font-weight: 600;
  color: #2c1810;
  text-align: right;

  &.name { color: #2c1810; }
  &.balance { color: #b8860b; }
}

.section {
  margin-top: 8px;
}

.section-title {
  font-size: 10px;
  color: #7a5c4a;
  margin-bottom: 4px;
  font-style: italic;
}

.item-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.item-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(139, 90, 43, 0.08);
  border: 1px solid rgba(139, 90, 43, 0.15);
  border-radius: 2px;
  font-size: 11px;
  color: #4a3020;
}

.card-tag {
  background: rgba(139, 69, 19, 0.1);
  border-color: rgba(139, 69, 19, 0.2);
  color: #6b3a1f;
}

.empty {
  text-align: center;
  color: #7a5c4a;
  font-size: 12px;
  font-style: italic;
  padding: 8px 0;
}
</style>
