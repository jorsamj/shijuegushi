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
    provider: "volcengine-doubao-tts-websocket",
    model: "seed-tts-2.0",
    selectionPolicy: "verified-uranus-bigtts-only",
    stories: {
      script_dormitory_rollcall: {
        speakerAliases: {
          "Broadcast": "dorm_broadcast",
          "\u5e7f\u64ad": "dorm_broadcast",
          "\u9648\u9732": "chenlu",
          "Chen Lu": "chenlu",
          "\u6c88\u598d": "shenyan",
          "Shen Yan": "shenyan",
          "\u5434\u963f\u59e8": "manager_wu",
          "\u5468\u5a49\u5b81": "zhouwanning",
          "\u8bb8\u68e0": "xutang",
          "\u8d75\u6674": "zhaoqing",
          "\u6797\u7a57": "linsui",
        },
        roles: {
          dorm_broadcast: role("dorm_broadcast", "Dormitory broadcast", "zh_female_zhixingnv_uranus_bigtts", "institutional PA broadcast", "Calm, exact, and emotionally indifferent. Keep short pauses between rules. Never adopt a newsreader cadence, horror whisper, or an urgent countdown."),
          xutang: role("xutang", "Xu Tang", "zh_female_qingchezizi_uranus_bigtts", "young student in the room", "Natural and clear. Begin uncertain, move through fear and self-doubt, then arrive at restrained courage without a crying voice."),
          linsui: role("linsui", "Lin Sui", "zh_female_wenrouxiaoya_uranus_bigtts", "young student in the room", "Warm and protective. Fear makes her more careful and repetitive, not suddenly theatrical. Let resolve sound earned."),
          zhaoqing: role("zhaoqing", "Zhao Qing", "zh_female_zhishuaiyingzi_uranus_bigtts", "dormitory leader", "Practical and controlled. Under pressure she leans on order because she is frightened, never because she is cruel."),
          chenlu: role("chenlu", "Chen Lu", "zh_female_shuangkuaisisi_uranus_bigtts", "young student in the room", "Initially brisk and lightly defensive. Once the recording changes, shorten phrases and let uncertainty interrupt her thought."),
          shenyan: role("shenyan", "Shen Yan", "zh_female_wenjingmaomao_uranus_bigtts", "young student in the room", "Quiet, measured, and sparing with words. Her real fear is most effective when her usual calm finally breaks."),
          manager_wu: role("manager_wu", "Manager Wu", "zh_female_wenroumama_uranus_bigtts", "middle-aged dorm manager", "Direct and lived-in, not mystical. Around the old case, allow avoidance and long-held guilt to surface without melodrama."),
          zhouwanning: role("zhouwanning", "Zhou Wanning", "zh_female_xiaohe_uranus_bigtts", "old recording from 2014", "A young woman captured in a real past recording: tired, frightened, and controlled. Never ghostly, airy, or stylised."),
        },
      },
      script_rain_call: {
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
          linzhou: role("linzhou", "Lin Zhou", "zh_female_linxiao_uranus_bigtts", "present-day investigator", "Tired and guarded in ordinary conversation. Pressure should tighten the rhythm, then settle into clear control at decisive moments."),
          xuzhixia: role("xuzhixia", "Xu Zhixia", "zh_female_cancan_uranus_bigtts", "old recording and distressed call", "Young and real, with a suppressed plea for help. Preserve hesitation and fear without turning her into a ghost or sustained sobbing."),
          xuzhiwan: role("xuzhiwan", "Xu Zhiwan", "zh_female_gaolengyujie_uranus_bigtts", "present-day caller and woman at the door", "Outwardly controlled and precise, with pressure held below the surface. Trust and grief should gradually soften the restraint without changing voiceprint."),
          zhouyu: role("zhouyu", "Zhou Yu", "zh_male_ruyaqingnian_uranus_bigtts", "present-day caller", "Courteous and composed at first. Pressure remains polite until evidence removes his control; do not signal a villain before the reveal."),
          chenyan: role("chenyan", "Chen Yan", "zh_female_qingxinnvsheng_uranus_bigtts", "present-day ally", "Clear-eyed and dependable. Keep her practical under danger; concern must not weaken her judgement."),
          landlady: role("landlady", "Landlady", "zh_female_gujie_uranus_bigtts", "older neighbour", "Matter-of-fact and weathered. Keep the delivery natural and local, avoiding caricature or occult colouring."),
        },
      },
    },
  };
})();
