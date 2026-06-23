const CharacterStats = z.object({
  好感度: z.coerce.number().prefault(0).transform(v => _.clamp(v, 0, 500)),
  了解度: z.coerce.number().prefault(0).transform(v => _.clamp(v, 0, 100)),
  自我理解度: z.coerce.number().prefault(0).transform(v => _.clamp(v, 0, 100)),
  灵魂共鸣度: z.coerce.number().prefault(0).transform(v => _.clamp(v, 0, 100)),
  关系: z.string().prefault('陌生人'),
});

export const Schema = z.object({
  角色档案: z.record(z.string(), CharacterStats).prefault({}),
  世界状态: z
    .object({
      时间: z.object({
        日期: z.string().prefault('2012-04-08'),
        当前片段: z.string().prefault('上午'),
      }).prefault({}),
      地点: z.string().prefault(''),
    })
    .prefault({}),
});
