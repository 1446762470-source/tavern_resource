const CATEGORIES = ['幸运','厄运','物品','事件','角色','无事'] as const;
const CATEGORY_WEIGHTS = [15,15,25,25,15,5];
const RARITIES = ['N','R','SR','SSR'] as const;
const RARITY_WEIGHTS = [50,30,15,5];

const POOL: any = {
  N:{幸运:['捡到500日元','贩卖机多掉一瓶饮料','刚好赶上末班车','老师忘了收作业','今天不用值日'],厄运:['上学踩到水坑','午饭钱掉了','笔突然没水了','鞋带关键时刻断了','课本忘在家里了'],物品:['一瓶冰镇饮料','一包零食','一支好看的笔','一把备用折叠伞','一个可爱钥匙扣'],事件:['放学和她同路','便利店偶遇','一起值日','被分到同一个小组','座位换到了她附近'],角色:['她多看了你一眼','她语气比平时温和','她今天心情不错','你们对视了一秒','她经过你座位时放慢了脚步'],无事:['什么都没发生']},
  R:{幸运:['考试选择题全蒙对','被老师表扬','免费抽中食堂套餐','刚好避开一场大雨','公交车刚好有座位'],厄运:['被老师点名回答问题','体育课摔了一跤','作业写错被退回','手机多了划痕','被放了鸽子'],物品:['两张电影票','一本她喜欢的书','一条围巾','一个精致马克杯','一盒她爱吃的巧克力'],事件:['和她同组做课题','她找你帮忙补习','一起被留堂打扫','她的包碰到你了','在走廊聊了很久'],角色:['她主动和你说话','她注意到你换了发型','她笑容格外多','她问了你一个问题','她记住了你的喜好'],无事:['什么都没发生']},
  SR:{幸运:['抽签抽到大吉','买彩票中小奖','被选为班级代表','社团经费意外增加','最怕的考试延期'],厄运:['被不喜欢的人告白','重要东西弄丢了','被老师误会','在大家面前出丑','收到莫名流言'],物品:['很难买到的限量版','手工定制特别礼物','她一直想要的东西','学园祭VIP通行证','温泉旅店双人券'],事件:['学园祭被关在器材室独处','合宿被安排同一个活动','她约你一起看电影','末班车后只剩你们俩','下雨天她分你一半伞'],角色:['她开始在意你和别人的互动','她对你说话语气不同','人群中她总是先看向你','她拒绝别人却和你说可以','她朋友开始打探你的事'],无事:['什么都没发生']},
  SSR:{幸运:['你陷入困境时她恰好出现','愿望以意想不到方式实现','一场意外让你和她成搭档','你捡到一把钥匙…通向她的心'],厄运:['最不想让她知道的事被她发现','她看到你最狼狈的一面','你的秘密暴露了','被困在必须坦白的局面'],物品:['只有她知道你会喜欢的东西','没有署名的心跳加速情书','手写日记里提到你','照片上的人是你'],事件:['她主动约你出来','她说想和你认真谈谈','只属于你们两人的约定','她做了让你无法忽视的事'],角色:['你感知到她当下的心情','她看你的眼神变了','她主动向你靠近一步','她说出了心里话——关于你'],无事:['什么都没发生']}
};

