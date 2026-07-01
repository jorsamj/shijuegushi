(function () {
  "use strict";

  const sceneArt = {
    rental_room_rain_night: `
      <div class="visual-scene visual-room">
        <div class="visual-window"><i></i><b></b><span></span></div>
        <div class="visual-desk"><i class="prop-laptop"></i><i class="prop-noodle"></i><i class="prop-cup"></i></div>
        <div class="visual-rain-lines"></div>
        <p>出租屋的窗缝漏着雨，电脑冷光把泡面碗照得发白。</p>
      </div>`,
    corridor_door: `
      <div class="visual-scene visual-corridor">
        <div class="visual-peephole"><i class="wet-silhouette"></i><b></b></div>
        <div class="visual-chain"></div>
        <div class="visual-door-light"></div>
        <p>猫眼外的楼道灯忽明忽暗，门链在冷光里轻轻晃。</p>
      </div>`,
    phone_call_ui: `
      <div class="visual-scene visual-phone-call">
        <div class="visual-phone">
          <span class="phone-time">22:47</span>
          <strong>许知夏</strong>
          <small>三年前的旧号码</small>
          <div class="call-wave"><i></i><i></i><i></i><i></i><i></i></div>
          <div class="call-actions"><button type="button" data-scene-feedback="你把手指悬在接听键上，雨声忽然变得很近。">接听</button><button type="button" data-scene-feedback="你想挂断，可屏幕还亮着。">挂断</button></div>
        </div>
      </div>`,
    old_chat_memory: `
      <div class="visual-scene visual-chat">
        <div class="memory-photo"></div>
        <div class="chat-line left">知夏：那天你会来吗？</div>
        <div class="chat-line right">林舟：会。</div>
        <div class="chat-line recalled">一条旧消息已撤回</div>
        <p>旧聊天记录像潮湿纸页，一碰就掉下三年前的灰。</p>
      </div>`,
    rental_room_table: `
      <div class="visual-scene visual-table">
        <div class="prop-card prop-box" data-scene-feedback="纸箱里有潮味，胶带已经发黄。">纸箱</div>
        <div class="prop-card prop-photo" data-scene-feedback="照片边缘起毛，像被人反复捏过。">旧照片</div>
        <div class="prop-card prop-disk" data-scene-feedback="旧硬盘发出很轻的转动声。">旧硬盘</div>
        <div class="coffee-ring"></div>
        <p>桌面被台灯切成两半，一半是现在，一半是你不想碰的过去。</p>
      </div>`,
    photo_zoom_view: `
      <div class="visual-scene visual-photo-zoom">
        <div class="photo-frame"><span class="corner-shadow"></span><b class="red-mark"></b></div>
        <div class="magnifier-lens"></div>
        <div class="inspect-actions"><button type="button" data-scene-feedback="已检查：玻璃反光里只有一截模糊的楼梯扶手。">玻璃反光</button><button type="button" data-scene-feedback="已检查：门牌号码和旧新闻里的地点能对上。">门牌</button><button type="button" data-scene-feedback="已检查：角落阴影里有一个熟悉的侧影。">角落人影</button></div>
      </div>`,
    old_phone_view: `
      <div class="visual-scene visual-old-phone">
        <div class="cracked-phone"><i></i><strong>语音备忘</strong><div class="voice-wave"><span></span><span></span><span></span><span></span><span></span></div><button type="button" data-scene-feedback="录音已归档。那句没说完的话，还在波形里发亮。">归档录音</button></div>
        <div class="cloud-restore">云端恢复</div>
      </div>`,
    ending_screen: `
      <div class="visual-scene visual-ending">
        <div class="archive-envelope"></div>
        <div class="evidence-thread"><i></i><i></i><i></i></div>
        <p>人生报告被归档，雨声仍在纸页背面。</p>
      </div>`,
  };

  window.SECOND_LIFE_VISUALS = {
    scenes: {
      rental_room_rain_night: { id: "scene_room", title: "雨夜出租屋", art: sceneArt.rental_room_rain_night },
      corridor_door: { id: "scene_corridor", title: "猫眼门口", art: sceneArt.corridor_door },
      phone_call_ui: { id: "scene_phone", title: "旧号码来电", art: sceneArt.phone_call_ui },
      old_chat_memory: { id: "scene_chat", title: "旧聊天回忆", art: sceneArt.old_chat_memory },
      rental_room_table: { id: "scene_table", title: "旧物桌面", art: sceneArt.rental_room_table },
      photo_zoom_view: { id: "scene_photo", title: "照片放大", art: sceneArt.photo_zoom_view },
      old_phone_view: { id: "scene_old_phone", title: "旧手机声音", art: sceneArt.old_phone_view },
      ending_screen: { id: "scene_ending", title: "结局归档", art: sceneArt.ending_screen },
    },
    characters: {
      林舟: { id: "linzhou", name: "林舟", role: "疲惫上班族", avatar: "avatar-linzhou" },
      许知晚: { id: "zhuwan", name: "许知晚", role: "门外的女人", avatar: "avatar-zhuwan" },
      周屿: { id: "zhouyu", name: "周屿", role: "温和旧友的影子", avatar: "avatar-zhouyu" },
      陈妍: { id: "chenyan", name: "陈妍", role: "清醒的现实支撑", avatar: "avatar-chenyan" },
      许知夏: { id: "zhixia", name: "许知夏", role: "留在记录里的人", avatar: "avatar-zhixia" },
      旁白: { id: "narrator", name: "旁白", role: "雨夜记录", avatar: "avatar-narrator" },
    },
    characterAliases: {
      "许知夏的声音": "许知夏",
      "周屿消息": "周屿",
      "陈妍消息": "陈妍",
      "系统": "旁白",
      "你的选择": "林舟",
    },
    clues: {
      clue_dead_call: { id: "icon_dead_call", label: "旧手机来电", icon: "icon-phone-wave" },
      clue_sister_mark: { id: "icon_sister_mark", label: "姐妹身份标记", icon: "icon-fingerprint-card" },
      clue_gray_loan: { id: "icon_gray_loan", label: "借贷记录", icon: "icon-loan-file" },
      clue_zhou_left: { id: "icon_zhou_left", label: "离城时间线", icon: "icon-ticket-pin" },
      clue_photo_background: { id: "icon_photo_background", label: "照片角落人影", icon: "icon-photo-shadow" },
      clue_timed_voice: { id: "icon_timed_voice", label: "云端语音波形", icon: "icon-cloud-voice" },
    },
    chapters: {
      chapter_01: { id: "cover_ch01", title: "雨夜来电", cover: "cover-rain-call", motif: "暴雨窗户 · 手机来电 · 22:47" },
      chapter_02: { id: "cover_ch02", title: "门外的许知晚", cover: "cover-door", motif: "猫眼 · 湿透人影 · 门链" },
      chapter_03: { id: "cover_ch03", title: "三年前的裂缝", cover: "cover-crack", motif: "旧聊天 · 新闻标题 · 断裂时间线" },
      chapter_04: { id: "cover_ch04", title: "最后一张合照", cover: "cover-photo", motif: "合照 · 放大镜 · 角落人影" },
      chapter_05: { id: "cover_ch05", title: "旧手机的声音", cover: "cover-old-phone", motif: "裂屏旧手机 · 语音波形 · 云端恢复" },
      chapter_06: { id: "cover_ch06", title: "无人接听", cover: "cover-no-answer", motif: "结局档案 · 空楼道 · 未接来电" },
    },
    props: {
      old_phone: { id: "prop_old_phone", label: "旧手机", icon: "prop-old-phone" },
      last_photo: { id: "prop_last_photo", label: "最后一张合照", icon: "prop-last-photo" },
      old_disk: { id: "prop_old_disk", label: "旧硬盘", icon: "prop-old-disk" },
      door_chain: { id: "prop_door_chain", label: "门链", icon: "prop-door-chain" },
      voice_file: { id: "prop_voice_file", label: "录音文件", icon: "prop-voice-file" },
      loan_record: { id: "prop_loan_record", label: "借贷记录", icon: "prop-loan-record" },
      zhou_message: { id: "prop_zhou_message", label: "周屿消息", icon: "prop-zhou-message" },
      chenyan_backup: { id: "prop_chenyan_backup", label: "陈妍备份", icon: "prop-chenyan-backup" },
    },
  };
})();
