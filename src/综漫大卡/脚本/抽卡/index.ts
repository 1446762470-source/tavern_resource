import { Schema } from '../../schema';

// 六大分类
const CATEGORIES = ['幸运', '厄运', '物品', '事件', '角色', '无事'] as const;
const CATEGORY_WEIGHTS = [15, 15, 25, 25, 15, 5]; // 对应上面的顺序

// 稀有度
const RARITIES = ['N', 'R', 'SR', 'SSR'] as const;
const RARITY_WEIGHTS = [50, 30, 15, 5];

// 能力名称库（按稀有度+分类）
const CARD_POOL: Record<string, Record<string, string[]>> = {
  N: {
    幸运: ['捡到500日元', '自动贩卖机多掉了一瓶饮料', '刚好赶上末班车', '老师忘了收作业', '今天不用值日'],
    厄运: ['上学踩到水坑袜子湿了', '午饭钱掉了', '笔突然没水了', '鞋带总是在关键时刻断', '课本忘在家里了'],
    物品: ['一瓶冰镇饮料', '一包零食', '一支好看的笔', '一把备用折叠伞', '一个可爱的钥匙扣'],
    事件: ['放学和她刚好同路', '在便利店偶遇', '一起值日', '被分到同一个小组', '座位换到了她附近'],
    角色: ['今天她多看了你一眼', '她的语气比平时温和', '她今天似乎心情不错', '你们对视了一秒', '她经过你座位时放慢了脚步'],
    无事: ['什么都没发生'],
  },
  R: {
    幸运: ['考试选择题全蒙对了', '被老师表扬了', '免费抽中了食堂的特别套餐', '刚好避开了一场大雨', '公交车上刚好有座位'],
    厄运: ['被老师点名回答问题', '体育课摔了一跤但有人扶你', '作业写错了被退回重做', '手机屏幕多了一道划痕', '约好的事被放了鸽子'],
    物品: ['两张电影票', '一本她喜欢的书', '一条围巾', '一个精致的马克杯', '一盒她最爱口味的巧克力'],
    事件: ['被分到和她同组做课题', '她找你帮忙补习', '一起被留下来打扫教室', '她的包不小心碰到了你', '一起在走廊上聊天'],
    角色: ['她今天主动和你说了话', '她注意到你换了新发型', '她的笑容今天格外多', '她问了你一个问题', '她记住了你随口说的一件事'],
    无事: ['什么都没发生'],
  },
  SR: {
    幸运: ['抽签抽到了大吉', '买的彩票中小奖了', '你被选为班级代表', '社团经费意外增加了', '你最怕的考试突然延期'],
    厄运: ['被不喜欢的人当众告白了', '重要的东西弄丢了', '被老师误会了', '在大家面前出了丑', '收到了莫名其妙的流言'],
    物品: ['很难买到的限量版商品', '手工定制的特别礼物', '她一直想要的东西', '一张学园祭VIP通行证', '温泉旅店双人券'],
    事件: ['学园祭被关在器材室独处', '合宿时被安排进同一个活动', '她约你一起去看电影', '末班车后只有你们两个人', '下雨天她把伞分给你一半'],
    角色: ['她开始在意你和别人的互动', '她对你说话的语气和别人不一样', '她在人群中总是先看向你', '她拒绝别人的邀约却和你说可以', '她的朋友开始打探你的消息'],
    无事: ['什么都没发生'],
  },
  SSR: {
    幸运: ['你陷入困境时她恰好出现了', '你许的愿望以意想不到的方式实现了', '一场意外让你和她成了搭档', '你捡到了一把钥匙…通向哪里？'],
    厄运: ['你最不想让她知道的事被她发现了', '她看到了你最狼狈的一面', '你的秘密在她面前暴露无遗', '你被困在了一个必须对她坦白的局面里'],
    物品: ['一件只有她知道你会喜欢的东西', '一封没有署名的情书…内容让你心跳加速', '一本手写的日记，里面提到了你', '一张照片——照片上的人是你'],
    事件: ['她主动约你出来', '她说想和你谈谈…认真的那种', '一个只属于你们两个人的约定', '她做了一件让你无论如何都无法忽视的事'],
    角色: ['你无意中感知到了她当下的心情', '她看你的眼神变了', '她主动向你靠近了一步', '她说出了心里话——关于你'],
    无事: ['什么都没发生'],
  },
};

