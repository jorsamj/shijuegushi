# 《第二人生：雨夜来电》上线前检查清单

## 机器检查

- `node --check script.js`
- `node --check story-data.js`
- `node --check assets/visual-assets.js`
- `node scripts/validate-story-data.mjs`
- `node scripts/check-story-flow.mjs`
- `node scripts/check-ui-flow.mjs`
- `node scripts/check-audio-coverage.mjs`
- `node scripts/check-audio-lifecycle.mjs`
- `node scripts/check-audio-semantics.mjs`
- `node scripts/check-audio-continuity.mjs`
- `node scripts/check-external-audio-assets.mjs`
- `node scripts/check-asset-library.mjs`
- `node scripts/check-visual-semantics.mjs`
- `node scripts/check-playability.mjs`
- `node scripts/check-mobile-ui.mjs`
- `node scripts/check-production-readiness.mjs`

## 人工体验

- 首页到故事详情页：首屏有产品质感，没有空白、破图、明显 Demo 文案。
- 首章体验：雨声、来电亮屏、震动、铃声、接通、断开、门铃、楼道脚步和门链节奏贴合文本。
- 第四章照片线：旧合照、背景人影、红圈标记和周屿来电打断必须一眼能看懂。
- 第五章旧手机线：旧手机启动、录音静电、语音触发记录要连续，不能像零散音效。
- 第六章推理：每题选择后能看到正确或偏差反馈，推理分和结局报告可理解。
- 音频开关：首次未解锁声音仍可玩；开启后声音正常；关闭后不再播放且剧情不卡死。
- 移动端：375px 宽度下工具栏可展开，选择可点，对白可滚动，结局页可读。
- 桌面端：主要画面、人物、对白、工具栏不互相遮挡，关键道具焦点明确。
- 控制台：无明显 JS error、资源 404、未捕获音频错误。

## 仍需人工确认

- 外部音频当前按 `demo-approved` 上线候选处理，商业最终发布前仍需完整人工试听和授权复核。
- 人物语音仍是稀疏关键 stinger/片段，不宣称完整商业级配音。
- 视觉资源已修正 P0 语义问题，但最终审美仍建议在真实设备上确认亮度、裁切和阅读舒适度。
