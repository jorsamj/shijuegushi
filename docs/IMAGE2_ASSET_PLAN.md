# 《第二人生：雨夜来电》Image2 正式视觉素材生产方案

## 1. 目标

当前素材存在临时感、粗糙感、拼接感。

本轮目标是用 image2 或同等级高质量图像生成工作流，正式重做视觉小说素材。

目标效果：

1. 人物更精美。
2. 背景更高级。
3. 光影更电影感。
4. 风格统一。
5. 素材可复用、可分层。
6. 不再像临时 demo。
7. 关键节点有视觉冲击力。
8. 人物脸部清楚，头部完整，构图专业。

---

## 2. 总体美术风格

关键词：

```text
都市悬疑视觉小说
雨夜
电影感
暗色调
冷蓝灰主色
微金色高光
湿冷空气
玻璃反光
旧案档案感
克制恐怖
高级感
半写实
视觉小说立绘
移动端友好
```

禁止项：

- 不要卡通幼稚
- 不要低多边形
- 不要廉价恐怖
- 不要血腥
- 不要粗糙拼图
- 不要过度模糊
- 不要发灰
- 不要低清
- 不要人物头部裁切
- 不要人物主体太小
- 不要过大透明边距

## 3. 分层原则

不要生成一张焊死的大整图。

所有素材必须按可复用分层生产：

```text
assets/
├─ bg/
├─ characters/
├─ props/
├─ overlays/
├─ clues/
├─ covers/
├─ endings/
├─ ui/
└─ fx/
```

## 4. 输出规格

### 4.1 人物立绘

建议：

- 格式：webp 或 png
- 高度：至少 1536px，建议 2048px
- 背景：透明或纯色便于抠图
- 主体：人物贴近画面边缘，不能有巨大透明边距
- 头部：完整
- 脸部：清晰

### 4.2 背景图

建议：

- 格式：webp
- 比例：16:9 或 4:3
- 分辨率：至少 1920x1080
- 移动端安全区：中下部预留对话框空间

### 4.3 道具 / 图标

建议：

- 格式：png 或 webp
- 背景：透明
- 轮廓：清楚
- 风格：与整体一致

### 4.4 overlays / fx

建议：

- 格式：png
- 背景：透明
- 可叠加
- 不要过度遮挡主体

## 5. 角色素材清单

### 5.1 许知晚 xuzhiwan

角色定位：

许知晚是本作最重要的女性视觉核心。

关键词：

- 成熟冷艳
- 御姐感
- 雨夜危险感
- 深色外套
- 黑丝
- 长腿
- 修长身形
- 高级
- 不低俗
- 电影感
- 克制
- 可信但不透明

通用 Prompt：

```text
urban suspense visual novel character sprite, mature elegant Chinese woman, cold and composed expression, cinematic rainy night mood, dark long coat, black stockings, long legs, slender silhouette, refined facial features, cold blue-gray lighting with subtle warm highlights, semi-realistic premium visual novel art, high detail, sharp face, clean cutout friendly background, full character visible, no cheap sexy style, no cartoon, no low poly, no blur, no bad anatomy, no overexposed skin, no vulgar pose
```

中文说明：

都市悬疑视觉小说角色立绘，成熟冷艳的中国女性，冷静克制的表情，雨夜氛围，深色长外套，黑丝，长腿，修长身形，五官精致，冷蓝灰光影，微金色高光，半写实高级视觉小说风格，脸部清晰，适合抠图，不低俗，不廉价，不幼稚，不模糊。

#### 5.1.1 `char_xuzhiwan_base.webp`

用途：

普通对话、人物面板、初始状态

Prompt：

```text
urban suspense visual novel character sprite, mature elegant Chinese woman, calm cold expression, dark long coat, black stockings, slender long legs, standing upright, restrained confidence, cinematic cold blue-gray lighting, subtle gold rim light, semi-realistic high-end visual novel style, transparent background, face sharp and clear, full upper body and legs visible, refined details, no vulgarity, no cartoon, no blur
```

