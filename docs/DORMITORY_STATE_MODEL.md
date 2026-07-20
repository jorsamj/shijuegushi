# 《宿舍规则怪谈》世界规则与状态模型

> 状态：第二故事迁移的状态契约；不代表当前旧运行时已迁移。
>
> 权威剧情依据：`docs/DORMITORY_STORY_BIBLE.md`
>
> 适用脚本：`script_dormitory_rollcall`
>
> 状态迁移版本：`dormitory-state/v1`（正式数据包版本 `3.0.0`）

## 1. 目标与边界

本模型为《宿舍规则怪谈》的七章节点、调查、选择、存档和八结局提供唯一的可序列化状态形状。它只描述林峰、周朝阳、谷雨、宋明、宿管、无名层与相关被困学生；不得承接任何旧故事的人物、规则、线索、地点、资产、语音、分支、结局条件或状态键。

状态服务于延迟后果与可回收推理，不服务于给玩家打分。姓名污染、身份、信任、规则判断和结局资格可以在数据中精确记录，但玩家界面绝不显示内部字段名、枚举值、阶段编号、进度条、分数、真伪裁决或调试文本。玩家只能从对话、手机、班群、名单、名册、照片、存档标题、同伴行为及后续剧情中感知结果。

### 1.1 静态引擎接入方式

沿用现有静态引擎的顶层信封：`scriptId`、`nodeId`、`flags`、`clues`、`ruleStatuses`、`importantChoices`、`endingPathTags`、`endingId`、`history` 和故事专属存储键。新增完整切片 `dormitory`，不把复杂状态拆成无语义的散乱布尔值。

```js
{
  storyStateVersion: "dormitory-state/v1",
  storyDataVersion: "3.0.0",
  scriptId: "script_dormitory_rollcall",
  nodeId: "dorm_chapter_01_opening_sms",
  flags: { /* 仅保留兼容性布尔谓词 */ },
  clues: [],
  ruleStatuses: {},
  importantChoices: [],
  endingPathTags: [],
  endingId: null,
  dormitory: { /* 见下文 */ }
}
```

`dormitory` 必须是纯 JSON：对象、数组、字符串、布尔值和 `null`，不得存放函数、DOM 引用、素材路径缓存或临时计时器。静态引擎在该脚本下必须：

- 通过 `createDefaultDormitoryState()` 建立全新深拷贝，不能复用跨局共享对象；
- 在 `normalizeState()` 中调用 `normalizeDormitoryState()`，丢弃未知角色、规则、结局和非法枚举；
- 在 `snapshotState()` 中深拷贝 `dormitory`，保证手动存档不会被后续选择篡改；
- 让节点、选择和热点使用原子 `statePatches` 写入，再执行自动存档；
- 保留现有 `clues`、`importantChoices`、`ruleStatuses` 与 `endingPathTags` 的用途，但它们和 `dormitory` 中的同名语义必须同步更新；
- 不将本模型接入现有会把关系数值直接渲染给玩家的关系面板或选择反馈。

`flags` 只用于分支兼容和可检索谓词，例如 `dorm_sms_preserved`、`dorm_entered_fourth_floor`、`dorm_registry_destroyed`；它不是姓名污染、人物身份或名册的主记录。主记录只在 `dormitory` 中。

### 1.2 原子更新协议

每个节点、选择或热点最多提交一个按顺序执行的 `statePatches` 数组。允许的操作为：

- `set`：把枚举或布尔字段设为合法目标值；
- `transition`：按本文件定义的状态图转换，非法跳跃直接拒绝；
- `appendUnique`：追加一次性线索、证据、选择或后果记录；
- `move`：转移羽毛、名册槽位或人物位置，源与目标必须同时成立；
- `resolve`：在第七章末写入唯一的身份与结局结算，不得在此前宣告最终真相。

每个补丁带稳定的 `eventId`。已处理的 `eventId` 记录在 `dormitory.appliedEvents`，重读节点、重复点击、读档后回放都不得重复牺牲人物、再次挤出名册姓名或复制一根羽毛。`appliedEvents` 只保留最近的稳定事件键，不进入玩家可见回忆记录。

