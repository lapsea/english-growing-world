// ===== 全局类型定义（唯一来源，数据层与页面共用）=====

export type Role = 'student' | 'parent' | 'teacher'
export type ModuleKey = 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'writing'
export type QuestionModule = 'vocabulary' | 'grammar' | 'listening' | 'reading'
export type QuestionType = 'choice' | 'fill' | 'judge'
export type AnswerSource = 'practice' | 'unit-test' | 'exam' | 'game'
export type MasteryStatus = 'unlearned' | 'learning' | 'mastered'
export type UnitColor = 'brand' | 'blue' | 'coral' | 'lav' | 'ice'
export type GameKey = 'match' | 'spelling' | 'listen' | 'sentence' | 'grammar'

// ===== 用户与组织 =====

export interface User {
  id: string
  name: string
  role: Role
  avatar: string
  active: boolean
  classId?: string
  groupId?: string
  childIds?: string[]
  teacherTitle?: string
  bio?: string
}

export interface ClassInfo {
  id: string
  name: string
  grade: string
  teacherId: string
  studentIds: string[]
}

export interface GroupInfo {
  id: string
  name: string
  classId: string
  memberIds: string[]
  points: number
  motto: string
  color: UnitColor
}

export interface ParentBinding {
  id: string
  parentId: string
  studentId: string
  relation: string
}

// ===== 教材单元 =====

export interface Phrase {
  id: string
  en: string
  zh: string
}

export interface GrammarExample {
  en: string
  zh: string
}

export interface GrammarPoint {
  name: string
  explain: string
  examples: GrammarExample[]
}

export interface Unit {
  id: string
  kind: 'starter' | 'unit'
  order: number
  title: string
  titleZh: string
  bigQuestion: string
  bigIdea: string
  page: number
  color: UnitColor
  pronunciation: string
  goals: string[]
  themeContext: string
  phrases: Phrase[]
  grammar: { title: string; points: GrammarPoint[] }
  listeningIds: string[]
  readingIds: string[]
  writingTaskIds: string[]
}

// ===== 单词 =====

export interface Word {
  id: string
  unitId: string
  en: string
  phonetic: string
  pos: string
  zh: string
  exampleEn: string
  exampleZh: string
}

export interface WordWithState extends Word {
  mastery: MasteryStatus
  favorite: boolean
}

export interface WordFilter {
  unitId?: string
  pos?: string
  mastery?: MasteryStatus
  favorite?: boolean
  keyword?: string
}

// ===== 听力 =====

export interface ListeningQuiz {
  lineIndex: number
  type: 'choice' | 'fill'
  question: string
  options?: string[]
  answer: string
  explain: string
}

export interface ListeningLine {
  speaker?: string
  en: string
  zh: string
}

export interface ListeningProgram {
  id: string
  unitId: string
  title: string
  titleZh: string
  type: 'words' | 'sentences' | 'dialogue'
  theme: string
  difficulty: 1 | 2 | 3
  durationMin: number
  keywords: { en: string; zh: string }[]
  lines: ListeningLine[]
  quiz: ListeningQuiz[]
}

export interface ListeningFilter {
  unitId?: string
  type?: string
  difficulty?: number
}

export interface ListeningRecord {
  programId: string
  lastLine: number
  finished: boolean
  bestScore: number | null
  plays: number
  favorite: boolean
  lastAt: string
}

// ===== 阅读 =====

export interface ReadingExercise {
  q: string
  options: string[]
  answer: number
  explain: string
}

export interface ReadingArticle {
  id: string
  unitId: string
  title: string
  titleZh: string
  genre: string
  topic: string
  difficulty: 1 | 2 | 3
  wordCount: number
  guide: string
  paragraphs: { en: string; zh: string }[]
  glossary: { word: string; zh: string }[]
  exercises: ReadingExercise[]
}

export interface ReadingFilter {
  unitId?: string
  genre?: string
  difficulty?: number
}

export interface ReadingRecord {
  articleId: string
  lastParagraph: number
  finished: boolean
  favorite: boolean
  bestScore: number | null
  lastAt: string
}

// ===== 写作 =====

export interface WritingTask {
  id: string
  unitId: string
  title: string
  prompt: string
  requirements: string[]
  usefulWords: { en: string; zh: string }[]
  patterns: { pattern: string; zh: string }[]
  structure: { step: string; detail: string }[]
  sample: { text: string[]; comment: string; score: number }
}

export interface WritingDraft {
  taskId: string
  outline: string[]
  content: string
  updatedAt: string
}

export interface WritingSubmission {
  id: string
  taskId: string
  taskTitle: string
  studentId: string
  studentName: string
  content: string
  submittedAt: string
  score: number
  comment: string
  graded: boolean
}

// ===== 题目 / 考试 =====

export interface Question {
  id: string
  type: QuestionType
  module: QuestionModule
  unitId: string
  stem: string
  audioLine?: string
  options?: string[]
  answer: string
  explain: string
}