#### 5.1.2 `char_xuzhiwan_wet.webp`

用途：

雨夜门外初登场、湿透状态

Prompt：

```text
urban suspense visual novel character sprite, mature cold Chinese woman standing in rainy night, wet dark hair, dark coat soaked by rain, black stockings, long legs, dangerous quiet presence, water droplets on clothes, cold corridor light, cinematic suspense lighting, semi-realistic premium game art, transparent background, face clear, head fully visible, no vulgar pose, no blur, no cheap horror
```

#### 5.1.3 `char_xuzhiwan_suspicious.webp`

用途：

身份核验、试探、怀疑主角

Prompt：

```text
mature elegant Chinese woman in urban suspense visual novel, suspicious probing expression, slightly narrowed eyes, dark coat, black stockings, restrained posture, cold rainy night lighting, cinematic shadow, refined face, semi-realistic high quality visual novel sprite, transparent background, clean silhouette, no cartoon, no blur
```

#### 5.1.4 `char_xuzhiwan_pressure.webp`

用途：

压迫感对话、提到周屿、逼近真相

Prompt：

```text
close upper body sprite of mature cold Chinese woman, urban suspense visual novel, intense restrained anger, low pressure gaze, dark wet coat, cinematic blue-gray lighting, subtle red warning glow, face sharply detailed, strong emotional presence, premium semi-realistic visual novel art, transparent background, no cropped head, no blur, no vulgarity
```

#### 5.1.5 `char_xuzhiwan_angry.webp`

用途：

愤怒但克制

Prompt：

```text
mature elegant Chinese woman, restrained anger expression, cold eyes, lips tense, urban suspense visual novel sprite, dark coat, rainy night atmosphere, cinematic lighting, semi-realistic premium art, transparent background, face clear, no exaggerated anime anger, no cartoon, no blur
```

#### 5.1.6 `char_xuzhiwan_fear.webp`

用途：

短暂惊恐、发现危险靠近

Prompt：

```text
mature cold Chinese woman showing controlled fear, eyes widened slightly, still composed, rainy night suspense mood, dark coat, black stockings, semi-realistic visual novel character sprite, cinematic cold light, face sharp, transparent background, no cheap horror, no overacting, no blur
```

#### 5.1.7 `char_xuzhiwan_horror.webp`

用途：

强恐怖节点、楼道压迫、危险靠近

Prompt：

```text
mature elegant Chinese woman in horror suspense visual novel, eerie oppressive expression, cold gaze, wet dark hair, dark coat, shadow across face, subtle red warning rim light, cinematic rainy corridor mood, semi-realistic premium game art, transparent background, face visible, head safe, no gore, no cheap ghost face, no blur
```

#### 5.1.8 `char_xuzhiwan_closeup.webp`

用途：

近景压迫、关键真相、强情绪节点

Prompt：

```text
cinematic close-up bust portrait of mature cold Chinese woman, urban suspense visual novel, intense eyes, restrained anger, wet hair details, dark coat collar, cold blue-gray light, subtle gold highlight, premium semi-realistic art, face extremely sharp, clean cutout friendly background, head fully visible, no blur, no cartoon
```

#### 5.1.9 `char_xuzhiwan_fullbody.webp`

用途：

全身登场、门外初见、人物面板

Prompt：

```text
full body sprite of mature elegant Chinese woman, urban suspense visual novel, dark long coat, black stockings, long legs, high heels, slender silhouette, rainy night mood, cold composed expression, premium cinematic semi-realistic style, transparent background, full body visible, head fully visible, balanced pose, no vulgarity, no excessive sexualization, no blur, no bad anatomy
```

### 5.2 林舟 linzhou

角色定位：

- 普通上班族
- 疲惫
- 压抑
- 被卷入旧案
- 逐渐惊恐

通用 Prompt：

