export const Schema = z.object({
  主角: z.object({
    姓名: z.string().prefault(''),
    性别: z.enum(['男', '女']).prefault('男'),
    班级: z.string().prefault(''),
    自我介绍: z.string().prefault(''),
    余额: z.coerce.number().prefault(50000),
    能力背包: z
      .record(
        z.string().describe('能力id'),
        z.object({
          名称: z.string(),
          稀有度: z.enum(['N', 'R', 'SR', 'SSR']),
          分类: z.enum(['幸运', '厄运', '物品', '事件', '角色', '无事']),
          效果描述: z.string().prefault(''),
          获得时间: z.string().prefault(''),
        }),
      )
      .prefault({}),
    抽卡统计: z.object({
      总抽数: z.coerce.number().prefault(0),
      N次数: z.coerce.number().prefault(0),
      R次数: z.coerce.number().prefault(0),
      SR次数: z.coerce.number().prefault(0),
      SSR次数: z.coerce.number().prefault(0),
    }),
  }),

  世界状态: z.object({
    时间: z.object({
      日期: z.string().prefault('2012-04-09'),
      当前片段: z.string().prefault('早晨'),
    }),
    季节: z.string().prefault('春'),
    天气: z.string().prefault('晴天'),
  }),

  角色列表: z
    .record(
      z.string().describe('角色名'),
      z.object({
        好感度: z.coerce.number().transform(v => _.clamp(v, 0, 500)).prefault(0),
      }),
    )
    .prefault({}),
}).prefault({});

export type Schema = z.output<typeof Schema>;
