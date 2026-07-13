# 剧情配音交付说明

## 宿舍规则怪谈：熄灯后，请勿点名

- 提供商：科大讯飞超拟人语音合成 WebAPI。
- 母版目录：`assets/stories/dormitory-rollcall/audio/voice-original/`。
- 运行时目录映射：`assets/voice-runtime-manifest.js`。
- 格式：24 kHz、单声道、16-bit PCM WAV；未添加背景音乐。
- 覆盖：46 个正式剧情节点、4 个结局正文、14 个独立制度广播段。
- 选角：9 个故事角色均使用不同的已授权 VCN，详见 `assets/voice-casting-manifest.js`。
- 缓存：文件的文本 hash 与选角参数 hash 写入 `voice-manifest.json`；相同输入不会重新请求。
- 发布状态：`awaiting-listening-signoff`。自动生成不等同于人工试听通过。

本作品的部分角色与广播语音由人工智能语音技术合成，不宣称为真人录音。公开或商业分发前，账号持有人必须确认所用套餐、发音人及生成音频的分发权限。

## 人工签核仍需完成

1. 耳机、桌面外放、手机外放试听全部广播与关键角色语音。
2. 双故事往返存档、读取与重开实测。
3. 第二故事移动端六章与四结局通关。
4. 第一故事完整人工回归和浏览器控制台检查。
