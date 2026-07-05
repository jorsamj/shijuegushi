# 《第二人生：雨夜来电》正式语音生产方案

## 1. 目标

本项目不再使用浏览器机械朗读作为正式语音体验。

正式目标是：

1. 旁白、林舟、许知晚、周屿、陈妍、许知夏分别拥有不同声音。
2. 每个角色根据剧情阶段呈现不同语气、语速、停顿和情绪。
3. 关键节点使用真实语音文件，不依赖 `speechSynthesis`。
4. `speechSynthesis` 仅作为开发 fallback，不作为正式体验。
5. 所有语音文件统一放入 `assets/audio/` 目录，并由 `assets/audio/audio-assets.js` 映射。

---

## 2. 目录结构

```text
assets/
└─ audio/
   ├─ bgm/
   │  ├─ bgm_rain_night_loop.mp3
   │  ├─ bgm_horror_corridor.mp3
   │  └─ bgm_ending_archive.mp3
   ├─ ambience/
   │  ├─ amb_rain_heavy_loop.mp3
   │  ├─ amb_room_night_loop.mp3
   │  └─ amb_corridor_hum.mp3
   ├─ sfx/
   │  ├─ sfx_phone_ring.mp3
   │  ├─ sfx_message_pop.mp3
   │  ├─ sfx_door_chain.mp3
   │  ├─ sfx_rain_hit_window.mp3
   │  ├─ sfx_recording_play.mp3
   │  ├─ sfx_static_noise.mp3
   │  └─ sfx_choice_confirm.mp3
   ├─ narration/
   │  ├─ narration_ch01_001.mp3
   │  ├─ narration_ch01_003.mp3
   │  ├─ narration_ch01_008.mp3
   │  └─ narration_ch01_020.mp3
   └─ voice/
      ├─ linzhou/
      ├─ xuzhiwan/
      ├─ zhouyu/
      ├─ chenyan/
      └─ xuzhixia/
```

## 3. `voiceMode` 规则

前端默认：

```js
voiceMode: "real"
```

语音播放优先级：

真实 mp3 / wav 文件 > fallback 合成语音 > 静默跳过

正式模式要求：

- `voiceMode === "real"` 时，只播放真实语音。
- 真实语音不存在时，不使用机械朗读。
- `voiceMode === "fallback"` 时，才允许使用 `speechSynthesis` 临时朗读。
- `speechSynthesis` 必须提示“当前为临时合成语音”。
- 真实语音缺失不能导致页面报错。

## 4. 推荐语音生成方案

优先使用支持情绪、语气、语速、音色控制的专业 TTS 服务。

推荐方案：

- ElevenLabs
- Azure Neural TTS
- MiniMax 语音
- 火山引擎语音
- 腾讯云 / 阿里云情绪语音
- 真人配音
- 其他支持 voice style / emotion / speed / pitch 的 TTS 服务

必须支持：

- 多角色音色
- 情绪控制
- 语速控制
- 音高控制
- 批量生成
- 输出 mp3 或 wav
- API 自动调用

Edge TTS / 浏览器 `speechSynthesis` 只能用于开发占位，不得作为正式体验验收依据。使用 Edge TTS 生成的文件必须在报告或重录清单中标记为 `placeholder`、`need-retake`、`not-final`。

## 4.1 固定角色音色规则

每个角色必须绑定一个固定 voice id / voice name：

| 角色 | 环境变量 | 规则 |
|---|---|---|
| 旁白 | `ELEVENLABS_VOICE_NARRATOR` | 固定低沉克制旁白音色 |
| 林舟 | `ELEVENLABS_VOICE_LINZHOU` | 固定疲惫、压抑男性音色 |
| 许知晚 | `ELEVENLABS_VOICE_XUZHIWAN` | 固定成熟冷艳、低声女性音色 |
| 周屿 | `ELEVENLABS_VOICE_ZHOUYU` | 固定温和转压迫男性音色 |
| 陈妍 | `ELEVENLABS_VOICE_CHENYAN` | 固定清醒利落女性音色 |
| 许知夏 | `ELEVENLABS_VOICE_XUZHIXIA` | 固定虚弱、旧录音感女性音色 |

要求：

- 同一角色所有语音文件必须使用同一个基础音色。
- 不允许用旁白音色代替人物音色。
- 不允许为了表现情绪更换另一个角色音色。
- 情绪变化只能通过 `voiceDirection`、style、speed、pitch、pause、后期滤镜控制。
- `VOICE_STRICT_CHARACTER_LOCK=true` 时，缺少某角色 voice id 不允许正式生成该角色语音。
- `dry-run` 必须输出角色、voice id、情绪方向、输出文件和是否正式音频。