function weightedRandom(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function generateCard(): { 名称: string; 稀有度: string; 分类: string; 效果描述: string } {
  const catIdx = weightedRandom([...CATEGORY_WEIGHTS]);
  const category = CATEGORIES[catIdx];

  const rarityIdx = weightedRandom([...RARITY_WEIGHTS]);
  const rarity = RARITIES[rarityIdx];

  const names = CARD_POOL[rarity]?.[category] ?? ['未知的能力'];
  const name = names[Math.floor(Math.random() * names.length)];

  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return {
    名称: name === '什么都没发生' && category === '无事' ? '风平浪静' : name,
    稀有度: rarity,
    分类: category,
    效果描述: category === '无事' ? '今天什么都没发生。但这份平静也许就是最好的礼物。' : '',
    获得时间: date,
  };
}

async function doDraw(count: number) {
  await waitGlobalInitialized('Mvu');

  const cost = count === 5 ? 98000 : 20000;
  const variables = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
  const statData = Schema.parse(_.get(variables, 'stat_data', {}));

  const balance = statData.主角?.余额 ?? 0;
  if (balance < cost) {
    toastr.warning(`余额不足！需要 ${cost.toLocaleString()}G，当前余额 ${balance.toLocaleString()}G`);
    return;
  }

  statData.主角.余额 -= cost;
  statData.主角.抽卡统计.总抽数 += count;

  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    const card = generateCard();
    const cardId = `card_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    statData.主角.能力背包[cardId] = card;

    // 更新统计
    const rarityKey = `${card.稀有度}次数` as keyof typeof statData.主角.抽卡统计;
    if (typeof statData.主角.抽卡统计[rarityKey] === 'number') {
      (statData.主角.抽卡统计[rarityKey] as number)++;
    }

    const emoji: Record<string, string> = { N: '⬜', R: '🟦', SR: '🟪', SSR: '🟧' };
    results.push(`${emoji[card.稀有度]} [${card.稀有度}] ${card.名称} <span class="text-xs opacity-60">${card.分类}</span>`);
  }

  // 写回变量
  await Mvu.replaceMvuData(
    { stat_data: Schema.parse(statData) },
    { type: 'message', message_id: getCurrentMessageId() },
  );

  // 弹窗显示结果
  const resultHTML = results.map(r => `<div class="py-1">${r}</div>`).join('');
  toastr.success(
    `抽卡完成！剩余 ${statData.主角.余额.toLocaleString()}G`,
    count === 5 ? '五连抽结果' : '单抽结果',
  );

  // 同时在页面上显示详细信息
  const $popup = $(`
    <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:#1a1a2e;color:#eee;padding:16px 24px;border-radius:12px;min-width:240px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.4);font-size:14px;">
      <div style="font-size:16px;font-weight:bold;margin-bottom:8px;display:flex;justify-content:space-between;">
        <span>${count === 5 ? '🎰 五连抽' : '🎰 单抽'} (-${cost.toLocaleString()}G)</span>
        <span style="cursor:pointer;color:#666;" class="popup-close">✕</span>
      </div>
      ${resultHTML}
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #333;color:#aaa;font-size:12px;">
        💰 剩余: ${statData.主角.余额.toLocaleString()}G
      </div>
    </div>
  `);

  $('body').append($popup);
  $popup.find('.popup-close').on('click', () => $popup.remove());
  setTimeout(() => $popup.fadeOut(300, () => $popup.remove()), 5000);
}

// 注册按钮
$(() => {
  appendInexistentScriptButtons([
    { name: '🎰 单抽 (20,000G)', visible: true },
    { name: '🎰 五连 (98,000G)', visible: true },
  ]);

  eventOn(getButtonEvent('🎰 单抽 (20,000G)'), () => doDraw(1));
  eventOn(getButtonEvent('🎰 五连 (98,000G)'), () => doDraw(5));
});