function wrand(w: readonly number[]): number { const t=w.reduce((a,b)=>a+b,0); let r=Math.random()*t; for(let i=0;i<w.length;i++){r-=w[i];if(r<=0)return i} return w.length-1; }
function gen() {
  const cat=CATEGORIES[wrand(CATEGORY_WEIGHTS)], rar=RARITIES[wrand(RARITY_WEIGHTS)];
  const names=POOL[rar]?.[cat]??['未知'], n=names[Math.floor(Math.random()*names.length)];
  const d=new Date(); return {能力名称:cat==='无事'?'风平浪静':n,稀有度:rar,分类:cat,效果描述:cat==='无事'?'今天什么都没发生。但这份平静也许就是最好的礼物。':'',获得时间:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
}

function getBalance(): number {
  try {
    const API=(window.top as any)?.AutoCardUpdaterAPI; if(!API) return 50000;
    const all=API.exportTableAsJson();
    for(const k of Object.keys(all)){const s=all[k]; if(s?.name==='主角信息表'&&s?.content?.length>1){const h=s.content[0],d=s.content[1]; const idx=h.indexOf('余额'); if(idx>=0) return parseInt(String(d[idx]??'50000'),10)||50000;}}
  } catch(e){}
  return 50000;
}

function getStats(){const d={总抽数:0,N次数:0,R次数:0,SR次数:0,SSR次数:0};try{const API=(window.top as any)?.AutoCardUpdaterAPI;if(!API)return d;const all=API.exportTableAsJson();for(const k of Object.keys(all)){const s=all[k];if(s?.name==='抽卡统计'&&s?.content?.length>1){const h=s.content[0],r=s.content[1];return{总抽数:parseInt(String(r[h.indexOf('总抽数')]??'0'),10)||0,N次数:parseInt(String(r[h.indexOf('N次数')]??'0'),10)||0,R次数:parseInt(String(r[h.indexOf('R次数')]??'0'),10)||0,SR次数:parseInt(String(r[h.indexOf('SR次数')]??'0'),10)||0,SSR次数:parseInt(String(r[h.indexOf('SSR次数')]??'0'),10)||0};}}}catch(e){}return d;}

async function doDraw(count:number){
  const cost=count===5?98000:20000, bal=getBalance();
  if(bal<cost){toastr.warning(`余额不足！需要${cost.toLocaleString()}G，当前${bal.toLocaleString()}G`);return;}
  const API=(window.top as any)?.AutoCardUpdaterAPI, results:any[]=[];
  for(let i=0;i<count;i++){const c=gen(); try{await API.insertRow('能力背包',c);}catch(e){console.warn(e)}
    const s=getStats();s.总抽数+=1;s[c.稀有度+'次数' as any]++;try{await API.updateRow('抽卡统计',1,{总抽数:String(s.总抽数),N次数:String(s.N次数),R次数:String(s.R次数),SR次数:String(s.SR次数),SSR次数:String(s.SSR次数)});}catch(e){console.warn(e)}
    results.push(c);
  }
  try{await API.updateCell('主角信息表',1,'余额',String(bal-cost));}catch(e){console.warn(e)}
  const newBal=getBalance(),emoji:any={N:'⬜',R:'🟦',SR:'🟪',SSR:'🟧'};
  const rows=results.map(r=>`<div style="padding:4px 0;font-size:14px;">${emoji[r.稀有度]} [${r.稀有度}] ${r.能力名称} <span style="font-size:11px;opacity:.5;">${r.分类}</span></div>`).join('');
  const $p=$(`<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:#1a1a2e;color:#eee;padding:16px 24px;border-radius:12px;min-width:240px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.4);font-size:14px;"><div style="font-size:16px;font-weight:bold;margin-bottom:8px;display:flex;justify-content:space-between;"><span>${count===5?'🎰 五连抽':'🎰 单抽'} (-${cost.toLocaleString()}G)</span><span style="cursor:pointer;color:#666;" class="popup-close">✕</span></div>${rows}<div style="margin-top:8px;padding-top:8px;border-top:1px solid #333;color:#aaa;font-size:12px;">💰 剩余: ${newBal.toLocaleString()}G</div></div>`);
  $('body').append($p);$p.find('.popup-close').on('click',()=>$p.remove());setTimeout(()=>$p.fadeOut(300,()=>$p.remove()),5000);
}

$(()=>{appendInexistentScriptButtons([{name:'🎰 单抽 (20,000G)',visible:true},{name:'🎰 五连 (98,000G)',visible:true}]);eventOn(getButtonEvent('🎰 单抽 (20,000G)'),()=>doDraw(1));eventOn(getButtonEvent('🎰 五连 (98,000G)'),()=>doDraw(5));});
