import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Schema } from './schema';

export const useDataStore = defineStore('float-phone-data', () => {
  // Start with mock data so the UI is visible immediately
  const data = ref({
    角色档案: {
      雪之下雪乃: { 好感度: 245, 了解度: 68, 自我理解度: 82, 灵魂共鸣度: 35, 关系: '挚友' },
      由比滨结衣: { 好感度: 180, 了解度: 45, 自我理解度: 30, 灵魂共鸣度: 0, 关系: '朋友' },
      雪之下阳乃: { 好感度: 60, 了解度: 20, 自我理解度: 55, 灵魂共鸣度: 0, 关系: '陌生人' },
    } as Record<string, any>,
    世界状态: {
      时间: { 日期: '2012-04-08', 当前片段: '上午' },
      地点: '总武高中',
    },
  });

  // Try to sync with MVU in background (non-blocking)
  async function trySyncWithMvu() {
    try {
      if (typeof waitGlobalInitialized !== 'function') return;
      await waitGlobalInitialized('Mvu');
      if (typeof Mvu === 'undefined') return;

      const mvuData = Mvu.getMvuData({ type: 'message', message_id: -1 });
      if (mvuData) {
        const statData = _.get(mvuData, 'stat_data');
        const parsed = Schema.safeParse(statData);
        if (parsed.success && parsed.data.角色档案 && Object.keys(parsed.data.角色档案).length > 0) {
          data.value = parsed.data as any;
          console.info('[浮窗手机] MVU 数据已同步');
        }
      }
    } catch (e) {
      console.warn('[浮窗手机] MVU 同步暂不可用，使用模拟数据');
    }

    // Poll for changes
    setInterval(() => {
      try {
        if (typeof Mvu === 'undefined') return;
        const mvuData = Mvu.getMvuData({ type: 'message', message_id: -1 });
        if (mvuData) {
          const statData = _.get(mvuData, 'stat_data');
          const parsed = Schema.safeParse(statData);
          if (parsed.success && parsed.data.角色档案 && Object.keys(parsed.data.角色档案).length > 0) {
            data.value = parsed.data as any;
          }
        }
      } catch (_) { /* ignore */ }
    }, 3000);
  }

  trySyncWithMvu();

  return { data };
});
