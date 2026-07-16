(function () {
  "use strict";

  const generatedDelivery = (audioId) => ({
    deliveryStatus: "volcengine-generated-awaiting-listening-signoff",
    filePath: `assets/stories/dormitory-rollcall/audio/voice-original/dorm_${audioId}__dorm_broadcast.wav`,
    licenceSource: "Volcengine Doubao Voice Synthesis Model 2.0 HTTP unidirectional API; project-owned API key and seed-tts-2.0 resource.",
    publicDistributionAllowed: true,
    commercialDistributionAllowed: true,
    listeningSignoff: "pending",
    runtimePolicy: "runtime-enabled-pending-manual-release-signoff",
  });

  const cue = (audioId, chapterIds, nodeIds, line, tone, durationSeconds, stopPolicy) => ({
    audioId,
    chapterIds,
    nodeIds,
    line,
    tone,
    durationSeconds,
    loop: false,
    skippable: true,
    recommendedFileName: `dorm_${audioId}__dorm_broadcast.wav`,
    stopPolicy,
    ...generatedDelivery(audioId),
  });

  window.DORMITORY_BROADCAST_AUDIO_CONTRACT = {
    version: "2.0",
    voiceDirection: "深夜女生宿舍公共广播：近距离、小房间喇叭、冷静清楚、制度化。危险内容也不带情绪，不使用新闻播报腔、客服腔、耳语或女鬼表演。",
    cues: [
      cue("dorm_broadcast_lockdown_rule", ["dorm_chapter_01"], ["dorm_01_002"], "请所有宿舍人员在三十秒内回到床铺，双脚不得接触地面。未按时归位者将不再被认定为宿舍人员。", "平静发布临时管控，清楚但没有安抚感。", 9, "Stop and fade within 160ms on node exit; never overlap another voice."),
      cue("dorm_broadcast_cleanup_complete", ["dorm_chapter_01"], ["dorm_01_006"], "一名违规人员已完成清理，当前楼层秩序正常。", "像登记结果一样平静，不能表现残酷或兴奋。", 5, "Stop within 120ms on node exit."),
      cue("dorm_broadcast_full_name_call", ["dorm_chapter_01"], ["dorm_01_010"], "许棠。", "单独点名，字音准确，句尾不拖长。", 2, "Stop within 100ms on node exit."),
      cue("dorm_broadcast_hold_position", ["dorm_chapter_05"], ["dorm_05_002"], "所有人员继续留在床铺，不得进入楼梯间。", "固定格式的留守命令，冷静、简短。", 5, "Stop within 120ms on node exit."),
      cue("dorm_broadcast_false_east_route", ["dorm_chapter_05"], ["dorm_05_003"], "东侧安全通道已经开放，请立即撤离。", "比真广播稍显主动，但仍保持制度口吻，不演反派。", 5, "Stop within 120ms on node exit."),
      cue("dorm_broadcast_ninety_second_window", ["dorm_chapter_06"], ["dorm_06_001"], "应急照明将在九十秒后失效，所有宿舍门将在此期间解除锁定。", "客观播报窗口，不做倒计时催促。", 7, "Stop within 140ms on node exit; no loop."),
      cue("dorm_broadcast_final_rollcall_start", ["dorm_chapter_06"], ["dorm_06_008"], "最终点名开始。请所有人员保持原位。", "闸机前的最终流程提示，平稳无同理心。", 5, "Fade within 120ms when leaving the node."),
      cue("dorm_broadcast_final_names", ["dorm_chapter_06"], ["dorm_06_009"], "许棠。林穗。赵晴。陈露。沈妍。", "逐名读取，每个姓名间留短停顿，不强调任何一人。", 7, "Stop immediately when the player leaves or makes a choice."),
      cue("dorm_broadcast_control_room_prompt", ["dorm_chapter_06"], ["dorm_06_010"], "检测到广播控制室仍在运行。请确认处理方式。", "系统流程提示，不替玩家作出选择。", 5, "Stop within 120ms after the choice is made."),
      cue("dorm_broadcast_gate_archive", ["dorm_chapter_06"], ["dorm_06_011"], "周婉宁的记录已恢复。通行记录正在归档。", "低调收束，为结局留出静默。", 5, "Fade within 220ms before ending audio or report."),
      cue("dorm_broadcast_ending_dawn", ["ending"], ["dorm_ending_true_dawn"], "现场人数与通行记录一致。出口已解除锁定。", "恢复秩序，但不做胜利奖励语气。", 5, "Play once, then stop before ending report."),
      cue("dorm_broadcast_ending_legal_count", ["ending"], ["dorm_ending_legal_count"], "登记人数符合要求。未登记人员不计入通行记录。", "机械确认制度结果，越正常越冷。", 6, "Play once, then stop before ending report."),
      cue("dorm_broadcast_ending_second_xutang", ["ending"], ["dorm_ending_second_xutang"], "检测到重复身份。请保留其中一人。", "平静处理身份替代，不使用惊吓语气。", 5, "Play once, then stop before ending report."),
      cue("dorm_broadcast_ending_broken", ["ending"], ["dorm_ending_broken_broadcast"], "广播连接中断。楼层管控已转入离线模式。", "短促、清楚，结尾直接切断。", 5, "Play once, then stop before ending report."),
    ],
  };
})();
