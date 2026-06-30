window.MIST_DATA = {
  "schemaVersion": "0.3",
  "product": {
    "name": "迷雾剧本馆",
    "subtitle": "每一个选择，都可能改变真相"
  },
  "series": [
    {
      "seriesId": "series_rain_call",
      "title": "雨夜来电系列",
      "status": "open",
      "summary": "围绕暴雨夜、旧手机、死者来电与身份疑云展开的都市悬疑系列。",
      "scriptIds": [
        "script_rain_call",
        "script_no_answer",
        "script_third_voice"
      ]
    },
    {
      "seriesId": "series_old_building",
      "title": "旧楼档案系列",
      "status": "locked",
      "summary": "旧楼里无人愿意提起的失踪记录。",
      "scriptIds": []
    },
    {
      "seriesId": "series_missing_people",
      "title": "消失的人系列",
      "status": "locked",
      "summary": "那些从生活缝隙里悄悄消失的人。",
      "scriptIds": []
    }
  ],
  "scripts": [
    {
      "scriptId": "script_rain_call",
      "seriesId": "series_rain_call",
      "title": "雨夜来电",
      "status": "open",
      "order": 1,
      "startNodeId": "ch01_001",
      "summary": "暴雨夜，林舟接到来自已故大学室友的电话，门外却站着一个和她一模一样的女人。"
    },
    {
      "scriptId": "script_no_answer",
      "seriesId": "series_rain_call",
      "title": "无人接听",
      "status": "coming",
      "order": 2,
      "summary": "旧号码再次响起，但这一次没有人敢接。"
    },
    {
      "scriptId": "script_third_voice",
      "seriesId": "series_rain_call",
      "title": "第三个声音",
      "status": "coming",
      "order": 3,
      "summary": "通话录音里，出现了不属于任何人的第三个声音。"
    }
  ],
  "chapters": [
    {
      "chapterId": "chapter_01",
      "title": "第 1 章：来电显示",
      "order": 1
    },
    {
      "chapterId": "chapter_02",
      "title": "第 2 章：门外的人",
      "order": 2
    },
    {
      "chapterId": "chapter_03",
      "title": "第 3 章：不能开门",
      "order": 3
    },
    {
      "chapterId": "chapter_04",
      "title": "第 4 章：许知晚",
      "order": 4
    },
    {
      "chapterId": "chapter_05",
      "title": "第 5 章：三年前的夏天",
      "order": 5
    },
    {
      "chapterId": "chapter_06",
      "title": "第 6 章：旧新闻",
      "order": 6
    },
    {
      "chapterId": "chapter_07",
      "title": "第 7 章：最后一张合照",
      "order": 7
    },
    {
      "chapterId": "chapter_08",
      "title": "第 8 章：照片里的人",
      "order": 8
    },
    {
      "chapterId": "chapter_09",
      "title": "第 9 章：旧手机的声音",
      "order": 9
    },
    {
      "chapterId": "chapter_10",
      "title": "第 10 章：周屿来电",
      "order": 10
    },
    {
      "chapterId": "chapter_11",
      "title": "第 11 章：选择相信谁",
      "order": 11
    },
    {
      "chapterId": "chapter_12",
      "title": "第 12 章：无人接听",
      "order": 12
    }
  ],
  "clues": {
    "clue_dead_call": {
      "clueId": "clue_dead_call",
      "title": "来自许知夏号码的来电",
      "category": "通话",
      "description": "三年前已经死亡的许知夏，旧号码却在雨夜打进林舟手机。",
      "isKey": true
    },
    "clue_warning_sentence": {
      "clueId": "clue_warning_sentence",
      "title": "“别开门，她不是我”",
      "category": "通话",
      "description": "来电中的短促警告，语义可被误读，不一定指向许知晚。",
      "isKey": true
    },
    "clue_door_woman": {
      "clueId": "clue_door_woman",
      "title": "门外女人与许知夏相貌一致",
      "category": "人物",
      "description": "猫眼外的女人与许知夏极像，自称许知晚。",
      "isKey": true
    },
    "clue_sister_mark": {
      "clueId": "clue_sister_mark",
      "title": "许知晚知道姐妹间私密细节",
      "category": "人物",
      "description": "许知晚说出只有许知夏和亲近之人才知道的旧事。",
      "isKey": true
    },
    "clue_old_phone": {
      "clueId": "clue_old_phone",
      "title": "许知夏遗留旧手机",
      "category": "物件",
      "description": "许知夏的旧手机被许知晚重新开机，是死者来电的现实来源。",
      "isKey": true
    },
    "clue_last_photo": {
      "clueId": "clue_last_photo",
      "title": "最后一张大学合照",
      "category": "照片",
      "description": "许知夏出事前最后一次聚会的合照，可能藏着旧案证据。",
      "isKey": true
    },
    "clue_photo_background": {
      "clueId": "clue_photo_background",
      "title": "合照背景里的楼道身影",
      "category": "照片",
      "description": "照片背景中疑似出现周屿，和他的证词相矛盾。",
      "isKey": true
    },
    "clue_gray_loan": {
      "clueId": "clue_gray_loan",
      "title": "许知夏信息被冒用借贷",
      "category": "旧案",
      "description": "许知夏死亡前发现身份信息被冒用，准备寻求帮助。",
      "isKey": true
    },
    "clue_zhou_left": {
      "clueId": "clue_zhou_left",
      "title": "周屿案发后离开城市",
      "category": "人物",
      "description": "周屿在案发后迅速离开，时间线异常。",
      "isKey": true
    },
    "clue_timed_voice": {
      "clueId": "clue_timed_voice",
      "title": "旧语音备忘云端触发记录",
      "category": "通话",
      "description": "许知晚重新开机旧手机后，旧语音备忘或云端记录被触发。",
      "isKey": true
    },
    "clue_landlady_testimony": {
      "clueId": "clue_landlady_testimony",
      "title": "房东证词",
      "category": "地点",
      "description": "房东老太见过许知晚，也见过一个可疑男人来打听林舟。",
      "isKey": false
    },
    "clue_old_chat_control": {
      "clueId": "clue_old_chat_control",
      "title": "旧聊天记录",
      "category": "人物",
      "description": "许知夏曾在聊天里提到周屿替她做决定。",
      "isKey": false
    },
    "clue_zhou_message": {
      "clueId": "clue_zhou_message",
      "title": "周屿异常短信",
      "category": "人物",
      "description": "周屿突然发来“别让她进去”，说明他知道当前雨夜的情况。",
      "isKey": false
    },
    "clue_photo_back_note": {
      "clueId": "clue_photo_back_note",
      "title": "合照背面字迹",
      "category": "照片",
      "description": "照片背面写着“别相信他说的那晚”。",
      "isKey": false
    },
    "clue_old_phone_boot_time": {
      "clueId": "clue_old_phone_boot_time",
      "title": "旧手机开机时间",
      "category": "物件",
      "description": "旧手机由许知晚重新开机，随后恢复旧记录。",
      "isKey": false
    }
  },
  "defaultFlags": {
    "trusted_zhuwan_early": false,
    "verified_zhuwan_identity": false,
    "found_gray_loan": false,
    "suspected_zhou": false,
    "found_last_photo": false,
    "backed_up_photo": false,
    "found_photo_background": false,
    "understood_dead_call": false,
    "deleted_evidence": false,
    "chose_reopen_case": false,
    "kept_door_closed": false,
    "called_chenyan": false,
    "answered_zhou_call": false,
    "refused_zhou_pressure": false,
    "gave_original_photo": false
  },
  "nodes": {
    "ch01_001": {
      "nodeId": "ch01_001",
      "chapterId": "chapter_01",
      "chapterTitle": "第 1 章：来电显示",
      "type": "dialogue",
      "scene": "rental_room_rain_night",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "暴雨从九点一直下到现在。窗缝被风吹得发抖，水珠沿着玻璃往下爬，像一行擦不干净的字。\n\n林舟盯着电脑屏幕，文档标题停在“周五前必须提交”。旁边的泡面已经坨了，杯子里剩着半口冷咖啡。\n\n右下角时间跳到 22:47。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch01_002",
      "note": "开场生活压力节点"
    },
    "ch01_002": {
      "nodeId": "ch01_002",
      "chapterId": "chapter_01",
      "chapterTitle": "第 1 章：来电显示",
      "type": "clue",
      "scene": "phone_call_ui",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "手机在桌边震了一下。\n\n林舟本能地伸手去按静音，却在看到来电显示时停住了。\n\n屏幕上只有三个字。\n\n许知夏。\n\n雨声一下子变远了。林舟听见自己的呼吸卡在喉咙里，像被什么旧东西轻轻掐住。\n\n许知夏已经死了三年。",
      "gainClues": [
        "clue_dead_call"
      ],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch01_003",
      "note": "前三节点内出现死者来电"
    },
    "ch01_003": {
      "nodeId": "ch01_003",
      "chapterId": "chapter_01",
      "chapterTitle": "第 1 章：来电显示",
      "type": "clue",
      "scene": "phone_call_ui",
      "cast": "林舟 / 许知夏的声音",
      "speaker": "许知夏的声音",
      "text": "林舟的手指悬在接听键上，指尖发凉。\n\n她还是接了。\n\n电话那头先是一阵很轻的电流声，然后是雨声。不是窗外这场雨，是更远、更空的雨，像从三年前某个楼道里传来。\n\n一个熟悉到让人胃里发紧的声音说：\n\n“林舟，别开门。”\n\n停顿半秒。\n\n“她不是我。”",
      "gainClues": [
        "clue_warning_sentence"
      ],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch01_004",
      "note": "第 1 章小高潮前半"
    },
    "ch01_004": {
      "nodeId": "ch01_004",
      "chapterId": "chapter_01",
      "chapterTitle": "第 1 章：来电显示",
      "type": "dialogue",
      "scene": "rental_room_rain_night",
      "cast": "林舟 / 旁白",
      "speaker": "林舟",
      "text": "“知夏？”\n\n林舟听见自己的声音小得不像自己。\n\n电话断了。\n\n手机屏幕黑下去，出租屋里只剩雨声和电脑风扇的嗡鸣。她盯着那块黑屏，三年前医院走廊的消毒水味忽然撞进鼻腔。\n\n那天她没有去见许知夏最后一面。她说自己请不了假。\n\n其实她是不敢。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch01_005",
      "note": "主角愧疚建立"
    },
    "ch01_005": {
      "nodeId": "ch01_005",
      "chapterId": "chapter_01",
      "chapterTitle": "第 1 章：来电显示",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "门铃响了。\n\n一声，很短。\n\n林舟的肩膀猛地僵住。她没有动，眼睛却不受控制地看向门口。\n\n第二声门铃紧跟着响起，比刚才更急。\n\n门外有人。\n\n这栋楼的楼道灯坏了半个月，平时外卖员都不愿意上来。这个时间，这场雨，谁会站在门口？",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch01_006",
      "note": "前 6 节点内门铃响起"
    },
    "ch01_006": {
      "nodeId": "ch01_006",
      "chapterId": "chapter_01",
      "chapterTitle": "第 1 章：来电显示",
      "type": "clue",
      "scene": "corridor_door",
      "cast": "林舟 / 许知晚 / 旁白",
      "speaker": "旁白",
      "text": "林舟屏住呼吸，走到门后。\n\n猫眼外的楼道被雨水反光照得发白。一个女人站在那里，头发湿透，黑色外套贴在肩上，脸色苍白得像刚从雨里捞出来。\n\n她抬起头。\n\n林舟的手一下按住门板。\n\n那张脸，和许知夏太像了。",
      "gainClues": [
        "clue_door_woman"
      ],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch01_007",
      "note": "第 1 章小高潮后半"
    },
    "ch01_007": {
      "nodeId": "ch01_007",
      "chapterId": "chapter_01",
      "chapterTitle": "第 1 章：来电显示",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“林舟，是吗？”\n\n门外的女人声音发哑，像忍了很久的冷。\n\n“我叫许知晚。许知夏是我姐姐。”\n\n林舟没有回答。\n\n女人靠近猫眼，雨水从她下巴滴下来。\n\n“我知道你不信我。但我真的不能再等了。有人也在找那张照片。”",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch01_008",
      "note": "提出合照钩子"
    },
    "ch01_008": {
      "nodeId": "ch01_008",
      "chapterId": "chapter_01",
      "chapterTitle": "第 1 章：来电显示",
      "type": "choice",
      "scene": "corridor_door",
      "cast": "林舟 / 许知晚",
      "speaker": "旁白",
      "text": "林舟的手机还握在掌心，屏幕上残留着刚才那通来电的记录。\n\n门外的女人等着她回答。\n\n死去三年的声音说：别开门。\n\n门外那张像极了许知夏的脸说：我不能再等了。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "先不开门，隔着门问她要证明",
          "nextNodeId": "ch02_001",
          "setFlags": [
            "kept_door_closed"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "把防盗链挂上，开一条门缝",
          "nextNodeId": "ch02_001",
          "setFlags": [
            "trusted_zhuwan_early"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "不回应，先给陈妍发消息",
          "nextNodeId": "ch02_001",
          "setFlags": [
            "called_chenyan"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 1 章关键选择和钩子"
    },
    "ch02_001": {
      "nodeId": "ch02_001",
      "chapterId": "chapter_02",
      "chapterTitle": "第 2 章：门外的人",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "林舟 / 许知晚",
      "speaker": "林舟",
      "text": "“你说你是她妹妹。”\n\n林舟尽量让自己的声音听起来稳一点。\n\n“那你应该知道，她大学时最怕什么。”\n\n门外沉默了两秒。楼道里有水滴落在地砖上，一声一声，像倒计时。\n\n许知晚说：“她怕别人碰她的日记本。不是因为里面有秘密，是因为她写字太难看，怕你笑她。”",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch02_002",
      "note": "身份试探开始"
    },
    "ch02_002": {
      "nodeId": "ch02_002",
      "chapterId": "chapter_02",
      "chapterTitle": "第 2 章：门外的人",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "林舟 / 许知晚",
      "speaker": "许知晚",
      "text": "“她还说，你有一次半夜胃疼，不肯去医院，她煮了一锅白粥，糊了。”\n\n许知晚低头笑了一下，笑意很快消失。\n\n“她说你们俩最后还是把那锅粥吃完了，因为月底都没钱点外卖。”\n\n林舟喉咙发紧。\n\n这件事，许知夏没有发过朋友圈，也没有告诉过周屿。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch02_003",
      "note": "私密细节铺垫"
    },
    "ch02_003": {
      "nodeId": "ch02_003",
      "chapterId": "chapter_02",
      "chapterTitle": "第 2 章：门外的人",
      "type": "dialogue",
      "scene": "rental_room_rain_night",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟想起那锅白粥。\n\n糊味很重，许知夏却一本正经地说：“焦香，是高级做法。”\n\n那时候她们还年轻，穷得坦荡，连难过都来得很轻。\n\n后来许知夏死了。大家在群里发了几句节哀，群就再也没人说话。\n\n林舟把那个群折叠了三年。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch02_004",
      "note": "回忆与愧疚"
    },
    "ch02_004": {
      "nodeId": "ch02_004",
      "chapterId": "chapter_02",
      "chapterTitle": "第 2 章：门外的人",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“我知道你害怕。”\n\n许知晚把声音压得很低。\n\n“但我也害怕。我找了你三个月，今天才确定你住在这里。”\n\n林舟皱眉：“你怎么确定的？”\n\n门外的女人没有立刻回答。\n\n她避开了猫眼，像是不想让林舟看清她的表情。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch02_005",
      "note": "许知晚隐瞒调查方式"
    },
    "ch02_005": {
      "nodeId": "ch02_005",
      "chapterId": "chapter_02",
      "chapterTitle": "第 2 章：门外的人",
      "type": "choice",
      "scene": "corridor_door",
      "cast": "林舟 / 许知晚",
      "speaker": "旁白",
      "text": "许知晚知道那些旧事。\n\n可她也在回避一些问题。\n\n林舟看着门锁，忽然意识到：现在每一个动作，都会把自己推向不同的危险。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "继续隔门询问她怎么找到这里",
          "nextNodeId": "ch02_006",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "让她把身份证明从门缝塞进来",
          "nextNodeId": "ch02_006",
          "setFlags": [
            "verified_zhuwan_identity"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "让她先进来避雨，但手机保持录音",
          "nextNodeId": "ch02_006",
          "setFlags": [
            "trusted_zhuwan_early"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 2 章关键选择"
    },
    "ch02_006": {
      "nodeId": "ch02_006",
      "chapterId": "chapter_02",
      "chapterTitle": "第 2 章：门外的人",
      "type": "clue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“我姐姐左手腕内侧有一道很浅的疤。”\n\n许知晚说。\n\n“小时候我摔碎杯子，她替我挡了一下。我妈以为是她打碎的，她也没解释。”\n\n她停了停。\n\n“你们合照里，她总把袖子往下拉。你应该见过。”\n\n林舟想起许知夏夏天也穿长袖的样子，心里某个位置轻轻塌了一块。",
      "gainClues": [
        "clue_sister_mark"
      ],
      "setFlags": [
        "verified_zhuwan_identity"
      ],
      "choices": [],
      "nextNodeId": "ch02_007",
      "note": "第 2 章小高潮"
    },
    "ch02_007": {
      "nodeId": "ch02_007",
      "chapterId": "chapter_02",
      "chapterTitle": "第 2 章：门外的人",
      "type": "dialogue",
      "scene": "stairwell_rain",
      "cast": "房东老太 / 林舟 / 许知晚",
      "speaker": "房东老太",
      "text": "楼上传来门轴的吱呀声。\n\n房东老太探出半张脸，披着旧毛衣，眼神比楼道灯还暗。\n\n“小林，这姑娘前两天来过，问你住不住这层。”\n\n她看了许知晚一眼，又把声音压低。\n\n“还有个男的，也来问过。戴帽子，话不多，看着不像送外卖的。”",
      "gainClues": [
        "clue_landlady_testimony"
      ],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch02_008",
      "note": "房东证词与更大威胁"
    },
    "ch02_008": {
      "nodeId": "ch02_008",
      "chapterId": "chapter_02",
      "chapterTitle": "第 2 章：门外的人",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "林舟 / 许知晚",
      "speaker": "旁白",
      "text": "房东老太关门前，又看了林舟一眼。\n\n“这雨夜，别什么人都往屋里放。”\n\n门合上，楼道重新安静。\n\n许知晚湿漉漉地站在门外，轻声说：“那个男的如果也找到你，千万别把照片给他。”\n\n林舟问：“什么照片？”\n\n许知晚抬头：“你真的忘了？”",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch03_001",
      "note": "章节钩子：照片"
    },
    "ch03_001": {
      "nodeId": "ch03_001",
      "chapterId": "chapter_03",
      "chapterTitle": "第 3 章：不能开门",
      "type": "dialogue",
      "scene": "rental_room_rain_night",
      "cast": "林舟 / 许知晚",
      "speaker": "林舟",
      "text": "“我不知道你说的是哪张照片。”\n\n林舟靠在门后，手心全是汗。\n\n许知晚的声音隔着门板传来：“大学毕业前，你们最后一次聚会。你、我姐姐、周屿，还有几个同学。”\n\n周屿。\n\n这个名字像被雨水泡过，忽然从三年前浮上来。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch03_002",
      "note": "周屿名字正式出现"
    },
    "ch03_002": {
      "nodeId": "ch03_002",
      "chapterId": "chapter_03",
      "chapterTitle": "第 3 章：不能开门",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "林舟 / 陈妍",
      "speaker": "陈妍",
      "text": "林舟给陈妍发了三条消息。\n\n【我门口有个女人，说是我死去室友的妹妹。】\n\n【刚才我接到那个室友的电话。】\n\n【我是不是该报警？】\n\n陈妍几乎秒回：\n\n【你先别开门。】\n\n【我知道你爱熬夜，但你别熬到都市传说里去。】",
      "gainClues": [],
      "setFlags": [
        "called_chenyan"
      ],
      "choices": [],
      "nextNodeId": "ch03_003",
      "note": "陈妍不是工具人，带真实反应"
    },
    "ch03_003": {
      "nodeId": "ch03_003",
      "chapterId": "chapter_03",
      "chapterTitle": "第 3 章：不能开门",
      "type": "clue",
      "scene": "phone_call_ui",
      "cast": "林舟 / 周屿",
      "speaker": "旁白",
      "text": "就在这时，又一条消息弹出来。\n\n发信人：周屿。\n\n林舟已经很久没见过这个名字了。他的头像还是三年前那张海边背影，朋友圈停在许知夏出事后的第二个月。\n\n消息只有五个字。\n\n【别让她进去。】",
      "gainClues": [
        "clue_zhou_message"
      ],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch03_004",
      "note": "第 3 章小高潮"
    },
    "ch03_004": {
      "nodeId": "ch03_004",
      "chapterId": "chapter_03",
      "chapterTitle": "第 3 章：不能开门",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "林舟 / 许知晚",
      "speaker": "林舟",
      "text": "林舟盯着那条消息，背后发冷。\n\n她没有告诉许知晚周屿发来了什么，只问：“你认识周屿吗？”\n\n门外安静了一瞬。\n\n许知晚说：“认识。”\n\n“我姐姐死后，他是第一个劝我别查的人。”",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch03_005",
      "note": "周屿嫌疑加深"
    },
    "ch03_005": {
      "nodeId": "ch03_005",
      "chapterId": "chapter_03",
      "chapterTitle": "第 3 章：不能开门",
      "type": "choice",
      "scene": "phone_call_ui",
      "cast": "林舟 / 陈妍 / 周屿 / 许知晚",
      "speaker": "旁白",
      "text": "三个人的名字同时压在手机屏幕上。\n\n门外的许知晚。\n\n聊天框里的陈妍。\n\n还有突然出现的周屿。\n\n林舟发现自己最想做的事，是把手机关机，把门铃拔掉，假装这一晚没有发生。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "回复周屿，问他为什么知道门外有人",
          "nextNodeId": "ch03_006",
          "setFlags": [
            "answered_zhou_call"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "把周屿消息截图发给陈妍",
          "nextNodeId": "ch03_006",
          "setFlags": [
            "called_chenyan"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "告诉许知晚周屿发了消息",
          "nextNodeId": "ch03_006",
          "setFlags": [
            "verified_zhuwan_identity"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 3 章关键选择"
    },
    "ch03_006": {
      "nodeId": "ch03_006",
      "chapterId": "chapter_03",
      "chapterTitle": "第 3 章：不能开门",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "周屿很快回了消息。\n\n【我听说有人在找你。】\n\n【她说什么你都别信。知夏当年的事已经够糟了，别再把自己卷进去。】\n\n林舟盯着“听说”两个字。\n\n她没有告诉任何老同学自己住在哪里。\n\n周屿是怎么知道的？",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch03_007",
      "note": "周屿关心带迷惑性"
    },
    "ch03_007": {
      "nodeId": "ch03_007",
      "chapterId": "chapter_03",
      "chapterTitle": "第 3 章：不能开门",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“他是不是跟你说，别信我？”\n\n许知晚的声音忽然绷紧。\n\n林舟没有回答。\n\n许知晚却像已经知道答案。\n\n“三年前，他也这么跟我说。他说我姐姐情绪不好，说她自己走到天台边，说所有人都该往前看。”\n\n她轻轻吸了一口气。\n\n“可我姐姐不是那样的人。”",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch03_008",
      "note": "旧案动机抬头"
    },
    "ch03_008": {
      "nodeId": "ch03_008",
      "chapterId": "chapter_03",
      "chapterTitle": "第 3 章：不能开门",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "许知晚从包里拿出什么，贴近猫眼。\n\n不是身份证。\n\n是一张手机照片。\n\n照片里，一部旧手机亮着屏，屏幕上有一个未发送的备忘标题。\n\n标题是：林舟。\n\n许知晚说：“这是我姐姐留下的。”",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch04_001",
      "note": "章节钩子，进入第 4 章"
    },
    "ch04_001": {
      "nodeId": "ch04_001",
      "chapterId": "chapter_04",
      "chapterTitle": "第 4 章：许知晚",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "林舟 / 许知晚",
      "speaker": "林舟",
      "text": "“你哪来的这部手机？”\n\n林舟听见自己的声音变了。\n\n那部旧手机她记得。许知夏大学时一直用到屏幕裂开，后来换新机也舍不得扔，说里面有很多“穷学生时代的证据”。\n\n许知晚把照片收回去。\n\n“我在她以前的东西里找到的。”",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch04_002",
      "note": "旧手机进入剧情"
    },
    "ch04_002": {
      "nodeId": "ch04_002",
      "chapterId": "chapter_04",
      "chapterTitle": "第 4 章：许知晚",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“我不是今天才来找你。”\n\n许知晚说。\n\n“我去过你以前的公司，找过你大学同学，也给你发过邮件。你都没有回。”\n\n林舟愣住。\n\n她想起邮箱垃圾箱里那些陌生标题。她没有点开过。\n\n三年前之后，所有和许知夏有关的东西，她都学会了绕开。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch04_003",
      "note": "林舟逃避被点破"
    },
    "ch04_003": {
      "nodeId": "ch04_003",
      "chapterId": "chapter_04",
      "chapterTitle": "第 4 章：许知晚",
      "type": "dialogue",
      "scene": "rental_room_rain_night",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟忽然想起许知夏葬礼后那几天。\n\n周屿发过一条很长的消息，说知夏走得突然，大家都别互相怪罪。\n\n林舟当时盯着那条消息看了很久。\n\n她很感激有人替大家把沉默说成体面。\n\n现在想来，那条消息更像是一块布，把什么东西盖住了。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch04_004",
      "note": "周屿话术伏笔"
    },
    "ch04_004": {
      "nodeId": "ch04_004",
      "chapterId": "chapter_04",
      "chapterTitle": "第 4 章：许知晚",
      "type": "choice",
      "scene": "corridor_door",
      "cast": "林舟 / 许知晚",
      "speaker": "旁白",
      "text": "许知晚还站在门外。\n\n雨水从她袖口滴到楼道地面，积成一小摊暗色的影子。\n\n林舟知道她在隐瞒。\n\n但门外的雨、手机里的死者号码、周屿的消息，都在逼她做决定。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "让许知晚进屋，但要求她把旧手机照片先发过来",
          "nextNodeId": "ch04_005",
          "setFlags": [
            "verified_zhuwan_identity"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "不开门，只让她继续隔门解释",
          "nextNodeId": "ch04_005",
          "setFlags": [
            "kept_door_closed"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "让她进屋，并承诺会帮她找照片",
          "nextNodeId": "ch04_005",
          "setFlags": [
            "trusted_zhuwan_early"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 4 章关键选择"
    },
    "ch04_005": {
      "nodeId": "ch04_005",
      "chapterId": "chapter_04",
      "chapterTitle": "第 4 章：许知晚",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "林舟 / 许知晚",
      "speaker": "旁白",
      "text": "许知晚把照片发了过来。\n\n图片有些糊，但能看清那部旧手机。屏幕裂痕从左上角贯到右下角，像一道旧伤。\n\n备忘列表最上方，赫然写着：\n\n林舟，别开门。\n\n创建时间显示在三年前，许知夏出事前一天。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch04_006",
      "note": "旧手机照片上有林舟名字"
    },
    "ch04_006": {
      "nodeId": "ch04_006",
      "chapterId": "chapter_04",
      "chapterTitle": "第 4 章：许知晚",
      "type": "clue",
      "scene": "old_phone_view",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟把图片放大。\n\n旧手机的锁屏壁纸是许知夏以前养过的一盆绿萝。那盆绿萝后来死在宿舍窗台上，许知夏还为它写过一段悼词。\n\n这不是伪造图片能想到的细节。\n\n这确实是许知夏的手机。",
      "gainClues": [
        "clue_old_phone"
      ],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch04_007",
      "note": "核心线索：旧手机"
    },
    "ch04_007": {
      "nodeId": "ch04_007",
      "chapterId": "chapter_04",
      "chapterTitle": "第 4 章：许知晚",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“我重开那部手机，是昨天晚上。”\n\n许知晚说。\n\n“它开机后一直在同步旧记录。今天傍晚，那个备忘忽然跳出来。我看到你的名字，就来了。”\n\n林舟问：“那刚才那通电话呢？”\n\n许知晚沉默了。\n\n“我也不知道它为什么会拨出去。”",
      "gainClues": [
        "clue_old_phone_boot_time"
      ],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch04_008",
      "note": "来电机制前置但不完全解释"
    },
    "ch04_008": {
      "nodeId": "ch04_008",
      "chapterId": "chapter_04",
      "chapterTitle": "第 4 章：许知晚",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "林舟 / 周屿",
      "speaker": "旁白",
      "text": "手机又亮了。\n\n周屿发来第二条消息。\n\n【林舟，我知道你现在很乱。】\n\n【但你记住，知夏已经不在了。现在用她名字找你的人，只会害你。】\n\n林舟看着这句话，忽然发现自己的窗户玻璃上，映出了楼道方向一闪而过的影子。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch05_001",
      "note": "章节钩子：周屿仿佛知道当下情况"
    },
    "ch05_001": {
      "nodeId": "ch05_001",
      "chapterId": "chapter_05",
      "chapterTitle": "第 5 章：三年前的夏天",
      "type": "dialogue",
      "scene": "old_chat_memory",
      "cast": "林舟 / 许知夏 / 周屿 / 旁白",
      "speaker": "旁白",
      "text": "林舟点开那个被她折叠了三年的大学群。\n\n最后一条消息停在许知夏去世后的第三天。\n\n再往上翻，时间突然活过来。约饭、拼车、考试答案、谁欠谁一杯奶茶。\n\n许知夏发过一张照片：林舟趴在桌上睡觉，周屿站在旁边，手里举着一杯冰美式。\n\n配文是：别喂她了，她再喝会看见另一个世界。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch05_002",
      "note": "大学关系生活化"
    },
    "ch05_002": {
      "nodeId": "ch05_002",
      "chapterId": "chapter_05",
      "chapterTitle": "第 5 章：三年前的夏天",
      "type": "dialogue",
      "scene": "old_chat_memory",
      "cast": "许知夏 / 林舟",
      "speaker": "许知夏",
      "text": "【林舟，明天陪我去拍毕业照。】\n\n【周屿也去？】\n\n【他说要来。】\n\n【你不想他来？】\n\n许知夏隔了很久才回：\n\n【也不是。就是有时候，他太替我做决定了。】\n\n林舟盯着这句话，指尖慢慢停住。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch05_003",
      "note": "周屿控制欲初现"
    },
    "ch05_003": {
      "nodeId": "ch05_003",
      "chapterId": "chapter_05",
      "chapterTitle": "第 5 章：三年前的夏天",
      "type": "clue",
      "scene": "old_chat_memory",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "她继续往前翻。\n\n周屿在群里很少发火。他总是温和的，周到的，替大家订票、订包间、安排路线。\n\n可私聊里，许知夏有几次提到他。\n\n【他又替我回了那个人的消息。】\n\n【他说我是为了我好。】\n\n【林舟，有时候我觉得他不是关心我，是不想让我离开他的安排。】",
      "gainClues": [
        "clue_old_chat_control"
      ],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch05_004",
      "note": "第 5 章小高潮：控制欲"
    },
    "ch05_004": {
      "nodeId": "ch05_004",
      "chapterId": "chapter_05",
      "chapterTitle": "第 5 章：三年前的夏天",
      "type": "dialogue",
      "scene": "rental_room_rain_night",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟想起周屿以前的样子。\n\n他会记得每个人的生日，会替喝醉的人叫车，会把争吵变成玩笑。\n\n大家都说，有周屿在就不用操心。\n\n可现在林舟忽然意识到：不用操心的另一面，是不用选择。\n\n许知夏当年是不是也这么想过？",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch05_005",
      "note": "人物关系反转"
    },
    "ch05_005": {
      "nodeId": "ch05_005",
      "chapterId": "chapter_05",
      "chapterTitle": "第 5 章：三年前的夏天",
      "type": "choice",
      "scene": "old_chat_memory",
      "cast": "林舟 / 陈妍 / 许知晚",
      "speaker": "旁白",
      "text": "陈妍发来消息：\n\n【你那个周屿，我搜了一下，三年前之后确实离开本市了。】\n\n【你还要继续翻吗？】\n\n林舟看着聊天记录。她知道再往下翻，可能会把自己也翻出来。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "继续翻许知夏和自己的私聊",
          "nextNodeId": "ch05_006",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "先问许知晚，周屿到底做过什么",
          "nextNodeId": "ch05_006",
          "setFlags": [
            "suspected_zhou"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "让陈妍帮忙查三年前新闻",
          "nextNodeId": "ch05_006",
          "setFlags": [
            "called_chenyan"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 5 章关键选择"
    },
    "ch05_006": {
      "nodeId": "ch05_006",
      "chapterId": "chapter_05",
      "chapterTitle": "第 5 章：三年前的夏天",
      "type": "dialogue",
      "scene": "old_chat_memory",
      "cast": "许知夏 / 林舟",
      "speaker": "许知夏",
      "text": "【林舟，你有没有觉得，人欠了别人太多好意，就很难拒绝他？】\n\n三年前的许知夏这么问过。\n\n林舟当时回的是：\n\n【你别想太多，周屿人挺好的。】\n\n现在，那行字像一根细针，扎进她眼底。\n\n她当年不是没看见。\n\n她只是懒得多想。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch05_007",
      "note": "主角愧疚深化"
    },
    "ch05_007": {
      "nodeId": "ch05_007",
      "chapterId": "chapter_05",
      "chapterTitle": "第 5 章：三年前的夏天",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“我姐姐出事前，给我打过一次电话。”\n\n许知晚说。\n\n“她说她终于明白，有些人不是照顾你，是把你的路一点点挪到他手里。”\n\n林舟低声问：“她说的是周屿？”\n\n许知晚没有直接回答。\n\n“她说，那个人不会让她报警。”",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch05_008",
      "note": "指向报警和旧案"
    },
    "ch05_008": {
      "nodeId": "ch05_008",
      "chapterId": "chapter_05",
      "chapterTitle": "第 5 章：三年前的夏天",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "陈妍 / 林舟",
      "speaker": "陈妍",
      "text": "陈妍发来一张截图。\n\n【我找到三年前的旧新闻了。标题挺轻描淡写的：女大学生意外坠楼。】\n\n【但评论里有人提到，她出事前好像在问借贷平台的事。】\n\n林舟还没点开截图，周屿的聊天框又弹了出来。\n\n【你在查什么？】",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch06_001",
      "note": "章节钩子：周屿像在同步知道"
    },
    "ch06_001": {
      "nodeId": "ch06_001",
      "chapterId": "chapter_06",
      "chapterTitle": "第 6 章：旧新闻",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "林舟 / 陈妍",
      "speaker": "陈妍",
      "text": "【我不是吓你。】\n\n陈妍的语音压得很低，背景里还有键盘声。\n\n【这条旧新闻被转载过几次，但原文下面有几条评论很怪。有人说她欠钱，有人说她在找人帮她报警。】\n\n林舟问：“能查到来源吗？”\n\n陈妍叹了口气。\n\n【姐，你这不是加班，这是把自己加进案子里了。】",
      "gainClues": [],
      "setFlags": [
        "called_chenyan"
      ],
      "choices": [],
      "nextNodeId": "ch06_002",
      "note": "陈妍真实反应"
    },
    "ch06_002": {
      "nodeId": "ch06_002",
      "chapterId": "chapter_06",
      "chapterTitle": "第 6 章：旧新闻",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "林舟 / 周屿",
      "speaker": "周屿",
      "text": "周屿的消息又来了。\n\n【知夏当年压力很大。】\n\n【她有些事不想让别人知道。你现在翻出来，只会让她难堪。】\n\n这句话几乎温柔。\n\n可林舟读着，却觉得像有人把一块湿布盖在她脸上。\n\n他不是在劝她。\n\n他是在替许知夏决定什么可以被记住。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch06_003",
      "note": "周屿控制叙事"
    },
    "ch06_003": {
      "nodeId": "ch06_003",
      "chapterId": "chapter_06",
      "chapterTitle": "第 6 章：旧新闻",
      "type": "choice",
      "scene": "phone_call_ui",
      "cast": "林舟 / 陈妍 / 周屿",
      "speaker": "旁白",
      "text": "林舟的手机快没电了，充电线被压在一堆文件下面。\n\n雨声越来越大，门外的许知晚不再催她。\n\n周屿的消息却像一只看不见的手，一直按着屏幕亮起。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "让陈妍继续查借贷相关信息",
          "nextNodeId": "ch06_004",
          "setFlags": [
            "called_chenyan"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "直接问周屿知夏是不是欠钱",
          "nextNodeId": "ch06_004",
          "setFlags": [
            "answered_zhou_call"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "问许知晚她查到了哪一步",
          "nextNodeId": "ch06_004",
          "setFlags": [
            "verified_zhuwan_identity"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 6 章关键选择"
    },
    "ch06_004": {
      "nodeId": "ch06_004",
      "chapterId": "chapter_06",
      "chapterTitle": "第 6 章：旧新闻",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "陈妍 / 林舟",
      "speaker": "陈妍",
      "text": "【查到了。】\n\n陈妍这次没有吐槽。\n\n【三年前有几个小平台用过许知夏的身份信息。金额不大，但分散。更怪的是，绑定联系人里有一个熟人号码。】\n\n林舟打字的手顿住。\n\n【谁？】\n\n陈妍回：\n\n【周屿。】",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch06_005",
      "note": "灰色借贷前置"
    },
    "ch06_005": {
      "nodeId": "ch06_005",
      "chapterId": "chapter_06",
      "chapterTitle": "第 6 章：旧新闻",
      "type": "clue",
      "scene": "phone_call_ui",
      "cast": "陈妍 / 林舟",
      "speaker": "旁白",
      "text": "陈妍发来的截图里，许知夏的名字后面跟着几行陌生平台名称。\n\n身份证号被打了码，手机号却是她大学时用过的旧号。\n\n紧急联系人一栏，周屿的名字清清楚楚。\n\n林舟忽然想起许知夏曾经说过：“如果有一天我说我不欠谁了，你要相信我。”\n\n当时她没有听懂。",
      "gainClues": [
        "clue_gray_loan"
      ],
      "setFlags": [
        "found_gray_loan"
      ],
      "choices": [],
      "nextNodeId": "ch06_006",
      "note": "第 6 章核心线索"
    },
    "ch06_006": {
      "nodeId": "ch06_006",
      "chapterId": "chapter_06",
      "chapterTitle": "第 6 章：旧新闻",
      "type": "clue",
      "scene": "phone_call_ui",
      "cast": "陈妍 / 林舟",
      "speaker": "陈妍",
      "text": "【还有一条搜索记录。】\n\n陈妍发来第二张截图。\n\n【许知夏死亡前一周，她用学校图书馆的电脑搜过：身份信息被冒用怎么办。】\n\n林舟看着那行字，雨声像突然砸进屋里。\n\n许知夏不是在躲债。\n\n她是在找办法自救。",
      "gainClues": [],
      "setFlags": [
        "found_gray_loan"
      ],
      "choices": [],
      "nextNodeId": "ch06_007",
      "note": "第 6 章小高潮"
    },
    "ch06_007": {
      "nodeId": "ch06_007",
      "chapterId": "chapter_06",
      "chapterTitle": "第 6 章：旧新闻",
      "type": "clue",
      "scene": "phone_call_ui",
      "cast": "陈妍 / 林舟",
      "speaker": "陈妍",
      "text": "【周屿三年前案发后就离开本市了。】\n\n【对外说是工作调动，但我查到他离职时间比新闻报道早一天提交。】\n\n林舟看着“早一天”三个字。\n\n如果许知夏的死真是意外，周屿为什么像提前准备好了离开？",
      "gainClues": [
        "clue_zhou_left"
      ],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch06_008",
      "note": "核心线索：周屿离城"
    },
    "ch06_008": {
      "nodeId": "ch06_008",
      "chapterId": "chapter_06",
      "chapterTitle": "第 6 章：旧新闻",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“现在你知道我为什么找你了。”\n\n许知晚的声音隔着门传来，低得几乎被雨盖住。\n\n“我缺的不是怀疑，是证据。”\n\n“我姐姐死前最后一张合照，在你那里。那张照片，可能拍到了周屿。”\n\n林舟的书柜深处，某个旧纸箱仿佛在黑暗里轻轻动了一下。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch07_001",
      "note": "章节钩子：最后合照"
    },
    "ch07_001": {
      "nodeId": "ch07_001",
      "chapterId": "chapter_07",
      "chapterTitle": "第 7 章：最后一张合照",
      "type": "dialogue",
      "scene": "rental_room_table",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟蹲在书柜前，把最下面的纸箱拖出来。\n\n灰尘被雨夜的潮气压得很重，贴在手指上。\n\n纸箱里有旧教材、褪色票根、坏掉的耳机，还有一叠她搬家时没舍得扔的照片。\n\n她忽然害怕起来。\n\n不是害怕找不到。\n\n是害怕真的找到。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch07_002",
      "note": "翻找旧物"
    },
    "ch07_002": {
      "nodeId": "ch07_002",
      "chapterId": "chapter_07",
      "chapterTitle": "第 7 章：最后一张合照",
      "type": "dialogue",
      "scene": "rental_room_table",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "第一张照片是宿舍楼下。\n\n许知夏举着半根烤肠，林舟在旁边笑得眼睛都没了。\n\n第二张是毕业答辩那天，周屿站在最边上，手搭在许知夏肩膀后，却没有真的碰到她。\n\n林舟以前觉得那是体贴。\n\n现在看，只觉得像一种练习过的距离。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch07_003",
      "note": "旧照片推动人物理解"
    },
    "ch07_003": {
      "nodeId": "ch07_003",
      "chapterId": "chapter_07",
      "chapterTitle": "第 7 章：最后一张合照",
      "type": "choice",
      "scene": "rental_room_table",
      "cast": "林舟 / 许知晚 / 陈妍",
      "speaker": "旁白",
      "text": "照片越翻越多，时间像从箱底漏出来。\n\n许知晚在门外不再说话。\n\n陈妍发来一句：【找到后先拍照备份，别学电视剧里唯一证据乱递。】\n\n林舟看着那叠照片，手指停在一张边角卷起的合照上。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "先拍下所有照片备份",
          "nextNodeId": "ch07_004",
          "setFlags": [
            "backed_up_photo"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "先找出许知晚说的最后合照",
          "nextNodeId": "ch07_004",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "问许知晚照片上应该有什么",
          "nextNodeId": "ch07_004",
          "setFlags": [
            "verified_zhuwan_identity"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 7 章关键选择，备份照片"
    },
    "ch07_004": {
      "nodeId": "ch07_004",
      "chapterId": "chapter_07",
      "chapterTitle": "第 7 章：最后一张合照",
      "type": "clue",
      "scene": "rental_room_table",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "她找到了。\n\n照片里，几个人站在旧教学楼前。许知夏穿着白衬衫，笑得很浅；周屿站在她身后半步，脸上是所有人都熟悉的温和。\n\n林舟也在照片里，手里拿着一杯快化掉的冰饮。\n\n那是许知夏出事前，大家最后一次合照。",
      "gainClues": [
        "clue_last_photo"
      ],
      "setFlags": [
        "found_last_photo"
      ],
      "choices": [],
      "nextNodeId": "ch07_005",
      "note": "核心线索：最后合照"
    },
    "ch07_005": {
      "nodeId": "ch07_005",
      "chapterId": "chapter_07",
      "chapterTitle": "第 7 章：最后一张合照",
      "type": "clue",
      "scene": "rental_room_table",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟翻过照片。\n\n背面有一行字，笔迹已经被时间磨淡。\n\n别相信他说的那晚。\n\n她认得这行字。\n\n是许知夏的字。最后一个“晚”字收得很急，像写字的人被什么声音打断。",
      "gainClues": [
        "clue_photo_back_note"
      ],
      "setFlags": [
        "found_last_photo"
      ],
      "choices": [],
      "nextNodeId": "ch07_006",
      "note": "第 7 章小高潮"
    },
    "ch07_006": {
      "nodeId": "ch07_006",
      "chapterId": "chapter_07",
      "chapterTitle": "第 7 章：最后一张合照",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“你找到了，对不对？”\n\n许知晚的声音忽然贴近门。\n\n林舟问：“你怎么知道？”\n\n“因为你沉默了。”\n\n许知晚的声音发颤。\n\n“我姐姐每次发现重要的事，也会先沉默。她说，真相刚出现的时候，人会本能地想把它塞回去。”",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch07_007",
      "note": "许知晚与姐姐情感连接"
    },
    "ch07_007": {
      "nodeId": "ch07_007",
      "chapterId": "chapter_07",
      "chapterTitle": "第 7 章：最后一张合照",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "周屿的电话打了进来。\n\n这一次不是消息。\n\n来电界面盖住照片，手机震动得像一只不安的虫。\n\n林舟盯着屏幕，忽然想起刚才那通来自许知夏的电话。\n\n一个死去的人叫她别开门。\n\n一个活着的人，正在试图让她别看照片。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch07_008",
      "note": "周屿电话压迫"
    },
    "ch07_008": {
      "nodeId": "ch07_008",
      "chapterId": "chapter_07",
      "chapterTitle": "第 7 章：最后一张合照",
      "type": "choice",
      "scene": "phone_call_ui",
      "cast": "林舟 / 周屿",
      "speaker": "旁白",
      "text": "周屿的电话还在震。\n\n林舟看着照片背面的字。\n\n别相信他说的那晚。\n\n“他说的那晚”，到底是哪一晚？",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "接周屿电话",
          "nextNodeId": "ch08_001",
          "setFlags": [
            "answered_zhou_call"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "挂断电话，先放大照片",
          "nextNodeId": "ch08_001",
          "setFlags": [
            "refused_zhou_pressure"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "把照片先发给陈妍备份",
          "nextNodeId": "ch08_001",
          "setFlags": [
            "backed_up_photo"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "章节钩子，进入照片检查"
    },
    "ch08_001": {
      "nodeId": "ch08_001",
      "chapterId": "chapter_08",
      "chapterTitle": "第 8 章：照片里的人",
      "type": "dialogue",
      "scene": "photo_zoom_view",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟把照片放在桌上，打开手机相机。\n\n镜头靠近时，照片里每个人的脸都被放大，笑容变得陌生。\n\n许知夏站在中间，阳光落在她肩上。\n\n背后的教学楼玻璃反着光。\n\n以前林舟只看见了人。\n\n现在，她开始看那些被忽略的角落。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch08_002",
      "note": "照片检查开始"
    },
    "ch08_002": {
      "nodeId": "ch08_002",
      "chapterId": "chapter_08",
      "chapterTitle": "第 8 章：照片里的人",
      "type": "dialogue",
      "scene": "photo_zoom_view",
      "cast": "林舟 / 陈妍",
      "speaker": "陈妍",
      "text": "【别只看脸。】\n\n陈妍发来语音。\n\n【看背景，看窗户反光，看门牌，看有没有时间线对不上的东西。】\n\n林舟忍不住低声说：“你怎么这么熟？”\n\n陈妍回得很快：\n\n【我平时爱看悬疑剧，但我真没想过有一天会远程指导同事查旧案。】",
      "gainClues": [],
      "setFlags": [
        "called_chenyan"
      ],
      "choices": [],
      "nextNodeId": "ch08_003",
      "note": "轻微缓冲和实操提示"
    },
    "ch08_003": {
      "nodeId": "ch08_003",
      "chapterId": "chapter_08",
      "chapterTitle": "第 8 章：照片里的人",
      "type": "choice",
      "scene": "photo_zoom_view",
      "cast": "林舟",
      "speaker": "旁白",
      "text": "照片被放大到有些模糊。\n\n画面里有三处异常：玻璃反光里似乎有楼道，右侧门牌只露出半个数字，角落阴影里有一块深色轮廓。\n\n林舟只能先看一个地方。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "先看玻璃反光",
          "nextNodeId": "ch08_004",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "先看右侧门牌",
          "nextNodeId": "ch08_004",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "先看角落阴影",
          "nextNodeId": "ch08_004",
          "setFlags": [],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 8 章关键选择，均通向发现"
    },
    "ch08_004": {
      "nodeId": "ch08_004",
      "chapterId": "chapter_08",
      "chapterTitle": "第 8 章：照片里的人",
      "type": "dialogue",
      "scene": "photo_zoom_view",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "放大后的颗粒感铺满屏幕。\n\n玻璃反光里，教学楼门口被拉长成一条细细的光带。\n\n光带尽头站着一个人。\n\n那人压低帽檐，侧脸模糊。\n\n林舟本来想说只是路人。\n\n可那件外套，她见过。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch08_005",
      "note": "发现前铺垫"
    },
    "ch08_005": {
      "nodeId": "ch08_005",
      "chapterId": "chapter_08",
      "chapterTitle": "第 8 章：照片里的人",
      "type": "dialogue",
      "scene": "old_chat_memory",
      "cast": "林舟 / 周屿",
      "speaker": "旁白",
      "text": "林舟翻回大学群相册。\n\n周屿有一张照片，穿着同样的深灰外套，袖口有一道很浅的白痕。\n\n他当时开玩笑说，那是被许知夏的钥匙划的。\n\n许知夏回了一个表情。\n\n不是笑。\n\n是一个句号。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch08_006",
      "note": "照片与旧聊天相连"
    },
    "ch08_006": {
      "nodeId": "ch08_006",
      "chapterId": "chapter_08",
      "chapterTitle": "第 8 章：照片里的人",
      "type": "clue",
      "scene": "photo_zoom_view",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟把两张图并在一起。\n\n深灰外套，袖口白痕，站姿，侧脸线条。\n\n背景里那个人是周屿。\n\n更重要的是，那张合照拍摄时间是许知夏出事当天傍晚。\n\n周屿说过，那天晚上他一直在外地。\n\n照片没有说话。\n\n但它把谎言照了下来。",
      "gainClues": [
        "clue_photo_background"
      ],
      "setFlags": [
        "found_photo_background"
      ],
      "choices": [],
      "nextNodeId": "ch08_007",
      "note": "第 8 章小高潮"
    },
    "ch08_007": {
      "nodeId": "ch08_007",
      "chapterId": "chapter_08",
      "chapterTitle": "第 8 章：照片里的人",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "周屿发来一条语音。\n\n“林舟，我知道她让你找照片。”\n\n他的声音还是旧日那种温和，甚至有点疲惫。\n\n“但你想过没有？有些照片会骗人。角度、反光、记忆，都会骗人。”\n\n他顿了顿。\n\n“知夏已经不在了，别让她再被人利用一次。”",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch08_008",
      "note": "周屿开始主动解释"
    },
    "ch08_008": {
      "nodeId": "ch08_008",
      "chapterId": "chapter_08",
      "chapterTitle": "第 8 章：照片里的人",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "许知晚听见林舟说“照片里是周屿”时，门外传来一声很轻的吸气。\n\n她没有哭。\n\n她只是说：“我找了三年。”\n\n“他们都说我该放下。”\n\n“可如果一个人是被推下去的，放下的人不该是我。”\n\n楼道灯忽然闪了一下。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch09_001",
      "note": "章节钩子，转向旧手机"
    },
    "ch09_001": {
      "nodeId": "ch09_001",
      "chapterId": "chapter_09",
      "chapterTitle": "第 9 章：旧手机的声音",
      "type": "dialogue",
      "scene": "old_phone_view",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "许知晚终于把更多照片发了过来。\n\n第一张是旧手机正面。\n\n第二张是备忘列表。\n\n第三张是开机时间记录。\n\n“我昨晚把它充上电。”她说，“它开机以后，一直在恢复旧记录。”\n\n林舟看着屏幕上的时间。\n\n旧手机开机，是昨晚 23:16。",
      "gainClues": [
        "clue_old_phone_boot_time"
      ],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch09_002",
      "note": "来电机制进入解释"
    },
    "ch09_002": {
      "nodeId": "ch09_002",
      "chapterId": "chapter_09",
      "chapterTitle": "第 9 章：旧手机的声音",
      "type": "dialogue",
      "scene": "old_phone_view",
      "cast": "林舟 / 许知晚",
      "speaker": "林舟",
      "text": "“所以刚才那通电话，是你打的？”\n\n许知晚立刻说：“不是。”\n\n她的声音有点急，像怕林舟把刚建立起来的一点信任又关回门外。\n\n“我没有拨你的号码。我只是打开了那部手机。它同步了很多旧东西，备忘、录音、联系人……我也不知道为什么会触发通话。”",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch09_003",
      "note": "许知晚不是制造来电者"
    },
    "ch09_003": {
      "nodeId": "ch09_003",
      "chapterId": "chapter_09",
      "chapterTitle": "第 9 章：旧手机的声音",
      "type": "choice",
      "scene": "old_phone_view",
      "cast": "林舟 / 许知晚",
      "speaker": "旁白",
      "text": "林舟看着旧手机截图。\n\n死者来电像一根刺，卡在整件事最不真实的地方。\n\n如果不能解释它，所有证据都会像雨夜里的影子，随时变形。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "让许知晚继续发旧手机记录",
          "nextNodeId": "ch09_004",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "让陈妍帮忙判断记录是否可能触发",
          "nextNodeId": "ch09_004",
          "setFlags": [
            "called_chenyan"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "先问周屿是否知道旧手机",
          "nextNodeId": "ch09_004",
          "setFlags": [
            "answered_zhou_call"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 9 章关键选择"
    },
    "ch09_004": {
      "nodeId": "ch09_004",
      "chapterId": "chapter_09",
      "chapterTitle": "第 9 章：旧手机的声音",
      "type": "dialogue",
      "scene": "old_phone_view",
      "cast": "陈妍 / 林舟",
      "speaker": "陈妍",
      "text": "陈妍听完林舟的描述，沉默了几秒。\n\n【不玄。】\n\n【旧手机重新开机，云端记录恢复，语音备忘、快捷拨号、旧号码服务，确实可能出现你说的那种异常触发。】\n\n【玄的是，为什么那句提醒偏偏是“别开门”。】\n\n林舟看着门口。\n\n这个问题，许知夏三年前就在问了。",
      "gainClues": [],
      "setFlags": [
        "understood_dead_call"
      ],
      "choices": [],
      "nextNodeId": "ch09_005",
      "note": "现实解释成立"
    },
    "ch09_005": {
      "nodeId": "ch09_005",
      "chapterId": "chapter_09",
      "chapterTitle": "第 9 章：旧手机的声音",
      "type": "clue",
      "scene": "old_phone_view",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“我刚才又看了一遍。”\n\n许知晚发来一段录屏。\n\n旧手机的语音备忘里，有一条文件名叫：林舟，门外的人。\n\n播放键被点下。\n\n许知夏的声音从录屏里传出来，断断续续。\n\n“如果你听到这个，说明我还是没来得及……”\n\n“别开门。她不是我。”",
      "gainClues": [
        "clue_timed_voice"
      ],
      "setFlags": [
        "understood_dead_call"
      ],
      "choices": [],
      "nextNodeId": "ch09_006",
      "note": "核心线索：来电机制"
    },
    "ch09_006": {
      "nodeId": "ch09_006",
      "chapterId": "chapter_09",
      "chapterTitle": "第 9 章：旧手机的声音",
      "type": "dialogue",
      "scene": "old_phone_view",
      "cast": "许知夏的声音 / 林舟",
      "speaker": "许知夏的声音",
      "text": "录音后半段忽然变轻，像许知夏把手机藏进了衣服里。\n\n“周屿他……”\n\n一阵刺耳杂音划过。\n\n录音断了。\n\n林舟按住桌沿，指节发白。\n\n那个名字终于从所有人的沉默里露出了一角。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch09_007",
      "note": "第 9 章小高潮"
    },
    "ch09_007": {
      "nodeId": "ch09_007",
      "chapterId": "chapter_09",
      "chapterTitle": "第 9 章：旧手机的声音",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "周屿的电话再次打来。\n\n这一次，林舟没有立刻挂断。\n\n接通后，他先是沉默，像在听她房间里的动静。\n\n然后他说：“你听到录音了？”\n\n林舟的后背一寸寸凉下去。\n\n她还没有告诉任何人录音内容。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch09_008",
      "note": "周屿知道不该知道的事"
    },
    "ch09_008": {
      "nodeId": "ch09_008",
      "chapterId": "chapter_09",
      "chapterTitle": "第 9 章：旧手机的声音",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "“林舟，听我说。”\n\n周屿的声音终于失去了一点温和。\n\n“有些录音是会被剪辑的。许知晚找了你这么久，她想让你听见什么，你就会听见什么。”\n\n林舟看向门口。\n\n门外的许知晚也在听。\n\n这场雨夜，终于把所有人都推到了同一扇门前。",
      "gainClues": [],
      "setFlags": [
        "answered_zhou_call"
      ],
      "choices": [],
      "nextNodeId": "ch10_001",
      "note": "章节钩子，周屿正式介入"
    },
    "ch10_001": {
      "nodeId": "ch10_001",
      "chapterId": "chapter_10",
      "chapterTitle": "第 10 章：周屿来电",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "“你还是老样子。”\n\n周屿忽然轻声说。\n\n“一紧张就不说话。以前知夏总说，你沉默的时候最难劝。”\n\n林舟握着手机，听见自己心跳很重。\n\n他的语气太熟悉了。\n\n像一个旧友，像一个知道你所有软肋的人。",
      "gainClues": [],
      "setFlags": [
        "answered_zhou_call"
      ],
      "choices": [],
      "nextNodeId": "ch10_002",
      "note": "熟人语气迷惑"
    },
    "ch10_002": {
      "nodeId": "ch10_002",
      "chapterId": "chapter_10",
      "chapterTitle": "第 10 章：周屿来电",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "林舟 / 周屿",
      "speaker": "林舟",
      "text": "“你怎么知道录音的事？”\n\n电话那头安静了一秒。\n\n周屿笑了一下。\n\n“许知晚找过很多人。她拿着她姐姐的旧东西到处问，迟早会问到我这里。”\n\n“林舟，她不是坏人。但一个被困在执念里的人，会把所有人都拖下去。”",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch10_003",
      "note": "周屿话术：不直接抹黑许知晚"
    },
    "ch10_003": {
      "nodeId": "ch10_003",
      "chapterId": "chapter_10",
      "chapterTitle": "第 10 章：周屿来电",
      "type": "dialogue",
      "scene": "rental_room_rain_night",
      "cast": "林舟 / 周屿",
      "speaker": "周屿",
      "text": "“你找到照片了吧？”\n\n林舟的手指猛地收紧。\n\n周屿继续说：“别误会。我只是了解你。你这种人，遇到事一定会先翻旧东西。”\n\n他说得很自然。\n\n可林舟看向桌面。\n\n照片就放在那里，背面朝上，像被人从电话那头看见了。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch10_004",
      "note": "第 10 章小高潮"
    },
    "ch10_004": {
      "nodeId": "ch10_004",
      "chapterId": "chapter_10",
      "chapterTitle": "第 10 章：周屿来电",
      "type": "choice",
      "scene": "phone_call_ui",
      "cast": "林舟 / 周屿",
      "speaker": "旁白",
      "text": "周屿知道她找到了合照。\n\n或者，他在赌。\n\n但无论是哪一种，他都太快了。\n\n林舟必须决定，自己要把什么告诉他。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "假装没找到照片，试探他的反应",
          "nextNodeId": "ch10_005",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "直接问他三年前为什么离开",
          "nextNodeId": "ch10_005",
          "setFlags": [
            "suspected_zhou"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "挂断电话，把照片立刻发给陈妍",
          "nextNodeId": "ch10_005",
          "setFlags": [
            "backed_up_photo"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 10 章关键选择"
    },
    "ch10_005": {
      "nodeId": "ch10_005",
      "chapterId": "chapter_10",
      "chapterTitle": "第 10 章：周屿来电",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "“你真的以为一张模糊的照片能证明什么？”\n\n周屿的声音低了一点。\n\n“那天楼里那么多人，知夏心情又不好。你们现在把所有事推到我身上，是因为我最像那个该负责的人。”\n\n林舟问：“你怎么知道照片模糊？”\n\n电话那头没有立刻回答。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch10_006",
      "note": "周屿失言"
    },
    "ch10_006": {
      "nodeId": "ch10_006",
      "chapterId": "chapter_10",
      "chapterTitle": "第 10 章：周屿来电",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 周屿 / 林舟",
      "speaker": "许知晚",
      "text": "门外的许知晚忽然开口。\n\n“周屿。”\n\n电话那头的呼吸明显顿了一下。\n\n许知晚隔着门板，一字一句地说：\n\n“你还记得我姐姐出事前，她最后问你的那句话吗？”\n\n周屿没有说话。\n\n雨声填满了沉默。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch10_007",
      "note": "三方对峙"
    },
    "ch10_007": {
      "nodeId": "ch10_007",
      "chapterId": "chapter_10",
      "chapterTitle": "第 10 章：周屿来电",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "“林舟，把照片删了。”\n\n周屿终于不再绕弯。\n\n“我不是威胁你。我是在救你。”\n\n“你以为许知晚只想要真相？她会拿着那张照片把所有人都拖回三年前。你、我、知夏，谁都不会好过。”\n\n林舟忽然明白，他最怕的不是许知晚。\n\n是照片。",
      "gainClues": [],
      "setFlags": [
        "suspected_zhou"
      ],
      "choices": [],
      "nextNodeId": "ch10_008",
      "note": "周屿露出恐惧"
    },
    "ch10_008": {
      "nodeId": "ch10_008",
      "chapterId": "chapter_10",
      "chapterTitle": "第 10 章：周屿来电",
      "type": "dialogue",
      "scene": "rental_room_rain_night",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟把手机放到桌上，开了免提。\n\n门外的许知晚，电话里的周屿，聊天框里的陈妍，都在等她下一步。\n\n就在这时，楼道灯啪地暗了一下，又亮起。\n\n像有人经过。\n\n许知晚忽然压低声音：“林舟，楼梯口有人。”",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch11_001",
      "note": "章节钩子，第二个人脚步声预备"
    },
    "ch11_001": {
      "nodeId": "ch11_001",
      "chapterId": "chapter_11",
      "chapterTitle": "第 11 章：选择相信谁",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "旁白",
      "text": "楼道里响起脚步声。\n\n不快，不慢。\n\n像有人踩着积水，一层一层往上走。\n\n许知晚退了一步，影子从猫眼里偏开。\n\n林舟听见她的呼吸变急。\n\n电话里的周屿却安静下来。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch11_002",
      "note": "楼道压力开始"
    },
    "ch11_002": {
      "nodeId": "ch11_002",
      "chapterId": "chapter_11",
      "chapterTitle": "第 11 章：选择相信谁",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "陈妍 / 林舟",
      "speaker": "陈妍",
      "text": "陈妍发来消息：\n\n【我已经把你发我的截图存下来了。】\n\n【但如果原照片没备份，清晰度可能不够。】\n\n【林舟，别当英雄。先保命，再保证据。】\n\n林舟看着“保证据”三个字，第一次觉得陈妍的吐槽像一根救命绳。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch11_003",
      "note": "备份重要性"
    },
    "ch11_003": {
      "nodeId": "ch11_003",
      "chapterId": "chapter_11",
      "chapterTitle": "第 11 章：选择相信谁",
      "type": "choice",
      "scene": "rental_room_table",
      "cast": "林舟 / 陈妍 / 许知晚 / 周屿",
      "speaker": "旁白",
      "text": "照片在桌上。\n\n原件只有一张。\n\n周屿要她删掉。\n\n许知晚要她交出来。\n\n陈妍要她先备份。\n\n林舟忽然意识到，自己不是在选择相信谁。\n\n她是在选择让证据活下来，还是让三年前继续沉下去。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "立刻拍照并发送给陈妍备份",
          "nextNodeId": "ch11_004",
          "setFlags": [
            "backed_up_photo"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "把原始照片从门缝交给许知晚",
          "nextNodeId": "ch11_004",
          "setFlags": [
            "gave_original_photo",
            "trusted_zhuwan_early"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "听周屿的话，删除手机里的照片备份",
          "nextNodeId": "ch11_004",
          "setFlags": [
            "deleted_evidence"
          ],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "第 11 章关键选择，决定结局倾向"
    },
    "ch11_004": {
      "nodeId": "ch11_004",
      "chapterId": "chapter_11",
      "chapterTitle": "第 11 章：选择相信谁",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "许知晚 / 林舟",
      "speaker": "许知晚",
      "text": "“林舟。”\n\n许知晚的声音第一次带上明显的哽咽。\n\n“我知道我不该逼你。我也知道，我今天这样出现，很像一个麻烦。”\n\n“可是我姐姐死的时候，所有人都说算了。警方说意外，学校说遗憾，朋友说节哀。”\n\n“我只有一句不算证据的‘我不信’。”",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch11_005",
      "note": "许知晚不是反派"
    },
    "ch11_005": {
      "nodeId": "ch11_005",
      "chapterId": "chapter_11",
      "chapterTitle": "第 11 章：选择相信谁",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "周屿轻声说：“你要是把照片交出去，事情就回不了头了。”\n\n林舟问：“你怕什么？”\n\n周屿笑了一声。\n\n“我怕你后悔。”\n\n“你最擅长后悔了，不是吗？”\n\n这句话像一枚针，准确扎进林舟三年的沉默。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch11_006",
      "note": "周屿攻击林舟愧疚"
    },
    "ch11_006": {
      "nodeId": "ch11_006",
      "chapterId": "chapter_11",
      "chapterTitle": "第 11 章：选择相信谁",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "旁白 / 许知晚 / 林舟",
      "speaker": "旁白",
      "text": "楼道灯灭了。\n\n不是闪烁。\n\n是整个楼道突然陷进黑暗。\n\n下一秒，门外传来第二个人的脚步声。\n\n许知晚压低声音：“不是房东。”\n\n林舟听见门把手轻轻响了一下。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch11_007",
      "note": "第 11 章小高潮，强制要求节点"
    },
    "ch11_007": {
      "nodeId": "ch11_007",
      "chapterId": "chapter_11",
      "chapterTitle": "第 11 章：选择相信谁",
      "type": "dialogue",
      "scene": "corridor_door",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "林舟没有尖叫。\n\n她把椅子慢慢拖到门后，抵住门板。\n\n木腿摩擦地面的声音很轻，却像在替她做一个迟到三年的决定。\n\n电话里的周屿说：“别做傻事。”\n\n林舟看着桌上的照片。\n\n“周屿，”她说，“你现在在哪？”",
      "gainClues": [],
      "setFlags": [
        "refused_zhou_pressure"
      ],
      "choices": [],
      "nextNodeId": "ch11_008",
      "note": "林舟开始主动反击"
    },
    "ch11_008": {
      "nodeId": "ch11_008",
      "chapterId": "chapter_11",
      "chapterTitle": "第 11 章：选择相信谁",
      "type": "dialogue",
      "scene": "phone_call_ui",
      "cast": "周屿 / 林舟",
      "speaker": "周屿",
      "text": "电话那头没有回答。\n\n楼道里的脚步声也停了。\n\n两种沉默叠在一起，几乎让人分不清哪个更近。\n\n林舟把照片翻到正面。\n\n许知夏站在三年前的阳光里，看着她。\n\n林舟终于按下录音键。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch12_001",
      "note": "进入最终推理"
    },
    "ch12_001": {
      "nodeId": "ch12_001",
      "chapterId": "chapter_12",
      "chapterTitle": "第 12 章：无人接听",
      "type": "dialogue",
      "scene": "rental_room_rain_night",
      "cast": "林舟 / 旁白",
      "speaker": "旁白",
      "text": "雨还在下。\n\n但林舟忽然觉得，真正让人听不清的不是雨声。\n\n是三年来所有人都选择不说的那些话。\n\n许知夏留下了声音。\n\n许知晚带来了旧手机。\n\n陈妍查到了旧新闻。\n\n照片拍下了周屿。\n\n现在，轮到林舟回答。",
      "gainClues": [],
      "setFlags": [],
      "choices": [],
      "nextNodeId": "ch12_002",
      "note": "最终推理开场"
    },
    "ch12_002": {
      "nodeId": "ch12_002",
      "chapterId": "chapter_12",
      "chapterTitle": "第 12 章：无人接听",
      "type": "deduction",
      "scene": "rental_room_table",
      "cast": "林舟 / 旁白",
      "speaker": "系统",
      "text": "最终推理 Q1：死去三年的许知夏为什么会来电？",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "许知晚重新开机旧手机后，旧语音备忘或云端记录被触发",
          "nextNodeId": "ch12_003",
          "setFlags": [
            "understood_dead_call"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "许知夏真的以灵异方式打来电话",
          "nextNodeId": "ch12_003",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "周屿提前伪造了整通原始来电",
          "nextNodeId": "ch12_003",
          "setFlags": [],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "正确方向对应 clue_dead_call、clue_old_phone、clue_timed_voice"
    },
    "ch12_003": {
      "nodeId": "ch12_003",
      "chapterId": "chapter_12",
      "chapterTitle": "第 12 章：无人接听",
      "type": "deduction",
      "scene": "corridor_door",
      "cast": "林舟 / 旁白",
      "speaker": "系统",
      "text": "最终推理 Q2：门外女人最可能是谁？",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "许知夏的妹妹许知晚，但她隐瞒了部分调查目的",
          "nextNodeId": "ch12_004",
          "setFlags": [
            "verified_zhuwan_identity"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "冒充许知夏的陌生人",
          "nextNodeId": "ch12_004",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "周屿安排来取照片的人",
          "nextNodeId": "ch12_004",
          "setFlags": [],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "正确方向对应 clue_door_woman、clue_sister_mark"
    },
    "ch12_004": {
      "nodeId": "ch12_004",
      "chapterId": "chapter_12",
      "chapterTitle": "第 12 章：无人接听",
      "type": "deduction",
      "scene": "old_chat_memory",
      "cast": "林舟 / 旁白",
      "speaker": "系统",
      "text": "最终推理 Q3：三年前许知夏为什么会死？",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "她发现周屿冒用信息借贷并准备报警",
          "nextNodeId": "ch12_005",
          "setFlags": [
            "found_gray_loan"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "她长期情绪低落，主动走向意外",
          "nextNodeId": "ch12_005",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "许知晚为了查案夸大了旧事",
          "nextNodeId": "ch12_005",
          "setFlags": [],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "正确方向对应 clue_gray_loan"
    },
    "ch12_005": {
      "nodeId": "ch12_005",
      "chapterId": "chapter_12",
      "chapterTitle": "第 12 章：无人接听",
      "type": "deduction",
      "scene": "photo_zoom_view",
      "cast": "林舟 / 旁白",
      "speaker": "系统",
      "text": "最终推理 Q4：最后一张合照的关键价值是什么？",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "背景拍到周屿出现在案发楼道附近",
          "nextNodeId": "ch12_006",
          "setFlags": [
            "found_photo_background"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "证明林舟和许知夏曾经关系很好",
          "nextNodeId": "ch12_006",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "证明许知晚长得像许知夏",
          "nextNodeId": "ch12_006",
          "setFlags": [],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "正确方向对应 clue_last_photo、clue_photo_background"
    },
    "ch12_006": {
      "nodeId": "ch12_006",
      "chapterId": "chapter_12",
      "chapterTitle": "第 12 章：无人接听",
      "type": "deduction",
      "scene": "phone_call_ui",
      "cast": "林舟 / 旁白",
      "speaker": "系统",
      "text": "最终推理 Q5：周屿当前最想阻止什么？",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "阻止林舟和许知晚保留并提交照片证据",
          "nextNodeId": "ch12_007",
          "setFlags": [
            "suspected_zhou"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "阻止许知晚继续打扰林舟生活",
          "nextNodeId": "ch12_007",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "阻止陈妍误会大学旧友",
          "nextNodeId": "ch12_007",
          "setFlags": [],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "正确方向对应 clue_zhou_left、clue_photo_background"
    },
    "ch12_007": {
      "nodeId": "ch12_007",
      "chapterId": "chapter_12",
      "chapterTitle": "第 12 章：无人接听",
      "type": "choice",
      "scene": "rental_room_table",
      "cast": "林舟 / 许知晚 / 周屿 / 陈妍",
      "speaker": "旁白",
      "text": "推理结束了。\n\n可选择才刚刚开始。\n\n照片、旧手机记录、陈妍查到的资料，都像被雨水打湿的火柴。\n\n点得着，就能照亮三年前。\n\n点不着，它们只会在这个雨夜里冷下去。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "备份所有证据，选择重启旧案",
          "nextNodeId": "ch12_008",
          "setFlags": [
            "backed_up_photo",
            "chose_reopen_case"
          ],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "把原始照片交给许知晚，让她带走",
          "nextNodeId": "ch12_008",
          "setFlags": [
            "gave_original_photo"
          ],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "删除照片，结束这一切",
          "nextNodeId": "ch12_008",
          "setFlags": [
            "deleted_evidence"
          ],
          "gainClues": []
        },
        {
          "choiceId": "d",
          "label": "选项 D",
          "text": "什么都不做，挂断所有电话",
          "nextNodeId": "ch12_008",
          "setFlags": [],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "最终结局分流选择"
    },
    "ch12_008": {
      "nodeId": "ch12_008",
      "chapterId": "chapter_12",
      "chapterTitle": "第 12 章：无人接听",
      "type": "ending",
      "scene": "ending_screen",
      "cast": "系统",
      "speaker": "系统",
      "text": "根据已获得线索、关键变量和最终选择进入结局。\n\nA 结局需要：clue_last_photo、clue_photo_background、clue_gray_loan、clue_zhou_left、clue_timed_voice，且 backed_up_photo = true，chose_reopen_case = true。\n\nB 结局在证据未备份、身份核验不足或来电机制未理解时，选择交出原始照片触发。\n\nC 结局在 deleted_evidence = true 且没有备份时触发。\n\n其余证据不足或逃避调查进入 D 结局。",
      "gainClues": [],
      "setFlags": [],
      "choices": [
        {
          "choiceId": "a",
          "label": "选项 A",
          "text": "进入 A 结局：真相重启",
          "nextNodeId": "ending_a",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "b",
          "label": "选项 B",
          "text": "进入 B 结局：证据失控",
          "nextNodeId": "ending_b",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "c",
          "label": "选项 C",
          "text": "进入 C 结局：删除证据",
          "nextNodeId": "ending_c",
          "setFlags": [],
          "gainClues": []
        },
        {
          "choiceId": "d",
          "label": "选项 D",
          "text": "进入 D 结局：无人接听",
          "nextNodeId": "ending_d",
          "setFlags": [],
          "gainClues": []
        }
      ],
      "nextNodeId": null,
      "note": "开发时由条件判断自动跳转，不展示全部选项"
    }
  },
  "endings": {
    "ending_a": {
      "endingId": "ending_a",
      "nodeId": "ending_a",
      "type": "ending",
      "scene": "ending_screen",
      "title": "真相重启",
      "speaker": "旁白",
      "text": "林舟把照片、录音、借贷截图和周屿的通话录音一起发给陈妍。\n\n发送成功的提示弹出来时，她才发现自己的手一直在抖。\n\n门外的许知晚没有立刻说谢谢。她只是靠着墙慢慢蹲下去，像终于允许自己累一会儿。\n\n周屿的电话还在打来。\n\n林舟看着屏幕，第一次没有逃。\n\n她按下挂断。\n\n雨快停时，陈妍发来消息：【我陪你们去。】\n\n旧案不会在这一夜结束。\n\n但它终于重新开始。\n\n凌晨 3:12，一个没有署名的语音文件出现在林舟手机里。里面只有雨声，和一声很轻的呼吸。"
    },
    "ending_b": {
      "endingId": "ending_b",
      "nodeId": "ending_b",
      "type": "ending",
      "scene": "ending_screen",
      "title": "证据失控",
      "speaker": "旁白",
      "text": "林舟把原始照片从门缝递出去。\n\n许知晚接过照片时，指尖冰凉。\n\n“我会保护好它。”她说。\n\n林舟相信她。\n\n可半小时后，周屿发来一张截图。\n\n那张照片被压缩得模糊不清，背景里的人影几乎看不出来。\n\n【你看，】周屿写道，【这就是所谓证据。】\n\n许知晚没有恶意。\n\n林舟也没有。\n\n但证据一旦失去原件、备份和清晰链路，就像被雨水冲散的脚印，再也踩不回原来的形状。"
    },
    "ending_c": {
      "endingId": "ending_c",
      "nodeId": "ending_c",
      "type": "ending",
      "scene": "ending_screen",
      "title": "删除证据",
      "speaker": "旁白",
      "text": "林舟点下删除。\n\n系统问她是否确认。\n\n她盯着那两个按钮，看了很久。\n\n周屿在电话里轻声说：“这样对大家都好。”\n\n她按下确认。\n\n照片从屏幕上消失的一瞬间，房间安静得可怕。\n\n门外的许知晚没有再敲门。\n\n第二天，雨停了。林舟照常上班，照常改文档，照常在茶水间听同事抱怨天气。\n\n只有夜里闭上眼时，她总会想起许知夏那句没说完的话。\n\n周屿他……"
    },
    "ending_d": {
      "endingId": "ending_d",
      "nodeId": "ending_d",
      "type": "ending",
      "scene": "ending_screen",
      "title": "无人接听",
      "speaker": "旁白",
      "text": "林舟没有开门。\n\n没有接周屿后来的电话。\n\n也没有再翻那只纸箱。\n\n她把手机调成勿扰，坐在椅子上等天亮。\n\n雨在凌晨四点停了。楼道恢复安静，像什么都没有发生。\n\n早上七点，林舟被闹钟叫醒。\n\n手机屏幕上有一通未接来电。\n\n来电人：许知夏。\n\n林舟盯着它，直到屏幕慢慢暗下去。\n\n这一次，她没有回拨。\n\n屏幕上只剩四个字。\n\n无人接听。"
    }
  }
};
