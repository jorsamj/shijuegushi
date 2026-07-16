(function () {
  "use strict";

  const role = (roleId, label, voiceType, sourceProfile, contextProfile) => ({
    roleId,
    label,
    voiceType,
    sourceProfile,
    contextProfile,
  });

  window.SECOND_LIFE_VOICE_CASTING = {
    version: 3,
    provider: "volcengine-doubao-tts-unidirectional",
    model: "seed-tts-2.0",
    selectionPolicy: "verified-uranus-bigtts-only",
    stories: {
      script_dormitory_rollcall: {
        speakerAliases: {
          "\u5e7f\u64ad": "dorm_broadcast",
          "\u5bbf\u820d\u5e7f\u64ad": "dorm_broadcast",
          "\u9648\u9732": "chenlu",
          "\u6c88\u598d": "shenyan",
          "\u5434\u963f\u59e8": "manager_wu",
          "\u5468\u5a49\u5b81": "zhouwanning",
          "\u8bb8\u68e0": "xutang",
          "\u8d75\u6674": "zhaoqing",
          "\u6797\u7a57": "linsui",
        },
        roles: {
          dorm_broadcast: role("dorm_broadcast", "宿舍广播", "zh_female_zhixingnv_uranus_bigtts", "宿舍公共广播", "冷静、清楚、制度化，规则之间保留短暂停顿；不要新闻播报腔、鬼声耳语或倒计时式催促。"),
          xutang: role("xutang", "许棠", "zh_female_qingchezizi_uranus_bigtts", "宿舍内年轻学生", "自然清澈，前期困惑，中期害怕和自我怀疑，后期有克制勇气，不做持续哭腔。"),
          linsui: role("linsui", "林穗", "zh_female_wenrouxiaoya_uranus_bigtts", "宿舍内年轻学生", "温和、有保护欲；害怕时更谨慎、更反复，最后的坚定要像挣扎后的选择。"),
          zhaoqing: role("zhaoqing", "赵晴", "zh_female_zhishuaiyingzi_uranus_bigtts", "寝室长", "理性、有控制力；恐惧时更依赖秩序，不要演成恶毒反派。"),
          chenlu: role("chenlu", "陈露", "zh_female_shuangkuaisisi_uranus_bigtts", "宿舍内年轻学生", "前期爽快活跃，用玩笑压紧张；录像异常后短句增多，话会说不完。"),
          shenyan: role("shenyan", "沈妍", "zh_female_wenjingmaomao_uranus_bigtts", "宿舍内年轻学生", "安静、慢、停顿多；真正害怕时是原有平静被打破，不做鬼声。"),
          manager_wu: role("manager_wu", "吴阿姨", "zh_female_wenroumama_uranus_bigtts", "中年宿管", "直接、有生活感；旧案相关台词带回避和愧疚，不神秘化。"),
          zhouwanning: role("zhouwanning", "周婉宁", "zh_female_xiaohe_uranus_bigtts", "2014年旧录音", "真实年轻女性的旧录音，疲惫、害怕、克制，不做鬼叫或空灵女鬼。"),
        },
      },
      script_rain_call: {
        identityBasis: {
          womanAtDoor: "门外女人明确自称许知晚，即许知夏的姐姐；第一章用私密信息完成身份核验，最终推理也确认该身份，因此共享许知晚基础声纹。",
        },
        speakerAliases: {
          "\u6797\u821f": "linzhou",
          "\u8bb8\u77e5\u590f": "xuzhixia",
          "\u8bb8\u77e5\u590f\u7684\u58f0\u97f3": "xuzhixia",
          "\u8bb8\u77e5\u665a": "xuzhiwan",
          "\u5973\u4eba": "xuzhiwan",
          "\u5468\u5c7f": "zhouyu",
          "\u9648\u598d": "chenyan",
          "\u623f\u4e1c\u8001\u592a": "landlady",
        },
        roles: {
          linzhou: role("linzhou", "林舟", "zh_female_linxiao_uranus_bigtts", "现实调查者", "疲惫、戒备；压力下节奏收紧，关键时刻重新冷静。"),
          xuzhixia: role("xuzhixia", "许知夏", "zh_female_cancan_uranus_bigtts", "旧录音与求救通话", "年轻、真实、压抑求救；保留迟疑和恐惧，不做幽灵或持续哭喊。"),
          xuzhiwan: role("xuzhiwan", "许知晚", "zh_female_gaolengyujie_uranus_bigtts", "现实来电者与门外女人", "外表克制精准，情绪压在下面；信任和悲伤逐步松动，但声纹不变。"),
          zhouyu: role("zhouyu", "周屿", "zh_male_ruyaqingnian_uranus_bigtts", "现实来电者", "前期礼貌温和，被证据拆穿后才显露控制欲，不提前暴露反派感。"),
          chenyan: role("chenyan", "陈妍", "zh_female_qingxinnvsheng_uranus_bigtts", "现实盟友", "清醒可靠，危险中仍实际，紧张不削弱判断力。"),
          landlady: role("landlady", "房东老太", "zh_female_gujie_uranus_bigtts", "年长邻居", "自然、带生活痕迹，不夸张、不神秘化。"),
        },
      },
    },
  };
})();