```text
urban suspense visual novel male character sprite, ordinary Chinese office worker, tired face, slightly messy hair, restrained anxiety, simple shirt or dark sweater, cinematic blue-gray lighting, semi-realistic premium visual novel art, transparent background, face clear, no idol style, no cartoon, no blur
```

需要生成：

- `char_linzhou_base.webp`
- `char_linzhou_worried.webp`
- `char_linzhou_shocked.webp`
- `char_linzhou_fear.webp`
- `char_linzhou_angry.webp`

`char_linzhou_base.webp`

```text
ordinary Chinese male office worker, tired but calm, urban suspense visual novel sprite, simple dark clothes, late night fatigue, semi-realistic cinematic lighting, transparent background, face clear
```

`char_linzhou_worried.webp`

```text
ordinary Chinese male office worker, worried expression, tense eyes, urban suspense visual novel, cold rainy night lighting, semi-realistic style, transparent background
```

`char_linzhou_shocked.webp`

```text
Chinese male office worker shocked by impossible phone call, eyes widened, tense posture, cinematic suspense lighting, semi-realistic visual novel sprite, transparent background
```

`char_linzhou_fear.webp`

```text
Chinese male office worker afraid but trying to stay calm, urban suspense visual novel sprite, cold blue-gray shadows, face clear, transparent background
```

`char_linzhou_angry.webp`

```text
ordinary Chinese male office worker with restrained anger, tense jaw, eyes focused, urban suspense visual novel sprite, semi-realistic cinematic lighting, transparent background
```

### 5.3 周屿 zhouyu

角色定位：

- 表面温和
- 旧友感
- 后期控制欲
- 威胁感
- 不是一开始就像反派

通用 Prompt：

```text
urban suspense visual novel male character sprite, Chinese man with gentle old friend appearance, clean and composed, hidden controlling gaze, cinematic lighting, semi-realistic premium style, transparent background, face clear, not obvious villain at first, no cartoon, no blur
```

需要生成：

- `char_zhouyu_calm.webp`
- `char_zhouyu_pressure.webp`
- `char_zhouyu_angry.webp`
- `char_zhouyu_horror.webp`

`char_zhouyu_calm.webp`

```text
Chinese man, gentle old friend expression, clean appearance, calm smile, urban suspense visual novel sprite, cinematic lighting, transparent background
```

`char_zhouyu_pressure.webp`

```text
Chinese man with hidden threat, calm but controlling eyes, low pressure expression, urban suspense visual novel, cinematic shadow, semi-realistic premium art, transparent background
```

`char_zhouyu_angry.webp`

```text
Chinese man losing composure, restrained anger, cold gaze, urban suspense visual novel sprite, dramatic lighting, transparent background
```

`char_zhouyu_horror.webp`

```text
Chinese man with chilling threatening presence, face half in shadow, low gaze, psychological horror suspense mood, semi-realistic visual novel art, transparent background, no gore, no cheap horror
```

### 5.4 陈妍 chenyan

角色定位：

- 清醒
- 干练
- 可靠
- 现实支撑
- 不工具人

通用 Prompt：

```text
urban suspense visual novel female character sprite, Chinese woman, sharp and clear-minded, professional casual outfit, reliable expression, clean short or tied hair, semi-realistic cinematic lighting, transparent background, face clear, not cute girl style, no cartoon, no blur
```

需要生成：

- `char_chenyan_base.webp`
- `char_chenyan_serious.webp`
- `char_chenyan_shocked.webp`

`char_chenyan_base.webp`

```text
Chinese woman, calm and reliable, professional casual outfit, urban suspense visual novel sprite, semi-realistic premium style, transparent background
```

`char_chenyan_serious.webp`

```text
Chinese woman serious and focused, rational expression, urban suspense visual novel sprite, cinematic cold lighting, transparent background
```

`char_chenyan_shocked.webp`

```text
Chinese woman surprised but composed, sharp eyes, urban suspense visual novel sprite, semi-realistic cinematic lighting, transparent background
```

### 5.5 许知夏 xuzhixia

