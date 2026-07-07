# 《第二人生》资产与体验 QA 报告

版本：v0.1  
日期：2026-07-04  
范围：《雨夜来电》故事详情页、音频播放、关键语音资产、反馈节奏、剧情沉浸感

## A. 页面结构问题

| 类别 | 节点/页面 | 当前问题 | 是否已修 | 处理方式 | 后续建议 |
|---|---|---|---|---|---|
| 页面结构 | 故事详情页 | 顶部大图压住信息层级，手机端像章节目录/素材展示页，不够纯粹。 | 已修 | 移除故事详情页顶部 hero image，改为纯 LIFE FILE 信息卡：标题、简介、标签、核心道具、开始/继续入口。 | 后续可保留一个小型封面徽章，但不要恢复大横图。 |
| 页面结构 | 故事详情页 | 页面视觉重心过重，故事还没开始就暴露过多“展示感”。 | 已修 | 详情页只展示故事级信息，不展示章节目录和大幅场景图。 | 章节封面继续用于章节结算、存档或回顾页。 |

## B. 声音问题

| 类别 | 节点/页面 | 当前问题 | 是否已修 | 处理方式 | 后续建议 |
|---|---|---|---|---|---|
| 语音策略 | 全局音频 | 之前 `speechSynthesis` 容易成为默认体验，机械朗读破坏沉浸。 | 已修 | 默认 `voiceMode` 改为 `real`，优先播放真实 mp3；缺失真实语音时跳过机械朗读，仅 `fallback` 模式才启用合成语音。 | 正式发布前建议关闭 fallback 入口或只保留开发模式。 |
| 旁白 | `narration_ch01_001.mp3` | 当前为 Edge Neural TTS 生成，能播放真实 mp3，但情绪仍偏普通 TTS，缺少电影档案感和停顿。 | 待重生成 | 已保留映射和播放链路。 | 建议用 ElevenLabs / Azure Neural Voice / 真人配音重生成，方向：低沉、克制、旧案档案感。 |
| 旁白 | `narration_ch01_003.mp3` | 当前文本已加厚，现有音频仍对应旧文本，且“许知夏”前停顿不够强。 | 待重生成 | 剧情文本已增强，报告中标记重录。 | 按新文本重生成，重点突出死者来电的停顿和压迫。 |
| 许知夏 | `voice_xuzhixia_ch01_005.mp3` | 当前可播放真实文件，但旧录音质感、电流噪声和恐惧感仍不足；文本已加厚后需要重录。 | 待重生成 | 继续使用真实 mp3 优先链路。 | 建议 ElevenLabs / Azure 情绪语音后期加轻微 static noise，保留“旧手机录音”距离感。 |
| 许知晚 | `voice_xuzhiwan_ch01_007.mp3` | 角色区分已有，但成熟冷艳、低声压迫感不够；文本已加厚后需重录。 | 待重生成 | 节点继续绑定该音频。 | 建议更成熟低声女声，不要甜美少女音，语速偏慢。 |
| 许知晚 | `voice_xuzhiwan_ch02_003.mp3` | 关键压迫台词需要更强演绎，目前仍偏普通 TTS。 | 待重生成 | 文本已增强为三句连续压迫。 | 建议 ElevenLabs / 真人配音，重点处理“闭嘴”和重复谎言的冷怒感。 |
| 周屿 | `voice_zhouyu_ch04_020.mp3` | 当前缺少“我知道你刚刚做了什么”的贴近威胁感；文本已加厚。 | 待重生成 | 节点保留真实 mp3 链路。 | 需要低沉、慢速、近距离压迫，像电话那头的人就在楼道。 |
| 陈妍 | `voice_chenyan_ch01_009.mp3` | 清醒利落感基本成立，但仍有 TTS 直读感。 | 待优化 | 保留现状作为可用版本。 | 后续可用更自然中文情绪语音重录。 |
| 林舟 | `voice_linzhou_ch01_004.mp3` | “不可能”需要更短促、更压低，现在情绪还不够像真实惊惧。 | 待优化 | 保留现状作为可用版本。 | 建议真人或强情绪 TTS 重录，突出疲惫后的突然惊恐。 |
| 固定音色 | 全部角色语音 | 当前语音虽可播放，但仍来自临时 TTS 生产链，角色一致性和表演感不足。 | 已标记 | 新增 `docs/VOICE_RETAKE_LIST.md`，并在生成脚本中要求正式模式锁定每个角色 voice id。 | P0 优先重录旁白、许知夏、许知晚、周屿关键句。 |
| Edge TTS | 全部临时语音 | Edge TTS 不应作为正式语音验收依据。 | 已修 | 生产方案和生成脚本均标记 Edge 仅允许 `--placeholder` 开发占位。 | 正式体验走 ElevenLabs / Azure / MiniMax / 火山 / 真人配音。 |
| 占位人声 | 全部已生成 mp3 | 当前 mp3 仍然不够好听，继续播放会破坏视觉小说体验。 | 已修 | 前端默认关闭 `productionStatus=need-retake` 的占位人声，除非显式打开 `allowPlaceholderVoices`。 | 接入固定角色 voice id 后重新生成，再移除 need-retake 状态。 |

