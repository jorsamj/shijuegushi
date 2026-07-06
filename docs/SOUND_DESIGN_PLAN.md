# 《第二人生：雨夜来电》声音设计计划

## 当前策略

本项目不做全量旁白朗读，也不做全程人物配音。视觉小说的主体体验仍然是阅读、选择和画面调度；声音只负责增强悬疑记忆点。

声音分为三类：

1. **SFX 音效**
   - 高频使用，但必须短、轻、克制。
   - 覆盖手机震动、死者来电、消息提示、门铃、门链、门锁、湿脚步、旧手机录音、照片放大、选择确认等动作。

2. **Voice Stinger / 关键短语音**
   - 只在关键节点出现。
   - 不完整朗读普通文本。
   - 用 0.5-3 秒的短声音制造记忆点，例如“别开门，她不是我”“林舟？”“对吗？”。

3. **BGM / Ambience**
   - 低音量、电影感、克制。
   - 禁止刺耳白噪音。
   - 没有高质量真实素材时宁可静默，不使用随机噪声冒充雨声或底噪。

## 禁止规则

- 普通旁白默认不朗读。
- 普通人物台词默认不朗读。
- `speechSynthesis` 只允许开发 fallback，不作为正式体验。
- 禁止用 Edge TTS / 浏览器机械朗读冒充正式配音。
- 禁止使用刺耳白噪音模拟雨声、电流声、房间底噪。

## P0 SFX 清单

- `phone_vibrate`
- `phone_ring_dead_call`
- `message_pop_cold`
- `doorbell_rain_night`
- `knock_soft`
- `door_chain_close`
- `door_lock_turn`
- `door_open_slow`
- `footstep_corridor_wet`
- `corridor_light_flicker`
- `old_phone_start`
- `recording_static_short`
- `photo_zoom`
- `marker_circle`
- `choice_confirm_soft`

## P0 关键短语音

- `voice_xuzhixia_ch01_005`：别开门，她不是我。
- `voice_xuzhiwan_ch01_007_short`：林舟？
- `voice_xuzhiwan_ch02_003_short`：先让所有人闭嘴。
- `voice_zhouyu_ch04_020_short`：对吗？
- `voice_chenyan_ch01_009_short`：别开门。
- `voice_linzhou_ch01_004`：不可能。

## P0 Stinger 清单

- `linzhou_gasp_short`
- `linzhou_breath_tense`
- `xuzhiwan_low_breath`
- `xuzhiwan_step_wet`
- `zhouyu_low_laugh`
- `zhouyu_pressure_breath`
- `xuzhixia_static_breath`
- `xuzhixia_recording_cut`

## 前端播放规则

- 节点只有配置 `voiceAudio`、`narrationAudio` 或 `voiceStinger` 时才播放语音类声音。
- 没有配置语音字段的节点只播放 SFX / BGM / ambience，不朗读正文。
- 翻页时必须先停止上一条 voice / narration / stinger，避免重叠。
- BGM 与 ambience 缺失时只打印警告并静默。
## 2026-07-05 P0 Audio Fill Status

- P0 SFX files have been created under `assets/audio/sfx/`.
- P0 stinger files have been created under `assets/audio/stingers/`.
- P0 short voice files have been refreshed under `assets/audio/voice/`.
- These files are playable placeholder MP3 assets for integration QA.
- They are not final production audio and remain `placeholder / need-retake / not-final`.
- No new BGM or ambience loops were added in this pass. Silence is still preferred over noisy ambience.
- `scripts/validate-story-data.mjs` now fails when mapped SFX, stingers, voice, or narration files are missing.

## 2026-07-06 Procedural Sound Direction

- The demo no longer pursues full narration or full character voice acting.
- Ordinary narration and ordinary dialogue must stay silent.
- `voiceAudio` and `narrationAudio` are disabled at story-node level.
- Key emotional moments use non-verbal `voiceStinger` only.
- BGM, ambience, SFX, and stingers are generated locally by `scripts/generate-procedural-audio.mjs`.
- The generated WAV assets do not use external downloads, unknown licenses, Edge TTS, or browser speech synthesis.
- BGM and ambience should remain low-volume and restrained; silence is preferred over harsh noise.

## 2026-07-06 Coverage Expansion

- Added a second generated SFX batch for phone call end, phone screen wake, chat typing, evidence reveal, old photo pickup, photo reflection discovery, backup, delete warning, archive stamp, rain-window hit, and silence-drop pressure.
- Added a second generated stinger batch for Linzhou swallow/heartbeat, Xuzhiwan cold exhale/sleeve drip, Zhouyu phone silence/tiny smile, and Xuzhixia weak static exhale/memory fade.
- Expanded key-node coverage across Chapter 1, Chapter 3 evidence moments, Chapter 4 photo investigation, Chapter 5 old-phone playback, and Chapter 6 final evidence decisions.
- Frontend volume targets are intentionally restrained: BGM around 0.16, ambience around 0.10, SFX around 0.50, stingers around 0.58.
- Ordinary narration and ordinary character dialogue remain silent. Only explicit `sfxOnEnter`, `sfxOnChoice`, and `voiceStinger` fields play.