## 5. 环境变量建议

新增 `.env.example`：

```env
VOICE_PROVIDER=azure

# Azure
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_NARRATOR=
ELEVENLABS_VOICE_LINZHOU=
ELEVENLABS_VOICE_XUZHIWAN=
ELEVENLABS_VOICE_ZHOUYU=
ELEVENLABS_VOICE_CHENYAN=
ELEVENLABS_VOICE_XUZHIXIA=
```

## 6. 角色声音设定

### 6.1 旁白 narrator

```js
{
  id: "narrator",
  name: "旁白",
  gender: "neutral-male",
  tone: "低沉、克制、电影感、悬疑纪录片感",
  speed: "slow",
  pitch: "low",
  emotion: "calm_suspense",
  direction: "像在翻阅一份旧案档案，语气克制，有压迫感，不要播音腔，不要机械。"
}
```

声音要求：

- 低沉
- 克制
- 有档案感
- 有旧案悬疑感
- 不要新闻播报腔
- 不要夸张恐怖讲故事腔

### 6.2 林舟 linzhou

```js
{
  id: "linzhou",
  name: "林舟",
  gender: "male",
  tone: "疲惫、压抑、普通上班族、逐渐惊恐",
  speed: "normal",
  pitch: "medium-low",
  emotion: "tired_to_fear",
  direction: "像一个普通人被卷入旧案，前期疲惫克制，后期越来越紧张。"
}
```

声音要求：

- 普通男性
- 有疲惫感
- 不英雄化
- 不偶像剧男主腔
- 前期压抑，后期惊恐

### 6.3 许知晚 xuzhiwan

```js
{
  id: "xuzhiwan",
  name: "许知晚",
  gender: "female",
  tone: "成熟冷艳、低声、克制、带压迫感",
  speed: "slow-normal",
  pitch: "medium-low female",
  emotion: "cold_tense",
  direction: "声音成熟、冷艳、压得住场，不甜美，不幼态，不机械。"
}
```

声音要求：

- 成熟冷艳
- 低声
- 带压迫感
- 有雨夜危险感
- 不甜妹音
- 不幼态
- 不浮夸

### 6.4 周屿 zhouyu

```js
{
  id: "zhouyu",
  name: "周屿",
  gender: "male",
  tone: "表面温和、后期低沉、控制欲、威胁感",
  speed: "normal-slow",
  pitch: "low",
  emotion: "gentle_to_threat",
  direction: "前期像温和旧友，后期声音变低、变慢，带控制欲和威胁感。"
}
```

声音要求：

- 前期温和
- 不一上来像反派
- 后期压迫感增强
- 语速变慢
- 尾音更冷
- 控制欲明显

### 6.5 陈妍 chenyan

```js
{
  id: "chenyan",
  name: "陈妍",
  gender: "female",
  tone: "清醒、干练、利落、可靠",
  speed: "normal-fast",
  pitch: "medium",
  emotion: "calm_reasonable",
  direction: "像能把主角拉回现实的人，语气清醒、利落、可靠。"
}
```

声音要求：

- 清醒
- 利落
- 现实感
- 节奏略快
- 不温吞
- 不甜腻

### 6.6 许知夏 xuzhixia

```js
{
  id: "xuzhixia",
  name: "许知夏",
  gender: "female",
  tone: "虚弱、遥远、旧录音残留感",
  speed: "slow",
  pitch: "soft-medium",
  emotion: "fear_memory",
  direction: "像从旧手机录音里传来，虚弱、遥远、带轻微电流噪声，有害怕但克制。"
}
```

声音要求：

- 虚弱
- 遥远
- 带旧录音感
- 带轻微电流底噪
- 不像鬼叫
- 不廉价恐怖

## 7. 第一批必须生成的语音文件

### 7.1 旁白 narrator

#### `narration_ch01_001.mp3`

路径：

```text
assets/audio/narration/narration_ch01_001.mp3
```

文本：

```text
暴雨把窗户拍得发白。林舟盯着电脑里还没写完的周报，泡面汤已经凉透，杯沿留着半圈咖啡渍。
```

要求：

- 低沉
- 克制
- 像旧案档案开场
- 语速偏慢
- 不要播音腔

#### `narration_ch01_003.mp3`

路径：