## C. 音频重叠问题

| 类别 | 节点/页面 | 当前问题 | 是否已修 | 处理方式 | 后续建议 |
|---|---|---|---|---|---|
| 音频播放 | 翻页/继续按钮 | 上一页语音未停，新节点语音开始，导致旁白和角色声重叠。 | 已修 | voice/narration 合并为唯一 `currentDialogueAudio`，`stopAllDialogueAudio()` 会中止当前 HTMLAudioElement、清空 src、取消 `speechSynthesis`。 | 后续可做 80-120ms 的短淡出，但不要牺牲响应速度。 |
| 音频播放 | 快速连续点击 | 异步音频 fallback 可能在切页后继续触发。 | 已修 | 增加 `dialogueSessionId` 与 `dialogueToken` 双重校验，旧会话的 onerror / onended / fallback 不再影响新节点。 | 继续观察真实浏览器上极端连点情况。 |
| 音频播放 | BGM / ambience | 对话语音停止时不应误杀背景雨声和 BGM。 | 已修 | `stopAllDialogueAudio()` 只停止 voice/narration/speechSynthesis；`stopAllAudio()` 才停止全部音频。 | 后续可按场景切 ambience 时做淡入淡出。 |
| 背景声音 | BGM / ambience | 之前缺少真实文件时会用 WebAudio 合成 BGM/白噪声 ambience，听感刺耳。 | 已修 | 缺少真实 BGM / ambience 时只输出 warn 并静默，不再生成随机白噪声。当前仓库没有正式 BGM/ambience mp3，因此运行时会保持静默。 | 后续补柔和循环雨声、低频悬疑 BGM 和弱楼道 hum。 |

## D. 剧情节奏问题

| 类别 | 节点/页面 | 当前问题 | 是否已修 | 处理方式 | 后续建议 |
|---|---|---|---|---|---|
| 打断频率 | 线索反馈 | 每条线索都弹大卡会打断阅读。 | 已修 | 线索仍自动入库并 toast 提示；只对 `clue_dead_call`、`clue_photo_background`、`clue_timed_voice` 弹出重点线索卡。 | 如果仍觉得打断，可把 `clue_dead_call` 也降为 toast。 |
| 打断频率 | 里程碑反馈 | 里程碑弹窗会把悬疑推进切碎。 | 已修 | 里程碑改为 toast，不再强制弹窗。 | 重大章节结尾仍保留章节结算。 |
| 剧情密度 | 第 1 章 | 死者来电和门外女人出现过快，缺少心理压迫和生活细节。 | 已修 | 加厚开场、来电、许知夏语音、许知晚登场、猫眼画面。 | 后续重录对应语音，以匹配新文本。 |
| 剧情密度 | 第 2-5 章 | 周屿压迫、许知晚指控、录音反转的戏剧张力不足。 | 已修 | 加厚 ch02_003、ch03_011、ch04_020、ch05_011。 | 后续可继续扩写动作和即时对话，但不建议增加新系统。 |
| 剧情密度 | 第 6 章 | 最终证据整理偏功能说明。 | 已修 | 加厚 ch06_001，让证据和林舟的愧疚连接起来。 | 后续可补最终推理前的门外危机音效。 |