角色定位：

- 旧照片中的人
- 旧录音中的残影
- 虚弱
- 遥远
- 不做廉价鬼图
- 诡异但克制

通用 Prompt：

```text
urban suspense visual novel female memory apparition, young Chinese woman, fragile and distant, old photograph feeling, soft cold light, subtle audio recording noise atmosphere, semi-realistic premium art, transparent background, face clear, not a ghost monster, no gore, no cheap horror, no blur
```

需要生成：

- `char_xuzhixia_memory.webp`
- `char_xuzhixia_recording.webp`
- `char_xuzhixia_fear.webp`
- `char_xuzhixia_horror.webp`

`char_xuzhixia_memory.webp`

```text
young Chinese woman as old memory, soft distant expression, old photograph atmosphere, cold muted lighting, semi-realistic visual novel sprite, transparent background
```

`char_xuzhixia_recording.webp`

```text
young Chinese woman as old phone recording residue, fragile face, faint digital noise, distant frightened eyes, cinematic cold light, semi-realistic visual novel sprite, transparent background, head fully visible
```

`char_xuzhixia_fear.webp`

```text
young Chinese woman with restrained fear, fragile but not exaggerated, old recording feeling, cold blue-gray light, semi-realistic premium visual novel sprite, transparent background
```

`char_xuzhixia_horror.webp`

```text
young Chinese woman memory residue with eerie suspense atmosphere, face partially shadowed, not a ghost monster, subtle distortion, cinematic cold lighting, semi-realistic visual novel art, transparent background
```

## 6. 背景素材清单

### 6.1 `bg_rental_room_rain_night.webp`

用途：

出租屋雨夜主场景

Prompt：

```text
urban apartment room at rainy night, cinematic suspense atmosphere, computer desk, cold blue rain light through window, subtle warm desk lamp, instant noodles, coffee cup, phone on desk, realistic lived-in rental room, dark visual novel background, premium semi-realistic game art, text-safe lower area, no characters, no blur, no low quality
```

### 6.2 `bg_corridor_door.webp`

用途：

门外楼道、猫眼、许知晚登场

Prompt：

```text
old apartment corridor outside a door at rainy night, cold flickering white light, wet floor reflections, oppressive atmosphere, door peephole feeling, cinematic urban suspense visual novel background, blue-gray tone, subtle warm highlight, no characters, text-safe lower area, high detail, no blur
```

### 6.3 `bg_phone_call_ui.webp`

用途：

死者来电、手机震动、旧号码

Prompt：

```text
dark cinematic phone call scene background, modern smartphone glowing in dark room, rain reflection on screen, unknown caller atmosphere, suspense visual novel background, blue-gray lighting, subtle waveform space, no readable text, text-safe lower area, high detail, no blur
```

### 6.4 `bg_old_chat_memory.webp`

用途：

陈妍消息、周屿消息、旧聊天

Prompt：

```text
abstract old chat memory background, dark smartphone chat interface atmosphere, blurred message bubbles, blue-gray urban suspense tone, subtle digital noise, visual novel background, no readable text, no specific UI brand, text-safe lower area, high detail
```

### 6.5 `bg_rental_room_table.webp`

用途：

旧物桌面、证据整理

Prompt：

```text
dark wooden table in rainy night apartment, old cracked phone, photo box, laptop, coffee cup, scattered documents, urban suspense evidence atmosphere, cinematic blue-gray light with warm desk lamp, premium visual novel background, no characters, high detail
```

### 6.6 `bg_photo_zoom_view.webp`

用途：

最后一张合照、背景人影线索

Prompt：

```text
old group photo investigation scene, photograph on dark table, magnifying glass, red marker circle, hidden shadow figure clue in photo background, cinematic suspense evidence board mood, blue-gray and muted gold tone, visual novel background, high detail, no blur
```

### 6.7 `bg_old_phone_view.webp`

用途：

旧手机录音、云端恢复、语音备忘

