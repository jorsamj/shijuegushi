# Story Voice Casting

Provider: Volcengine Doubao Voice Synthesis Model 2.0, HTTP unidirectional API.

Runtime policy:

- Provider id: `volcengine-doubao-tts-unidirectional`
- Model / resource: `seed-tts-2.0`
- Voice family: verified `uranus_bigtts` voices only
- Narration, action, environment, and pure system text remain silent
- Legacy XFYUN files are retained only as non-runtime archives

## Dormitory Rules

| Role | Voice type | Direction |
|---|---|---|
| Dormitory broadcast | `zh_female_zhixingnv_uranus_bigtts` | Calm, institutional, exact, never newsreader-like or ghostly. |
| Xu Tang | `zh_female_qingchezizi_uranus_bigtts` | Young, clear, uncertain at first, then frightened but increasingly firm. |
| Lin Sui | `zh_female_wenrouxiaoya_uranus_bigtts` | Warm and protective; fear makes her careful rather than theatrical. |
| Zhao Qing | `zh_female_zhishuaiyingzi_uranus_bigtts` | Controlled dorm leader; pressure sounds practical, not villainous. |
| Chen Lu | `zh_female_shuangkuaisisi_uranus_bigtts` | Brisk and ordinary, with anxiety breaking her rhythm later. |
| Shen Yan | `zh_female_wenjingmaomao_uranus_bigtts` | Quiet and measured; danger shows when calm finally breaks. |
| Manager Wu | `zh_female_wenroumama_uranus_bigtts` | Direct dorm-manager voice with lived-in guilt around the old case. |
| Zhou Wanning | `zh_female_xiaohe_uranus_bigtts` | A real young woman in an old recording: tired, restrained, afraid. |

## Rain Call

| Role | Voice type | Direction |
|---|---|---|
| Lin Zhou | `zh_female_linxiao_uranus_bigtts` | Tired, guarded, then controlled under pressure. |
| Xu Zhixia | `zh_female_cancan_uranus_bigtts` | Young, real, hesitant, and frightened in recordings or calls. |
| Xu Zhiwan / woman at the door | `zh_female_gaolengyujie_uranus_bigtts` | Restrained and precise; the shared voiceprint is intentional because the woman identifies herself as Xu Zhiwan and the story verifies it. |
| Zhou Yu | `zh_male_ruyaqingnian_uranus_bigtts` | Courteous and composed until evidence removes his control. |
| Chen Yan | `zh_female_qingxinnvsheng_uranus_bigtts` | Clear, practical, reliable under danger. |
| Landlady | `zh_female_gujie_uranus_bigtts` | Weathered, matter-of-fact, never caricatured. |

## Release State

Formal WAVs are generated and mapped in `assets/voice-runtime-manifest.js`.
The Draft PR remains blocked by manual listening and mobile regression gates;
automated voice checks do not count as release sign-off.