## E. 故事沉浸重写验收

| 类别 | 节点/页面 | 当前问题 | 是否已修 | 处理方式 | 后续建议 |
|---|---|---|---|---|---|
| 开场钩子 | 第 1 章 | 死者来电的压迫感不够，容易像功能演示。 | 已修 | 加厚旧号码、手机震动、来电沉默、许知夏声音和门外呼吸细节。 | 后续按新文本重录旁白和许知夏语音。 |
| 身份疑云 | 第 2 章 | 许知晚身份判断不够纠结，周屿干扰不够自然。 | 已修 | 增强许知晚回避、私密细节、旧手机截图、周屿“关心式控制”台词。 | 可继续让许知晚在后续版本保留少量自相矛盾细节。 |
| 旧案推进 | 第 3 章 | 灰色借贷和离城信息像线索说明。 | 已修 | 改为陈妍查证、旧聊天和周屿反咬共同推进，并加入报警记录被撤回钩子。 | 后续可增加一条陈妍语音资产，强化现实支撑。 |
| 照片推理 | 第 4 章 | 玩家参与感不足，照片获得后过快进入结论。 | 已修 | 通过玻璃反光、门牌、右下角人影逐步放大检查，最后才获得正式线索。 | 若后续做交互热点，可直接绑定这三类检查。 |
| 伪灵异解释 | 第 5 章 | 旧手机机制偏技术说明。 | 已修 | 改为录屏、陈妍判断、许知夏录音和周屿异常反应共同拼出。 | 需要为旧手机录音做更强音频后期。 |
| 最终选择 | 第 6 章 | 结尾像流程结算，不够像玩家亲手选择结果。 | 已修 | 加强门外压力、证据整理和“备份/交出/删除/逃避”的现实后果。 | 后续可继续优化结局报告文案，但无需改判定框架。 |
| 打断控制 | 全局反馈 | 真相进度和反馈提示容易抢剧情。 | 已修 | 真相进度阶段提示改为静默记录；里程碑维持 toast；正式线索卡仅保留少数关键节点。 | 观察试玩反馈，如仍打断可进一步减少线索卡。 |

## 本轮结论

本轮已完成结构、播放体验和故事沉浸修复：故事详情页更纯粹，切页语音重叠已修，反馈系统不再频繁抢戏，关键剧情节点更像悬疑视觉小说文本。

音频资产仍处于“可播放真实 mp3，但演绎质量待提升”的阶段。建议下一轮不要继续扩功能，而是集中用 ElevenLabs / Azure 情绪语音 / 真人配音重生成上述关键节点。


## Sound Design Revision - Key Voices, SFX, and Silence-First Ambience

