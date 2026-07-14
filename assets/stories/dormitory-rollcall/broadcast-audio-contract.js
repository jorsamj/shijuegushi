(function () {
  "use strict";

  const awaitingDelivery = {
    deliveryStatus: "awaiting-authorised-human-recording",
    filePath: null,
    licenceSource: null,
    publicDistributionAllowed: false,
    commercialDistributionAllowed: false,
    listeningSignoff: "pending",
    runtimePolicy: "disabled-until-approved",
  };

  const cue = (audioId, chapterIds, nodeIds, line, tone, durationSeconds, stopPolicy) => ({
    audioId,
    chapterIds,
    nodeIds,
    line,
    tone,
    durationSeconds,
    loop: false,
    skippable: true,
    recommendedFileName: `${audioId}_zh-CN.mp3`,
    stopPolicy,
    ...awaitingDelivery,
  });

  window.DORMITORY_BROADCAST_AUDIO_CONTRACT = {
    version: "1.0",
    voiceDirection: "午夜校园宿舍公共广播：近距离、小房间喇叭、低情绪但清楚。短句之间留白，字尾不扬，不要主持人新闻腔、客服腔、耳语或恐怖表演。",
    cues: [
      cue("dorm_broadcast_rollcall_start", ["dorm_chapter_01"], ["dorm_01_002"], "现在时间零点十七分。四一七寝室夜间点名开始。", "值班系统播报，低而平，不像新闻开场", 4, "Fade out within 120ms when leaving the node or beginning the rules."),
      cue("dorm_broadcast_public_rules", ["dorm_chapter_01"], ["dorm_01_002"], "一，点名结束前不得离开宿舍。二，真正的查寝者会敲三下，停两秒，再敲一下。三，床号被叫到时，当事人保持安静，由另一人回答：已经休息。四，红灯亮起时闭眼十秒，不得使用手机照明。五，有人从洗手间回来时，先查看她原来的床位。六，镜中出现陌生姓名时，不得擦去，也不得念出。", "每条规则像旧制度逐项读取，句间短停，不连成主持人口播", 34, "Stop and fade within 180ms on node exit; never overlap another broadcast cue."),
      cue("dorm_broadcast_current_count", ["dorm_chapter_01"], ["dorm_01_006"], "四一七登记住户，四人。请按床位应答。", "简短、冷静", 5, "Stop within 120ms on node exit."),
      cue("dorm_broadcast_bed_call", ["dorm_chapter_02"], ["dorm_02_002"], "二号床，请应答。", "点名式、平直", 3, "Stop within 120ms on node exit."),
      cue("dorm_broadcast_unlisted_person", ["dorm_chapter_04", "dorm_chapter_05"], ["dorm_04_012", "dorm_05_009"], "请未登记人员，前往值班室。", "制度化、无威胁表演", 4, "Use once per scene; stop within 120ms when the node changes."),
      cue("dorm_broadcast_deadline_0113", ["dorm_chapter_04"], ["dorm_04_012"], "距一点十三分，还有一分钟。请确认登记人数。", "克制提醒，不作倒计时鼓点", 5, "Stop within 120ms on node exit; no loop."),
      cue("dorm_broadcast_correction_prompt", ["dorm_chapter_06"], ["dorm_06_007"], "请提交最终名单。", "制度化、留白", 3, "Fade within 140ms when player chooses or leaves the node."),
      cue("dorm_broadcast_restore_zhou", ["dorm_chapter_06"], ["dorm_06_009"], "二零一四年宿舍记录：周婉宁。人数更正为三百二十人。", "平静确认", 6, "Stop within 160ms on node exit."),
      cue("dorm_broadcast_restore_xutang", ["dorm_chapter_06"], ["dorm_06_009"], "四一七寝室记录：许棠。人数更正为五人。", "平静确认", 5, "Stop within 160ms on node exit."),
      cue("dorm_broadcast_rollcall_complete", ["dorm_chapter_06"], ["dorm_06_011"], "名单已归档。点名结束。", "低调收束", 4, "Fade within 220ms before ending music begins."),
      cue("dorm_broadcast_ending_a", ["ending"], ["dorm_ending_a"], "更正完成。所有姓名均已记录。", "平静、恢复秩序", 4, "Play once, then stop before ending report."),
      cue("dorm_broadcast_ending_b", ["ending"], ["dorm_ending_b"], "四一七登记人数，四人。", "机械但不夸张", 4, "Play once, then stop before ending report."),
      cue("dorm_broadcast_ending_c", ["ending"], ["dorm_ending_c"], "人数不匹配。请重新确认。", "平静、无惊吓", 4, "Play once, then stop before ending report."),
      cue("dorm_broadcast_ending_d", ["ending"], ["dorm_ending_d"], "下一次点名，将于零点十七分开始。", "克制循环感", 5, "Play once, then stop before ending report."),
    ],
  };
})();
