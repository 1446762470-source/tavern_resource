<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
    <div class="w-full max-w-md">

      <!-- 加载中 -->
      <div v-if="!isReady" class="text-center text-gray-400 text-sm py-8">
        <div class="text-2xl mb-2 animate-pulse">🌸</div>
        正在连接…
      </div>

      <!-- 已创建，跳过 -->
      <div v-else-if="alreadyCreated" class="text-center text-gray-500 text-xs py-4">
        角色已创建，跳过设定
      </div>

      <!-- ====== 第一屏：角色创建 ====== -->
      <div v-else-if="step === 1" class="space-y-5">
        <div class="text-center">
          <div class="text-3xl mb-2">🌸</div>
          <h1 class="text-xl font-bold text-white">你的故事，从这里开始</h1>
          <p class="text-sm text-gray-400 mt-1">填写基本信息，然后选择你的身份</p>
        </div>

        <!-- 名字 -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">姓名</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="输入你的名字"
            maxlength="20"
            class="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/60 transition-colors"
          />
        </div>

        <!-- 性别 -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">性别</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="g in ['男', '女']"
              :key="g"
              @click="form.gender = g"
              class="py-2.5 rounded-lg border transition-all text-sm"
              :class="form.gender === g
                ? 'bg-pink-500/20 border-pink-400/50 text-pink-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'"
            >{{ g === '男' ? '♂' : '♀' }} {{ g }}</button>
          </div>
        </div>

        <!-- 自我介绍 -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">自我介绍</label>
          <textarea
            v-model="form.bio"
            placeholder="一句话介绍自己，AI 会在开场中引用…"
            maxlength="100"
            rows="2"
            class="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/60 transition-colors resize-none"
          ></textarea>
          <div class="text-right text-xs text-gray-500 mt-0.5">{{ form.bio.length }}/100</div>
        </div>

        <!-- 下一步 -->
        <button
          @click="nextStep"
          :disabled="!canNext"
          class="w-full py-3 rounded-lg font-medium text-sm transition-all"
          :class="canNext
            ? 'bg-pink-500 hover:bg-pink-400 text-white cursor-pointer'
            : 'bg-white/5 text-gray-600 cursor-not-allowed'"
        >下一步 →</button>
      </div>

      <!-- ====== 第二屏：初始设定 ====== -->
      <div v-else-if="step === 2" class="space-y-5">
        <div class="text-center">
          <div class="text-3xl mb-2">🏫</div>
          <h1 class="text-xl font-bold text-white">选择你的起点</h1>
          <p class="text-sm text-gray-400 mt-1">你将以什么身份开始这段故事？</p>
        </div>

        <!-- 班级选择 -->
        <div class="space-y-2.5">
          <button
            v-for="cls in classes"
            :key="cls.value"
            @click="selectClass(cls.value)"
            class="w-full text-left px-4 py-3 rounded-lg border transition-all"
            :class="form.class === cls.value
              ? 'bg-pink-500/10 border-pink-400/40 text-white'
              : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'"
          >
            <div class="font-medium text-sm">{{ cls.label }}</div>
            <div class="text-xs mt-0.5" :class="form.class === cls.value ? 'text-pink-300/70' : 'text-gray-500'">{{ cls.desc }}</div>
          </button>

          <!-- 自定义 -->
          <div
            class="px-4 py-3 rounded-lg border transition-all cursor-pointer"
            :class="form.class === '__custom__'
              ? 'bg-pink-500/10 border-pink-400/40'
              : 'bg-white/5 border-white/10 hover:border-white/20'"
            @click="selectClass('__custom__')"
          >
            <div class="font-medium text-sm text-gray-300">📝 自定义</div>
            <div class="text-xs text-gray-500 mt-0.5">输入你自己的班级</div>
            <input
              v-if="form.class === '__custom__'"
              v-model="customClass"
              type="text"
              placeholder="例如：总武高高三国语科"
              maxlength="30"
              class="w-full mt-2 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-400/60"
              @click.stop
            />
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="flex gap-3">
          <button
            @click="step = 1"
            class="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-all"
          >← 返回</button>
          <button
            @click="confirm"
            :disabled="!canConfirm"
            class="flex-[2] py-3 rounded-lg font-medium text-sm transition-all"
            :class="canConfirm
              ? 'bg-pink-500 hover:bg-pink-400 text-white cursor-pointer'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'"
          >确认并开始 🎉</button>
        </div>
      </div>

      <!-- ====== 完成 ====== -->
      <div v-else-if="step === 3" class="text-center space-y-4">
        <div class="text-5xl">🌸</div>
        <h1 class="text-xl font-bold text-white">设定完成</h1>
        <p class="text-sm text-gray-400">
          <span class="text-pink-300">{{ finalClassName }}</span> · {{ form.name }}<br>
          初始金币 <span class="text-amber-400 font-mono">50,000 G</span>
        </p>
        <p class="text-xs text-gray-500 animate-pulse">正在载入你的故事…</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Schema } from '../../schema';

const isReady = ref(false);
const alreadyCreated = ref(false);
const step = ref(1);

onMounted(async () => {
  try {
    await waitGlobalInitialized('Mvu');
    await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));
    const variables = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
    const statData = Schema.parse(_.get(variables, 'stat_data', {}));
    if (statData.主角?.姓名) {
      alreadyCreated.value = true;
    }
  } catch {}
  isReady.value = true;
});

const form = reactive({
  name: '',
  gender: '男',
  bio: '',
  class: '',
});

const customClass = ref('');

const classes = [
  { value: '总武高高二J班', label: '📚 总武高高二J班', desc: '由比滨结衣、三浦优美子、川崎沙希所在的班级，氛围热闹' },
  { value: '总武高高二F班', label: '🏀 总武高高二F班', desc: '叶山隼人所在的班级，运动社团活跃，社交中心' },
  { value: '总武高高一C班', label: '🎀 总武高高一C班', desc: '一色彩羽所在的班级，学妹视角，充满新鲜感' },
];

const canNext = computed(() => form.name.trim().length > 0);

const finalClassName = computed(() => {
  if (form.class === '__custom__') return customClass.value || '自定义班级';
  const found = classes.find(c => c.value === form.class);
  return found ? found.value : form.class;
});

const canConfirm = computed(() => {
  if (!form.class) return false;
  if (form.class === '__custom__' && !customClass.value.trim()) return false;
  return true;
});

function selectClass(val: string) {
  form.class = val;
}

function nextStep() {
  if (!canNext.value) return;
  step.value = 2;
}

async function confirm() {
  if (!canConfirm.value) return;
  step.value = 3;

  try {
    await waitGlobalInitialized('Mvu');
    await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));

    const variables = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
    const statData = Schema.parse(_.get(variables, 'stat_data', {}));

    // 写入基本信息
    statData.主角.姓名 = form.name.trim();
    statData.主角.性别 = form.gender as '男' | '女';
    statData.主角.班级 = finalClassName.value;
    statData.主角.自我介绍 = form.bio.trim();

    // 写入变量
    const updated = { stat_data: Schema.parse(statData) };
    await Mvu.replaceMvuData(updated, { type: 'message', message_id: getCurrentMessageId() });
  } catch (e) {
    console.error('[开局] 变量写入失败', e);
  }

  // 延迟关闭，让玩家看到完成页面
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}
</script>
