// ===== 社区 / 家校 / 学习记录种子数据 =====
// 用户、班级、小组、家长绑定、进度、游戏、考试、错题、写作与作业数据。
// 今日基准日期为 2026-09-05，daysAgo / minutesOffsets 均以此为基准。

import type {
  Assignment,
  Badge,
  ClassInfo,
  GroupInfo,
  ParentBinding,
  TeacherComment,
  User,
} from '../types';

// ===== 种子数据局部接口 =====

export interface SeedProgress {
  studentId: string;
  streakDays: number;
  exp: number;
  todayMinutes: number;
  weekMinutes: number;
  unitCompletion: Record<string, number>;
  moduleMastery: Record<'vocabulary' | 'grammar' | 'listening' | 'reading' | 'writing', number>;
  /** 7 个数字，下标 0 = 6 天前，下标 6 = 今天 */
  minutesOffsets: number[];
  badges: Badge[];
  assignmentDone: number;
  assignmentTotal: number;
}

export interface SeedGameResult {
  id: string;
  studentId: string;
  game: 'match' | 'spelling' | 'listen' | 'sentence' | 'grammar';
  daysAgo: number;
  score: number;
  accuracy: number;
  durationSec: number;
  combo: number;
  pointsGained: number;
  wrongs: { question: string; yourAnswer: string; correctAnswer: string }[];
}

export interface SeedExamRecord {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  daysAgo: number;
  score: number;
  total: number;
  moduleScores: Record<'vocabulary' | 'grammar' | 'listening' | 'reading', number>;
  details: { questionId: string; yourAnswer: string; correct: boolean }[];
}

export interface SeedWrongItem {
  key: string;
  source: 'practice' | 'unit-test' | 'exam' | 'game';
  kind: string;
  unitId: string;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  explain: string;
  wrongTimes: number;
  daysAgo: number;
  reviewStreak: number;
  status: 'active' | 'mastered';
}

export interface SeedWritingSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  studentId: string;
  studentName: string;
  content: string;
  daysAgo: number;
  score: number;
  comment: string;
  graded: boolean;
}

// ===== 徽章（6 枚，按 got 序列生成，保证各学生不一致）=====

function makeBadges(got: [boolean, boolean, boolean, boolean, boolean, boolean]): Badge[] {
  const list: { id: string; name: string; icon: string; desc: string }[] = [
    { id: 'b1', name: '连续学习7天', icon: '🔥', desc: '连续 7 天完成学习任务' },
    { id: 'b2', name: '单词达人', icon: '📚', desc: '累计掌握 200 个单词' },
    { id: 'b3', name: '听力新星', icon: '🎧', desc: '完成 30 次听力练习' },
    { id: 'b4', name: '阅读小能手', icon: '📖', desc: '读完 20 篇英文短文' },
    { id: 'b5', name: '错题克星', icon: '🛡️', desc: '在错题本攻克 20 道错题' },
    { id: 'b6', name: '游戏冠军', icon: '🏆', desc: '在任意小游戏中得到 900 分' },
  ];
  return list.map((b, i) => ({ ...b, got: got[i] }));
}

// ===== 用户 =====