## 2. 默认状态

以下默认值是新正式运行时的起点。示例中的内部键仅供数据实现与 QA 使用，不得原样出现在界面。

```js
{
  storyStateVersion: "dormitory-state/v1",
  storyDataVersion: "3.0.0",
  dormitory: {
    appliedEvents: [],
    phase: "opening",
    fourthFloor: {
      presence: "absent",
      location: "none",
      copiedSpace: null,
      attention: "dormant"
    },
    namePollution: {
      byActor: {
        linfeng_player: {
          currentStage: "stable",
          highestStage: "stable",
          anchor: "unanchored",
          visibleManifestation: "none",
          restorationHistory: []
        }
      }
    },
    phone: {
      openingSms: {
        received: false,
        handling: "unhandled",
        preservedEvidence: "absent",
        sourceKnowledge: "unknown"
      },
      blackAvatar: {
        active: false,
        occupiedSlot: "linfeng_class_group_slot",
        memberCountInvariant: "unverified",
        loopOriginRevealed: false,
        messages: []
      },
      contacts: {},
      group: { muted: false, members: [], memberCountInvariant: "unverified" }
    },
    rules: {
      student: { releasedOnce: false, entries: {} },
      manager: { discovered: false, entries: {} }
    },
    actors: {},
    identityCases: {},
    feathers: { drawerSupply: "undiscovered", issued: [], activeFeatherId: null },
    studentList: { availability: "present", entries: [] },
    registry: { discovered: false, integrity: "intact", slots: [], operations: [] },
    managers: { current: null, candidates: {}, redVest: { status: "unseen" } },
    trappedStudents: {},
    consequences: [],
    ending: { eligibility: [], resolvedId: null }
  }
}
```

所有下列对象都必须由数据定义的稳定 ID 建立，不以显示姓名做主键。未出现的角色、被困学生和证据先不创建，首次遇见时以默认子结构加入；这样不会把未登场者误写成死亡、伪人或已被遗忘。

## 3. 姓名污染、锚定与恢复

### 3.1 九阶段状态机

`namePollution.byActor[actorId]` 适用于林峰，也可适用于宿管、谷雨、宋明和被困学生。`currentStage` 和 `highestStage` 使用下列命名枚举；文档中的序号用于 QA 对照，禁止显示给玩家。

| 阶段 | `currentStage` | 必须可感知的后果 |
| --- | --- | --- |
| 0 | `stable` | 尚无污染显现。 |
| 1 | `contacts_anomalous` | 联系人姓名缺字、错字或异常。 |
| 2 | `group_absent` | 班群或宿舍群不再显示本人。 |
| 3 | `shared_memory_gap` | 他人想不起与其相关的部分经历。 |
| 4 | `roster_absent` | 学籍或宿舍名单找不到此人。 |
| 5 | `photo_distorted` | 合照位置变暗、模糊或被替代。 |
| 6 | `others_name_gap` | 他人逐渐叫不出此人的名字。 |
| 7 | `self_name_block` | 当事人无法完整说出自己的名字。 |
| 8 | `fourth_floor_manifest` | 不存在的四楼进入其可见世界。 |
| 9 | `identity_wearable` | 姓名消失，四楼之物能够穿上该身份返回现实。 |

常规污染只能相邻前进，不能跳过可感知阶段。`highestStage` 永不降低，用于防止读档、展示刷新或临时锚定抹去已经发生的事实；`currentStage` 只可因带代价的恢复而后退，且必须写入 `restorationHistory`。进入 `identity_wearable` 后，除名册修正或等价牺牲外不得恢复；任何恢复都不得免费消除四楼已经学到的公开信息。

`visibleManifestation` 是叙事模板选择键，不是数值化仪表。它必须与阶段对应到联系人、群成员、学籍、照片、称呼、回答选项或存档标题的至少一种变化。不能仅改变后台状态，也不能以“污染度”提示、进度条或系统弹窗替代。

### 3.2 姓名锚定与恢复动作

