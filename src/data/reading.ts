import type { ReadingArticle } from '../types';

// ===== 阅读 Mock 数据（人教版七年级上册，全部原创）=====

export const readingArticles: ReadingArticle[] = [
  {
    id: 'ra1',
    unitId: 'u1',
    title: 'Looking for New Friends',
    titleZh: '交友帖子两则',
    genre: '网络帖子',
    topic: '结交朋友',
    difficulty: 1,
    wordCount: 148,
    guide: '两个七年级的同学在网上发帖寻找新朋友，介绍了自己的爱好和心愿。读一读：他们各自想找什么样的朋友？',
    paragraphs: [
      {
        en: "Hi! My name is Jack Miller. I'm twelve years old. I'm from Sydney, Australia, but now I live in Beijing with my parents. I'm in Class 2, Grade 7. I'm tall, and I have short brown hair.",
        zh: '你好！我叫杰克·米勒，今年十二岁。我来自澳大利亚悉尼，但现在和父母一起住在北京。我在七年级二班。我个子高高的，留着一头短短的棕色头发。',
      },
      {
        en: 'I love sports very much. Basketball is my favourite, and I play it with friends after school every day. I also like reading books about animals. I want a friend who loves basketball too, so we can play together.',
        zh: '我非常喜欢运动。篮球是我的最爱，我每天放学后都和朋友们一起打篮球。我还喜欢读关于动物的书。我想找一个也喜欢篮球的朋友，这样我们就可以一起打球了。',
      },
      {
        en: "Hello, everyone! I'm Lin Hua, a girl of thirteen from Chengdu, China. This is my first year in middle school. Music and drawing are my favourite things. I can play the piano a little, and I draw flowers every weekend.",
        zh: '大家好！我是林华，一个来自中国成都的十三岁女孩。这是我上中学的第一年。音乐和绘画是我最喜欢的东西。我会弹一点钢琴，每个周末都画花儿。',
      },
      {
        en: "I'm looking for kind friends from all over the world. Write to me in English, and I can tell you about Chinese food and festivals. Don't be shy! Let's be good friends!",
        zh: '我在寻找世界各地善良的朋友。你可以用英文给我写信，我可以告诉你关于中国美食和节日的故事。别害羞！让我们成为好朋友吧！',
      },
    ],
    glossary: [
      { word: 'favourite', zh: '最喜爱的' },
      { word: 'weekend', zh: '周末' },
      { word: 'piano', zh: '钢琴' },
      { word: 'middle school', zh: '中学' },
      { word: 'shy', zh: '害羞的' },
      { word: 'festival', zh: '节日' },
      { word: 'world', zh: '世界' },
    ],
    exercises: [
      {
        q: "What is Jack's favourite sport?",
        options: ['Football', 'Basketball', 'Ping-pong', 'Swimming'],
        answer: 1,
        explain: "细节题。定位第一则帖子第二段：'Basketball is my favourite, and I play it with friends after school every day.' 可知杰克最喜欢的运动是篮球。",
      },
      {
        q: 'What can we know about Lin Hua?',
        options: [
          'She is in her first year of middle school.',
          'She is from Australia.',
          "She doesn't like music.",
          'She can play the piano very well.',
        ],
        answer: 0,
        explain: "推理题。定位第二则帖子第一段：'This is my first year in middle school.' 可知林华刚上中学；她来自中国成都而不是澳大利亚，她喜欢音乐，只会弹一点钢琴，故其余三项均错误。",
      },
      {
        q: "The word 'shy' here means ______ in Chinese.",
        options: ['害羞的', '勇敢的', '难过的', '认真的'],
        answer: 0,
        explain: "词义猜测题。定位第二则帖子第二段，林华说 'Don't be shy!'，是在鼓励大家大胆给她写信，可推知 shy 意为'害羞的'。",
      },
      {
        q: 'The two posts are both about ______.',
        options: ['school clubs', 'looking for new friends', 'favourite sports', 'Chinese festivals'],
        answer: 1,
        explain: '主旨题。两则帖子都在做自我介绍并寻找新朋友，共同主题是"寻找新朋友"。学校社团、运动和节日只是其中提到的细节。',
      },
    ],
  },
  {
    id: 'ra2',
    unitId: 'u2',
    title: 'My Family Photo',
    titleZh: '我的全家福',
    genre: '描述文',
    topic: '介绍家人',
    difficulty: 1,
    wordCount: 167,
    guide: "一张普通的全家福，藏着一家人的温暖故事，爸爸、妈妈和妹妹各有特点。读一读：照片里的'我'藏在哪里？",
    paragraphs: [
      {
        en: 'This is a photo of my family. The old man and the old woman in the middle are my grandpa and grandma. They are seventy years old, but they are healthy and happy.',
        zh: '这是一张我的全家福。照片中间的老爷爷和老奶奶是我的爷爷和奶奶。他们七十岁了，但依然健康快乐。',
      },
      {
        en: 'The tall man next to my grandma is my father. He is a doctor in a big hospital. He is busy every day, but on weekends he often cooks nice food for us. His noodles are my favourite!',
        zh: '站在奶奶身边的高个子男人是我的爸爸。他是一家大医院的医生。他每天都很忙，但周末经常给我们做好吃的饭菜。他做的面条是我的最爱！',
      },
      {
        en: "The woman in a red dress is my mother. She is an English teacher in a middle school. My mother's hobby is gardening. There are many beautiful flowers in our garden, and she waters them every morning.",
        zh: '穿红裙子的女人是我的妈妈。她是一所中学的英语老师。我妈妈的爱好是园艺。我们家的花园里有许多美丽的花，她每天早上都给花浇水。',
      },
      {
        en: 'Who is the little girl in the photo? She is my sister Lily. She is only five years old. She loves drawing and singing, and she wants to be a singer one day.',
        zh: '照片里的小女孩是谁？她是我的妹妹莉莉。她只有五岁。她喜欢画画和唱歌，梦想有一天成为一名歌手。',
      },
      {
        en: "I love my family very much. We often take photos together on Sundays. Where am I in the photo? Ha! I'm the boy behind my sister!",
        zh: '我非常爱我的家人。星期天我们经常一起拍照片。照片里的我在哪儿？哈！我就在妹妹的身后！',
      },
    ],
    glossary: [
      { word: 'photo', zh: '照片' },
      { word: 'hospital', zh: '医院' },
      { word: 'hobby', zh: '爱好' },
      { word: 'garden', zh: '花园' },
      { word: 'healthy', zh: '健康的' },
      { word: 'dress', zh: '连衣裙' },
      { word: 'behind', zh: '在……后面' },
    ],
    exercises: [
      {
        q: "What does the writer's father do?",
        options: ['He is a teacher.', 'He is a doctor.', 'He is a farmer.', 'He is a cook.'],
        answer: 1,
        explain: "细节题。定位第二段：'He is a doctor in a big hospital.' 爸爸是一名医生。",
      },
      {
        q: 'What can we know about the writer?',
        options: [
          'He is five years old.',
          'He has a little sister.',
          'His mother teaches maths.',
          'He lives with his uncle.',
        ],
        answer: 1,
        explain: '推理题。定位第四段可知作者有一个五岁的妹妹莉莉，由此推知他有一个小妹妹；五岁的是妹妹而不是作者，妈妈教英语而不是数学，文中没有提到叔叔，故其余三项错误。',
      },
      {
        q: "The word 'gardening' in Paragraph 3 means ______.",
        options: ['做饭', '园艺', '游泳', '唱歌'],
        answer: 1,
        explain: "词义猜测题。定位第三段：妈妈的爱好是 gardening，紧接着说'花园里有许多美丽的花，她每天早晨给花浇水'，可推知 gardening 指种花种草的'园艺'活动。",
      },
      {
        q: 'What is the passage mainly about?',
        options: ['A school photo', "The writer's family", "The writer's hobbies", 'A happy Sunday'],
        answer: 1,
        explain: '主旨题。全文围绕一张全家福依次介绍爷爷奶奶、爸爸妈妈和妹妹，讲的是"作者的一家人"；学校照片、爱好和星期天只是文中细节。',
      },
    ],
  },
  {
    id: 'ra3',
    unitId: 'u3',
    title: 'My New School',
    titleZh: '我的新学校',
    genre: '电子邮件',
    topic: '介绍新学校',
    difficulty: 2,
    wordCount: 158,
    guide: '升入中学的徐慧给小学好友安娜写了一封电子邮件，介绍自己的新学校。猜一猜：她最喜欢学校里的哪个地方？',
    paragraphs: [
      {
        en: "Dear Anna, How are you? I'm fine. Now I'm a student at No. 4 Middle School. My new school is big and beautiful, and I want to tell you about it.",
        zh: '亲爱的安娜：你好吗？我很好。现在我已经是第四中学的学生了。我的新学校又大又漂亮，我想给你讲讲它。',
      },
      {
        en: "Our classroom is in Building A. It is on the third floor, next to the music room. There are forty desks and chairs in it, and there is a computer on the teacher's desk.",
        zh: '我们的教室在 A 栋教学楼，在三楼，紧挨着音乐教室。教室里有四十套桌椅，讲台上还有一台电脑。',
      },
      {
        en: 'My favourite place is the library. It is in front of the playground, and there are many interesting books in it. I often read storybooks there after class because it is nice and quiet.',
        zh: '我最喜欢的地方是图书馆。它在操场前面，里面有许多有趣的书。课后我常在那里读故事书，因为那里安静又舒适。',
      },
      {
        en: 'The playground is really big. We play football and basketball there. Behind the playground, there is a dining hall. The food there is very nice, and my favourite is the noodles.',
        zh: '操场真的很大，我们在那里踢足球、打篮球。操场后面是食堂，那里的饭菜很好吃，我最喜欢的是面条。',
      },
      {
        en: 'What do you think of my new school? Is your school big too? Please write to me soon and tell me about your school days.',
        zh: '你觉得我的新学校怎么样？你的学校也很大吗？请快点给我回信，跟我讲讲你的学校生活吧。',
      },
      {
        en: 'Love, Xu Hui.',
        zh: '爱你的，徐慧。',
      },
    ],
    glossary: [
      { word: 'building', zh: '建筑物；楼' },
      { word: 'floor', zh: '楼层' },
      { word: 'front', zh: '前面' },
      { word: 'playground', zh: '操场' },
      { word: 'dining hall', zh: '食堂' },
      { word: 'storybook', zh: '故事书' },
      { word: 'quiet', zh: '安静的' },
    ],
    exercises: [
      {
        q: "Where is the writer's classroom?",
        options: ['On the first floor.', 'On the second floor.', 'On the third floor.', 'Behind the library.'],
        answer: 2,
        explain: "细节题。定位第二段：'It is on the third floor, next to the music room.' 教室在三楼，紧挨着音乐教室。",
      },
      {
        q: 'What can we learn about Xu Hui?',
        options: [
          "She doesn't like the food at school.",
          'She often reads storybooks after class.',
          'She has lunch at home.',
          'She is a teacher at the school.',
        ],
        answer: 1,
        explain: "推理题。定位第三段：'I often read storybooks there after class.' 可知徐慧课后常在图书馆读故事书；她说学校饭菜很好吃，并没有说在家吃午饭，其余选项与原文不符。",
      },
      {
        q: "The word 'quiet' in Paragraph 3 means ______.",
        options: ['干净的', '安静的', '明亮的', '拥挤的'],
        answer: 1,
        explain: "词义猜测题。定位第三段：图书馆 'nice and quiet'，是课后读书的好地方，可推知 quiet 意为'安静的'。",
      },
      {
        q: 'Why does Xu Hui write the email?',
        options: [
          'To ask Anna for help.',
          'To say thanks to Anna.',
          'To tell Anna about her new school.',
          'To invite Anna to her party.',
        ],
        answer: 2,
        explain: '主旨题。全文都在介绍新学校的教室、图书馆、操场和食堂，结尾还请安娜回信介绍她的学校，可知写信的目的是"告诉安娜自己的新学校"。',
      },
    ],
  },
  {
    id: 'ra4',
    unitId: 'u4',
    title: 'Subjects We Love',
    titleZh: '我们喜爱的科目',
    genre: '网络帖子',
    topic: '学校科目',
    difficulty: 2,
    wordCount: 144,
    guide: '托尼和玛丽亚在网上聊起了自己最喜欢的科目，一个爱数学，一个爱美术。想一想：他们的理由分别是什么？',
    paragraphs: [
      {
        en: "Hi, I'm Tony from London. We have a maths class today, and I'm happy because maths is my favourite subject. It is a little difficult, but I think it is really interesting.",
        zh: '你好，我是来自伦敦的托尼。今天我们有一节数学课，我很开心，因为数学是我最喜欢的科目。它虽然有点难，但我觉得非常有趣。',
      },
      {
        en: 'Numbers are everywhere in our life. When I go shopping with my mum, I often help her count the money. My maths teacher says maths is useful, and I think so too. What about you? Is maths your favourite subject too?',
        zh: '数字在我们的生活中无处不在。和妈妈去购物时，我经常帮她算钱。我的数学老师说数学很有用，我也这么认为。你呢？数学也是你最喜欢的科目吗？',
      },
      {
        en: "Hello, I'm Maria from New York. My favourite subject is art. I don't like maths because it's hard for me, but I love drawing pictures in the art class. Art class is fun and relaxing.",
        zh: '大家好，我是来自纽约的玛丽亚。我最喜欢的科目是美术。我不喜欢数学，因为它对我来说太难了，但是我喜欢在美术课上画画。美术课有趣又让人放松。',
      },
      {
        en: 'In art class, we often draw animals and flowers, and sometimes we paint our school. My dream is to be a painter one day. Art makes me happy, so I never feel tired in this class.',
        zh: '在美术课上，我们经常画动物和花草，有时还画我们的学校。我的梦想是有一天成为一名画家。美术让我快乐，所以在这节课上我从不觉得累。',
      },
    ],
    glossary: [
      { word: 'subject', zh: '科目' },
      { word: 'difficult', zh: '困难的' },
      { word: 'useful', zh: '有用的' },
      { word: 'everywhere', zh: '处处；到处' },
      { word: 'count', zh: '数；计算' },
      { word: 'relaxing', zh: '令人放松的' },
      { word: 'painter', zh: '画家' },
    ],
    exercises: [
      {
        q: 'Why does Tony like maths?',
        options: [
          'Because it is easy for him.',
          'Because it is useful and interesting.',
          'Because his mum likes it.',
          'Because he wants to be a painter.',
        ],
        answer: 1,
        explain: "细节题。定位第一、二段：数学虽然有点难但非常有趣（interesting），托尼还认同数学老师说的数学很有用（useful），所以他喜欢数学是因为它有用又有趣。",
      },
      {
        q: 'What can we know about Maria?',
        options: [
          'She is good at maths.',
          'She often draws at school.',
          'Her favourite subject is music.',
          'She is from London.',
        ],
        answer: 1,
        explain: '推理题。定位第三、四段：玛丽亚喜欢在美术课上画画，经常画动物和花草，可推知她常在学校画画；她不喜欢数学，最喜欢的科目是美术而不是音乐，她来自纽约而不是伦敦，故其余三项错误。',
      },
      {
        q: "The word 'relaxing' in Paragraph 3 means ______.",
        options: ['无聊的', '令人放松的', '困难的', '忙碌的'],
        answer: 1,
        explain: "词义猜测题。定位第三段：美术课 'fun and relaxing'，第四段又说美术让玛丽亚快乐、从不觉得累，可推知 relaxing 意为'令人放松的'。",
      },
      {
        q: 'What do Tony and Maria talk about?',
        options: ['Their families.', 'Their schools.', 'Their favourite subjects.', 'Their weekends.'],
        answer: 2,
        explain: '主旨题。两则帖子分别介绍了自己最喜欢的科目及原因，主题是"他们最喜欢的科目"；家庭、学校和周末只是文中零星提到的内容。',
      },
    ],
  },
  {
    id: 'ra5',
    unitId: 'u5',
    title: 'Join Our Clubs!',
    titleZh: '社团招新啦',
    genre: '广告',
    topic: '学校社团',
    difficulty: 2,
    wordCount: 149,
    guide: '新学期学校社团开始招新：象棋社、乐队和讲故事社都在等你。读一读：哪个社团最适合你？',
    paragraphs: [
      {
        en: 'New term, new fun! Our school has many interesting clubs for you. Come and join us, and make your school life colourful!',
        zh: '新学期，新乐趣！我们学校为你们准备了许多有趣的社团。快来加入我们，让你的校园生活丰富多彩！',
      },
      {
        en: "Do you like chess? Come to the Chess Club! We meet every Friday afternoon in Classroom 5B. Here you can play chess with good players and learn smart moves. You don't need to be a great player — just come and have fun!",
        zh: '你喜欢国际象棋吗？快来象棋社吧！我们每周五下午在 5B 教室活动。在这里，你可以和高手下棋，还能学习巧妙的招法。你不必是高手——快来玩得开心就好！',
      },
      {
        en: "Can you sing, dance or play the guitar? Then the Music Band wants you! We practise in the music room from 4:00 to 5:00 every Tuesday. We also sing at the school show every term. Join us and let's make beautiful music together!",
        zh: '你会唱歌、跳舞或弹吉他吗？乐队正需要你！我们每周二下午 4 点到 5 点在音乐教室排练，每学期还会在学校文艺演出上唱歌。加入我们，一起奏出美妙的音乐吧！',
      },
      {
        en: 'Do you love stories? In the Story-telling Club, you can read funny stories and tell them to your friends in English. We meet in the school library every Wednesday. It is a great way to practise your English. Come and join us!',
        zh: '你喜欢故事吗？在讲故事社，你可以阅读有趣的故事，并用英语把它们讲给朋友们听。我们每周三在学校图书馆活动。这是练习英语的好方法。快来加入我们吧！',
      },
    ],
    glossary: [
      { word: 'club', zh: '社团' },
      { word: 'join', zh: '加入' },
      { word: 'player', zh: '棋手；选手' },
      { word: 'smart', zh: '巧妙的' },
      { word: 'practise', zh: '练习；排练' },
      { word: 'show', zh: '演出' },
      { word: 'colourful', zh: '丰富多彩的' },
    ],
    exercises: [
      {
        q: 'When does the Chess Club meet?',
        options: ['Every Tuesday.', 'Every Wednesday.', 'Every Friday afternoon.', 'Every day.'],
        answer: 2,
        explain: "细节题。定位第二段：'We meet every Friday afternoon in Classroom 5B.' 象棋社每周五下午在 5B 教室活动。",
      },
      {
        q: 'Who may be interested in the Music Band?',
        options: [
          'A student who can play the guitar.',
          'A student who loves maths.',
          'A student who likes shopping.',
          'A student who wants to cook.',
        ],
        answer: 0,
        explain: "推理题。定位第三段：乐队招新时问 'Can you sing, dance or play the guitar?'，会弹吉他的学生正符合乐队的要求，会对它感兴趣；数学、购物和做饭与三个社团的内容都无关。",
      },
      {
        q: "The word 'practise' in Paragraph 3 means ______.",
        options: ['练习；排练', '休息', '考试', '参观'],
        answer: 0,
        explain: "词义猜测题。定位第三段：乐队每周二 4:00-5:00 在音乐教室 practise，还要在学校演出上唱歌，可推知 practise 意为'练习，排练'。",
      },
      {
        q: 'What is the main idea of the passage?',
        options: [
          'A school music show.',
          'Three school clubs welcome students.',
          'How to play chess well.',
          'A story about school friends.',
        ],
        answer: 1,
        explain: '主旨题。文章先总起介绍学校社团，再分别介绍象棋社、乐队和讲故事社的招新信息，主旨是"三个学校社团欢迎同学们加入"；演出、下棋方法都只是细节。',
      },
    ],
  },
  {
    id: 'ra6',
    unitId: 'u6',
    title: 'A School Day in Finland',
    titleZh: '芬兰男孩的学校一天',
    genre: '记叙文',
    topic: '学校一天',
    difficulty: 3,
    wordCount: 186,
    guide: '芬兰男孩埃罗的一天和我们的学校生活有些不一样。读一读：哪个细节最让你惊讶？',
    paragraphs: [
      {
        en: "Eero is a middle school student in Finland. His school day is a little different from ours. What does he do every day? Let's take a look!",
        zh: '埃罗是芬兰的一名中学生。他的学校生活和我们有一点不一样。他每天都做些什么呢？我们一起来看看吧！',
      },
      {
        en: "Eero usually gets up at seven in the morning. He doesn't go to school by bus. He rides his bike for ten minutes, because his home is near his school.",
        zh: '埃罗通常早上七点起床。他上学不坐公交车。因为家离学校很近，他骑自行车十分钟就到了。',
      },
      {
        en: "School starts at nine o'clock — not eight! Eero has four classes in the morning, and there is no homework after class. His favourite subject is science. In the science class, he often does interesting experiments.",
        zh: '学校九点才开始上课——不是八点！埃罗上午有四节课，课后没有作业。他最喜欢的科目是科学。在科学课上，他经常做有趣的实验。',
      },
      {
        en: 'At twelve, Eero has lunch with his friends at school. The lunch is free for all the students in Finland. After lunch, he plays with his friends in the playground.',
        zh: '十二点，埃罗和朋友们在学校吃午饭。在芬兰，所有学生的午餐都是免费的。午饭后，他会在操场上和朋友们玩耍。',
      },
      {
        en: 'School is over at about three in the afternoon. After school, Eero goes to the swimming club on Mondays and Wednesdays. On other days, he reads books or plays ice hockey with his brother.',
        zh: '大约下午三点放学。放学后，埃罗每周一和周三去游泳俱乐部，其他时间他会看看书，或者和哥哥一起打冰球。',
      },
      {
        en: 'Eero loves his school life. "I have time to play and do sports every day," he says. What about your school day? Is it the same as Eero\'s or different?',
        zh: '埃罗热爱他的学校生活。"我每天都有时间玩和做运动，"他说。那你的学校一天是怎样的呢？和埃罗的一样，还是不同呢？',
      },
    ],
    glossary: [
      { word: 'Finland', zh: '芬兰' },
      { word: 'different', zh: '不同的' },
      { word: 'experiment', zh: '实验' },
      { word: 'free', zh: '免费的' },
      { word: 'ice hockey', zh: '冰球' },
      { word: 'swimming club', zh: '游泳俱乐部' },
      { word: 'same', zh: '相同的' },
    ],
    exercises: [
      {
        q: 'How does Eero go to school?',
        options: ['By bus.', 'By bike.', 'By car.', 'On foot.'],
        answer: 1,
        explain: "细节题。定位第二段：'He rides his bike for ten minutes.' 埃罗骑自行车上学。",
      },
      {
        q: 'What can we learn from the passage?',
        options: [
          'Eero has much homework every day.',
          'School in Finland starts at eight.',
          "Students in Finland don't pay for lunch.",
          'Eero goes to the swimming club every day.',
        ],
        answer: 2,
        explain: "推理题。定位第四段：'The lunch is free for all the students in Finland.' 可知芬兰学生吃午饭不用付钱；第三段说埃罗课后没有作业、学校九点上课，第五段说他只在周一和周三去游泳俱乐部，故其余三项均错误。",
      },
      {
        q: "The word 'experiments' in Paragraph 3 means ______.",
        options: ['作业', '实验', '游戏', '考试'],
        answer: 1,
        explain: "词义猜测题。定位第三段：埃罗在科学课上经常做有趣的 experiments，结合科学课的语境可推知该词意为'实验'。",
      },
      {
        q: 'What is the best title for the passage?',
        options: ['Free Lunch in Finland', "Eero's Favourite Subject", 'A School Day in Finland', 'Eero and His Brother'],
        answer: 2,
        explain: "主旨题。全文按时间顺序介绍芬兰男孩埃罗从起床、上课到放学后活动的学校一天，'芬兰的学校一天'最能概括全文；免费午餐和喜欢的科目只是其中两个细节。",
      },
    ],
  },
  {
    id: 'ra7',
    unitId: 'u7',
    title: "Ben's Birthday Party",
    titleZh: '本的生日聚会',
    genre: '记叙文',
    topic: '生日聚会',
    difficulty: 1,
    wordCount: 138,
    guide: '上周五是本的十二岁生日，他和朋友们开了一场热闹的生日聚会。读一读：本收到了哪些礼物？他最喜欢哪一个？',
    paragraphs: [
      {
        en: "Last Friday was Ben's twelfth birthday. He had a birthday party at home, and six friends came to his house after school.",
        zh: '上周五是本十二岁的生日。他在家里开了一场生日聚会，六个同学放学后来到了他家。',
      },
      {
        en: "Ben's mother made a big dinner for them. There were noodles, chicken and fruit salad. Then Mum brought in a big birthday cake with twelve candles on it. Everyone sang the birthday song, and Ben made a wish before he blew out the candles.",
        zh: '本的妈妈为他们做了一顿丰盛的晚餐，有面条、鸡肉和水果沙拉。然后妈妈端进来一个插着十二支蜡烛的大生日蛋糕。大家一起唱生日歌，本在吹灭蜡烛前许了一个愿望。',
      },
      {
        en: "After dinner, Ben opened his presents. Anna gave him a model plane, and Cindy's present was a book about animals. Ben's best friend Tony gave him a football. 'I love it!' Ben said. 'Now we can play football together every weekend!'",
        zh: '晚饭后，本打开了礼物。安娜送他一架模型飞机，辛迪的礼物是一本关于动物的书。本最好的朋友托尼送了他一个足球。"我太喜欢了！"本说，"以后每个周末我们都可以一起踢足球了！"',
      },
      {
        en: "It was ten o'clock when the party was over. Ben said thank you to all his friends. 'It is the best birthday in my life,' he said with a big smile.",
        zh: '聚会结束时已经十点了。本向所有朋友道谢。"这是我人生中最好的生日，"他笑着说。',
      },
    ],
    glossary: [
      { word: 'twelfth', zh: '第十二' },
      { word: 'candle', zh: '蜡烛' },
      { word: 'wish', zh: '愿望' },
      { word: 'present', zh: '礼物' },
      { word: 'model plane', zh: '飞机模型' },
      { word: 'blow out', zh: '吹灭' },
      { word: 'smile', zh: '微笑' },
    ],
    exercises: [
      {
        q: "When was Ben's birthday?",
        options: ['Last Monday.', 'Last Friday.', 'This Friday.', 'Last Sunday.'],
        answer: 1,
        explain: "细节题。定位第一段：'Last Friday was Ben's twelfth birthday.' 本的生日是上周五。",
      },
      {
        q: "What was Cindy's present?",
        options: ['A model plane.', 'A football.', 'A book about animals.', 'A birthday cake.'],
        answer: 2,
        explain: "细节题。定位第三段：'Cindy's present was a book about animals.' 辛迪送的礼物是一本关于动物的书。",
      },
      {
        q: 'What can we learn from the passage?',
        options: [
          'Ben got six presents.',
          "Ben's mother cooked the dinner.",
          "Tony doesn't like football.",
          'The party was at school.',
        ],
        answer: 1,
        explain:
          "推理题。定位第二段：'Ben's mother made a big dinner for them.' 晚饭是妈妈做的；六个朋友来参加但文中只提到三件礼物，聚会在本的家里而不是学校，托尼送足球说明他喜欢足球，故其余三项错误。",
      },
      {
        q: 'What is the passage mainly about?',
        options: ["A school dinner.", "Ben's birthday party.", "Ben's favourite sport.", 'A book about animals.'],
        answer: 1,
        explain:
          "主旨题。全文按时间顺序写了本的生日聚会：吃晚饭、吃蛋糕、收礼物，主题是'本的生日聚会'；学校晚餐、运动和动物书都只是文中细节。",
      },
    ],
  },
  {
    id: 'ra8',
    unitId: 'su1',
    title: 'Hello Around the World',
    titleZh: '世界各地的问候语',
    genre: '说明文',
    topic: '见面问候',
    difficulty: 2,
    wordCount: 143,
    guide: '不同国家的人见面打招呼的方式很不一样。读一读：英国人和泰国人打招呼有什么不同？',
    paragraphs: [
      {
        en: 'People in different countries say hello in different ways. When you travel around the world, you will find many interesting greetings.',
        zh: '不同国家的人打招呼的方式各不相同。当你环游世界时，会发现许多有趣的问候方式。',
      },
      {
        en: "In England, people often ask 'How are you?' when they meet. But it is not a real question. You can just say 'Fine, thank you.' People usually shake hands when they meet for the first time.",
        zh: '在英国，人们见面时常问"你好吗？"。但这并不是一个真正的问题，你只需回答"很好，谢谢"。初次见面时，人们通常会握手。',
      },
      {
        en: "In Thailand, people put their hands together and bow their heads a little to say hello. It is called the 'wai'. In France, friends often kiss each other on the cheek when they meet. In Japan, people bow to each other — the deeper the bow, the more respect it shows.",
        zh: '在泰国，人们双手合十、微微低头问好，这叫做"合十礼"。在法国，朋友们见面时常常互相亲吻脸颊。在日本，人们互相鞠躬——鞠躬越深，表示越尊敬。',
      },
      {
        en: "Greetings are different, but they all mean the same thing: 'I am happy to see you.' So don't be afraid to make mistakes. Just smile and say hello — a smile is a greeting in every country!",
        zh: '问候的方式不同，但意思都一样："见到你很高兴。"所以不要害怕出错，微笑着打招呼就好——在任何国家，微笑都是一种问候！',
      },
    ],
    glossary: [
      { word: 'greeting', zh: '问候' },
      { word: 'shake hands', zh: '握手' },
      { word: 'bow', zh: '鞠躬' },
      { word: 'respect', zh: '尊敬' },
      { word: 'cheek', zh: '脸颊' },
      { word: 'smile', zh: '微笑' },
      { word: 'mistake', zh: '错误' },
    ],
    exercises: [
      {
        q: 'What do English people usually do when they meet for the first time?',
        options: ['They kiss on the cheek.', 'They shake hands.', 'They bow to each other.', 'They put their hands together.'],
        answer: 1,
        explain:
          "细节题。定位第二段：'People usually shake hands when they meet for the first time.' 英国人初次见面通常握手。",
      },
      {
        q: "When someone in England asks you 'How are you?', you can ______.",
        options: ['tell him all your problems', 'just say "Fine, thank you."', 'ask him a real question', 'give him a big hug'],
        answer: 1,
        explain:
          "推理题。定位第二段：在英国 'How are you?' 'is not a real question'，只需回答 'Fine, thank you.' 即可。",
      },
      {
        q: "The word 'respect' in Paragraph 3 means ______ in Chinese.",
        options: ['勇气', '尊敬', '友好', '感谢'],
        answer: 1,
        explain:
          "词义猜测题。定位第三段：在日本鞠躬越深，表示的 respect 越多，结合鞠躬礼的语境可推知 respect 意为'尊敬'。",
      },
      {
        q: 'What is the best title for the passage?',
        options: ['How to Shake Hands', 'A Trip to Thailand', 'Greetings Around the World', 'How to Make Friends'],
        answer: 2,
        explain:
          "主旨题。文章依次介绍英国、泰国、法国和日本的问候方式，主题是'世界各地的问候'；握手方法、泰国之行都只提到一部分或没有提到。",
      },
    ],
  },
  {
    id: 'ra9',
    unitId: 'su2',
    title: 'Where Is My Schoolbag?',
    titleZh: '我的书包在哪儿？',
    genre: '记叙文',
    topic: '物品方位',
    difficulty: 1,
    wordCount: 155,
    guide: '莉莉的房间总是乱糟糟的，早上她又找不到自己的书包了。读一读：书包最后在哪里找到了？',
    paragraphs: [
      {
        en: 'Lily is a tidy girl at school, but her room at home is always not tidy. Books, pens and clothes are everywhere — on the bed, on the chair and under the desk.',
        zh: '莉莉在学校是个爱整洁的女孩，可她在家的房间总是乱糟糟的。书、钢笔和衣服到处都是——床上、椅子上、桌子底下。',
      },
      {
        en: "This morning, Lily couldn't find her schoolbag. 'Mum, where is my schoolbag?' she asked. 'Is it under your chair?' Mum asked. 'No, it isn't,' Lily said. 'Is it in your desk?' 'No, it isn't there either.'",
        zh: '今天早上，莉莉找不到自己的书包了。"妈妈，我的书包在哪儿？"她问。"在椅子下面吗？"妈妈问。"不，不在。"莉莉说。"在书桌里呢？""也不在。"',
      },
      {
        en: "Lily looked everywhere in her room. She looked under the bed, behind the door and even in her big toy box, but the schoolbag was not there. Then Mum opened the fridge in the kitchen and laughed: 'Oh dear! Here it is, next to the milk!'",
        zh: '莉莉在房间里找了个遍。床底下、门后面，甚至大玩具箱里都找了，可书包不在那儿。后来妈妈打开厨房的冰箱，笑了："天哪！在这儿呢，就在牛奶旁边！"',
      },
      {
        en: "'I remember now,' Lily's face turned red. 'Yesterday I put some snacks into the schoolbag. Maybe I put it into the fridge too!' From that day on, Lily keeps her room tidy, and her schoolbag always stays in the right place.",
        zh: '"我想起来了，"莉莉的脸红了。"昨天我把零食放进了书包，可能把书包也放进冰箱了！"从那天起，莉莉保持着房间整洁，书包也总是放在固定的地方。',
      },
    ],
    glossary: [
      { word: 'tidy', zh: '整洁的' },
      { word: 'everywhere', zh: '到处' },
      { word: 'schoolbag', zh: '书包' },
      { word: 'fridge', zh: '冰箱' },
      { word: 'snack', zh: '零食' },
      { word: 'toy box', zh: '玩具箱' },
      { word: 'laugh', zh: '笑' },
    ],
    exercises: [
      {
        q: "Where was Lily's schoolbag?",
        options: ['Under the bed.', 'Behind the door.', 'In the fridge.', 'In the toy box.'],
        answer: 2,
        explain:
          "细节题。定位第三段：妈妈打开冰箱后说 'Here it is, next to the milk!' 可知书包在冰箱里、牛奶旁边。",
      },
      {
        q: "Why did Lily's face turn red?",
        options: [
          'Because she was hot in the kitchen.',
          'Because she felt a little embarrassed about her mistake.',
          'Because she couldn\'t find her snack.',
          'Because Mum was angry with her.',
        ],
        answer: 1,
        explain:
          '推理题。莉莉想起是自己昨天把零食放进书包、误把书包放进冰箱，脸红是因为意识到自己的粗心而不好意思。',
      },
      {
        q: "The word 'laughed' in Paragraph 3 means ______.",
        options: ['哭了', '笑了', '喊了', '睡了'],
        answer: 1,
        explain:
          "词义猜测题。妈妈在冰箱里找到书包后说 'Oh dear!'，结合找到书包时的开心语境可推知 laughed 意为'笑了'。",
      },
      {
        q: 'What is the best title for the passage?',
        options: ['A Tidy Girl', 'Where Is My Schoolbag?', 'Mum and the Fridge', 'My Snacks'],
        answer: 1,
        explain:
          "主旨题。全文围绕'找书包'展开：找不到书包—到处找—在冰箱里找到，'我的书包在哪儿'最能概括全文；其他选项都只是文中细节。",
      },
    ],
  },
  {
    id: 'ra10',
    unitId: 'su3',
    title: "A Day on Grandpa's Farm",
    titleZh: '爷爷农场的一天',
    genre: '记叙文',
    topic: '农场动物',
    difficulty: 2,
    wordCount: 148,
    guide: '每年夏天，汤姆和妹妹艾米都会去爷爷的农场玩。读一读：他们在农场看到了哪些动物？',
    paragraphs: [
      {
        en: 'My grandpa has a small farm in the countryside. Every summer, my sister Amy and I visit him and have great fun there.',
        zh: '我爷爷在乡下有一个小农场。每年夏天，我和妹妹艾米都会去看望他，在那里玩得很开心。',
      },
      {
        en: "There are many animals on the farm. In the yard, there are ten rabbits, eight ducks and five chickens. Amy loves the rabbits best because they have long ears and short tails. She counts them every morning: one, two, three... ten! This year there are two baby rabbits — how lovely they are!",
        zh: '农场里有许多动物。院子里有十只兔子、八只鸭子和五只鸡。艾米最喜欢兔子，因为它们有长长的耳朵和短短的尾巴。她每天早上都要数一数：一、二、三……十只！今年还添了两只小兔子——多可爱呀！',
      },
      {
        en: "In the field behind the house, there are twelve cows and six sheep. Every morning, Grandpa rides an old tractor to give them grass and water. I help him carry the big bucket. The cows are very friendly — they eat from my hand!",
        zh: '房子后面的田里有十二头奶牛和六只绵羊。每天早上，爷爷开着一台旧拖拉机给它们送草和水，我帮他提大水桶。奶牛们非常友好——它们会从我手里吃东西！',
      },
      {
        en: "I love the farm because it is like a big animal family. Next summer, Grandpa says we can have a little camp near the yard. Amy and I can't wait!",
        zh: '我爱这个农场，因为它就像一个动物的大家庭。爷爷说，明年夏天我们可以在院子附近搭一个小帐篷露营。我和艾米都等不及了！',
      },
    ],
    glossary: [
      { word: 'countryside', zh: '乡下；农村' },
      { word: 'rabbit', zh: '兔子' },
      { word: 'duck', zh: '鸭子' },
      { word: 'chicken', zh: '鸡' },
      { word: 'cow', zh: '奶牛' },
      { word: 'sheep', zh: '绵羊' },
      { word: 'tractor', zh: '拖拉机' },
    ],
    exercises: [
      {
        q: 'How many animals are there in the yard?',
        options: ['Ten.', 'Eighteen.', 'Twenty-three.', 'Thirty.'],
        answer: 2,
        explain:
          '细节题（计算）。定位第二段：院子里有十只兔子、八只鸭子和五只鸡，10+8+5=23，共二十三只动物。',
      },
      {
        q: 'Why does Amy love the rabbits best?',
        options: [
          'Because they are white.',
          'Because they have long ears and short tails.',
          'Because they are friendly.',
          'Because she can feed them.',
        ],
        answer: 1,
        explain:
          "细节题。定位第二段：'Amy loves the rabbits best because they have long ears and short tails.' 艾米最喜欢兔子是因为它们耳朵长、尾巴短。",
      },
      {
        q: "The word 'friendly' in Paragraph 3 means ______.",
        options: ['害怕的', '友好的', '懒惰的', '聪明的'],
        answer: 1,
        explain:
          "词义猜测题。定位第三段：奶牛 friendly——'它们会从我手里吃东西'，可推知 friendly 意为'友好的'。",
      },
      {
        q: 'What is the passage mainly about?',
        options: ["Animals on Grandpa's farm.", 'How to ride a tractor.', "Amy's favourite rabbits.", 'A camp next summer.'],
        answer: 0,
        explain:
          "主旨题。全文介绍爷爷农场院子和田里的各种动物，主题是'爷爷农场上的动物'；开拖拉机、兔子和露营都只是文中细节。",
      },
    ],
  },
  {
    id: 'ra11',
    unitId: 'u3',
    title: 'Sports Day Is Coming!',
    titleZh: '运动会来啦',
    genre: '通知',
    topic: '校园运动会',
    difficulty: 2,
    wordCount: 152,
    guide: '学校要开运动会啦！这张通知上有时间、地点和注意事项。读一读：运动会那天上午同学们要先去哪里？',
    paragraphs: [
      {
        en: 'Attention, please! Our school Sports Day is coming. It is on Friday, October the sixteenth. Here is some important information for you.',
        zh: '请注意！我们学校的运动会就要到了，时间是十月十六日星期五。下面是一些重要信息。',
      },
      {
        en: "In the morning, all the students must go to the big playground first. The opening ceremony starts at eight o'clock. After that, Class 7A and 7B will have a basketball game on the playground, and the running races are in the field next to the library.",
        zh: '上午，全体同学要先到大操场集合。八点整开幕式开始。之后，七年级 A 班和 B 班将在操场上进行篮球赛，跑步比赛在图书馆旁边的田径场举行。',
      },
      {
        en: "At twelve, we have lunch in the dining hall. In the afternoon, there are two fun games for everyone: the egg-and-spoon race is in front of the teaching building, and the tug-of-war is behind it. There is also a photo show in the school hall — you can see photos of last year's Sports Day there.",
        zh: '十二点，我们在食堂吃午饭。下午有两个人人都能参加的趣味游戏：托蛋赛跑在教学楼前举行，拔河比赛在教学楼后进行。学校礼堂里还有一个照片展——你可以在那里看到去年运动会的照片。',
      },
      {
        en: "Please wear your sports shoes and school uniform on that day. Don't forget to bring some water. Come and cheer for your classmates — let's make our Sports Day wonderful!",
        zh: '当天请穿好运动鞋和校服，别忘了带水。快来为你的同学加油——让我们一起把运动会办得精彩！',
      },
    ],
    glossary: [
      { word: 'attention', zh: '注意' },
      { word: 'playground', zh: '操场' },
      { word: 'ceremony', zh: '仪式' },
      { word: 'race', zh: '赛跑' },
      { word: 'tug-of-war', zh: '拔河' },
      { word: 'uniform', zh: '校服' },
      { word: 'cheer', zh: '欢呼；加油' },
    ],
    exercises: [
      {
        q: 'When is the school Sports Day?',
        options: [
          'On Friday, October the sixteenth.',
          'On Saturday, October the sixth.',
          'On Friday, October the sixth.',
          'On Sunday, October the sixteenth.',
        ],
        answer: 0,
        explain:
          "细节题。定位第一段：'It is on Friday, October the sixteenth.' 运动会在十月十六日星期五。",
      },
      {
        q: 'Where is the egg-and-spoon race?',
        options: [
          'On the big playground.',
          'In the field next to the library.',
          'In front of the teaching building.',
          'Behind the school hall.',
        ],
        answer: 2,
        explain:
          '细节题。定位第三段：the egg-and-spoon race is in front of the teaching building，托蛋赛跑在教学楼前举行。',
      },
      {
        q: 'What can students do in the school hall on Sports Day?',
        options: ['Watch a photo show.', 'Have lunch.', 'Play the tug-of-war.', 'Buy sports shoes.'],
        answer: 0,
        explain:
          "推理题。定位第三段：学校礼堂里有照片展，可以看到去年运动会的照片；午饭在食堂吃，拔河在教学楼后，故其余三项错误。",
      },
      {
        q: 'What is the purpose of the notice?',
        options: [
          'To tell students about the school Sports Day.',
          'To invite parents to a basketball game.',
          'To sell sports shoes and uniforms.',
          'To show photos of last year.',
        ],
        answer: 0,
        explain:
          "主旨题。通知写明了运动会的时间、集合地点、各项活动的位置和注意事项，目的是'告知同学们运动会的信息'。",
      },
    ],
  },
];
