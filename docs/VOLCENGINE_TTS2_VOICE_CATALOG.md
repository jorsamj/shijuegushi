# Volcengine TTS 2.0 Voice Catalog

## Verified Scope

- Source: owner-supplied official Volcengine PDF export, preserved as sanitized [raw extracted text](official/volcengine-tts2/raw-official-content.txt) and sanitized screenshots in [the evidence directory](official/volcengine-tts2/).
- Retrieved: 2026-07-14. Source page update shown in the PDF: 2026-07-13 10:25:43.
- Included: 93 standard voices explicitly listed under the official Doubao Voice Synthesis Model 2.0 heading. 90 are Chinese and eligible only for later casting review.
- Excluded: ICL rows, Model 1.0 rows, end-to-end S2S rows, and any voice not in that heading.

## Emotion Boundary

The official Model 2.0 standard-voice table lists instruction-following capability, but it does **not** provide a fixed Model 2.0 emotion enum, an API field location, a strength range, or per-voice emotion compatibility. The fixed emotion table in the PDF is visibly under the Model 1.0 heading. It is not used here.

Therefore every Model 2.0 record uses `emotion.status: unavailable`. No runtime request, casting decision, or sample generation may use an `emotion` parameter until a separate official API reference supplies the valid field and values.

## Structured Data

The complete machine-readable evidence, including verified status and source pages, is in [assets/volcengine-tts2-voice-catalog.json](../assets/volcengine-tts2-voice-catalog.json).

## Verified Voice Types