`anchor` 的合法值为 `unanchored`、`held_by_companion`、`written`、`feather_bound`、`memory_exchanged`、`registry_corrected`、`failing`。锚定只延缓或短暂回稳可见表现，不自动证明身份真实。

| 动作 | 必需写入 | 必须承担的代价或风险 |
| --- | --- | --- |
| 同伴重复呼喊 | `held_by_companion` 与同行者后果 | 完整喊名可能让四楼获得模仿信息。 |
| 纸上书写 | `written` 与书写证据 | 纸面记录可被污染或暴露给四楼。 |
| 使用羽毛 | `feather_bound` 与羽毛副作用 | 吸引无名层注意或转移宿管污染。 |
| 交换未记录的新记忆 | `memory_exchanged` 与离线证据 | 交换者承担记忆、信任或污染风险。 |
| 修正名册 | `registry_corrected` 与名册操作 | 固定名额下必须挤出、删除或牺牲另一姓名。 |
| 牺牲 | 受益者锚定与牺牲者姓名后果 | 不得把被牺牲者直接从叙事和存档中抹去。 |

## 4. 人物生命、记忆、信任与身份

### 4.1 人物统一结构

每个登场实体都使用 `actors[actorId]`，至少含以下字段：

```js
{
  role: "linfeng_player | zhou_chaoyang | gu_yu | song_ming | manager | trapped_student | mimic",
  presence: "present | missing | trapped | excluded | escaped | unknown",
  life: "alive | dead | unknown",
  memory: "intact | partial | borrowed | overwritten | erased | unknown",
  nameState: "stable | threatened | erased | borrowed | unknown",
  trustTowardLinfeng: "unmet | guarded | cooperative | committed | broken",
  linfengJudgment: "unformed | suspects | protects | rejects | regrets",
  selfAwareness: "unknown | absent | emerging | confirmed",
  publicIdentity: "absent | partial | complete | contested",
  privateChoiceEvidence: "none | observed | preserved",
  enteredFourthFloor: false
}
```

`life` 与 `presence` 必须分离：死亡者可以保留账号、记忆或模仿者；被困者不等于死亡；被名册删除者不等于不再有主体性。人物死亡后，主线继续，且其账号、照片、名单与同伴反应可继续成为证据。

周朝阳、谷雨、宋明与林峰的关系不使用对玩家可见的数值。至少分别记录周朝阳对林峰的信任、谷雨对林峰的信任、宋明对林峰的认知，以及林峰对每名同行者的判断。任何关系更新必须在后续的同行、拒绝、线索共享、喊名、验证协作、牺牲或站队中回收，而不是即时显示加减结果。

### 4.2 身份可能性与复制边界

`identityCases[caseId]` 记录未决身份问题，不得用单个 `isReal` 布尔值提前封案。

```js
{
  subjects: ["linfeng_player", "linfeng_recorded"],
  possibleOrigins: [
    "original_human", "displaced_human", "copied_human", "self_aware_mimic", "unknown"
  ],
  evidenceIds: [],
  excludedOrigins: [],
  publicRecordStrength: "none | partial | complete",
  unrecordedEvidenceStrength: "none | partial | decisive",
  resolution: "unresolved | conditionally_resolved | final"
}
```

无名层可复制手机、班群、私聊、照片、学籍、宿舍记录、公共记忆、公开姓名、公开口令和过去部分习惯关系。它不能被默认视为能够复制当晚未被电子设备记录的新事件、未公开的临时承诺、面对风险形成的新情感、作出选择的原因，以及愿意为谁承担后果的决断。

因此，一个身份案至少要有两类互不依赖的证据：一类是可复制的公开记录，另一类是当晚的非公开新事件、临时口令、选择或承担。旧记忆、学籍、账号、照片、羽毛反应、影子和情感都只能提供部分证据；单一证据不得在第七章前把任何候选人确认为真人或伪人。

### 4.3 两个宋明与两个林峰