```text
assets/audio/narration/narration_ch01_003.mp3
```

文本：

```text
手机突然震动。来电显示跳出来的名字，让林舟的手停在键盘上。许知夏。
```

要求：

- 前半句平稳
- “许知夏”前明显停顿
- “许知夏”压低
- 悬疑感增强

#### `narration_ch01_008.mp3`

路径：

```text
assets/audio/narration/narration_ch01_008.mp3
```

文本：

```text
猫眼外站着一个浑身湿透的女人。她抬头时，林舟差点后退。那张脸和许知夏太像了。
```

要求：

- 低声
- 画面感强
- “她抬头时”停顿
- “太像了”带冷意

#### `narration_ch01_020.mp3`

路径：

```text
assets/audio/narration/narration_ch01_020.mp3
```

文本：

```text
门外的许知晚听见这个名字，忽然安静了。楼道灯闪了一下，把猫眼里的她切成一张潮湿的旧照片。
```

要求：

- 语速慢
- 气氛压低
- “忽然安静了”停顿
- 最后一句有旧照片感

### 7.2 林舟 linzhou

#### `voice_linzhou_ch01_002.mp3`

路径：

```text
assets/audio/voice/linzhou/voice_linzhou_ch01_002.mp3
```

文本：

```text
再改一版……就睡。
```

要求：

- 疲惫
- 普通上班族
- 声音低
- 像熬夜加班后的自言自语

#### `voice_linzhou_ch01_004.mp3`

路径：

```text
assets/audio/voice/linzhou/voice_linzhou_ch01_004.mp3
```

文本：

```text
不可能。
```

要求：

- 短促
- 震惊
- 压低
- 像看到不该出现的名字

#### `voice_linzhou_ch01_019.mp3`

路径：

```text
assets/audio/voice/linzhou/voice_linzhou_ch01_019.mp3
```

文本：

```text
周屿怎么会知道门外有人？
```

要求：

- 疑惑
- 紧张
- 语速略快
- 最后带恐惧

#### `voice_linzhou_ch02_002.mp3`

路径：

```text
assets/audio/voice/linzhou/voice_linzhou_ch02_002.mp3
```

文本：

```text
你怎么知道？
```

要求：

- 压低声音
- 带防备
- 问句不要太大声

### 7.3 许知夏 xuzhixia

#### `voice_xuzhixia_ch01_005.mp3`

路径：

```text
assets/audio/voice/xuzhixia/voice_xuzhixia_ch01_005.mp3
```

文本：

```text
别开门，她不是我。
```

要求：

- 旧手机里传来的女声
- 虚弱
- 急促
- 带电流底噪
- “别开门”急
- “她不是我”明显压低
- 不要鬼叫

#### `voice_xuzhixia_ch05_005.mp3`

路径：

```text
assets/audio/voice/xuzhixia/voice_xuzhixia_ch05_005.mp3
```

文本：

```text
如果这段被恢复，说明我没来得及见到林舟。
```

要求：

- 旧录音感
- 克制
- 疲惫
- 像提前留下的备忘
- 不要哭腔过重

#### `voice_xuzhixia_ch05_011.mp3`

路径：

```text
assets/audio/voice/xuzhixia/voice_xuzhixia_ch05_011.mp3
```

文本：

```text
周屿他……如果我出事，不要相信他说那晚不在。照片——
```

要求：

- 压着恐惧
- “周屿他”后停顿
- 后半句急促
- “照片——”突然中断
- 带轻微电流噪声

#### `voice_xuzhixia_ch05_015.mp3`

路径：

```text
assets/audio/voice/xuzhixia/voice_xuzhixia_ch05_015.mp3
```

文本：

```text
如果来得及，把那张合照留下来。
```

要求：

- 很轻
- 像留给未来的一句话
- 带遗憾
- 不要太恐怖

### 7.4 许知晚 xuzhiwan

#### `voice_xuzhiwan_ch01_007.mp3`

路径：

```text
assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_007.mp3
```

文本：

```text
林舟？我是许知晚。许知夏的妹妹。雨太大了，你先别怕。
```

要求：

- 门外低声
- 成熟冷艳
- 带试探
- 不甜美
- 雨夜压迫感
- “你先别怕”不是安慰，而是克制的控制感

#### `voice_xuzhiwan_ch01_011.mp3`

路径：

```text
assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_011.mp3
```

文本：

```text
她怕黑。不是夜灯那种黑，是楼梯间突然停电的黑。
```