export const seedUsers: User[] = [
  {
    id: 'teacher-001',
    name: '林晚晴',
    role: 'teacher',
    avatar: '👩‍🏫',
    active: true,
    classId: 'class-701',
    teacherTitle: '英语教研组组长',
    bio: '从教十二年，相信每个孩子都能爱上英语。',
  },
  {
    id: 'stu-001',
    name: '陈乐乐',
    role: 'student',
    avatar: '🧢',
    active: true,
    classId: 'class-701',
    groupId: 'group-a',
    bio: '爱打篮球的阳光男孩，梦想周游世界。',
  },
  {
    id: 'stu-002',
    name: '王小虎',
    role: 'student',
    avatar: '🐯',
    active: true,
    classId: 'class-701',
    groupId: 'group-a',
    bio: '活力满满，最喜欢英语闯关小游戏。',
  },
  {
    id: 'stu-003',
    name: '李想想',
    role: 'student',
    avatar: '💡',
    active: true,
    classId: 'class-701',
    groupId: 'group-a',
    bio: '爱问为什么，是小组里的点子王。',
  },
  {
    id: 'stu-004',
    name: '赵一一',
    role: 'student',
    avatar: '⭐',
    active: true,
    classId: 'class-701',
    groupId: 'group-b',
    bio: '做事认真踏实，笔记写得工工整整。',
  },
  {
    id: 'stu-005',
    name: '孙跳跳',
    role: 'student',
    avatar: '🏃',
    active: true,
    classId: 'class-701',
    groupId: 'group-b',
    bio: '运动健将，跑步和背单词一样快。',
  },
  {
    id: 'stu-006',
    name: '周果果',
    role: 'student',
    avatar: '🍎',
    active: true,
    classId: 'class-701',
    groupId: 'group-b',
    bio: '喜欢画画，想在美术社团大显身手。',
  },
  {
    id: 'parent-001',
    name: '陈大民',
    role: 'parent',
    avatar: '👨',
    active: true,
    childIds: ['stu-001'],
    bio: '陈乐乐的爸爸，关注孩子的每一点进步。',
  },
  {
    id: 'parent-002',
    name: '王梅',
    role: 'parent',
    avatar: '👩',
    active: true,
    childIds: ['stu-002'],
    bio: '王小虎的妈妈，最重视孩子的学习习惯。',
  },
  {
    id: 'parent-003',
    name: '李建国',
    role: 'parent',
    avatar: '🧔',
    active: true,
    childIds: ['stu-003'],
    bio: '李想想的爸爸，愿意陪孩子一起学英语。',
  },
];

// ===== 班级与小组 =====

export const seedClass: ClassInfo = {
  id: 'class-701',
  name: '七年级(1)班',
  grade: '2026级',
  teacherId: 'teacher-001',
  studentIds: ['stu-001', 'stu-002', 'stu-003', 'stu-004', 'stu-005', 'stu-006'],
};

export const seedGroups: GroupInfo[] = [
  {
    id: 'group-a',
    name: '积木小队',
    classId: 'class-701',
    memberIds: ['stu-001', 'stu-002', 'stu-003'],
    points: 112, // 38 + 45 + 29
    motto: '一块一块，搭出高分',
    color: 'brand',
  },
  {
    id: 'group-b',
    name: '闪电小队',
    classId: 'class-701',
    memberIds: ['stu-004', 'stu-005', 'stu-006'],
    points: 101, // 41 + 33 + 27
    motto: '快如闪电，准确第一',
    color: 'blue',
  },
];

// ===== 家长绑定 =====

export const seedBindings: ParentBinding[] = [
  { id: 'bd-1', parentId: 'parent-001', studentId: 'stu-001', relation: '父子' },
  { id: 'bd-2', parentId: 'parent-002', studentId: 'stu-002', relation: '母子' },
  { id: 'bd-3', parentId: 'parent-003', studentId: 'stu-003', relation: '父子' },
];

// ===== 学生个人积分（组内排行榜用）=====

export const seedStudentPoints: Record<string, number> = {
  'stu-001': 38,
  'stu-002': 45,
  'stu-003': 29,
  'stu-004': 41,
  'stu-005': 33,
  'stu-006': 27,
};

// ===== 教师评语 =====

export const seedTeacherComments: TeacherComment[] = [
  {
    id: 'tc-1',
    teacherId: 'teacher-001',
    teacherName: '林晚晴',
    studentId: 'stu-001',
    date: '2026-09-02',
    text:
      '乐乐，这周老师在批改 Starter Unit 2 的练习时惊喜地发现，你方位介词 in / on / under 的题目全部答对，单词闯关也一次通过！课堂上你领读的声音越来越响亮自信。接下来 Unit 1 要学习自我介绍了，期待你在课堂上大方地展示自己，加油！',
  },
  {
    id: 'tc-2',
    teacherId: 'teacher-001',
    teacherName: '林晚晴',
    studentId: 'stu-001',
    date: '2026-08-30',
    text:
      '乐乐你好！开学第一周你就做到了每天坚持晨读打卡，26 个字母书写工整漂亮，老师真为你高兴。中学的英语学习是一个全新的开始，遇到不懂的问题随时来问我。勇敢开口，慢慢来，你一定会越来越棒！',
  },
];

