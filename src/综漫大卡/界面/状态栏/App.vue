<template>
  <div class="flex flex-col gap-2 text-sm p-2 rounded-lg">
    <!-- 余额 -->
    <div class="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
      <span class="text-amber-700 font-medium">🪙 余额</span>
      <span class="text-amber-900 font-bold text-base">{{ (store.data.主角?.余额 ?? 0).toLocaleString() }} G</span>
    </div>

    <!-- 抽卡统计 -->
    <div class="grid grid-cols-2 gap-1 text-xs text-gray-500">
      <span>总抽：{{ (store.data.主角?.抽卡统计?.总抽数 ?? 0) }}次</span>
      <span>SSR：{{ (store.data.主角?.抽卡统计?.SSR次数 ?? 0) }}</span>
      <span>SR：{{ (store.data.主角?.抽卡统计?.SR次数 ?? 0) }}</span>
      <span>R：{{ (store.data.主角?.抽卡统计?.R次数 ?? 0) }}</span>
      <span>N：{{ (store.data.主角?.抽卡统计?.N次数 ?? 0) }}</span>
    </div>

    <!-- 能力背包 -->
    <div v-if="cards.length > 0" class="flex flex-col gap-1">
      <div class="text-xs text-gray-400 font-medium">已有能力</div>
      <div
        v-for="card in cards"
        :key="card[0]"
        class="rounded px-2 py-1 text-xs border"
        :class="rarityStyle(card[1].稀有度)"
      >
        <div class="flex items-center gap-1">
          <span class="font-bold">{{ rarityIcon(card[1].稀有度) }}</span>
          <span>{{ card[1].名称 }}</span>
          <span class="ml-auto text-[10px] opacity-60">{{ card[1].分类 }}</span>
        </div>
        <div v-if="card[1].效果描述" class="text-[10px] mt-0.5 opacity-70">{{ card[1].效果描述 }}</div>
      </div>
    </div>

    <!-- 暂无能力 -->
    <div v-else class="text-xs text-gray-300 text-center py-2">
      还没有能力，去抽一发吧 🎰
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from './store';

const store = useDataStore();

const cards = computed(() => {
  const backpack = store.data.主角?.能力背包 ?? {};
  return Object.entries(backpack);
});

function rarityStyle(rarity: string) {
  const map: Record<string, string> = {
    N: 'bg-gray-50 border-gray-200 text-gray-600',
    R: 'bg-blue-50 border-blue-200 text-blue-700',
    SR: 'bg-purple-50 border-purple-200 text-purple-700',
    SSR: 'bg-amber-50 border-amber-300 text-amber-800',
  };
  return map[rarity] ?? '';
}

function rarityIcon(rarity: string) {
  const map: Record<string, string> = { N: '⬜', R: '🟦', SR: '🟪', SSR: '🟧' };
  return map[rarity] ?? '⬜';
}
</script>
