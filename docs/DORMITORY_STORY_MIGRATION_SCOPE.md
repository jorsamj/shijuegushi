# 《宿舍规则怪谈》旧稿冲突与迁移范围

> 状态：迁移规划清单，不是运行时实现  
> 唯一剧情依据：`docs/DORMITORY_STORY_BIBLE.md`

## 1. 当前冲突结论

当前仓库中的第二故事运行时仍是旧版女生宿舍实现，与新剧情圣经存在整体性冲突。它可以作为回退材料保留，但不能继续扩写，也不能被视为新基线已经实现。

| 范围 | 当前旧实现 | 新正式基线 | 处理方式 |
| --- | --- | --- | --- |
| 主角 | 许棠 | 林峰 | 全量重写 |
| 核心同伴 | 林穗、赵晴、陈露、沈妍 | 周朝阳、谷雨、宋明 | 全量重写 |
| 宿舍类型 | 女生宿舍与 417/415/419 | 男生宿舍、十一楼、1107、三楼宿管宿舍、无名四楼 | 全量重建 |
| 核心机制 | 广播点名、人数补录、伪人手机验真 | 姓名污染、身份复制、固定人数名册、黑色头像、无名层 | 全量重写 |
| 规则 | 六条公开规则与隐藏修正 | 八条学生规则、七条宿管规则及后续污染规则 | 全量重写 |
| 章节 | 六章 | 七章 | 全量重写 |
| 线索 | 2014 火灾、周婉宁、417 名单等 | 黑色头像、短信、双规则、宿管日记、羽毛、名册、照片与账号变化 | 全量重写 |
| 结局 | 旧版八结局 | 新版八结局 | 全量重写，不能复用旧触发条件 |
| 视觉 | 女性角色、女生宿舍、旧门牌 | 男性角色、男生宿舍、十一楼/三楼/四楼空间 | 全量重制 |
| 配音 | 旧女性角色与旧制度广播 | 林峰、周朝阳、谷雨、宋明、宿管与新世界内声音 | 文本稳定后重新审计与生成 |

## 2. 必须重写的剧情与数据

### 2.1 正式剧情数据

- `assets/stories/dormitory-rollcall/story-data.js`
  - 旧人物、六章、旧规则、旧线索、旧关系、旧分支和旧八结局全部冲突；
  - 后续需建立七章、姓名污染状态、黑色头像、双宋明、双林峰和新八结局；
  - 迁移前不得局部混入新人物或新规则。

### 2.2 资产与场景映射

- `assets/stories/dormitory-rollcall/story-asset-map.js`
- `assets/stories/dormitory-rollcall/asset-manifest.js`

现有角色映射指向许棠、林穗、赵晴、陈露、沈妍、周婉宁和吴阿姨旧状态；背景与道具围绕 417/415/419、广播室、闸机和 2014 火灾。后续需原子化替换为新人物、男生宿舍、十一楼、三楼宿管宿舍、复制 1107、校长室、名册与八结局。

### 2.3 规则、线索、关系与状态

后续数据模型至少需要覆盖：

- 姓名污染的可见阶段；
- 周朝阳、谷雨、宋明与林峰之间的隐式信任/认知；
- 学生规则和宿管规则的来源、状态、歧义和污染；
- 羽毛持有、使用、转移与副作用；
- 黑色头像、联系人、班群成员、学籍、照片和存档标题变化；
- 多个宋明、两个林峰和有自我意识伪人的身份状态；
- 固定人数名册的恢复与挤出结果；
- 30 至 40 个以上选择的延迟后果；
- 新八结局的互斥与可达条件。

不得复用旧版 `basic-credible` 等内部状态作为玩家可见文本。

## 3. 必须重制的视觉资产

以下现有目录均视为旧版可回退资产，当前不删除：

- `assets/stories/dormitory-rollcall/characters/`
- `assets/stories/dormitory-rollcall/characters-v2/`
- `assets/stories/dormitory-rollcall/backgrounds/`
- `assets/stories/dormitory-rollcall/backgrounds-v2/`
- `assets/stories/dormitory-rollcall/phone-v2/`
- `assets/stories/dormitory-rollcall/clues/`
- `assets/stories/dormitory-rollcall/endings/`
- `assets/stories/dormitory-rollcall/endings-v2/`
- `assets/stories/dormitory-rollcall/covers/`
- `assets/stories/dormitory-rollcall/props-v2/`
- `assets/stories/dormitory-rollcall/effects-v2/`

后续需重新制作：