// ===== 学习进度 =====

export const seedProgress: Record<string, SeedProgress> = {
  'stu-001': {
    studentId: 'stu-001',
    streakDays: 12,
    exp: 2460,
    todayMinutes: 25,
    weekMinutes: 186,
    unitCompletion: {
      su1: 100,
      su2: 90,
      su3: 80,
      u1: 70,
      u2: 60,
      u3: 45,
      u4: 30,
      u5: 20,
      u6: 10,
      u7: 5,
    },
    moduleMastery: { vocabulary: 72, grammar: 58, listening: 66, reading: 61, writing: 45 },
    minutesOffsets: [30, 25, 40, 20, 35, 28, 25],
    badges: makeBadges([true, true, true, true, false, false]),
    assignmentDone: 1,
    assignmentTotal: 2,
  },
  'stu-002': {
    studentId: 'stu-002',
    streakDays: 9,
    exp: 1890,
    todayMinutes: 17,
    weekMinutes: 152,
    unitCompletion: { su1: 100, su2: 95, su3: 70, u1: 55, u2: 40, u3: 25, u4: 15, u5: 8, u6: 5, u7: 2 },
    moduleMastery: { vocabulary: 78, grammar: 52, listening: 70, reading: 64, writing: 40 },
    minutesOffsets: [20, 22, 18, 25, 30, 20, 17],
    badges: makeBadges([true, true, true, false, false, false]),
    assignmentDone: 2,
    assignmentTotal: 2,
  },
  'stu-003': {
    studentId: 'stu-003',
    streakDays: 5,
    exp: 1240,
    todayMinutes: 15,
    weekMinutes: 104,
    unitCompletion: { su1: 90, su2: 75, su3: 60, u1: 45, u2: 30, u3: 20, u4: 12, u5: 8, u6: 5, u7: 3 },
    moduleMastery: { vocabulary: 60, grammar: 70, listening: 55, reading: 58, writing: 48 },
    minutesOffsets: [12, 18, 10, 22, 15, 12, 15],
    badges: makeBadges([false, false, true, false, false, false]),
    assignmentDone: 1,
    assignmentTotal: 2,
  },
  'stu-004': {
    studentId: 'stu-004',
    streakDays: 7,
    exp: 1650,
    todayMinutes: 22,
    weekMinutes: 140,
    unitCompletion: { su1: 100, su2: 85, su3: 75, u1: 65, u2: 50, u3: 40, u4: 25, u5: 15, u6: 10, u7: 5 },
    moduleMastery: { vocabulary: 74, grammar: 68, listening: 50, reading: 70, writing: 55 },
    minutesOffsets: [18, 20, 25, 15, 22, 18, 22],
    badges: makeBadges([true, true, false, true, true, false]),
    assignmentDone: 2,
    assignmentTotal: 2,
  },
  'stu-005': {
    studentId: 'stu-005',
    streakDays: 3,
    exp: 980,
    todayMinutes: 12,
    weekMinutes: 83,
    unitCompletion: { su1: 85, su2: 70, su3: 55, u1: 40, u2: 28, u3: 18, u4: 12, u5: 8, u6: 5, u7: 3 },
    moduleMastery: { vocabulary: 62, grammar: 50, listening: 58, reading: 45, writing: 38 },
    minutesOffsets: [15, 0, 20, 10, 18, 8, 12],
    badges: makeBadges([false, true, true, false, false, false]),
    assignmentDone: 1,
    assignmentTotal: 2,
  },
  'stu-006': {
    studentId: 'stu-006',
    streakDays: 4,
    exp: 860,
    todayMinutes: 10,
    weekMinutes: 79,
    unitCompletion: { su1: 80, su2: 65, su3: 50, u1: 35, u2: 25, u3: 15, u4: 10, u5: 5, u6: 3, u7: 2 },
    moduleMastery: { vocabulary: 58, grammar: 46, listening: 52, reading: 56, writing: 50 },
    minutesOffsets: [10, 15, 12, 8, 14, 10, 10],
    badges: makeBadges([false, false, true, true, false, false]),
    assignmentDone: 0,
    assignmentTotal: 2,
  },
};