| Category | Scope | Current Issue | Status | Treatment | Next Step |
|---|---|---|---|---|---|
| Voice strategy | Ordinary narration/dialogue | Full narration and full character reading harmed pacing and sounded mechanical. | Fixed | Ordinary nodes no longer auto-read text. Only explicit voiceAudio, narrationAudio, or voiceStinger can play voice-like audio. | Keep this sparse strategy for the playable prototype. |
| Key voice | P0 story hooks | Existing MP3 files are placeholders and still need retakes. | Routed | P0 keys are mapped only for the strongest moments: dead call, first door voice, Xu Zhiwan pressure, Zhou Yu pressure, Chen Yan warning, Lin Zhou reaction. | Retake with ElevenLabs, Azure Neural TTS, strong Chinese emotional TTS, or real actors. |
| SFX | Phone, door, corridor, old phone | The game needed action feedback without full voice acting. | Fixed | Added SFX keys for phone vibration, dead call ring, doorbell, chain, wet footsteps, old phone, photo zoom, marker, soft choice confirm. | Produce short non-harsh real SFX assets. |
| Stingers | Character short sounds | Character breath and short sonic memory points were missing. | Routed | Added stingers category and P0 keys for Lin Zhou breath, Xu Zhiwan low breath, Zhou Yu low laugh/breath, Xu Zhixia static breath/cut. | Produce 0.5-3s high-quality stingers. |
| BGM and ambience | Global | White noise and synthetic ambience are unacceptable. | Fixed | Missing BGM/ambience is silent; no random white noise fallback is allowed. | Add soft cinematic loops only when they are good enough. |
## 2026-07-05 P0 Audio Asset Closure

| Category | Scope | Current State | Status | Treatment | Next Step |
|---|---|---|---|---|---|
| P0 SFX | Phone, door, corridor, old phone, photo, choice confirm | All required P0 SFX files now exist under `assets/audio/sfx/`. | Filled | Added playable MP3 files and tightened validation so missing mapped SFX fails. | Human listen test; retake anything that sounds synthetic or harsh. |
| P0 stingers | Lin Zhou, Xu Zhiwan, Zhou Yu, Xu Zhixia, Chen Yan short sounds | All required P0 stinger files now exist under `assets/audio/stingers/`. | Filled | Added short playable MP3 files and tightened validation so missing mapped stingers fail. | Retake with high-quality voice/SFX production. |
| P0 key voices | Dead call, first door voice, pressure lines, warning, reaction | Required P0 voice files exist and were refreshed as short clips. | Placeholder | Files remain `placeholder / need-retake / not-final`; they are suitable for integration QA only. | Replace with fixed-character high-quality TTS or real actor takes. |
| Validation | Audio asset completeness | Missing SFX/stinger/voice files were previously easy to miss. | Fixed | `scripts/validate-story-data.mjs` now checks mapped SFX, stingers, voice, narration, P0 required keys, external URLs, and small-file warnings. | Keep this gate before each push. |

## 2026-07-06 Procedural Audio QA

| Category | Scope | Current State | Status | Treatment | Next Step |
|---|---|---|---|---|---|
| Sound source | BGM, ambience, SFX, stingers | External free asset sourcing is paused. | Fixed | Added local procedural WAV generation with no network and no third-party audio files. | Replace only if a later licensed professional pack is curated. |
| Voice strategy | Ordinary narration/dialogue | Spoken TTS was distracting and inconsistent. | Fixed | Removed story-node `voiceAudio` and `narrationAudio` triggers; ordinary text stays silent. | Keep sparse sound design. |
| Key moments | Character emotion beats | Spoken lines are no longer used as the default. | Fixed | Converted key moments to non-verbal stingers: breath, gasp, low laugh, recording cut. | Human listen pass on mobile. |
| Background audio | BGM/ambience | Prior fallback could sound like white noise. | Fixed | Generated low-volume pads/rain/hum as WAV and mapped them in `audio-assets.js`. | Adjust gain after in-browser listening. |
| Validation | Generated audio | The repo needed a repeatable local build path. | Fixed | `node scripts/generate-procedural-audio.mjs` regenerates all current demo audio; validation checks generated files. | Run generation before major audio edits. |

## 2026-07-06 Procedural Audio Coverage Expansion QA