Prompt：

```text
old cracked smartphone glowing in dark room, audio waveform reflection, dust, scratches, cold blue light, subtle static noise atmosphere, urban suspense visual novel background, high detail, text-safe lower area, no characters, no blur
```

### 6.8 `bg_ending_archive.webp`

用途：

结局页、档案归档、证据链

Prompt：

```text
dark archive evidence desk, case files, red strings, old photos, sealed folder, cinematic suspense ending atmosphere, blue-gray shadows with subtle gold highlights, visual novel ending background, high detail, no characters, text-safe area
```

## 7. 道具素材清单

所有道具要求：

- 透明背景
- 轮廓清晰
- 风格统一
- 适合小卡片和场景叠加
- 不要过度复杂
- 不要低清

`prop_phone_modern.png`

```text
modern smartphone prop, dark screen with cold glow, rainy reflection, premium visual novel item asset, transparent background, high detail
```

`prop_phone_old_cracked.png`

```text
old cracked smartphone prop, damaged screen, cold blue glow, dust and scratches, suspense visual novel item, transparent background, high detail
```

`prop_photo_polaroid.png`

```text
old polaroid photo prop, slightly yellowed, worn edges, mysterious group photo feeling, visual novel clue item, transparent background
```

`prop_photo_box.png`

```text
old cardboard photo box prop, worn texture, archive evidence mood, transparent background, visual novel item
```

`prop_door_chain.png`

```text
metal door chain prop, close-up, cold light reflection, suspense item, transparent background, high detail
```

`prop_laptop.png`

```text
dark laptop prop with cold screen glow, visual novel item, transparent background
```

`prop_cup.png`

```text
coffee cup prop, late night work atmosphere, subtle coffee stain, transparent background
```

`prop_noodle_bowl.png`

```text
instant noodle bowl prop, late night apartment detail, transparent background, visual novel item
```

`prop_hard_drive.png`

```text
old external hard drive prop, evidence storage atmosphere, transparent background, high detail
```

`prop_archive_folder.png`

```text
archive folder prop, case file feeling, worn paper, transparent background, high detail
```

`prop_loan_document.png`

```text
gray loan document prop, official paper but anonymized, suspense clue item, transparent background, no readable real text
```

`prop_recording_file.png`

```text
digital audio recording file icon prop, waveform, old phone record feeling, transparent background, blue-gray glow
```

## 8. Overlays / FX 清单

`overlay_rain_light.png`

```text
transparent overlay of light rain streaks, cinematic visual novel effect, subtle, no background
```

`overlay_rain_heavy.png`

```text
transparent overlay of heavy rain streaks, strong rainy night atmosphere, cinematic, no background
```

`overlay_mist_dark.png`

```text
transparent dark mist overlay, subtle fog, suspense atmosphere, no background
```

`overlay_window_reflection.png`

```text
transparent window glass reflection overlay, rainy night light streaks, cinematic, no background
```

`overlay_glass_noise.png`

```text
transparent dirty glass noise overlay, subtle scratches and dust, suspense visual novel effect
```

`overlay_peephole_mask.png`

```text
transparent peephole circular vignette mask, dark edge, apartment door view effect
```

`overlay_red_alert_glow.png`

```text
transparent red warning glow overlay, subtle psychological horror atmosphere, no background
```

`overlay_signal_noise.png`

```text
transparent digital signal noise overlay, old phone recording static, subtle, no background
```

`fx_waveform_blue.png`

```text
transparent blue audio waveform effect, old phone voice recording, cinematic glow
```

`fx_waveform_red.png`

```text
transparent red audio waveform effect, danger signal, suspense visual novel effect
```

`fx_lightning_flash.png`

```text
transparent lightning flash overlay, rainy night visual novel effect, subtle
```

`fx_red_marker_circle.png`

```text
transparent red hand-drawn marker circle, evidence clue annotation, no background
```

`fx_dirty_lens.png`