export interface ExamChallenge {
  id: string
  title: string
  subtitle: string
  unitIds: string[]
  durationMin: number
  totalScore: number
  published: boolean
  questions: Question[]
}

export interface NewExamData {
  title: string
  subtitle: string
  unitIds: string[]
  durationMin: number
  questions: Question[]
}

export interface NewUserData {
  name: string
  role: Role
  avatar: string
  bio?: string
  groupId?: string
  childIds?: string[]
  teacherTitle?: string
}

export interface ExamDetail {
  questionId: string
  yourAnswer: string
  correct: boolean
}

export interface ExamRecord {
  id: string
  examId: string
  examTitle: string
  studentId: string
  date: string
  score: number
  total: number
  moduleScores: Record<QuestionModule, number>
  details: ExamDetail[]
}

export interface UnitQuiz {
  id: string
  title: string
  questions: Question[]
}

// ===== 作业 =====

export interface Assignment {
  id: string
  teacherId: string
  teacherName: string
  classId: string
  title: string
  type: 'practice' | 'writing' | 'listening'
  unitId: string
  description: string
  questionIds: string[]
  writingTaskId?: string
  dueDate: string
  createdAt: string
}

export interface AssignmentWithStatus extends Assignment {
  status: 'pending' | 'done'
  submittedAt?: string
  score?: number
}

export interface NewAssignmentData {
  teacherId: string
  classId: string
  title: string
  type: 'practice' | 'writing' | 'listening'
  unitId: string
  description: string
  questionIds: string[]
  writingTaskId?: string
  dueDate: string
}

// ===== 错题本 =====

export interface WrongItem {
  key: string
  source: AnswerSource
  kind: string
  unitId: string
  question: string
  yourAnswer: string
  correctAnswer: string
  explain: string
  wrongTimes: number
  lastWrongAt: string
  reviewStreak: number
  status: 'active' | 'mastered'
}

export interface WrongFilter {
  unitId?: string
  kind?: string
  status?: 'active' | 'mastered'
  minTimes?: number
}

// ===== 学习进度 =====

export interface Badge {
  id: string
  name: string
  icon: string
  desc: string
  got: boolean
}

export interface DailyMinutes {
  date: string
  minutes: number
}

export interface StudentProgress {
  studentId: string
  streakDays: number
  exp: number
  level: number
  todayMinutes: number
  weekMinutes: number
  lastActiveDate?: string
  unitCompletion: Record<string, number>
  moduleMastery: Record<ModuleKey, number>
  dailyMinutes: DailyMinutes[]
  badges: Badge[]
  assignmentDone: number
  assignmentTotal: number
}

// ===== 小游戏 =====

export interface GameWrong {
  question: string
  yourAnswer: string
  correctAnswer: string
}

export interface GameResult {
  id: string
  studentId: string
  game: GameKey
  date: string
  score: number
  accuracy: number
  durationSec: number
  combo: number
  wrongs: GameWrong[]
  pointsGained: number
}

// ===== 家校 =====

export interface TeacherComment {
  id: string
  teacherId: string
  teacherName: string
  studentId: string
  date: string
  text: string
}

export interface LeaderboardEntry {
  studentId: string
  name: string
  groupId: string
  groupName: string
  points: number
  exp: number
}

export interface GroupStanding {
  group: GroupInfo
  totalPoints: number
  rank: number
}

export interface ParentReport {
  studentId: string
  weekLabel: string
  generatedAt: string
  totalMinutes: number
  daysActive: number
  finishedTasks: number
  unitSummary: { unitId: string; unitTitle: string; completion: number }[]
  strongest: ModuleKey
  weakest: ModuleKey
  topWrongWords: { question: string; times: number }[]
  examScores: { title: string; score: number; total: number; date: string }[]
  summaryText: string
  suggestion: string
}

// ===== 管理端 =====

export interface BrowseCollection {
  name: string
  label: string
  count: number
  rows: Record<string, unknown>[]
}

// ===== 其他 =====

export interface GrammarDetectItem {
  sentence: string
  wrongIndex: number
  fix: string
  options: string[]
  explain: string
  corrected: string
}

export interface GameContent {
  scrambleSentences: string[]
  grammarItems: GrammarDetectItem[]
}

export interface AnswerPayload {
  studentId: string
  question: Question
  yourAnswer: string
  source: AnswerSource
}

export interface AnswerFeedback {
  correct: boolean
  explain: string
}

export const MODULE_LABELS: Record<ModuleKey, string> = {
  vocabulary: '词汇',
  grammar: '语法',
  listening: '听力',
  reading: '阅读',
  writing: '写作',
}

export const GAME_LABELS: Record<GameKey, string> = {
  match: '单词消消乐',
  spelling: '拼写冲刺',
  listen: '听音寻词',
  sentence: '句子工厂',
  grammar: '语法侦探',
}

export const SOURCE_LABELS: Record<AnswerSource, string> = {
  practice: '练习',
  'unit-test': '单元测验',
  exam: '考试挑战',
  game: '小游戏',
}