// ===== 小游戏记录 =====

export const seedGameResults: SeedGameResult[] = [
  {
    id: 'gr-1',
    studentId: 'stu-001',
    game: 'match',
    daysAgo: 0,
    score: 320,
    accuracy: 92,
    durationSec: 95,
    combo: 8,
    pointsGained: 32,
    wrongs: [{ question: 'bird 鸟', yourAnswer: 'bear', correctAnswer: 'bird' }],
  },
  {
    id: 'gr-2',
    studentId: 'stu-002',
    game: 'spelling',
    daysAgo: 0,
    score: 480,
    accuracy: 88,
    durationSec: 150,
    combo: 10,
    pointsGained: 40,
    wrongs: [
      { question: '拼写“书桌”', yourAnswer: 'deks', correctAnswer: 'desk' },
      { question: '拼写“黄色”', yourAnswer: 'yello', correctAnswer: 'yellow' },
    ],
  },
  {
    id: 'gr-3',
    studentId: 'stu-001',
    game: 'listen',
    daysAgo: 1,
    score: 260,
    accuracy: 80,
    durationSec: 120,
    combo: 5,
    pointsGained: 26,
    wrongs: [{ question: '听音选物：Which one is a ruler?', yourAnswer: 'B', correctAnswer: 'C' }],
  },
  {
    id: 'gr-4',
    studentId: 'stu-004',
    game: 'sentence',
    daysAgo: 1,
    score: 540,
    accuracy: 94,
    durationSec: 210,
    combo: 12,
    pointsGained: 45,
    wrongs: [
      {
        question: '连词成句：is / name / what / your (?)',
        yourAnswer: 'What your name is?',
        correctAnswer: 'What is your name?',
      },
    ],
  },
  {
    id: 'gr-5',
    studentId: 'stu-002',
    game: 'match',
    daysAgo: 2,
    score: 410,
    accuracy: 90,
    durationSec: 105,
    combo: 9,
    pointsGained: 41,
    wrongs: [{ question: 'eraser 橡皮', yourAnswer: 'ruler', correctAnswer: 'eraser' }],
  },
  {
    id: 'gr-6',
    studentId: 'stu-005',
    game: 'grammar',
    daysAgo: 2,
    score: 180,
    accuracy: 68,
    durationSec: 90,
    combo: 4,
    pointsGained: 18,
    wrongs: [
      { question: 'She ___ my English teacher. (be 动词)', yourAnswer: 'are', correctAnswer: 'is' },
      { question: 'They ___ my new friends. (be 动词)', yourAnswer: 'is', correctAnswer: 'are' },
      { question: 'I ___ in Class 3. (be 动词)', yourAnswer: 'is', correctAnswer: 'am' },
    ],
  },
  {
    id: 'gr-7',
    studentId: 'stu-001',
    game: 'spelling',
    daysAgo: 3,
    score: 390,
    accuracy: 85,
    durationSec: 160,
    combo: 7,
    pointsGained: 39,
    wrongs: [{ question: '拼写“图书馆”', yourAnswer: 'libary', correctAnswer: 'library' }],
  },
  {
    id: 'gr-8',
    studentId: 'stu-003',
    game: 'sentence',
    daysAgo: 4,
    score: 300,
    accuracy: 78,
    durationSec: 180,
    combo: 6,
    pointsGained: 30,
    wrongs: [
      {
        question: '连词成句：your / in / schoolbag / what / is (?)',
        yourAnswer: 'What in your schoolbag is?',
        correctAnswer: 'What is in your schoolbag?',
      },
    ],
  },
  {
    id: 'gr-9',
    studentId: 'stu-006',
    game: 'listen',
    daysAgo: 4,
    score: 150,
    accuracy: 60,
    durationSec: 110,
    combo: 3,
    pointsGained: 15,
    wrongs: [
      { question: '听音选颜色：What colour is the cap?', yourAnswer: 'Blue', correctAnswer: 'Yellow' },
      { question: '听音选位置：Where are the books?', yourAnswer: 'On the chair', correctAnswer: 'Under the chair' },
    ],
  },
  {
    id: 'gr-10',
    studentId: 'stu-004',
    game: 'match',
    daysAgo: 5,
    score: 880,
    accuracy: 97,
    durationSec: 240,
    combo: 16,
    pointsGained: 50,
    wrongs: [],
  },
  {
    id: 'gr-11',
    studentId: 'stu-002',
    game: 'grammar',
    daysAgo: 5,
    score: 350,
    accuracy: 86,
    durationSec: 100,
    combo: 8,
    pointsGained: 35,
    wrongs: [{ question: '___ you like music? (do / does)', yourAnswer: 'Does', correctAnswer: 'Do' }],
  },
  {
    id: 'gr-12',
    studentId: 'stu-005',
    game: 'spelling',
    daysAgo: 6,
    score: 120,
    accuracy: 55,
    durationSec: 140,
    combo: 2,
    pointsGained: 10,
    wrongs: [{ question: '拼写“兔子”', yourAnswer: 'rabit', correctAnswer: 'rabbit' }],
  },
];