| Category | Scope | Current State | Status | Treatment | Next Step |
|---|---|---|---|---|---|
| BGM | rain_night_loop, horror_corridor, ending_archive | First procedural pass was usable but could feel too forward. | Adjusted | Lowered generator peak targets and reduced frontend BGM playback to 0.16. | Manual listen on headphones and phone speaker. |
| Ambience | rain, room, corridor | Must never become constant white noise. | Adjusted | Lowered noise gain, reduced high frequency content, and reduced frontend ambience playback to 0.10. | If still tiring, prefer silence. |
| SFX coverage | Key story actions | Some actions were still silent. | Expanded | Added procedural cues for call end, screen wake, evidence reveal, photo pickup, reflection find, backup, delete warning, archive stamp, rain-window hit, and silence drop. | Use `docs/AUDIO_PLAYTEST_CHECKLIST.md` for node-by-node review. |
| Stingers | Character non-verbal beats | More key pressure moments needed subtle human-like reactions. | Expanded | Added swallow, heartbeat, cold exhale, sleeve drip, phone silence, tiny smile, weak static exhale, and memory fade. | Keep them sparse and non-verbal. |
| Runtime policy | Ordinary text | Ordinary text should not be read aloud. | Protected | Validation still fails if story nodes use `voiceAudio` or `narrationAudio`. | Do not reintroduce full narration. |
| Validation | Second audio batch | New generated assets need automated coverage. | Fixed | Validation now checks second-batch SFX/stinger files and audio mappings. | Run validation before every audio push. |

## 2026-07-06 Full Playability QA Addendum

This pass moves into story-flow, ending-path, and save/load QA. The audio system remains frozen: no TTS was restored, no generated audio mappings were removed, and ordinary narration/dialogue should remain silent unless a specific SFX or stinger is configured. The story detail page remains a clean LIFE FILE view and should not regain a large hero image, chapter list, or marketing-page layout.

## Reusable Asset Library

This pass establishes a reusable asset library layer without moving the existing runtime files. The current audio, background, and prop assets are indexed in `assets/asset-manifest.js`; Rain Call story keys are mapped to library IDs in `assets/stories/rain-call/story-asset-map.js`.

Audio assets such as rain loops, phone vibration, dark phone ring, wooden knock, old corridor hum, evidence reveal, and archive stamp are marked reusable. Backgrounds for rainy rental rooms, old apartment corridors, phone-call UI, photo inspection, old-phone closeup, and archive endings are also marked reusable. Named character portraits remain story-specific and should not be reused as other characters in future stories.

Future stories should first check `docs/REUSABLE_ASSET_INDEX.md` before generating new media. Manual QA is still required before any demo asset is promoted to `final-candidate`.

## 2026-07-07 Rain Call First Story Polish

New story expansion, story scaffolds, and second-story work are paused. This pass keeps the reusable asset library in place but focuses QA on the first playable story: `第二人生：雨夜来电`.

Audio asset direction was tightened again:

- Procedural sounds must support realistic suspense, not pixel-game or small-game UI feeling.
- Knock, doorbell, phone vibration, dead-call ring, rain, evidence reveal, photo inspection, archive stamp, and choice confirm were retuned toward lower, more physical, less melodic cues.
- Ordinary narration and ordinary character dialogue remain silent.
- Generated audio still requires manual listening before any `demo-usable` cue can become a `final-candidate`.

Manual QA should confirm the first chapter phone/door sequence, Chapter 4 photo sequence, Chapter 5 old-phone sequence, and Chapter 6 ending archive do not sound like Mario-like reward cues, coin sounds, chiptune, arcade prompts, or victory jingles.

## External Audio Integration Readiness

External audio is not yet committed because the current environment could not reliably download allowed assets from Pixabay/Freesound with traceable metadata. The project now includes:

- `assets/external-audio-manifest.js`
- `docs/EXTERNAL_AUDIO_CANDIDATES.md`
- `docs/AUDIO_CREDITS.md`
- `scripts/check-external-audio-assets.mjs`

All external audio must keep generated fallback paths. No external file may be used without source URL, author, license, commercial-use status, and attribution rules.