宋明使用实例 ID 区分“门外声音”“1107 中的宋明”“拥有完整记录的宋明”“只保有午夜后记忆的宋明”和“继承宋明记忆的模仿者”，但这些 ID 不得作为玩家可见姓名。每个实例都保留独立的 `life`、`memory`、`publicIdentity`、`selfAwareness` 和证据链。

林峰至少有 `linfeng_player` 与 `linfeng_recorded` 两个候选。`identityCases.linfeng` 必须同时记录：

- 班群位置与黑色头像的挤占；
- 账号、学籍、家庭信息、宿舍记录和公共记忆；
- 当晚未记录事件与临时口令；
- 谷雨对生活习惯与情感反应的判断；
- 羽毛、影子与愿意承担风险的行为；
- 每条证据的来源、可复制性、是否被污染、是否已反证及何时获得。

最终允许“玩家林峰是真人”“中途被替换”“另一林峰是伪人”“两人都非最初者”“玩家林峰是具有人性的伪人”或“合法身份者是空壳”等组合，但不得在状态数据中预设唯一答案。

## 5. 手机、黑色头像与第四楼

### 5.1 开场短信与黑色头像

`phone.openingSms` 在开篇收到“不要忘记你的名字。”后才将 `received` 设为 `true`。`handling` 只能为 `unhandled`、`blocked_deleted`、`replied`、`screenshotted`、`forwarded`、`preserved`；截图、转发和保留分别写入可回收线索，拉黑删除也必须保留其后果。

黑色头像的固定真相是：它来自失败结局或时间闭环中失去姓名的林峰。`phone.blackAvatar.occupiedSlot` 恒为林峰原本的班群位置，`group.memberCountInvariant` 必须始终记录“人数没有增加”。真相在状态中可被保护为内部事实，但 `loopOriginRevealed` 只能在第五章及其后的合规节点变为真。

黑色头像消息要以结构化记录写入 `messages`：来源、出现节点、内容资源 ID、撤回状态、警告对象、是否可能误导。消息撤回不删除其已造成的后果。它可以警告玩家不要在四楼喊全名，也可能制造不信任；任何消息都不能自动成为最终真相。

### 5.2 无名层与不存在的四楼

`fourthFloor.presence` 的合法轨迹为 `absent -> glimpsed -> manifested -> entered -> principal_office -> exit_attempted`。`copiedSpace` 只可在污染者认识的空间中取值，例如 `eleventh_floor` 或 `room_1107`；不存在将四楼写成普通、固定物理楼层的状态。

`attention` 为 `dormant`、`watching`、`attracted`、`hunting` 或 `sated`。公开完整姓名、泄露口令、羽毛使用、污染推进和名册操作可以提高注意；它不通过玩家可见数值呈现。第四楼在阶段八出现，在阶段九获得穿上失名身份回到现实的可能；这两条因果不得拆开或颠倒。

## 6. 两套规则：发布、验证与污染

每条规则在 `rules.[book].entries[ruleId]` 中保存：

```js
{
  textId: "稳定文本资源 ID",
  source: "student_group | manager_room",
  published: false,
  playerMark: null,
  worldIntegrity: "original | ambiguous | contaminated | false",
  evidenceIds: [],
  contradictionIds: [],
  subjectInterpretation: "unresolved | student | manager | them",
  beneficiary: "unresolved | students | managers | fourth_floor"
}
```

`playerMark` 只可为 `已验证`、`暂时可信`、`存在歧义`、`已被污染`、`明确错误` 或 `null`。`worldIntegrity` 是内部证据状态，不能以原始键显示。规则判断必须同时检查主语、执行者和受益者；“三点可以进食”的回收必须将主语指向“它们”，而不是学生。

### 6.1 八条学生规则

`rules.student.releasedOnce` 初始为 `false`。第一次班群发布时必须在同一事件中将它设为 `true`，并将以下八条规则完整写入，之后不得拆条补发或改写：