要求：

- 低声
- 回忆感
- 情绪克制
- “楼梯间突然停电的黑”压低

#### `voice_xuzhiwan_ch01_016.mp3`

路径：

```text
assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_016.mp3
```

文本：

```text
你可以报警。但在他们来之前，你先看一眼我发给你的东西。别让周屿知道。
```

要求：

- 冷静
- 语速偏慢
- “别让周屿知道”明显压低
- 带危险提示

#### `voice_xuzhiwan_ch02_001.mp3`

路径：

```text
assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_001.mp3
```

文本：

```text
他给你发消息了，对不对？
```

要求：

- 低声
- 试探
- 已经知道答案的感觉
- 不要疑问过度

#### `voice_xuzhiwan_ch02_003.mp3`

路径：

```text
assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_003.mp3
```

文本：

```text
因为三年前，他也是这样先让所有人闭嘴。
```

要求：

- 冷
- 慢
- 压抑怒意
- “闭嘴”两个字有明显压迫感
- 不要喊

#### `voice_xuzhiwan_ch02_005.mp3`

路径：

```text
assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_005.mp3
```

文本：

```text
她高三那年离家出走，躲在图书馆天台。
```

要求：

- 回忆
- 克制
- 有难过但不哭
- 语气稳定

#### `voice_xuzhiwan_ch02_008.mp3`

路径：

```text
assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_008.mp3
```

文本：

```text
我可以给你看旧手机照片，但你不能转给周屿。
```

要求：

- 冷静
- 警惕
- “不能转给周屿”加重

### 7.5 周屿 zhouyu

#### `voice_zhouyu_ch02_015.mp3`

路径：

```text
assets/audio/voice/zhouyu/voice_zhouyu_ch02_015.mp3
```

文本：

```text
我只是担心你。你以前就容易心软，知夏出事那晚也是。
```

要求：

- 前半句温和
- 后半句带刺
- 表面关心，实际试探
- 语速正常偏慢

#### `voice_zhouyu_ch03_011.mp3`

路径：

```text
assets/audio/voice/zhouyu/voice_zhouyu_ch03_011.mp3
```

文本：

```text
知夏那时候压力很大，你现在翻这些，只会让所有人更难堪。
```

要求：

- 温和控制
- 像替别人做决定
- “更难堪”压低

#### `voice_zhouyu_ch03_018.mp3`

路径：

```text
assets/audio/voice/zhouyu/voice_zhouyu_ch03_018.mp3
```

文本：

```text
我离开是因为受不了。林舟，不是每个人都能像你一样假装三年没事。
```

要求：

- 辩解
- 反咬
- 后半句带攻击
- “假装三年没事”压低

#### `voice_zhouyu_ch04_018.mp3`

路径：

```text
assets/audio/voice/zhouyu/voice_zhouyu_ch04_018.mp3
```

文本：

```text
你没找到就好。我的意思是，别再翻那些东西了。它们只会害你。
```

要求：

- 第一句像松口气
- 发现说漏嘴后转冷
- 后半句威胁感出现

#### `voice_zhouyu_ch04_020.mp3`

路径：

```text
assets/audio/voice/zhouyu/voice_zhouyu_ch04_020.mp3
```

文本：

```text
林舟，你刚刚找到那张合照，对吗？
```

要求：

- 贴近感
- 低沉
- 像知道玩家刚做了什么
- “对吗”前停顿

#### `voice_zhouyu_ch05_007.mp3`

路径：

```text
assets/audio/voice/zhouyu/voice_zhouyu_ch05_007.mp3
```

文本：

```text
旧手机？她妹妹连这个都告诉你了？林舟，你知道她这些年怎么查你的吗？
```

要求：

- 先惊讶
- 后转为诱导怀疑
- 有挑拨感

#### `voice_zhouyu_ch05_016.mp3`

路径：

```text
assets/audio/voice/zhouyu/voice_zhouyu_ch05_016.mp3
```

文本：

```text
林舟，你听到录音了？
```

要求：

- 极近
- 低沉
- 像贴着耳边问
- 最后微停顿

#### `voice_zhouyu_ch05_018.mp3`

路径：

```text
assets/audio/voice/zhouyu/voice_zhouyu_ch05_018.mp3
```

文本：

```text
损坏就别修了。知夏已经死了，别再让她把活人也拖下去。
```

要求：

- 冷
- 残酷
- 推卸责任
- 不喊
- 越低越有压迫感