// ===== 考试记录 =====

export const seedExamRecords: SeedExamRecord[] = [
  {
    id: 'er-1',
    examId: 'exam-1',
    examTitle: '期中冲刺 · Starter–Unit 3 综合',
    studentId: 'stu-001',
    daysAgo: 6,
    score: 85,
    total: 100,
    moduleScores: { vocabulary: 20, grammar: 18, listening: 24, reading: 23 },
    details: [
      { questionId: 'q-e1-01', yourAnswer: 'B', correct: true },
      { questionId: 'q-e1-02', yourAnswer: 'C', correct: true },
      { questionId: 'q-e1-03', yourAnswer: 'A', correct: true },
      { questionId: 'q-e1-04', yourAnswer: 'D', correct: false },
      { questionId: 'q-e1-05', yourAnswer: 'A', correct: true },
      { questionId: 'q-e1-06', yourAnswer: 'B', correct: true },
      { questionId: 'q-e1-07', yourAnswer: 'C', correct: false },
      { questionId: 'q-e1-08', yourAnswer: 'A', correct: true },
    ],
  },
  {
    id: 'er-2',
    examId: 'exam-1',
    examTitle: '期中冲刺 · Starter–Unit 3 综合',
    studentId: 'stu-002',
    daysAgo: 6,
    score: 92,
    total: 100,
    moduleScores: { vocabulary: 24, grammar: 22, listening: 24, reading: 22 },
    details: [
      { questionId: 'q-e1-01', yourAnswer: 'B', correct: true },
      { questionId: 'q-e1-02', yourAnswer: 'C', correct: true },
      { questionId: 'q-e1-03', yourAnswer: 'A', correct: true },
      { questionId: 'q-e1-04', yourAnswer: 'B', correct: true },
      { questionId: 'q-e1-05', yourAnswer: 'A', correct: true },
      { questionId: 'q-e1-06', yourAnswer: 'D', correct: true },
      { questionId: 'q-e1-07', yourAnswer: 'C', correct: false },
      { questionId: 'q-e1-08', yourAnswer: 'A', correct: true },
    ],
  },
  {
    id: 'er-3',
    examId: 'exam-1',
    examTitle: '期中冲刺 · Starter–Unit 3 综合',
    studentId: 'stu-004',
    daysAgo: 6,
    score: 78,
    total: 100,
    moduleScores: { vocabulary: 18, grammar: 20, listening: 16, reading: 24 },
    details: [
      { questionId: 'q-e1-01', yourAnswer: 'B', correct: true },
      { questionId: 'q-e1-02', yourAnswer: 'A', correct: false },
      { questionId: 'q-e1-03', yourAnswer: 'C', correct: false },
      { questionId: 'q-e1-04', yourAnswer: 'B', correct: true },
      { questionId: 'q-e1-05', yourAnswer: 'D', correct: true },
      { questionId: 'q-e1-06', yourAnswer: 'B', correct: true },
      { questionId: 'q-e1-07', yourAnswer: 'A', correct: true },
      { questionId: 'q-e1-08', yourAnswer: 'C', correct: true },
    ],
  },
  {
    id: 'er-4',
    examId: 'exam-1',
    examTitle: '期中冲刺 · Starter–Unit 3 综合',
    studentId: 'stu-005',
    daysAgo: 6,
    score: 88,
    total: 100,
    moduleScores: { vocabulary: 22, grammar: 18, listening: 26, reading: 22 },
    details: [
      { questionId: 'q-e1-01', yourAnswer: 'B', correct: true },
      { questionId: 'q-e1-02', yourAnswer: 'C', correct: true },
      { questionId: 'q-e1-03', yourAnswer: 'A', correct: true },
      { questionId: 'q-e1-04', yourAnswer: 'D', correct: false },
      { questionId: 'q-e1-05', yourAnswer: 'A', correct: true },
      { questionId: 'q-e1-06', yourAnswer: 'B', correct: true },
      { questionId: 'q-e1-07', yourAnswer: 'D', correct: true },
      { questionId: 'q-e1-08', yourAnswer: 'A', correct: false },
    ],
  },
  {
    id: 'er-5',
    examId: 'exam-2',
    examTitle: '期末冲刺 · Unit 4–Unit 7 综合',
    studentId: 'stu-002',
    daysAgo: 2,
    score: 82,
    total: 100,
    moduleScores: { vocabulary: 22, grammar: 16, listening: 22, reading: 22 },
    details: [
      { questionId: 'q-e2-01', yourAnswer: 'C', correct: true },
      { questionId: 'q-e2-02', yourAnswer: 'A', correct: true },
      { questionId: 'q-e2-03', yourAnswer: 'B', correct: false },
      { questionId: 'q-e2-04', yourAnswer: 'D', correct: true },
      { questionId: 'q-e2-05', yourAnswer: 'C', correct: false },
      { questionId: 'q-e2-06', yourAnswer: 'A', correct: true },
    ],
  },
];

