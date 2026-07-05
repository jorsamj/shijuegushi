# 《第二人生：雨夜来电》语音重录清单

版本：v0.1  
日期：2026-07-04  
状态：当前仓库内已有 mp3 可播放，但主要来自临时 TTS，占位性质为 `placeholder / need-retake / not-final`。

前端默认不会播放这些占位人声。只有显式打开开发设置 `allowPlaceholderVoices=true` 时才允许听占位版本，用于核对节点和时长；正式体验必须使用重录后的高质量文件。

## 总原则

- 每个角色必须固定一个基础音色。
- 同一角色不同情绪只能改变语速、语调、停顿、气息和后期处理，不能换成另一个音色。
- Edge TTS / 浏览器 `speechSynthesis` 只能用于开发占位。
- 正式体验建议使用 ElevenLabs、Azure Neural TTS、MiniMax、火山引擎语音、腾讯云 / 阿里云情绪语音，或真人配音。
- 许知夏的旧手机录音感应通过同一女声音色加滤镜实现，不要更换成“鬼声”。

## 固定角色音色

| 角色 | 环境变量 | 声音方向 | 当前状态 |
|---|---|---|---|
| 旁白 | `ELEVENLABS_VOICE_NARRATOR` | 低沉、克制、悬疑档案感 | need-retake |
| 林舟 | `ELEVENLABS_VOICE_LINZHOU` | 疲惫、压抑、普通男性，逐渐惊恐 | need-retake |
| 许知晚 | `ELEVENLABS_VOICE_XUZHIWAN` | 成熟冷艳、低声、压迫感 | need-retake |
| 周屿 | `ELEVENLABS_VOICE_ZHOUYU` | 前期温和，后期低沉控制欲 | need-retake |
| 陈妍 | `ELEVENLABS_VOICE_CHENYAN` | 清醒、利落、现实支撑 | need-retake |
| 许知夏 | `ELEVENLABS_VOICE_XUZHIXIA` | 虚弱、遥远、旧录音残留感 | need-retake |

## P0 必须重录

| 文件 | 角色 | 问题 | 重录方向 |
|---|---|---|---|
| `assets/audio/voice/xuzhixia/voice_xuzhixia_ch01_005.mp3` | 许知夏 | 旧录音、电流感、恐惧停顿不足 | 虚弱、急促、轻微电流滤镜，“她不是我”压低 |
| `assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_007.mp3` | 许知晚 | 成熟冷艳感不足 | 门外低声、克制、有雨夜压迫感 |
| `assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_003.mp3` | 许知晚 | 关键压迫台词不够像表演 | 低声、慢、冷，“闭嘴”要有控制力 |
| `assets/audio/voice/zhouyu/voice_zhouyu_ch04_020.mp3` | 周屿 | 贴近威胁感不足 | 极低、慢、像知道玩家刚做了什么 |
| `assets/audio/narration/narration_ch01_001.mp3` | 旁白 | 电影档案感不足 | 低沉克制，不播音腔 |
| `assets/audio/narration/narration_ch01_003.mp3` | 旁白 | 死者来电前停顿不够 | “许知夏”前明显停顿，压低 |

## P1 重点重录

| 范围 | 角色 | 重录方向 |
|---|---|---|
| 林舟关键反应 | 林舟 | 疲惫后的突然惊惧，不英雄化 |
| 陈妍关键提醒 | 陈妍 | 清醒、利落、略快，但不机械 |
| 周屿后期威胁语音 | 周屿 | 同一音色逐渐变慢、变低、控制欲增强 |
| 许知夏旧手机录音 | 许知夏 | 同一虚弱女声加旧手机滤镜，不能鬼叫 |

## 当前背景音问题

- `assets/audio/bgm/` 和 `assets/audio/ambience/` 当前缺少正式 mp3。
- 前端已改为：缺少正式 BGM / ambience 时静默，不再使用随机白噪声冒充雨声或房间底噪。
- 后续需要替换为柔和可循环雨声、低频悬疑 BGM、极弱房间底噪和低频楼道 hum。

## 验收标准

- 同一角色从头到尾像同一个人在说话。
- 人声优先于 BGM / ambience，不能被盖住。
- 默认 `voiceMode=real`，没有真实语音时静默跳过，不强行机械朗读。
- `voiceMode=fallback` 仅用于开发测试，必须提示临时合成语音。
- 快速连续翻页时不出现两条人声叠加。