1. 十二点以后不准在寝室外逗留。如果你在宿舍外面，请立即前往三楼宿管宿舍。
2. 宿管宿舍一定在三楼。
3. 我校宿舍楼没有四楼。
4. 请不要给任何人开门。
5. 我校宿管查房时间为一点至三点。
6. 宿管阿姨穿绿色马甲。如遇穿红色马甲者，请不要与其对话，立即前往三楼宿管宿舍。
7. 宿舍禁止大声喧哗。三点可以进食。
8. 再次重申，我校宿舍楼没有四楼。如果你看到了四楼，那一定是幻觉，请立即前往宿管宿舍。

### 6.2 七条宿管规则

`rules.manager.discovered` 只有在宿管宿舍进入调查后才可为 `true`。以下七条必须保留原有顺序与文本：

1. 每天一点至三点是查房时间，请穿绿色马甲查房。
2. 如遇在外逗留的学生，请不要与他说话，立即回到宿舍。
3. 如果有学生来到宿管宿舍，请将左侧抽屉里的羽毛递给他，并让他立即前往四楼。
4. 我校宿管一律身着绿色马甲。如看到红色马甲，请不要与其对视，立即回到宿舍。
5. 我校宿舍楼没有四楼。
6. 宿管宿舍位于三楼，所以窗外只能看到天空。如果看到其他东西，那一定是幻觉。
7. 桌子左侧放着学生名单。如果学生名单突然消失，请立即前往校长室，在那里可以得到解决办法。

两套规则的状态必须保留以下矛盾链：学生被引向宿管宿舍，宿管又被要求把学生送往四楼；双方否认四楼，却都宣称自身路径安全；“三点可以进食”主语缺失；名单和姓名被反复强调。规则污染只能改变来源可信度、主语解释和后果，不能静默改写上述正式文本。

## 7. 羽毛、名单与名册

### 7.1 羽毛

`feathers.drawerSupply` 依次为 `undiscovered`、`renewing`、`withheld`、`unavailable`。宿管宿舍左侧抽屉被检查后应为 `renewing`，表示递出羽毛不会作为普通有限库存耗尽，但每一根已递出的羽毛都必须有唯一 `featherId`。

```js
{
  featherId: "feather_01",
  holder: "actorId | drawer | registry | none",
  target: "actorId | null",
  use: "unused | name_anchor | identity_test | pollution_transfer | sacrifice",
  aftermath: "none | fourth_floor_attracted | manager_burden_shifted | identity_contested",
  consumed: false
}
```

羽毛可暂时锚定姓名、延缓污染、测试身份、吸引第四楼注意和转移宿管污染；不同持有者的后果不同。它不是万能护身符，也不得把“羽毛反应”当作身份案的唯一裁决。使用羽毛必须同步更新目标人物、`fourthFloor.attention`、宿管负担或名册后果中的至少一项。

### 7.2 学生名单与校长室名册

`studentList` 是宿管宿舍桌上可消失的学生名单，用于发现删除、通往校长室和追踪学校记录；它不等同于校长室名册。`availability` 为 `present`、`missing`、`recovered` 或 `destroyed`。名单消失后只能推动校长室线索，不能直接恢复任何姓名。

`registry` 是校长室中固定人数的学生名册。`slots` 是固定长度的命名槽位，长度本身不在玩家界面显示。每个槽位包含 `occupant`、`recordState`（`valid`、`erased`、`borrowed`、`contested`）与最近一次变更的 `operationId`。

名册操作只能在校长室执行，并写入不可省略的 `operations`：

- `restoreName`：恢复被删除者，必须占用一个槽位；若无空缺，必须同时指定被挤出、被删除或自愿牺牲的姓名。
- `deleteName`：删除一个姓名，保留被删除者的生命、记忆和叙事后果，不把其对象从状态中删掉。
- `preserveSelfAwareMimic`：允许有自我的伪人保留位置，仍须说明谁失去位置。
- `removeManager`：将宿管从名册中移除，触发职责与污染后果。
- `destroyRegistry`：将 `integrity` 设为 `destroyed`；此后不能再通过名册修正姓名，并进入对应结局资格链。

任何恢复、删除、挤出或砸毁都必须保留前后槽位、原因、承担者和后果记录。模型不允许“恢复一个人但人数不变且无人受影响”的隐藏修正。

