# Audio Playtest Checklist

Status values are intentionally set to "pending manual listen". The project now uses procedural BGM, ambience, SFX, and non-verbal stingers only. Ordinary narration and ordinary dialogue must stay silent.

Global style rule: every listed sound must support urban suspense. It must not sound like a game, Super Mario, pixel game, arcade cue, coin sound, victory jingle, or cute UI beep. The Chinese QA shorthand is: 不能像游戏、不能像超级马里奥、要像真实敲门、手机铃声要像真实来电、阴森背景音乐要低频克制、下雨声要柔和。

| Node | Expected sound | Must not happen | Style status |
|---|---|---|---|
| ch01_001 | Low rain-night BGM, quiet room ambience, soft rain on window | No narration reading, no harsh white noise; 阴森背景音乐不能像游戏 BGM | pending manual listen |
| ch01_003 | Phone screen wake, table vibration, dead-call ring, rain ambience | Phone call must not sound like a game ring, Super Mario, pixel game, or cheerful coin cue; 手机铃声要偏真实来电 | pending manual listen |
| ch01_004 | Sudden silence drop and Linzhou short gasp | Shock cue must not sound like a game failure sound | pending manual listen |
| ch01_005 | Short recording static and weak old-recording breath | Old recording must not sound like white-noise static | pending manual listen |
| ch01_006 | Phone call ends; choices use soft confirm | No long audio tail overlap; choice confirm must stay very soft | pending manual listen |
| ch01_007 | Doorbell, wet corridor step, Xuzhiwan low breath | Doorbell must not sound like a game prompt, arcade cue, or Mario-like item cue | pending manual listen |
| ch01_008 | Door chain and corridor light flicker | Door chain must not sound like a coin or bright metal reward; 真实敲门/门链要有物理感 | pending manual listen |
| ch01_009 | Cold message pop | Notification must not copy phone-system defaults or game buttons | pending manual listen |
| ch01_018 | Cold message pop and Zhouyu phone-silence pressure | No full Zhouyu line reading; silence should feel close and tense | pending manual listen |
| ch01_020 | Corridor light flicker and Xuzhiwan cold exhale | No jump-scare sting | pending manual listen |
| ch02_003 | Corridor flicker and Xuzhiwan low breath | No full pressure line reading | pending manual listen |
| ch03_010 | Evidence reveal for gray-loan clue | Evidence reveal must not sound like a reward fanfare | pending manual listen |
| ch03_017 | Evidence reveal for Zhouyu leaving timeline | No bright success chime | pending manual listen |
| ch03_018 | Cold message pop and Zhouyu tiny smile | No exaggerated monster or villain laugh | pending manual listen |
| ch04_006 | Old photo pickup | No exaggerated paper tear | pending manual listen |
| ch04_010 | Photo zoom and soft choice confirm | Photo zoom must not sound like a UI game button or reward cue | pending manual listen |
| ch04_011 | Photo reflection find | No sharp glass sound; should be restrained discovery | pending manual listen |
| ch04_015 | Evidence reveal and marker circle | No intrusive clue fanfare | pending manual listen |
| ch04_020 | Cold message pop and Zhouyu tiny smile | Zhouyu pressure must not sound like a monster effect | pending manual listen |
| ch05_004 | Old phone start and soft choice confirm | Old phone must not sound like sci-fi startup | pending manual listen |
| ch05_005 | Old phone start, recording static, weak static exhale | No full voiceover | pending manual listen |
| ch05_011 | Old phone start, recording static, weak static exhale | No long TTS reading | pending manual listen |
| ch05_012 | Backup success | Backup success must not sound like a victory jingle | pending manual listen |
| ch05_013 | Wet corridor footstep | No monster step | pending manual listen |
| ch05_015 | Recording static and memory fade | No harsh cut noise | pending manual listen |
| ch05_016 | Cold message pop and Zhouyu pressure breath | No spoken line reading | pending manual listen |
| ch05_020 | Door lock turn | No cheap horror door creak | pending manual listen |
| ch06_005 | Backup success | No victory sound | pending manual listen |
| ch06_006 | Backup start | No loud electronic sweep | pending manual listen |
| ch06_007 | Delete warning | No alarm siren | pending manual listen |
| ch06_010 | Silence drop and soft choice confirm | No narration reading | pending manual listen |
| ch06_020 | Ending archive BGM, room ambience, archive stamp | Ending must not sound like completion music, victory jingle, or game reward | pending manual listen |
| ending_a | Ending report should keep archive BGM atmosphere | No extra voice reading | pending manual listen |
| ending_b | Ending report should stay restrained | No extra voice reading | pending manual listen |
| ending_c | Ending report should not add jump scare | No extra voice reading | pending manual listen |
| ending_d | Ending report should stay rain-night restrained | No extra voice reading | pending manual listen |