// ===== 错题本（陈乐乐的错题记录）=====

export const seedWrongItems: SeedWrongItem[] = [
  {
    key: 'wi-1',
    source: 'practice',
    kind: '语法选择',
    unitId: 'u1',
    question: 'Choose the right word: 我___a student. (be 动词)',
    yourAnswer: 'is',
    correctAnswer: 'am',
    explain:
      '主语“我”后面要用 be 动词 am，不能跟 is。口诀：我用 am，你用 are，is 跟着他、她、它。I am 还可以缩写成 I\'m。',
    wrongTimes: 2,
    daysAgo: 1,
    reviewStreak: 1,
    status: 'active',
  },
  {
    key: 'wi-2',
    source: 'unit-test',
    kind: '词汇选择',
    unitId: 'u2',
    question: "Choose the right word: My father's mother is my ___. (grandmother / grandfather)",
    yourAnswer: 'grandfather',
    correctAnswer: 'grandmother',
    explain:
      '“父亲的妈妈”是奶奶，英文是 grandmother；grandfather 指“爷爷、外公”。记住 -mother 结尾是女性、-father 结尾是男性，就不会选错了。',
    wrongTimes: 1,
    daysAgo: 2,
    reviewStreak: 1,
    status: 'active',
  },
  {
    key: 'wi-3',
    source: 'unit-test',
    kind: '听力理解',
    unitId: 'u3',
    question: 'Listen and choose: Where is the library?',
    yourAnswer: 'Next to the dining hall',
    correctAnswer: 'Across from the dining hall',
    explain:
      '录音里说的是 “The library is across from the dining hall.”（图书馆在食堂对面）。across from 意为“在……对面”，不要和 next to（在……旁边）混淆。',
    wrongTimes: 3,
    daysAgo: 3,
    reviewStreak: 0,
    status: 'active',
  },
  {
    key: 'wi-4',
    source: 'exam',
    kind: '连词成句',
    unitId: 'u1',
    question: '连词成句：is / she / my / friend (.)',
    yourAnswer: 'She is friend my.',
    correctAnswer: 'She is my friend.',
    explain:
      '连词成句要按英语语序排列：主语 + be 动词 + 其他成分。“我的朋友”是 my friend，物主代词 my 必须放在名词 friend 前面，不能拆开。',
    wrongTimes: 1,
    daysAgo: 5,
    reviewStreak: 2,
    status: 'mastered',
  },
  {
    key: 'wi-5',
    source: 'game',
    kind: '拼写',
    unitId: 'u2',
    question: 'Spell the word: 家庭 (f_____)',
    yourAnswer: 'famliy',
    correctAnswer: 'family',
    explain:
      'family 的正确拼写是 f-a-m-i-l-y，注意第三、四个字母是 i 和 l，不要写反。可以这样记：father and mother I love you，六个单词的首字母连起来就是 family！',
    wrongTimes: 2,
    daysAgo: 4,
    reviewStreak: 2,
    status: 'mastered',
  },
];