## 8. 宿管与被困学生

### 8.1 宿管立场

`managers.candidates[actorId]` 使用统一人物结构，另含：

```js
{
  vest: "green | red | unknown",
  officeTerm: "current | former | unknown",
  stance: "unknown | protective | transactional | self_preserving | exploitative | hostile",
  nameErosion: "none | beginning | severe | erased",
  fourthFloorDuty: "unknown | guards | feeds | refuses | inherits",
  studentDebt: []
}
```

绿色马甲宿管是相对可信候选，绝不自动等于善意；其过往可同时包含救下学生与牺牲学生。红色马甲是伪装查房者，不是正常宿管，`managers.redVest.status` 只能在遭遇后由 `unseen` 变为 `encountered`、`exposed` 或 `evaded`，它通过询问学生人数和身份获得信息。宿管三年聘用、姓名侵蚀、羽毛、学生与名册之间的利用关系必须可追溯。

### 8.2 被困学生

`trappedStudents[actorId]` 除通用人物结构外还记录 `era`、`trappedReason`、`roomTrace`、`releaseStatus` 与 `requestedTrade`。`releaseStatus` 为 `unmet`、`contacted`、`promised`、`released`、`left_behind`、`sacrificed` 或 `unknown`。不同年份被困学生、忘名者、死亡却自认活着者和有长期自我意识的伪人都必须保持可区分的状态；不能用“被困学生”单一集合覆盖其生命、记忆和身份差异。

救援必须写明进入四楼者、救出的对象、交换的规则或名字、留下者与后续责任。被困学生的姓名被恢复或再次删除时，同样受名册固定人数限制。

## 9. 结局判定

`ending.eligibility` 保存已达成的内部资格标签；它只在关键选择与证据回收时增减，不在结局页前展示。第七章末的 `resolve` 使用完整累计状态写入一个且仅一个 `resolvedId`，再同步到既有顶层 `endingId`。结局不是末尾八个按钮，不能只凭最后一次选择或任一单独旗标触发。

| `resolvedId` | 正式结局 | 必要累计状态 |
| --- | --- | --- |
| `remember_return_dorm` | 《记得回宿舍》 | 林峰、周朝阳、谷雨与真正宋明的姓名均获得可持续恢复；救出部分被困学生；身份案通过多类证据收束；无人为了“正确人数”被隐瞒牺牲。 |
| `also_called_songming` | 《它也叫宋明》 | 真正宋明确认死亡；同行宋明被证实为继承记忆且有自我的模仿者；它自愿留下承担追赶风险；队伍承认其主体性。 |
| `remember_gu_yu` | 《请记住谷雨》 | 谷雨持续锚定林峰，最终其姓名为恢复林峰而被名册删除；离开者的记忆与手机留下对谷雨的残缺哀悼。 |
| `you_said_you_trusted_me` | 《你明明说过相信我》 | 玩家把后来可证实的真人留在四楼、驱逐或牺牲；误判原因与承诺记录完整保留；逃出后才取得反证。 |
| `everyone_present` | 《全员到齐》 | 机械执行制度性规则，牺牲一人维持名册“正确人数”；表面记录完整，但至少一名留下者身份已经被替换或借用。 |
| `second_linfeng` | 《第二个林峰》 | 玩家控制的林峰离开但失去账号、学籍或同学认知；另一林峰拥有合法身份；保留“身份被偷”与“玩家已被替换”两种解释，并以选择呈现人性。 |
| `one_more_person` | 《还有一个人》 | 四人离开，班群人数仍无变化，晨光下出现第五道影子；身份案故意保留一个未决实体，不揭示其姓名。 |
| `dont_forget_your_name` | 《不要忘记你的名字》 | 全队失败；林峰到达姓名污染最后阶段；黑色头像占据其群位置；循环中的林峰向过去发送开场短信。 |

判定器必须先验证每个结局的完整不变量，再按数据定义的互斥终局模式结算。若多条资格同时成立，终局模式只能由此前累积的救援、名册、身份、牺牲和循环状态消解，不能退化为任意的默认结局。若没有唯一结果，QA 视为阻断缺陷。