- 林峰、周朝阳、谷雨、宋明、绿色/红色马甲宿管、历任宿管；
- 两个宋明、两个林峰、被污染者、不同年份学生与人性化伪人；
- 男生宿舍、十一楼走廊、楼梯间、三楼宿管宿舍、无名四楼、复制 1107、校长室；
- 巨大月亮、窗外手印、羽毛、宿管日记、学生名册、变化合照、群聊与账号异常；
- 八个新结局的独立竖版场景；
- 新封面与故事详情图。

所有正式场景优先采用 9:16 竖版构图，并保留移动端对话安全区。

## 4. 必须重做的手机与界面

共享引擎能力可以复用，但第二故事的数据与表现需要重新设计：

- 陌生短信与处理选择；
- 被禁言班群、黑色头像和人数不变；
- 八条初始规则一次性完整阅读；
- 消息撤回、联系人缺字、用户不存在、死亡账号上线和相同账号；
- 学籍、合照、名册和存档标题污染；
- 姓名锚定的非数值化反馈；
- 两套规则的对照、标记与证据关联；
- 身份验证与延迟后果；
- 不显示英文名、内部 ID、技术枚举或调试状态；
- 普通信息不使用阻断式“我知道啦”弹窗。

## 5. 必须重做的配音与音频合同

以下内容与旧剧情绑定，后续文本稳定后再处理，当前不删除：

- `assets/stories/dormitory-rollcall/broadcast-audio-contract.js`
- `assets/stories/dormitory-rollcall/audio/voice-manifest.json`
- `assets/stories/dormitory-rollcall/audio/voice-original/`
- `assets/stories/dormitory-rollcall/audio/voice-legacy-xfyun-*/`
- 其他旧版正式或 staging 语音目录。

后续正式发声角色/来源至少包括：林峰、周朝阳、谷雨、宋明、绿色马甲宿管、红色马甲宿管、吴阿姨或历任宿管、黑色头像可听内容、电话/录音/广播等世界内声音。

旁白、动作、环境、心理叙述和系统说明继续静音。旧女性角色配音不得进入新运行时。新文本稳定前不得批量生成。

## 6. 必须更新的 QA 与文档

### 6.1 QA 脚本

`scripts/` 下所有硬编码旧人物、六章、旧规则、旧线索、旧广播或旧八结局的检查均需重写。新检查至少覆盖：

- 唯一正式故事名；
- 七章结构；
- 八条学生规则与七条宿管规则；
- 姓名污染阶段；
- 黑色头像不增加群人数；
- 双宋明与双林峰；
- 30 至 40 个以上有效选择及延迟后果；
- 八个新结局可达且条件互斥；
- 旧女性角色与旧资产不再被新运行时引用；
- 第一故事状态、存档、视觉与音频回归。

### 6.2 已过期文档

以下文档描述旧版女生宿舍或旧迁移方案，仅作历史参考，不得覆盖剧情圣经：

- `docs/DORMITORY_RULES_VISUAL_DIRECTION.md`
- `docs/DORMITORY_RULES_ASSET_INVENTORY.md`
- `docs/DORMITORY_VISUAL_ASSET_INVENTORY.md`
- `docs/DORMITORY_BROADCAST_DELIVERY_MANIFEST.md`
- `docs/DORMITORY_BROADCAST_SEQUENCE_REVIEW.md`
- `docs/VOICE_COVERAGE_AUDIT_dormitory.md`
- `docs/superpowers/specs/2026-07-15-dormitory-formal-rework-design.md`
- `docs/superpowers/plans/2026-07-15-dormitory-formal-rework.md`

这些文档后续应移动到明确的 legacy 归档或由新版本替代。当前不删除，以保留回退和审计依据。

## 7. 迁移顺序与原子边界

后续迁移应按以下顺序进行：

1. 完成七章节点、规则、选择、状态和八结局设计；
2. 通过剧情一致性与可达性审查；
3. 建立新视觉圣经、角色设定和竖版镜头清单；
4. 制作并人工验收新图片与手机状态；
5. 迁移界面、特效和共享引擎适配；
6. 文本稳定后生成新语音 staging；
7. 校验文本 hash、角色映射、音频完整性、生命周期和多故事隔离；
8. 原子化切换第二故事正式运行时；
9. 完成桌面、移动端、八结局、双故事存档与《雨夜来电》回归；
10. 人工签核完成前保持 PR #6 为 Draft。

禁止在同一正式运行时中混用旧剧情人物与新剧情人物，禁止用旧资产占位后宣称新版本完成。

## 8. 本次未执行事项

- 未修改任何正式运行时代码或数据；
- 未修改故事入口、存档或共享引擎；
- 未生成或替换图片；
- 未生成或替换语音；
- 未删除旧版可回退资产；
- 未合并 `main`；
- 未发布 GitHub Pages；
- 未将 PR #6 转为 Ready。

