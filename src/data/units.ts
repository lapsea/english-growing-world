// ===== 人教版（2024）英语七年级上册单元数据 =====
// 单元顺序、标题、页码、语音 / 语法 / 项目结构严格对照教材目录：
// 3 个 Starter Unit（预备单元）+ 7 个正式单元，共 10 个单元。

import type { Unit } from '../types';

export const units: Unit[] = [
  // ---------- Starter Unit 1 Hello! ----------
  {
    id: 'su1',
    kind: 'starter',
    order: 1,
    title: 'Hello!',
    titleZh: '你好！',
    bigQuestion: 'How do you greet people?',
    bigIdea: '',
    page: 1,
    color: 'blue',
    pronunciation: '26个字母的读音',
    goals: [
      '能正确认读并规范书写 26 个英语字母，读准每个字母的发音',
      '能用 Hi. / Hello. / Good morning. 等 6 种方式打招呼并作出回应',
      '能询问别人的姓名，并用 How do you spell your name? 拼出自己的名字',
      '能借助英语词典查询单词，初步学会使用词典',
    ],
    themeContext: '人与自我——初入中学校园，用英语大方地打招呼、介绍自己，开启崭新的英语学习之旅。',
    phrases: [
      { id: 'ph-su1-1', en: 'Good morning', zh: '早上好' },
      { id: 'ph-su1-2', en: 'Nice to meet you', zh: '很高兴认识你' },
      { id: 'ph-su1-3', en: 'How are you?', zh: '你好吗？' },
      { id: 'ph-su1-4', en: 'spell your name', zh: '拼写你的名字' },
    ],
    grammar: {
      title: '日常问候与介绍',
      points: [
        {
          name: '问候与回应 (Greetings and responses)',
          explain:
            "英语里打招呼要看时间和场合。Good morning. 用于早上，Good afternoon. 用于下午。How are you? 是在问候对方的近况，回答可以说 I'm fine, thank you.，再补一句 And you? 礼貌又自然。",
          examples: [
            { en: 'Good morning, Miss Gao!', zh: '早上好，高老师！' },
            { en: "How are you? — I'm fine, thank you.", zh: '你好吗？——我很好，谢谢。' },
            { en: 'Nice to meet you. — Nice to meet you, too.', zh: '很高兴认识你。——我也很高兴认识你。' },
          ],
        },
        {
          name: '询问姓名与拼写 (Asking about names and spelling)',
          explain:
            "What's your name? 用来问对方的名字，回答用 My name is... 或 I'm...。想知道一个单词怎么拼，可以问 How do you spell it?，然后一个字母一个字母地拼读，注意首字母要大写。",
          examples: [
            { en: "What's your name? — My name is Peter.", zh: '你叫什么名字？——我叫彼得。' },
            { en: "I'm Ella. E-L-L-A.", zh: '我是艾拉。E-L-L-A。' },
            { en: 'How do you spell the word?', zh: '这个单词怎么拼写？' },
          ],
        },
      ],
    },
    listeningIds: ['lp1'],
    readingIds: [],
    writingTaskIds: [],
  },

  // ---------- Starter Unit 2 Keep Tidy! ----------
  {
    id: 'su2',
    kind: 'starter',
    order: 2,
    title: 'Keep Tidy!',
    titleZh: '保持整洁！',
    bigQuestion: 'What do you have?',
    bigIdea: '',
    page: 7,
    color: 'ice',
    pronunciation: '元音字母 a e i o u 的发音(1)',
    goals: [
      '能听懂并正确拼写 schoolbag、pencil、ruler、eraser 等学习用品名称',
      '能用 What do you have in your schoolbag? 询问他人有什么物品，并用 I have... 回答',
      '能用 in / on / under 准确描述物品的位置',
      '能通过描述物品的颜色和位置玩“猜猜它是什么”游戏',
    ],
    themeContext: '人与自我——整理自己的学习用品，养成保持整洁的好习惯，学会用英语谈论物品及其位置。',
    phrases: [
      { id: 'ph-su2-1', en: 'in the schoolbag', zh: '在书包里' },
      { id: 'ph-su2-2', en: 'on the desk', zh: '在桌子上' },
      { id: 'ph-su2-3', en: 'under the chair', zh: '在椅子下面' },
      { id: 'ph-su2-4', en: 'keep tidy', zh: '保持整洁' },
    ],
    grammar: {
      title: '物品与方位',
      points: [
        {
          name: '方位介词 in / on / under (Prepositions of place)',
          explain:
            'in 表示“在……里面”，on 表示“在……上面”，under 表示“在……下面”。它们放在名词前面，告诉我们东西在哪里。看图说话时选对介词，别人就能准确找到你的东西。',
          examples: [
            { en: 'My books are in the schoolbag.', zh: '我的书在书包里。' },
            { en: 'The cap is on the box.', zh: '帽子在盒子上面。' },
            { en: 'The pencil is under the chair.', zh: '铅笔在椅子下面。' },
          ],
        },
        {
          name: 'what 引导的特殊疑问句 (Wh-questions with what)',
          explain:
            "What do you have in your schoolbag? 用来问对方有什么东西，回答用 I have...。What colour is...? 用来问颜色，回答用 It's...。特殊疑问句不能用 Yes 或 No 回答，要说出具体内容。",
          examples: [
            { en: 'What do you have in your schoolbag?', zh: '你的书包里有什么？' },
            { en: 'I have two notebooks and a pencil box.', zh: '我有两个笔记本和一个铅笔盒。' },
            { en: "What colour is the cap? — It's yellow.", zh: '这顶帽子是什么颜色？——是黄色的。' },
          ],
        },
      ],
    },
    listeningIds: [],
    readingIds: [],
    writingTaskIds: [],
  },

  // ---------- Starter Unit 3 Welcome! ----------
  {
    id: 'su3',
    kind: 'starter',
    order: 3,
    title: 'Welcome!',
    titleZh: '欢迎！',
    bigQuestion: 'What is fun in a yard?',
    bigIdea: '',
    page: 13,
    color: 'lav',
    pronunciation: '元音字母 a e i o u 的发音(2)',
    goals: [
      '能听懂并说出 pig、rabbit、duck、tomato、apple 等常见动物和果蔬名称',
      '能用 What\'s this/that? What are these/those? 指认远近不同的事物',
      '能用 How many...? 询问数量，并用复数名词作出回答',
      '能设计并介绍自己的小农场，说清楚农场里有什么',
    ],
    themeContext: '人与自然——走进院子与农场，认识身边的动植物，感受田园生活的乐趣。',
    phrases: [
      { id: 'ph-su3-1', en: 'in the yard', zh: '在院子里' },
      { id: 'ph-su3-2', en: 'on the farm', zh: '在农场里' },
      { id: 'ph-su3-3', en: 'how many', zh: '多少（询问数量）' },
      { id: 'ph-su3-4', en: 'over there', zh: '在那边' },
    ],
    grammar: {
      title: '指认与数量',
      points: [
        {
          name: '指示代词 this / that / these / those (Demonstratives)',
          explain:
            "this 指离自己近的一个事物，that 指远处的一个事物；these 和 those 分别是它们的复数形式。回答 What's this/that? 时统一用 It's...，回答 What are these/those? 时用 They're...，不用管问句用的是近指还是远指。",
          examples: [
            { en: "What's this? — It's a tomato.", zh: '这是什么？——是一个西红柿。' },
            { en: "What's that? — It's a rabbit.", zh: '那是什么？——是一只兔子。' },
            { en: "What are those? — They're apple trees.", zh: '那些是什么？——是苹果树。' },
          ],
        },
        {
          name: 'How many...? 询问数量 (Asking about numbers with how many)',
          explain:
            'How many 后面接可数名词的复数形式，用来问“有多少”。例如 How many rabbits do they have? 回答可以说 They have ten rabbits. 注意名词要变成复数，多数在词尾加 -s 或 -es。',
          examples: [
            { en: 'How many rabbits do they have?', zh: '他们有多少只兔子？' },
            { en: 'They have twelve rabbits on the farm.', zh: '他们农场上有十二只兔子。' },
            { en: 'How many ducks can you see?', zh: '你能看见多少只鸭子？' },
          ],
        },
      ],
    },
    listeningIds: ['lp3'],
    readingIds: ['ra3'],
    writingTaskIds: [],
  },

  // ---------- Unit 1 You and Me ----------
  {
    id: 'u1',
    kind: 'unit',
    order: 4,
    title: 'You and Me',
    titleZh: '你和我',
    bigQuestion: 'How do we get to know each other?',
    bigIdea: 'How do we make new friends?',
    page: 19,
    color: 'brand',
    pronunciation: '/iː/ /ɪ/; /e/ /æ/; 缩读形式',
    goals: [
      '能用 be 动词介绍自己的姓名、年龄、班级和家乡等信息',
      '能正确使用 I、you、he、she、it、we、they 七个主格代词',
      '能听懂并区分 /iː/ 与 /ɪ/、/e/ 与 /æ/ 两组元音，读准缩读形式',
      '能制作一张英文个人简介卡，并向新同学介绍自己',
    ],
    themeContext: '人与社会——升入初中结识新朋友，学会介绍自己、了解他人，真诚地交上新朋友。',
    phrases: [
      { id: 'ph-u1-1', en: 'make friends', zh: '交朋友' },
      { id: 'ph-u1-2', en: 'be from', zh: '来自' },
      { id: 'ph-u1-3', en: 'full name', zh: '全名' },
      { id: 'ph-u1-4', en: 'get to know', zh: '认识；了解' },
    ],
    grammar: {
      title: '一般现在时（一）',
      points: [
        {
          name: '一般现在时：be 动词 (The simple present tense: be)',
          explain:
            "be 动词有 am、is、are 三种形式，意思是“是”，常用来介绍身份、年龄和来历。I 后面用 am，you / we / they 后面用 are，he / she / it 后面用 is。I am 可以缩写成 I'm，口语中更常用缩写形式。",
          examples: [
            { en: 'I am a student in Class 3, Grade 7.', zh: '我是七年级三班的一名学生。' },
            { en: 'She is my new friend Lisa.', zh: '她是我的新朋友丽莎。' },
            { en: 'We are in the same school.', zh: '我们在同一所学校。' },
          ],
        },
        {
          name: '主格代词 (Subject pronouns)',
          explain:
            '主格代词用来代替人或事物作主语，避免重复。I 指我，you 指你或你们，he / she / it 指他、她、它，we 指我们，they 指他们、她们或它们。注意 he 指男性、she 指女性，使用时别弄错。',
          examples: [
            { en: 'This is Mike. He is from England.', zh: '这是迈克，他来自英国。' },
            { en: 'Anna and I are classmates. We like our school.', zh: '安娜和我是同班同学，我们都喜欢我们的学校。' },
            { en: 'They are my teachers.', zh: '他们是我的老师们。' },
          ],
        },
      ],
    },
    listeningIds: ['lp2'],
    readingIds: ['ra1'],
    writingTaskIds: [],
  },

  // ---------- Unit 2 We're Family! ----------
  {
    id: 'u2',
    kind: 'unit',
    order: 5,
    title: "We're Family!",
    titleZh: '我们是全家！',
    bigQuestion: 'What is your family like?',
    bigIdea: 'What does family mean to you?',
    page: 27,
    color: 'coral',
    pronunciation: '/ɜː/ /ə/; /ʌ/ /ɑː/; 单词重读(1)',
    goals: [
      '能听懂并说出 father、mother、grandparents、cousin 等家庭成员名称',
      '能用实义动词的一般现在时介绍家人的日常活动',
      "能正确使用名词所有格 's 表示所属关系，如 my father's car",
      '能制作家庭树，并用英语介绍自己的家人',
    ],
    themeContext: '人与社会——介绍自己的家庭，感受家人的关爱与陪伴，体会家庭的意义。',
    phrases: [
      { id: 'ph-u2-1', en: 'family tree', zh: '家庭树；家谱' },
      { id: 'ph-u2-2', en: 'a photo of my family', zh: '一张全家福照片' },
      { id: 'ph-u2-3', en: 'have dinner together', zh: '一起吃晚饭' },
      { id: 'ph-u2-4', en: 'help each other', zh: '互相帮助' },
    ],
    grammar: {
      title: '一般现在时（二）',
      points: [
        {
          name: '一般现在时：实义动词 (The simple present tense: action verbs)',
          explain:
            '实义动词表示具体的动作或行为，如 like、have、play。主语是 I / you / we / they 时动词用原形；主语是 he / she / it 时动词要加 -s 或 -es。构成否定句和疑问句时要借助 do / does。',
          examples: [
            { en: 'My parents like music.', zh: '我父母喜欢音乐。' },
            { en: 'My sister plays the piano every day.', zh: '我妹妹每天弹钢琴。' },
            { en: 'Do you have any brothers or sisters?', zh: '你有兄弟姐妹吗？' },
          ],
        },
        {
          name: "名词所有格 (Possessive 's)",
          explain:
            "在名词后面加 's 可以表示“某人的”。单数人名后直接加 's，如 Tom's sister（汤姆的姐姐）；以 s 结尾的复数名词只加撇号，如 my parents' room（我父母的房间）。",
          examples: [
            { en: "This is my mother's car.", zh: '这是我妈妈的车。' },
            { en: "Lily's father is a doctor.", zh: '莉莉的爸爸是一名医生。' },
            { en: "That is my grandparents' house.", zh: '那是我爷爷奶奶的房子。' },
          ],
        },
      ],
    },
    listeningIds: [],
    readingIds: ['ra2'],
    writingTaskIds: ['wt1'],
  },

  // ---------- Unit 3 My School ----------
  {
    id: 'u3',
    kind: 'unit',
    order: 6,
    title: 'My School',
    titleZh: '我的学校',
    bigQuestion: 'What is your school like?',
    bigIdea: 'What do you like about your school?',
    page: 35,
    color: 'blue',
    pronunciation: '/ɔː/ /ɒ/; /uː/ /ʊ/; 单词重读(2)',
    goals: [
      '能用 there be 句型描述学校里的场所、设施和物品',
      '能正确使用 in front of、behind、between、next to、across from 等方位介词',
      '能听懂并区分 /ɔː/ 与 /ɒ/、/uː/ 与 /ʊ/ 两组元音',
      '能带“朋友”参观校园，用英语清楚介绍各个场所的位置',
    ],
    themeContext: '人与社会——熟悉并热爱自己的校园，学会介绍学校场所与设施，增强集体归属感。',
    phrases: [
      { id: 'ph-u3-1', en: 'next to', zh: '在……旁边' },
      { id: 'ph-u3-2', en: 'in front of', zh: '在……前面' },
      { id: 'ph-u3-3', en: 'sports field', zh: '运动场' },
      { id: 'ph-u3-4', en: 'dining hall', zh: '食堂' },
    ],
    grammar: {
      title: 'there be 句型与方位',
      points: [
        {
          name: 'there be 句型 (The “there be” structure)',
          explain:
            'there be 表示“某处有某物”。be 动词用 is 还是 are，要看后面的名词：单数名词或不可数名词用 there is，复数名词用 there are。当后面有多个名词并列时，be 动词和最近的那个名词保持一致。',
          examples: [
            { en: 'There is a library in our school.', zh: '我们学校有一个图书馆。' },
            { en: 'There are twenty classrooms in the teaching building.', zh: '教学楼里有二十间教室。' },
            { en: 'Is there a garden behind the building?', zh: '楼后面有花园吗？' },
          ],
        },
        {
          name: '方位介词 (Prepositions of position)',
          explain:
            'in front of 意为“在……前面”，behind 意为“在……后面”，between 意为“在（两者）之间”，常和 and 连用；next to 意为“在……旁边”，across from 意为“在……对面”。用准这些介词，就能把位置关系说得清清楚楚。',
          examples: [
            { en: 'The science building is behind the sports field.', zh: '科学楼在运动场后面。' },
            { en: "Our classroom is next to the teachers' office.", zh: '我们的教室在老师办公室旁边。' },
            { en: 'The library is across from the dining hall.', zh: '图书馆在食堂对面。' },
          ],
        },
      ],
    },
    listeningIds: ['lp3'],
    readingIds: ['ra3'],
    writingTaskIds: [],
  },

  // ---------- Unit 4 My Favourite Subject ----------
  {
    id: 'u4',
    kind: 'unit',
    order: 7,
    title: 'My Favourite Subject',
    titleZh: '我最喜爱的学科',
    bigQuestion: 'Why do you like this subject?',
    bigIdea: 'Why do we learn different subjects?',
    page: 43,
    color: 'lav',
    pronunciation: '/eɪ/ /aɪ/ /ɔɪ/; /əʊ/ /aʊ/; /ɪə/ /eə/ /ʊə/; 连读',
    goals: [
      '能听懂并说出 maths、history、geography、art 等学科名称',
      '能用 My favourite subject is... 谈论自己喜爱的学科，并说明理由',
      '能正确使用连词 and、but、because 连接词语和句子',
      '能小组合作设计班级周课程表，并用英语介绍各天的课程',
    ],
    themeContext: '人与自我——了解不同学科的特点与价值，表达对学科的喜好，学会合理安排学习。',
    phrases: [
      { id: 'ph-u4-1', en: 'favourite subject', zh: '最喜爱的学科' },
      { id: 'ph-u4-2', en: 'be good at', zh: '擅长' },
      { id: 'ph-u4-3', en: 'on Monday', zh: '在星期一' },
      { id: 'ph-u4-4', en: 'from... to...', zh: '从……到……' },
    ],
    grammar: {
      title: '连词',
      points: [
        {
          name: '连词 and / but / because (Conjunctions: and, but, because)',
          explain:
            'and 表示并列或递进，意为“和、并且”；but 表示转折，意为“但是”；because 表示原因，意为“因为”。它们能把两个词或两个句子连在一起，让表达更连贯。回答 Why...? 的问题时，常用 because 说出理由。',
          examples: [
            { en: 'I like music and art.', zh: '我喜欢音乐和美术。' },
            { en: "I like maths, but it's a little difficult.", zh: '我喜欢数学，但它有点难。' },
            { en: "We don't have history today because the teacher is ill.", zh: '因为老师生病了，我们今天不上历史课。' },
          ],
        },
      ],
    },
    listeningIds: [],
    readingIds: ['ra4'],
    writingTaskIds: [],
  },

  // ---------- Unit 5 Fun Clubs ----------
  {
    id: 'u5',
    kind: 'unit',
    order: 8,
    title: 'Fun Clubs',
    titleZh: '有趣的社团',
    bigQuestion: 'How do you choose a school club?',
    bigIdea: 'Why do we join school clubs?',
    page: 51,
    color: 'ice',
    pronunciation: '/p/ /b/; /t/ /d/; /k/ /g/; /f/ /v/; 不完全爆破',
    goals: [
      '能听懂并说出 chess club、art club、music club 等社团名称',
      '能正确使用情态动词 can 谈论自己和他人的能力',
      '能听清并区分 /p/-/b/、/t/-/d/、/k/-/g/、/f/-/v/ 四组清浊辅音',
      '能策划一个自己的社团，写出简单的英文招募启事',
    ],
    themeContext: '人与社会——了解学校社团活动，大胆展示个人才能，在社团中结交志同道合的伙伴。',
    phrases: [
      { id: 'ph-u5-1', en: 'chess club', zh: '象棋社' },
      { id: 'ph-u5-2', en: 'play the guitar', zh: '弹吉他' },
      { id: 'ph-u5-3', en: 'join a club', zh: '加入社团' },
      { id: 'ph-u5-4', en: 'take photos', zh: '拍照' },
    ],
    grammar: {
      title: '情态动词 can',
      points: [
        {
          name: '情态动词 can 表能力 (Can for ability)',
          explain:
            'can 意为“能、会”，后面接动词原形，表示某人具备某种能力。它的否定形式是 cannot，缩写成 can\'t；变成疑问句时把 can 提到主语前面。can 没有人称和数的变化，任何人称后面都用 can。',
          examples: [
            { en: "I can play chess, but I can't play the drums.", zh: '我会下象棋，但不会打架子鼓。' },
            { en: 'Can you swim? — Yes, I can. / No, I can\'t.', zh: '你会游泳吗？——是的，我会。/ 不，我不会。' },
            { en: 'My friend Tom can speak a little Chinese.', zh: '我的朋友汤姆会说一点儿汉语。' },
          ],
        },
      ],
    },
    listeningIds: ['lp4'],
    readingIds: ['ra5'],
    writingTaskIds: [],
  },

  // ---------- Unit 6 A Day in the Life ----------
  {
    id: 'u6',
    kind: 'unit',
    order: 9,
    title: 'A Day in the Life',
    titleZh: '生活中的一天',
    bigQuestion: 'How do you spend your school day?',
    bigIdea: 'How can you make good use of your time?',
    page: 59,
    color: 'brand',
    pronunciation: '/s/ /z/; /ʃ/ /ʒ/; /tʃ/ /dʒ/; /θ/ /ð/; 句子重音',
    goals: [
      "能用两种方式表达时间，如 six o'clock 和 half past six",
      '能正确使用 what time、when、what 引导的特殊疑问句询问和谈论作息',
      '能听懂并会说 get up、have breakfast、go to bed 等日常活动短语',
      '能采访他人的日常作息，并把结果整理成一篇小短文',
    ],
    themeContext: '人与自我——记录并分享自己的一天，学会合理规划时间，养成良好的作息习惯。',
    phrases: [
      { id: 'ph-u6-1', en: 'get up', zh: '起床' },
      { id: 'ph-u6-2', en: 'have breakfast', zh: '吃早饭' },
      { id: 'ph-u6-3', en: 'go to school', zh: '去上学' },
      { id: 'ph-u6-4', en: 'go to bed', zh: '上床睡觉' },
    ],
    grammar: {
      title: '时间表达与特殊疑问句',
      points: [
        {
          name: '时间表达法 (Telling the time)',
          explain:
            "整点可以说“数字 + o'clock”，如 six o'clock（六点钟）。分钟数不超过半小时用“分钟 + past + 小时”，如 twenty past six（六点二十）；超过半小时用“分钟 + to + 下一个小时”，如 ten to eight（七点五十）。也可以按顺序直接读成 six twenty。表达“在几点”要用介词 at。",
          examples: [
            { en: 'I get up at six thirty.', zh: '我六点半起床。' },
            { en: "School starts at eight o'clock.", zh: '学校八点开始上课。' },
            { en: "It's ten to nine. Let's hurry.", zh: '差十分九点了，我们快点吧。' },
          ],
        },
        {
          name: '特殊疑问句：what time / when / what (Wh-questions: what time, when, what)',
          explain:
            'what time 用来询问具体的钟点，如 What time do you get up?；when 询问的时间范围更宽，可以问日期、星期等；what 询问事物或活动，如 What do you do after school? 回答时要给出具体信息，不能用 Yes 或 No。',
          examples: [
            { en: 'What time do you have breakfast? — At half past seven.', zh: '你什么时候吃早饭？——七点半。' },
            { en: 'When do you have maths class? — On Monday and Wednesday.', zh: '你们什么时候上数学课？——周一和周三。' },
            { en: 'What do you do in the evening? — I do my homework.', zh: '你晚上做什么？——我做作业。' },
          ],
        },
      ],
    },
    listeningIds: ['lp5'],
    readingIds: ['ra6'],
    writingTaskIds: ['wt2'],
  },

  // ---------- Unit 7 Happy Birthday! ----------
  {
    id: 'u7',
    kind: 'unit',
    order: 10,
    title: 'Happy Birthday!',
    titleZh: '生日快乐！',
    bigQuestion: 'How do we celebrate birthdays?',
    bigIdea: 'Why do we celebrate birthdays?',
    page: 67,
    color: 'blue',
    pronunciation: '/h/ /r/ /l/; /m/ /n/ /ŋ/; /w/ /j/; 语调',
    goals: [
      '能听懂并说出 January 到 December 十二个月份的名称',
      '能正确使用序数词表达日期和顺序，如 June 1st、the first class',
      '能用 When is your birthday? 等特殊疑问句询问和谈论生日活动',
      '能策划一次生日庆祝活动，并用英语送出生日祝福',
    ],
    themeContext: '人与社会——了解中外生日的庆祝方式，学会表达祝福与感谢，珍惜亲情与友谊。',
    phrases: [
      { id: 'ph-u7-1', en: 'make a wish', zh: '许愿' },
      { id: 'ph-u7-2', en: 'have a birthday party', zh: '举办生日聚会' },
      { id: 'ph-u7-3', en: 'blow out the candles', zh: '吹灭蜡烛' },
      { id: 'ph-u7-4', en: 'birthday card', zh: '生日贺卡' },
    ],
    grammar: {
      title: '序数词与日期',
      points: [
        {
          name: '序数词 (Ordinal numbers)',
          explain:
            '表示“第几”的词叫序数词，如 first（第一）、second（第二）、third（第三）。其余大多数在基数词后加 -th 构成，如 fourth、sixth，个别有特殊变化，如 fifth、eighth、ninth、twelfth。表达日期时用“月份 + 序数词”，如 June 1st 读作 June the first。',
          examples: [
            { en: 'My birthday is on June 1st.', zh: '我的生日在六月一日。' },
            { en: 'Our English test is on the 15th of this month.', zh: '我们的英语测试在这个月十五号。' },
            { en: 'She is the first one to come to class.', zh: '她是第一个来教室的人。' },
          ],
        },
        {
          name: '特殊疑问句复习 (Wh-questions review)',
          explain:
            '本单元复习 when、what、how 等特殊疑问词。when 询问时间，what 询问事物或活动，how 询问方式或感受。特殊疑问句的语序是“疑问词 + 一般疑问句”，朗读时疑问词通常要重读。',
          examples: [
            { en: "When is your mother's birthday? — It's on August 8th.", zh: '你妈妈的生日是什么时候？——八月八日。' },
            { en: 'What do you usually do on your birthday? — I have a party with my friends.', zh: '你生日那天通常做什么？——我和朋友们开一个聚会。' },
            { en: 'How do you celebrate it? — We eat noodles and a big cake.', zh: '你们怎么庆祝？——我们吃面条和一个大蛋糕。' },
          ],
        },
      ],
    },
    listeningIds: ['lp6'],
    readingIds: [],
    writingTaskIds: [],
  },
];