```text
transparent dirty lens overlay, dust scratches, cinematic suspense atmosphere
```

## 9. 封面素材清单

`cover_home_hero.webp`

```text
main hero cover for urban suspense interactive visual novel, rainy night phone call, mysterious woman outside door, old case file atmosphere, cinematic blue-gray tone with subtle gold highlights, premium visual novel key art, high impact, no text, high detail
```

`cover_ch01_rain_call.webp`

```text
chapter cover, rainy night phone call from dead friend, smartphone glowing, dark apartment, suspense atmosphere, cinematic visual novel art, no text
```

`cover_ch02_door.webp`

```text
chapter cover, mysterious wet woman outside apartment door, peephole perspective, cold corridor light, urban suspense visual novel key art, no text
```

`cover_ch03_crack.webp`

```text
chapter cover, three years ago old case crack, old chat records, documents, gray loan clue, dark investigation mood, cinematic visual novel art, no text
```

`cover_ch04_photo.webp`

```text
chapter cover, last group photo clue, magnifier, hidden figure in background, red marker, suspense evidence mood, cinematic visual novel art, no text
```

`cover_ch05_old_phone.webp`

```text
chapter cover, old cracked phone playing recovered voice recording, waveform, cold blue glow, dark room, suspense visual novel art, no text
```

`cover_ch06_unanswered.webp`

```text
chapter cover, unanswered call, archive files, dark phone screen, final choice atmosphere, cinematic suspense visual novel art, no text
```

## 10. 结局图清单

`ending_a_truth_restart.webp`

```text
ending art, truth reopened, evidence archive, morning light faintly entering dark room, case file opened, restrained hope, cinematic visual novel ending, no text
```

`ending_b_evidence_out_of_control.webp`

```text
ending art, evidence out of control, scattered photos and documents, phone screen glowing with forwarded files, anxious atmosphere, cinematic suspense visual novel ending, no text
```

`ending_c_deleted_evidence.webp`

```text
ending art, deleted evidence, dark phone screen, erased files, rain reflection, oppressive silence, psychological suspense ending, cinematic visual novel art, no text
```

`ending_d_unanswered.webp`

```text
ending art, unanswered call, empty dark apartment, phone vibrating alone, rain outside window, unresolved old case atmosphere, cinematic suspense visual novel ending
```

## 11. 线索图标清单

`clue_dead_call.png`

```text
clue icon, dead person's phone call, dark smartphone with blue waveform, suspense visual novel icon, transparent background
```

`clue_sister_mark.png`

```text
clue icon, identity mark of sister, fingerprint card and old photo detail, suspense clue icon, transparent background
```

`clue_gray_loan.png`

```text
clue icon, gray loan document, anonymous file paper, red mark, suspense clue icon, transparent background
```

`clue_zhou_left.png`

```text
clue icon, departure record, ticket or location pin, cold archive style, transparent background
```

`clue_photo_background.png`

```text
clue icon, photo background shadow figure, old photo with red circle, suspense clue icon, transparent background
```

`clue_timed_voice.png`

```text
clue icon, timed voice memo, old phone waveform and clock, suspense clue icon, transparent background
```

## 12. 素材接入要求

生成素材后，必须更新：

```text
assets/visual-assets.js
```

确保所有路径指向新素材。

不得出现：

- 空图
- 断图
- 外链图片
- 临时占位图
- 粗糙 CSS 假图

## 13. 验收标准

人物：

- 人物脸部清楚。
- 头部完整。
- 单人默认居中。
- 关键镜头有冲击力。
- 许知晚成熟冷艳、长腿黑丝、但不低俗。
- 许知夏有旧录音残影感。
- 周屿前后期状态有明显区别。

背景：

- 背景电影感增强。
- 雨夜氛围真实。
- 不发灰、不糊。
- 场景和剧情对应。

素材体系：

- 全部可复用。
- 全部分层。
- 所有资源路径有效。
- 不出现外链。
- `node scripts/validate-story-data.mjs` 通过。