#### `voice_zhouyu_ch05_019.mp3`

路径：

```text
assets/audio/voice/zhouyu/voice_zhouyu_ch05_019.mp3
```

文本：

```text
你以为你在救她？你当年要是接她电话，她也许根本不会死。
```

要求：

- 愧疚攻击
- 强控制
- 贴近压迫
- “她也许根本不会死”压低

### 7.6 陈妍 chenyan

#### `voice_chenyan_ch01_009.mp3`

路径：

```text
assets/audio/voice/chenyan/voice_chenyan_ch01_009.mp3
```

文本：

```text
你最好别开门。还有，把门链扣上。
```

要求：

- 干练
- 直接
- 稍快
- 现实支撑感

#### `voice_chenyan_ch02_007.mp3`

路径：

```text
assets/audio/voice/chenyan/voice_chenyan_ch02_007.mp3
```

文本：

```text
截图收到了。周屿？你大学那个老好人？他为什么半夜盯着你家门口？
```

要求：

- 前半句清醒
- “周屿？”有疑惑
- 后半句明显警觉

#### `voice_chenyan_ch03_004.mp3`

路径：

```text
assets/audio/voice/chenyan/voice_chenyan_ch03_004.mp3
```

文本：

```text
我查到一点东西，但你最好坐下听。
```

要求：

- 利落
- 有不妙感
- “最好坐下听”放慢

#### `voice_chenyan_ch04_006.mp3`

路径：

```text
assets/audio/voice/chenyan/voice_chenyan_ch04_006.mp3
```

文本：

```text
别只盯着人脸，看背景。照片里最不会撒谎的是背景。
```

要求：

- 清醒
- 理性
- 像在引导主角推理
- 语速正常

## 8. BGM / SFX / Ambience 要求

### 8.1 BGM

#### `bgm_rain_night_loop.mp3`

要求：

- 雨夜
- 低频氛围
- 慢
- 克制
- 不要旋律过强

#### `bgm_horror_corridor.mp3`

要求：

- 楼道压迫
- 冷
- 低频
- 间歇性不安音色
- 不要廉价惊吓音

#### `bgm_ending_archive.mp3`

要求：

- 档案归档感
- 有结局仪式感
- 不要太燃
- 留白

### 8.2 环境音

#### `amb_rain_heavy_loop.mp3`

- 暴雨
- 窗户雨声
- 可循环
- 不刺耳

#### `amb_room_night_loop.mp3`

- 夜晚出租屋底噪
- 轻微电流
- 远处雨声

#### `amb_corridor_hum.mp3`

- 楼道灯嗡鸣
- 空旷
- 微弱压迫感

### 8.3 SFX

#### `sfx_phone_ring.mp3`

- 手机突然来电
- 短促
- 不要普通轻快铃声
- 要有冷感

#### `sfx_message_pop.mp3`

- 消息提示
- 短
- 有一点刺耳

#### `sfx_door_chain.mp3`

- 门链摩擦
- 金属感
- 贴近

#### `sfx_rain_hit_window.mp3`

- 雨打窗
- 可短音效

#### `sfx_recording_play.mp3`

- 旧录音开始
- 点击/磁带/电流感

#### `sfx_static_noise.mp3`

- 电流噪声
- 短
- 不刺耳

#### `sfx_choice_confirm.mp3`

- 选择确认
- 低调
- 不游戏化过重

## 9. 生成脚本要求

新增：

```text
scripts/generate-voice-assets.mjs
```

功能：

- 读取 `story-data.js`
- 读取 `assets/audio/audio-assets.js`
- 读取 `assets/audio/voice/VOICE_TODO.md`
- 根据 `voiceProfile` / `voiceDirection` / `voiceEmotion` 生成语音
- 输出到对应目录
- 更新 `audio-assets.js` 映射
- 支持 dry-run
- 支持 provider 参数
- 支持 API key 通过环境变量读取

命令示例：

```bash
node scripts/generate-voice-assets.mjs --provider azure --dry-run
node scripts/generate-voice-assets.mjs --provider elevenlabs
```

## 10. 验收标准

- 默认不再机械朗读。
- 真实语音文件优先播放。
- 旁白和每个角色的声音明显不同。
- 关键节点具备剧情化语调。
- 许知夏声音有旧录音感。
- 周屿后期声音有威胁感。
- 许知晚声音成熟冷艳。
- 陈妍声音清醒利落。
- 缺失语音不会报错卡死。
- `node scripts/validate-story-data.mjs` 通过。