| Official name | Official voice_type | Official scene | Official language | PDF page |
| --- | --- | --- | --- | --- |
| Vivi 2.0 | `zh_female_vv_uranus_bigtts` | 通用场景 | 中文、日文、印尼、墨西哥西班牙语 方言：四川、陕西、东北 | 1 |
| 小何  2.0 | `zh_female_xiaohe_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 云舟  2.0 | `zh_male_m191_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 小天  2.0 | `zh_male_taocheng_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 刘飞  2.0 | `zh_male_liufei_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 魅力苏菲  2.0 | `zh_female_sophie_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 清新女声  2.0 | `zh_female_qingxinnvsheng_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 知性灿灿  2.0 | `zh_female_cancan_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 撒娇学妹  2.0 | `zh_female_sajiaoxuemei_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 甜美小源  2.0 | `zh_female_tianmeixiaoyuan_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 甜美桃子  2.0 | `zh_female_tianmeitaozi_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 爽快思思  2.0 | `zh_female_shuangkuaisisi_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 佩奇猪  2.0 | `zh_female_peiqi_uranus_bigtts` | 视频配音 | 中文 | 1 |
| 邻家女孩  2.0 | `zh_female_linjianvhai_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 少年梓辛  2.0 | `zh_male_shaonianzixin_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 猴哥  2.0 | `zh_male_sunwukong_uranus_bigtts` | 视频配音 | 中文 | 1 |
| Tina 老师  2.0 | `zh_female_yingyujiaoxue_uranus_bigtts` | 教育场景 | 中文、英式英语 | 1 |
| 暖阳女声  2.0 | `zh_female_kefunvsheng_uranus_bigtts` | 客服场景 | 中文 | 1 |
| 儿童绘本  2.0 | `zh_female_xiaoxue_uranus_bigtts` | 有声阅读 | 中文 | 1 |
| 大壹  2.0 | `zh_male_dayi_uranus_bigtts` | 视频配音 | 中文 | 1 |
| 黑猫侦探社咪仔  2.0 | `zh_female_mizai_uranus_bigtts` | 视频配音 | 中文 | 1 |
| 鸡汤女  2.0 | `zh_female_jitangnv_uranus_bigtts` | 视频配音 | 中文 | 1 |
| 魅力女友  2.0 | `zh_female_meilinvyou_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 流畅女声  2.0 | `zh_female_liuchangnv_uranus_bigtts` | 视频配音 | 中文 | 1 |
| 儒雅逸辰  2.0 | `zh_male_ruyayichen_uranus_bigtts` | 视频配音 | 中文 | 1 |
| Tim | `en_male_tim_uranus_bigtts` | 多语种 | 美式英语 | 1 |
| Dacey | `en_female_dacey_uranus_bigtts` | 多语种 | 美式英语 | 1 |
| Stokie | `en_female_stokie_uranus_bigtts` | 多语种 | 美式英语 | 1 |
| 温柔妈妈  2.0 | `zh_female_wenroumama_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 解说小明  2.0 | `zh_male_jieshuoxiaoming_uranus_bigtts` | 通用场景 | 中文 | 1 |
| TVB 女声  2.0 | `zh_female_tvbnv_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 译制片男  2.0 | `zh_male_yizhipiannan_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 俏皮女声  2.0 | `zh_female_qiaopinv_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 直率英子  2.0 | `zh_female_zhishuaiyingzi_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 邻家男孩  2.0 | `zh_male_linjiananhai_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 四郎  2.0 | `zh_male_silang_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 儒雅青年  2.0 | `zh_male_ruyaqingnian_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 擎苍  2.0 | `zh_male_qingcang_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 熊二  2.0 | `zh_male_xionger_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 樱桃丸子  2.0 | `zh_female_yingtaowanzi_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 温暖阿虎  2.0 | `zh_male_wennuanahu_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 奶气萌娃  2.0 | `zh_male_naiqimengwa_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 婆婆  2.0 | `zh_female_popo_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 高冷御姐  2.0 | `zh_female_gaolengyujie_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 傲娇霸总  2.0 | `zh_male_aojiaobazong_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 懒音绵宝  2.0 | `zh_male_lanyinmianbao_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 反卷青年  2.0 | `zh_male_fanjuanqingnian_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 温柔淑女  2.0 | `zh_female_wenroushunv_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 古风少御  2.0 | `zh_female_gufengshaoyu_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 活力小哥  2.0 | `zh_male_huolixiaoge_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 霸气青叔  2.0 | `zh_male_baqiqingshu_uranus_bigtts` | 有声阅读 | 中文 | 1 |
| 悬疑解说  2.0 | `zh_male_xuanyijieshuo_uranus_bigtts` | 有声阅读 | 中文 | 1 |
| 萌丫头  2.0 | `zh_female_mengyatou_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 贴心女声  2.0 | `zh_female_tiexinnvsheng_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 鸡汤妹妹  2.0 | `zh_female_jitangmei_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 磁性解说男声  2.0 | `zh_male_cixingjieshuonan_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 亮嗓萌仔  2.0 | `zh_male_liangsangmengzai_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 开朗姐姐  2.0 | `zh_female_kailangjiejie_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 高冷沉稳  2.0 | `zh_male_gaolengchenwen_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 深夜播客  2.0 | `zh_male_shenyeboke_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 鲁班七号  2.0 | `zh_male_lubanqihao_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 娇喘女声  2.0 | `zh_female_jiaochuannv_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 林潇  2.0 | `zh_female_linxiao_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 玲玲姐姐  2.0 | `zh_female_lingling_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 春日部姐姐  2.0 | `zh_female_chunribu_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 唐僧  2.0 | `zh_male_tangseng_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 庄周  2.0 | `zh_male_zhuangzhou_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 开朗弟弟  2.0 | `zh_male_kailangdidi_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 猪八戒  2.0 | `zh_male_zhubajie_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 感冒电音姐姐  2.0 | `zh_female_ganmaodianyin_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 谄媚女声  2.0 | `zh_female_chanmeinv_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 女雷神  2.0 | `zh_female_nvleishen_uranus_bigtts` | 角色扮演 | 中文 | 1 |
| 亲切女声  2.0 | `zh_female_qinqienv_uranus_bigtts` | 通用场景 | 中文 | 1 |
| 快乐小东  2.0 | `zh_male_kuailexiaodong_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 开朗学长  2.0 | `zh_male_kailangxuezhang_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 悠悠君子  2.0 | `zh_male_youyoujunzi_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 文静毛毛  2.0 | `zh_female_wenjingmaomao_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 知性女声  2.0 | `zh_female_zhixingnv_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 清爽男大  2.0 | `zh_male_qingshuangnanda_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 渊博小叔  2.0 | `zh_male_yuanboxiaoshu_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 阳光青年  2.0 | `zh_male_yangguangqingnian_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 清澈梓梓  2.0 | `zh_female_qingchezizi_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 甜美悦悦  2.0 | `zh_female_tianmeiyueyue_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 心灵鸡汤  2.0 | `zh_female_xinlingjitang_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 温柔小哥  2.0 | `zh_male_wenrouxiaoge_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 柔美女友  2.0 | `zh_female_roumeinvyou_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 东方浩然  2.0 | `zh_male_dongfanghaoran_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 温柔小雅  2.0 | `zh_female_wenrouxiaoya_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 天才童声  2.0 | `zh_male_tiancaitongsheng_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 武则天  2.0 | `zh_female_wuzetian_uranus_bigtts` | 角色扮演 | 中文 | 2 |
| 顾姐  2.0 | `zh_female_gujie_uranus_bigtts` | 角色扮演 | 中文 | 2 |
| 广告解说  2.0 | `zh_male_guanggaojieshuo_uranus_bigtts` | 通用场景 | 中文 | 2 |
| 少儿故事  2.0 | `zh_female_shaoergushi_uranus_bigtts` | 有声阅读 | 中文 | 2 |