// ===== 写作工坊提交记录 =====

export const seedWritingSubmissions: SeedWritingSubmission[] = [
  {
    id: 'ws-1',
    taskId: 'wt2',
    taskTitle: 'My School Day',
    studentId: 'stu-002',
    studentName: '王小虎',
    daysAgo: 1,
    score: 0,
    comment: '',
    graded: false,
    content:
      "My name is Wang Xiaohu. I am a student in Class 1, Grade 7. I get up at six thirty every morning, and I have breakfast at seven o'clock. At half past seven, I go to school by bike. My favourite subject is PE because we can play games. After school, I play basketball with my friends, and I go to bed at nine thirty.",
  },
  {
    id: 'ws-2',
    taskId: 'wt2',
    taskTitle: 'My School Day',
    studentId: 'stu-004',
    studentName: '赵一一',
    daysAgo: 3,
    score: 88,
    comment:
      '一一的短文结构清楚，按时间顺序展开，能正确使用 get up、have breakfast、go to bed 等本单元重点短语，还用 and 把句子连得很自然，真棒！小建议：可以把其中两个时间换一种说法，比如 half past six，文章会更丰富。继续加油！',
    graded: true,
    content:
      'My school day is busy but happy. I get up at six o\'clock and do morning exercises for twenty minutes. At seven, I have breakfast with my parents, and classes begin at eight. I have four classes in the morning and two in the afternoon. After school, I do my homework first, and then I read English for half an hour. I love my busy but happy school day!',
  },
];

// ===== 作业 =====

export const seedAssignments: Assignment[] = [
  {
    id: 'asg-1',
    teacherId: 'teacher-001',
    teacherName: '林晚晴',
    classId: 'class-701',
    title: 'Unit 1 词汇语法小练',
    type: 'practice',
    unitId: 'u1',
    description: '完成 6 道词汇与语法选择题，巩固 be 动词和主格代词。',
    questionIds: ['q-p01', 'q-p02', 'q-p03', 'q-p08', 'q-p09', 'q-p10'],
    dueDate: '2026-09-08',
    createdAt: '2026-09-03',
  },
  {
    id: 'asg-2',
    teacherId: 'teacher-001',
    teacherName: '林晚晴',
    classId: 'class-701',
    title: '写作任务：My School Day',
    type: 'writing',
    unitId: 'u6',
    description: '用一般现在时写 5 句以上短文，介绍你的学校一天。请先在写作工坊列提纲。',
    questionIds: [],
    writingTaskId: 'wt2',
    dueDate: '2026-09-12',
    createdAt: '2026-09-04',
  },
];
