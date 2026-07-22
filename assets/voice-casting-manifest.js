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
    version: 4,
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
      script_dormitory_namefloor: {
        identityBasis: {
          songMingDoorMimic: "门外的声音是对宋明的刻意模仿；它与宋明共享经批准的基础声纹，但保留独立的角色与演出方向。",
          redVestDoorVoice: "门外的女声与红色马甲宿管属于同一红马甲威胁来源；它们共享经批准的基础声纹。",
        },
        speakerAliases: {
          "林峰": "namefloor_linfeng",
          "周朝阳": "namefloor_zhouchaoyang",
          "谷雨": "namefloor_guyu",
          "宋明": "namefloor_songming",
          "门外的声音": "namefloor_songming_door_mimic",
          "吴阿姨": "namefloor_manager_wu",
          "门外的女声": "namefloor_red_vest",
          "红色马甲宿管": "namefloor_red_vest",
          "校园广播": "namefloor_campus_broadcast",
        },
        roles: {
          namefloor_linfeng: role("namefloor_linfeng", "林峰", "zh_male_kailangxuezhang_uranus_bigtts", "男生宿舍中的学生", "自然、紧绷但不莽撞；恐惧里保留普通学生的犹豫和突然的愤怒。"),
          namefloor_zhouchaoyang: role("namefloor_zhouchaoyang", "周朝阳", "zh_male_qingshuangnanda_uranus_bigtts", "逻辑型男大学生", "冷静、清楚、观察先于情绪；关键提问像帮人锚定姓名，不像审问。"),
          namefloor_guyu: role("namefloor_guyu", "谷雨", "zh_male_wenrouxiaoge_uranus_bigtts", "敏感的男生宿舍同伴", "温和、紧张时声音会发虚；关键时刻仍能说出愿意承担的选择。"),
          namefloor_songming: role("namefloor_songming", "宋明", "zh_male_yangguangqingnian_uranus_bigtts", "林峰的舍友", "自然的年轻男声，半夜离开宿舍时放低音量；不提前怪物化。"),
          namefloor_songming_door_mimic: role("namefloor_songming_door_mimic", "门外的宋明模仿声", "zh_male_yangguangqingnian_uranus_bigtts", "模仿宋明的门外声音", "与宋明保持同一基础声纹，但语句更短、更平，压迫感来自不自然的笃定，不做兽化或鬼叫。"),
          namefloor_manager_wu: role("namefloor_manager_wu", "吴阿姨", "zh_female_wenroumama_uranus_bigtts", "知道宿管旧账的历任宿管", "直接、有生活感，也带克制的愧疚；不把复杂性演成绝对善意或反派。"),
          namefloor_red_vest: role("namefloor_red_vest", "红色马甲宿管", "zh_female_gaolengyujie_uranus_bigtts", "红色马甲的查房威胁", "表面温柔、节奏机械，裂缝从过分平稳的礼貌里出现；不使用夸张女鬼腔。"),
          namefloor_campus_broadcast: role("namefloor_campus_broadcast", "校园广播", "zh_female_zhixingnv_uranus_bigtts", "校园内真实广播", "清楚、制度化、没有情绪渲染；可怕感来自措辞与正确人数，而非语气。"),
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