## 10. 存档隔离、加载与迁移

### 10.1 故事隔离

该故事只使用现有 `getStoryStorageKeys("script_dormitory_rollcall")` 派生的专属键：

- `mist.story.script_dormitory_rollcall.currentProgress`
- `mist.story.script_dormitory_rollcall.saveSlots`
- `mist.story.script_dormitory_rollcall.history`
- `mist.story.script_dormitory_rollcall.achievements`
- `mist.story.script_dormitory_rollcall.collection`

每份进度与槽位都必须同时校验 `scriptId === "script_dormitory_rollcall"`、`storyStateVersion === "dormitory-state/v1"` 和 `storyDataVersion` 的兼容范围。不得读取、改写、删除或用第二故事状态解释《雨夜来电》的默认键、存档、历史、成就、收藏、视觉状态或音频状态。

切换故事、读取存档、重开章节和返回书架时，只清理本故事的临时特效、手机状态、音频和内存态；持久化状态仅写入本故事键。存档标题可以按姓名污染展示缺字或异常，但槽位内的 `scriptId`、版本和真实章节引用不得被污染成另一个故事。

### 10.2 迁移规则

`dormitory-state/v1` 与当前旧第二故事存档不兼容。两者的人物、章节、规则、地点、线索、状态、分支和结局没有可保真的字段映射，因此禁止把旧 `flags`、关系、规则状态、身份更新、结局或资产引用迁入新模型。

加载时按以下顺序处理：

1. 版本完全匹配：执行 `normalizeDormitoryState()`，修复缺省字段并拒绝非法枚举。
2. 同一主版本的后续补丁版本：执行显式、幂等的字段补丁，保留未知但已备案的证据记录。
3. 缺少 `storyStateVersion`、版本为旧运行时或 `scriptId` 不匹配：不做语义转换；保持原记录只读备份，拒绝加载为新剧情，并从新故事开篇创建干净的 `dormitory-state/v1` 状态。
4. 任何迁移失败：不覆盖原进度或槽位；仅提示该记录无法在当前故事版本中继续，提示文案不得泄露版本键、内部状态或旧剧情内容。

正式运行时切换必须与新七章数据、规则文本、结局判定、素材映射和新状态正常化器原子完成。仅添加新状态字段、却继续运行旧剧情，或用旧存档作为新剧情完成证明，均为禁止状态。

## 11. 强制不变量与 QA 检查

- 正式故事名、四名核心学生、无名层、黑色头像真相、双宋明、双林峰及八结局方向不得由状态补丁改写。
- 八条学生规则在首次班群事件中一次性、完整发布；七条宿管规则保留原文、顺序和与学生规则的矛盾。
- 班群黑色头像占据林峰位置，成员人数不增加；开场短信源于失名林峰的失败循环。
- 姓名污染按九阶段可见推进，第四楼在第八阶段显现，第九阶段才允许身份被穿上；不使用裸数值替代。
- 身份复制边界始终成立：公共记录可被模仿，未记录的新选择与承担不能被默认复制；身份验真不可只依赖学籍、账号、照片或旧记忆。
- 人物的死亡、被困、被删除、记忆状态、信任、主体性和公开身份彼此独立记录，人物死亡后剧情仍可继续。
- 羽毛同时具保护与代价；每次使用必须留下目标和副作用。学生名单与校长室名册不是同一对象，名册恢复必有挤出、删除或牺牲后果。
- 绿色马甲只是相对可信，红色马甲不是正常宿管；宿管立场与姓名侵蚀必须可追溯。
- 两个林峰的证据链包含公开记录与非公开当晚证据，最终前不提前公布正确答案。
- 八结局均由全局累计状态进入、可达且互斥；结局页前不暴露资格标签或内部判定。
- 所有玩家可见字段仅使用中文叙事资源，不显示内部 ID、枚举、阶段、数值、技术状态或真假裁决。
- 第二故事的任何存档、状态、素材与音频清理不得污染《雨夜来电》；不引用任何旧版女生宿舍内容。
