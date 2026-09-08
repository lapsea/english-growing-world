import type { WritingTask } from '../types'

// ===== 写作任务（人教版七年级上册）=====

export const writingTasks: WritingTask[] = [
  {
    id: 'wt1',
    unitId: 'u2',
    title: '用一张照片介绍你的全家',
    prompt:
      '你的英语老师让大家带一张全家福并向同学介绍家人。请写一篇 50 词左右的短文，描述照片上的人以及他们的职业和爱好。',
    requirements: [
      '用 This is... 句型逐位介绍照片上的家人',
      '写出至少 1 位家人的职业和 1 位家人的爱好',
      "用上名词所有格 's，如 my father's name",
      '条理清晰，不少于 50 词',
    ],
    usefulWords: [
      { en: 'family', zh: '家庭；家人' },
      { en: 'photo', zh: '照片' },
      { en: 'doctor', zh: '医生' },
      { en: 'love', zh: '爱；喜爱' },
      { en: 'happy', zh: '幸福的；高兴的' },
      { en: 'help', zh: '帮助' },
    ],
    patterns: [
      { pattern: 'This is my...', zh: '这是我的…' },
      { pattern: 'He/She is a...', zh: '他/她是一名…' },
      { pattern: "My father's name is...", zh: '我爸爸的名字叫…' },
      { pattern: 'We love...', zh: '我们喜爱…' },
    ],
    structure: [
      {
        step: '开头',
        detail: '点明照片：用 This is a photo of my family. 引出全家福话题，总说家里有几口人。',
      },
      {
        step: '中间 1',
        detail: '介绍爸爸：用 This is my father. 开头，写出他的职业和爱好，如 He is a doctor. He likes reading.',
      },
      {
        step: '中间 2',
        detail: '介绍妈妈和其他家人：继续用 This is my mother... 逐位介绍，写出她们的职业或爱好。',
      },
      {
        step: '结尾',
        detail: '表达感情：用 I love my family. We are happy together. 等句子收尾。',
      },
    ],
    sample: {
      text: [
        'This is a photo of my family. There are four people in it.',
        "This is my father. My father's name is Li Wei. He is a doctor. He likes reading. This is my mother. She is a teacher. My mother's hobby is singing.",
        'This is my little sister Kate. She is five. She likes playing with her cat. I often help her at home.',
        'I love my family. We are happy together.',
      ],
      comment:
        '范文结构完整：开头总说照片，中间用 This is... 逐位介绍家人，结尾表达感情，条理清晰。"My father\'s name is Li Wei." 和 "My mother\'s hobby is singing." 两处名词所有格用得准确，"He is a doctor." 也清楚写出了职业。可改进：介绍妹妹时可以再补一句 She is cute. 让人物更生动；结尾若加一句 We often help each other，感情会更饱满。',
      score: 92,
    },
  },
  {
    id: 'wt2',
    unitId: 'u6',
    title: '写一写你的学校一天',
    prompt:
      '校刊 English Corner 征稿：介绍你的一天。请用一般现在时写一篇 60 词左右的短文，按时间顺序写出你从起床到睡前的活动。',
    requirements: [
      '按时间顺序写出从起床到睡前的活动',
      '全部使用陈述句，不要使用 what time / when 开头的问句',
      '至少写出 3 个时间表达，如 at six thirty',
      '使用一般现在时，不少于 60 词',
    ],
    usefulWords: [
      { en: 'get up', zh: '起床' },
      { en: 'breakfast', zh: '早餐' },
      { en: 'start', zh: '开始' },
      { en: 'finish', zh: '结束；完成' },
      { en: 'homework', zh: '家庭作业' },
      { en: 'go to bed', zh: '上床睡觉' },
    ],
    patterns: [
      { pattern: 'I get up at...', zh: '我……点起床' },
      { pattern: 'School starts at...', zh: '……点开始上课' },
      { pattern: 'After school, I...', zh: '放学后我……' },
      { pattern: 'I go to bed at...', zh: '我……点睡觉' },
    ],
    structure: [
      {
        step: '开头',
        detail: '点明主题：用一句总起，如 My school day is busy but happy.',
      },
      {
        step: '早晨',
        detail: '写起床与上学：I get up at six thirty. Then I have breakfast and go to school.',
      },
      {
        step: '白天与放学后',
        detail: '写上课和课后安排：School starts at eight. After school, I play basketball / do my homework.',
      },
      {
        step: '结尾',
        detail: '写晚上的安排并收尾：I go to bed at nine thirty. What a nice day!',
      },
    ],
    sample: {
      text: [
        'My school day is busy but happy.',
        'I get up at six thirty in the morning. Then I have breakfast at seven. I go to school at seven thirty.',
        'School starts at eight. I have four classes in the morning. School finishes at five. After school, I play basketball with my friends. Then I do my homework.',
        'I go to bed at nine thirty. What a nice day!',
      ],
      comment:
        '范文按"起床—早饭—上学—上课—放学后—睡觉"的时间顺序展开，脉络清楚。"I get up at six thirty""School starts at eight""I go to bed at nine thirty" 等时间表达准确丰富，动词全部使用一般现在时，并用 After school, I... 使句式有变化。可改进：中间可补一句 I have lunch at twelve at school，让时间线更完整；结尾加一句 I love my school day，更能点明感情。',
      score: 90,
    },
  },
  {
    id: 'wt3',
    unitId: 'u1',
    title: '写一张自我介绍卡交新朋友',
    prompt:
      '开学初，班级要办英语角"朋友圈"展示墙。请写一篇 50 词左右的自我介绍，让大家认识你，并说一说你想交什么样的朋友。',
    requirements: [
      "用 I'm... / My name is... 介绍自己的姓名",
      '写出你的年龄和来自的城市',
      '用 I like... 写出至少 2 个爱好',
      '说一说你想交什么样的朋友，不少于 50 词',
    ],
    usefulWords: [
      { en: 'student', zh: '学生' },
      { en: 'name', zh: '名字' },
      { en: 'from', zh: '来自' },
      { en: 'like', zh: '喜欢' },
      { en: 'friend', zh: '朋友' },
      { en: 'favourite', zh: '最喜爱的' },
    ],
    patterns: [
      { pattern: 'My name is... / I am...', zh: '我叫……' },
      { pattern: "I'm ... years old.", zh: '我……岁了' },
      { pattern: "I'm from...", zh: '我来自……' },
      { pattern: 'I like... and I want to...', zh: '我喜欢……，我想……' },
    ],
    structure: [
      {
        step: '开头',
        detail: '打招呼并报上姓名和班级：Hello! My name is Li Ming. I am a new student in Class 3, Grade 7.',
      },
      {
        step: '基本信息',
        detail: '介绍年龄和家乡：I am twelve years old. I am from Hangzhou, a beautiful city.',
      },
      {
        step: '爱好',
        detail: '写出自己喜欢的活动：I like playing football and reading books.',
      },
      {
        step: '结尾',
        detail: '说出交友心愿：I want to make friends with you. Let\'s be friends!',
      },
    ],
    sample: {
      text: [
        'Hello, everyone! My name is Li Ming. I am a new student in Class 3, Grade 7.',
        "I'm twelve years old, and I'm from Hangzhou, a beautiful city in China.",
        'I like playing football and reading books. I play football with my friends every weekend, and I read storybooks every evening.',
        "I want to make friends with boys and girls who like sports too. Let's be friends!",
      ],
      comment:
        '范文开头打招呼并自我介绍，中间按"姓名—年龄—家乡—爱好"的顺序展开，条理清楚。"I\'m twelve years old, and I\'m from Hangzhou." 信息完整，"I like playing football and reading books." 写出了两个爱好。可改进：结尾可以再补一句 Welcome to my home! 让交友心愿更具体；爱好若加一句原因（because it makes me happy）会更生动。',
      score: 91,
    },
  },
  {
    id: 'wt4',
    unitId: 'u3',
    title: '带客人参观我们的教室',
    prompt:
      '家长开放日快到了，你要用英语向前来参观的家长介绍你们的教室。请用 there be 句型写一篇 50 词左右的短文，介绍教室里的物品和它们的位置。',
    requirements: [
      '至少使用 3 次 There is / There are 句型',
      '用上 at least 2 个方位词，如 in, on, under, next to',
      '写出教室里的 3 种以上物品',
      '表达你对教室的感情，不少于 50 词',
    ],
    usefulWords: [
      { en: 'classroom', zh: '教室' },
      { en: 'desk', zh: '课桌' },
      { en: 'chair', zh: '椅子' },
      { en: 'blackboard', zh: '黑板' },
      { en: 'computer', zh: '电脑' },
      { en: 'map', zh: '地图' },
    ],
    patterns: [
      { pattern: 'There is a/an... in/on...', zh: '在……有（一个）……' },
      { pattern: 'There are ... in/on...', zh: '在……有（多个）……' },
      { pattern: '... is next to...', zh: '……紧挨着……' },
      { pattern: 'I love our classroom because...', zh: '我爱我们的教室，因为……' },
    ],
    structure: [
      {
        step: '开头',
        detail: '总说教室：Welcome to our classroom! It is big and clean.',
      },
      {
        step: '中间 1',
        detail: '介绍前面的物品：There is a blackboard on the front wall. The teacher\'s desk is next to it.',
      },
      {
        step: '中间 2',
        detail: '介绍其他物品与位置：There are forty desks and chairs. My schoolbag is under my chair.',
      },
      {
        step: '结尾',
        detail: '表达感情：I love our classroom. It is a warm home for us.',
      },
    ],
    sample: {
      text: [
        'Welcome to our classroom! It is big and clean.',
        "There is a big blackboard on the front wall, and the teacher's desk is next to it. There is a computer on the teacher's desk.",
        'There are forty desks and chairs in the room. My desk is near the window. There are many books on it, and my schoolbag is under my chair.',
        'I love our classroom. It is a warm home for all of us.',
      ],
      comment:
        '范文按"总—分—总"的结构介绍教室：开头总说教室又大又干净，中间用 There is / There are 依次介绍黑板、讲台、电脑和课桌椅，结尾表达对教室的喜爱。方位词 on, next to, near, under 用得准确。可改进：可以再写一句墙上的地图或图画（There is a map of China on the wall），让教室更具体；结尾若加 We keep it clean and tidy every day，更能体现爱护教室。',
      score: 92,
    },
  },
  {
    id: 'wt5',
    unitId: 'u4',
    title: '我最喜欢的科目',
    prompt:
      '校刊"我喜爱的科目"专栏征稿。请写一篇 50 词左右的短文，介绍你最喜欢的科目，并用 because 说明喜欢的理由。',
    requirements: [
      '写出你最喜欢的科目是什么',
      '用 because 写出至少 2 个喜欢的理由',
      '用 and 或 but 连接句子至少 1 次',
      '不少于 50 词',
    ],
    usefulWords: [
      { en: 'subject', zh: '科目' },
      { en: 'favourite', zh: '最喜爱的' },
      { en: 'interesting', zh: '有趣的' },
      { en: 'useful', zh: '有用的' },
      { en: 'teacher', zh: '老师' },
      { en: 'science', zh: '科学' },
    ],
    patterns: [
      { pattern: 'My favourite subject is...', zh: '我最喜欢的科目是……' },
      { pattern: 'I like it because...', zh: '我喜欢它，因为……' },
      { pattern: 'It is ... and ...', zh: '它既……又……' },
      { pattern: '... is a little difficult, but...', zh: '……虽然有点难，但是……' },
    ],
    structure: [
      {
        step: '开头',
        detail: '点明科目：My favourite subject is science.',
      },
      {
        step: '理由 1',
        detail: '用 because 写出第一个理由：I like it because science helps me know more about the world.',
      },
      {
        step: '理由 2',
        detail: '再写一个理由，可用 and / but 连接：Science is a little difficult, but it is really interesting.',
      },
      {
        step: '结尾',
        detail: '表达心愿：I want to be a scientist one day, so I will work hard at it.',
      },
    ],
    sample: {
      text: [
        'My favourite subject is science.',
        'I like it because science helps me know more about the world. Why is the sky blue? Why do leaves fall in autumn? Science tells me the answers.',
        'Science is a little difficult, but it is really interesting. The experiments in the science class are fun, and our teacher is very kind. She often helps us after class.',
        'I want to be a scientist one day, so I will work hard at it.',
      ],
      comment:
        '范文开头直接点明最喜欢的科目，中间用两个 because 写出喜欢的理由——科学帮助认识世界、课程有趣，理由具体真实。"Science is a little difficult, but it is really interesting." 一句用 but 转折，句式有变化。可改进：结尾可以加一句 I have science on Monday and Thursday，写出和科学课相关的小细节；理由若再联系生活（如周末去科技馆）会更有个人特色。',
      score: 91,
    },
  },
  {
    id: 'wt6',
    unitId: 'u5',
    title: '为你的社团写一篇招新海报',
    prompt:
      '学校社团节到了，请你为自己喜欢的社团写一则 50 词左右的英文招新海报，用 can 介绍社团成员能做的事情，吸引同学们加入。',
    requirements: [
      '写出社团的名字和活动时间',
      '用 can 写出至少 3 个社团里能做的事情',
      "用 Come and... / Join us! 等句子发出邀请",
      '不少于 50 词',
    ],
    usefulWords: [
      { en: 'club', zh: '社团' },
      { en: 'join', zh: '加入' },
      { en: 'sing', zh: '唱歌' },
      { en: 'dance', zh: '跳舞' },
      { en: 'wonderful', zh: '精彩的' },
      { en: 'welcome', zh: '欢迎' },
    ],
    patterns: [
      { pattern: 'Welcome to the ... Club!', zh: '欢迎来到……社！' },
      { pattern: 'You can ... here.', zh: '在这里你可以……' },
      { pattern: 'We meet every ...', zh: '我们每周……活动' },
      { pattern: "Come and join us!", zh: '快来加入我们吧！' },
    ],
    structure: [
      {
        step: '开头',
        detail: '热情招呼并亮出社团名字：Do you like music? Welcome to the Music Club!',
      },
      {
        step: '中间 1',
        detail: '介绍活动时间：We meet every Friday afternoon from 4:00 to 5:00 in the music room.',
      },
      {
        step: '中间 2',
        detail: '用 can 写出能做的事情：Here you can sing songs, dance and play the guitar.',
      },
      {
        step: '结尾',
        detail: '发出邀请：Come and join us! Let\'s have fun together!',
      },
    ],
    sample: {
      text: [
        'Do you like music? Do you want to make new friends? Welcome to the Music Club!',
        "We meet every Friday afternoon from 4:00 to 5:00 in the music room. You don't need to be a good singer — just come and enjoy music with us!",
        'In our club, you can sing beautiful songs, you can learn to dance, and you can play the guitar with your friends. Every term, we also sing at the school show.',
        "Come and join us now! Let's make wonderful music together!",
      ],
      comment:
        '范文是一则格式完整的招新海报：开头用两个问句吸引同学注意，中间交代活动时间，连用三个 You can... 写出社团里能做的事情，结尾发出邀请，号召力强。"You don\'t need to be a good singer" 一句打消了同学们的顾虑，很贴心。可改进：可以加一句报名地点（如 Find us in Classroom 2A），让海报更实用；开头也可点出社团获得的荣誉，增强吸引力。',
      score: 93,
    },
  },
  {
    id: 'wt7',
    unitId: 'u7',
    title: '写一写你的生日聚会',
    prompt:
      '上个月你度过了一个难忘的生日。请用英语写一篇 50 词左右的短文，介绍你的生日日期和聚会上的活动，和大家分享你的快乐。',
    requirements: [
      '用序数词写出你的生日日期，如 My birthday is on June the first',
      '写出聚会上的 2-3 个活动',
      '写出收到礼物或吃到蛋糕等细节',
      '表达快乐或感谢的心情，不少于 50 词',
    ],
    usefulWords: [
      { en: 'birthday', zh: '生日' },
      { en: 'party', zh: '聚会' },
      { en: 'cake', zh: '蛋糕' },
      { en: 'present', zh: '礼物' },
      { en: 'candle', zh: '蜡烛' },
      { en: 'happy', zh: '快乐的' },
    ],
    patterns: [
      { pattern: 'My birthday is on...', zh: '我的生日在……' },
      { pattern: 'We ... at the party.', zh: '我们在聚会上……' },
      { pattern: '... makes me happy.', zh: '……让我开心' },
      { pattern: 'Thank you for...', zh: '谢谢你们的……' },
    ],
    structure: [
      {
        step: '开头',
        detail: '点明生日日期：My birthday is on October the tenth. It is my favourite day of the year.',
      },
      {
        step: '中间 1',
        detail: '写聚会和活动：I have a birthday party at home. We sing, dance and play games.',
      },
      {
        step: '中间 2',
        detail: '写蛋糕和礼物：We eat the birthday cake with twelve candles. My friends give me nice presents.',
      },
      {
        step: '结尾',
        detail: '表达感谢和快乐：What a happy day! Thank you for everything.',
      },
    ],
    sample: {
      text: [
        'My birthday is on October the tenth. It is my favourite day of the year.',
        'This year, I have a birthday party at home. My friends Anna, Ben and Cindy all come. We sing the birthday song, dance and play fun games together.',
        'Mum cooks long noodles for me. Then we eat the big birthday cake with twelve candles. My friends give me nice presents — a book, a football and a model plane. I like them very much.',
        'What a happy day! Thank you for everything, my dear family and friends.',
      ],
      comment:
        '范文开头用序数词清楚写出生日日期，中间按顺序写朋友们来参加聚会、唱歌跳舞做游戏、吃长寿面和生日蛋糕、收礼物等活动，内容丰富有序。结尾用感叹句和感谢句表达快乐的心情。可改进：可以写一写许愿的细节（I make a wish before blowing out the candles）；若把收到的礼物和自己的爱好联系起来（如 I love football, so I like the football best），文章会更真实动人。',
      score: 92,
    },
  },
]
