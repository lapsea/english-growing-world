import type {
  Assignment,
  AssignmentWithStatus,
  AnswerFeedback,
  AnswerPayload,
  Badge,
  BrowseCollection,
  ClassInfo,
  ExamChallenge,
  ExamRecord,
  GameKey,
  GameResult,
  GroupInfo,
  GroupStanding,
  LeaderboardEntry,
  ListeningFilter,
  ListeningProgram,
  ListeningRecord,
  MasteryStatus,
  ModuleKey,
  NewAssignmentData,
  NewExamData,
  NewUserData,
  ParentBinding,
  ParentReport,
  Question,
  QuestionModule,
  ReadingArticle,
  ReadingFilter,
  ReadingRecord,
  StudentProgress,
  TeacherComment,
  Unit,
  UnitQuiz,
  User,
  WordFilter,
  WordWithState,
  WritingDraft,
  WritingSubmission,
  WritingTask,
  WrongFilter,
  WrongItem,
  GameContent,
} from '../types'
import type { Repository } from './repository'
import { loadJSON, saveJSON, clearAllStorage, storageUsageKB } from './storage'
import { units } from '../data/units'
import { words } from '../data/words'
import { listeningPrograms } from '../data/listening'
import { readingArticles } from '../data/reading'
import { writingTasks } from '../data/writing'
import { practiceQuestions } from '../data/questions'
import { examChallenges } from '../data/exams'
import {
  seedUsers,
  seedClass,
  seedGroups,
  seedBindings,
  seedStudentPoints,
  seedTeacherComments,
  seedProgress,
  seedGameResults,
  seedExamRecords,
  seedWrongItems,
  seedWritingSubmissions,
  seedAssignments,
} from '../data/community'
import { scrambleSentences, grammarDetectItems } from '../data/gameContent'

const DB_KEY = 'mock-db'
const DB_VERSION = 6

interface WordState {
  status: MasteryStatus
  favorite: boolean
}

interface MockDB {
  version: number
  currentUserId: string
  wordStates: Record<string, Record<string, WordState>>
  listeningRecords: Record<string, Record<string, ListeningRecord>>
  readingRecords: Record<string, Record<string, ReadingRecord>>
  wrongItems: Record<string, WrongItem[]>
  progress: Record<string, StudentProgress>
  gameResults: Record<string, GameResult[]>
  examRecords: Record<string, ExamRecord[]>
  assignmentsExtra: Assignment[]
  assignmentRecords: Record<string, Record<string, { status: 'pending' | 'done'; submittedAt?: string; score?: number }>>
  writingDrafts: Record<string, Record<string, WritingDraft>>
  writingSubmissions: WritingSubmission[]
  userQuestions: Question[]
  deletedQuestionIds: string[]
  examPublished: Record<string, boolean>
  userExams: ExamChallenge[]
  deletedExamIds: string[]
  userActive: Record<string, boolean>
  userOverrides: Record<string, Partial<User>>
  newUsers: User[]
  deletedUserIds: string[]
  classOverrides: Partial<Pick<ClassInfo, 'studentIds'>>
  bindingsExtra: ParentBinding[]
  removedBindingIds: string[]
  groupOverrides: Record<string, Partial<GroupInfo>>
  teacherComments: TeacherComment[]
}

// ---------- 日期工具 ----------
function iso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function todayISO(): string {
  return iso(new Date())
}
function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return iso(d)
}
function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10)
}
function weekLabelOf(d = new Date()): string {
  const start = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
  return `${d.getFullYear()} 年第 ${week} 周`
}
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.?!。？！\s]+$/g, '').replace(/\s+/g, ' ')
}

function defaultWordState(): WordState {
  return { status: 'unlearned', favorite: false }
}

// ---------- 初始化种子数据 ----------
function buildSeedDB(): MockDB {
  const wordStates: Record<string, Record<string, WordState>> = {}
  // 为演示学生预置部分掌握度：已学完单元大部分掌握，进行中单元部分学习中
  const stu1: Record<string, WordState> = {}
  words.forEach((w, i) => {
    const unit = w.unitId
    let status: MasteryStatus = 'unlearned'
    const order = ['su1', 'su2', 'su3', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'].indexOf(unit)
    if (order <= 2) status = i % 4 === 0 ? 'learning' : 'mastered'
    else if (order <= 4) status = i % 3 === 0 ? 'mastered' : i % 2 === 0 ? 'learning' : 'unlearned'
    else if (order === 5) status = i % 3 === 0 ? 'learning' : 'unlearned'
    stu1[w.id] = { status, favorite: false }
  })
  const favByEn = ['hobby', 'rabbit', 'cake', 'guitar', 'library']
  favByEn.forEach((en) => {
    const w = words.find((x) => x.en === en)
    if (w) stu1[w.id] = { ...stu1[w.id], favorite: true }
  })
  wordStates['stu-001'] = stu1

  const progress: Record<string, StudentProgress> = {}
  for (const [sid, sp] of Object.entries(seedProgress)) {
    const daily = sp.minutesOffsets.map((m, i) => ({ date: daysAgoISO(6 - i), minutes: m }))
    progress[sid] = {
      studentId: sid,
      streakDays: sp.streakDays,
      exp: sp.exp,
      level: Math.floor(sp.exp / 500) + 1,
      todayMinutes: daily[6]?.minutes ?? 0,
      weekMinutes: daily.reduce((s, d) => s + d.minutes, 0),
      lastActiveDate: todayISO(),
      unitCompletion: sp.unitCompletion,
      moduleMastery: sp.moduleMastery,
      dailyMinutes: daily,
      badges: sp.badges,
      assignmentDone: sp.assignmentDone,
      assignmentTotal: sp.assignmentTotal,
    }
  }

  const gameResults: Record<string, GameResult[]> = {}
  Object.keys(progress).forEach((sid) => (gameResults[sid] = []))
  seedGameResults.forEach((g, i) => {
    gameResults[g.studentId].push({
      id: `gseed-${i + 1}`,
      studentId: g.studentId,
      game: g.game,
      date: daysAgoISO(g.daysAgo),
      score: g.score,
      accuracy: g.accuracy,
      durationSec: g.durationSec,
      combo: g.combo,
      wrongs: g.wrongs,
      pointsGained: g.pointsGained,
    })
  })

  const examRecords: Record<string, ExamRecord[]> = {}
  Object.keys(progress).forEach((sid) => (examRecords[sid] = []))
  seedExamRecords.forEach((r) => {
    examRecords[r.studentId].push({
      id: r.id,
      examId: r.examId,
      examTitle: r.examTitle,
      studentId: r.studentId,
      date: daysAgoISO(r.daysAgo),
      score: r.score,
      total: r.total,
      moduleScores: r.moduleScores,
      details: r.details,
    })
  })

  const wrongItems: Record<string, WrongItem[]> = {}
  Object.keys(progress).forEach((sid) => (wrongItems[sid] = []))
  wrongItems['stu-001'] = seedWrongItems.map((w) => ({
    key: w.key,
    source: w.source,
    kind: w.kind,
    unitId: w.unitId,
    question: w.question,
    yourAnswer: w.yourAnswer,
    correctAnswer: w.correctAnswer,
    explain: w.explain,
    wrongTimes: w.wrongTimes,
    lastWrongAt: daysAgoISO(w.daysAgo),
    reviewStreak: w.reviewStreak,
    status: w.status,
  }))

  const assignmentRecords: MockDB['assignmentRecords'] = {}
  Object.keys(progress).forEach((sid) => (assignmentRecords[sid] = {}))
  assignmentRecords['stu-001']['asg-1'] = { status: 'done', submittedAt: daysAgoISO(1), score: 83 }
  assignmentRecords['stu-002']['asg-1'] = { status: 'done', submittedAt: daysAgoISO(1), score: 100 }
  assignmentRecords['stu-002']['asg-2'] = { status: 'done', submittedAt: daysAgoISO(1) }
  assignmentRecords['stu-003']['asg-1'] = { status: 'done', submittedAt: daysAgoISO(2), score: 67 }
  assignmentRecords['stu-004']['asg-1'] = { status: 'done', submittedAt: daysAgoISO(2), score: 100 }
  assignmentRecords['stu-004']['asg-2'] = { status: 'done', submittedAt: daysAgoISO(3) }
  assignmentRecords['stu-005']['asg-1'] = { status: 'done', submittedAt: daysAgoISO(1), score: 50 }
  assignmentRecords['stu-006']['asg-1'] = { status: 'done', submittedAt: daysAgoISO(1), score: 83 }

  const userActive: Record<string, boolean> = {}
  seedUsers.forEach((u) => (userActive[u.id] = true))

  return {
    version: DB_VERSION,
    currentUserId: 'stu-001',
    userOverrides: {},
    newUsers: [],
    deletedUserIds: [],
    classOverrides: {},
    wordStates,
    listeningRecords: {},
    readingRecords: {},
    wrongItems,
    progress,
    gameResults,
    examRecords,
    assignmentsExtra: [],
    assignmentRecords,
    writingDrafts: {},
    writingSubmissions: seedWritingSubmissions.map((s, i) => ({
      id: `wsub-seed-${i + 1}`,
      taskId: s.taskId,
      taskTitle: s.taskTitle,
      studentId: s.studentId,
      studentName: s.studentName,
      content: s.content,
      submittedAt: daysAgoISO(s.daysAgo),
      score: s.score,
      comment: s.comment,
      graded: s.graded,
    })),
    userQuestions: [],
    deletedQuestionIds: [],
    examPublished: {},
    userExams: [],
    deletedExamIds: [],
    userActive,
    bindingsExtra: [],
    removedBindingIds: [],
    groupOverrides: {},
    teacherComments: seedTeacherComments,
  }
}

// ---------- MockRepository ----------
export class MockRepository implements Repository {
  private db: MockDB
  private listeners = new Set<() => void>()

  constructor() {
    const stored = loadJSON<MockDB | null>(DB_KEY, null)
    if (stored && stored.version === DB_VERSION) {
      this.db = stored
    } else {
      this.db = buildSeedDB()
      this.persist()
    }
  }

  private persist() {
    saveJSON(DB_KEY, this.db)
  }

  private notify() {
    this.persist()
    this.listeners.forEach((cb) => cb())
  }

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  /** 当前展示视角对应的学生（老师/家长视角下默认看演示学生） */
  private viewStudentId(): string {
    const user = this.userSync(this.db.currentUserId)
    if (user?.role === 'student') return user.id
    if (user?.role === 'parent') return user.childIds?.[0] ?? 'stu-001'
    return 'stu-001'
  }

  private userSync(id: string): User | undefined {
    return this.allUsersSync().find((u) => u.id === id)
  }

  private studentsSync(): User[] {
    return this.allUsersSync().filter((u) => u.role === 'student')
  }

  private activeOf(u: User): boolean {
    return this.db.userActive[u.id] ?? u.active
  }

  private allUsersSync(): User[] {
    return [...seedUsers, ...this.db.newUsers]
      .filter((u) => !this.db.deletedUserIds.includes(u.id))
      .map((u) => ({ ...u, ...this.db.userOverrides[u.id], active: this.activeOf(u) }))
  }

  private classSync(): ClassInfo {
    const studentIds = this.db.classOverrides.studentIds ?? seedClass.studentIds
    return { ...seedClass, ...this.db.classOverrides, studentIds }
  }

  private groupsSync(): GroupInfo[] {
    return seedGroups.map((g) => ({ ...g, ...this.db.groupOverrides[g.id] }))
  }

  private assignmentsSync(): Assignment[] {
    return [...seedAssignments, ...this.db.assignmentsExtra]
  }

  private bindingsSync(): ParentBinding[] {
    return [...seedBindings.filter((b) => !this.db.removedBindingIds.includes(b.id)), ...this.db.bindingsExtra]
  }

  private questionsSync(): Question[] {
    return [...practiceQuestions, ...this.db.userQuestions].filter((q) => !this.db.deletedQuestionIds.includes(q.id))
  }

  private examsSync(): ExamChallenge[] {
    return [...examChallenges, ...this.db.userExams]
      .filter((e) => !this.db.deletedExamIds.includes(e.id))
      .map((e) => ({ ...e, published: this.db.examPublished[e.id] ?? e.published }))
  }

  private bumpProgress(studentId: string, patch: (p: StudentProgress) => void) {
    const p = this.db.progress[studentId]
    if (!p) return
    patch(p)
    p.level = Math.floor(p.exp / 500) + 1
  }

  private ensureToday(progress: StudentProgress) {
    const today = todayISO()
    if (!progress.dailyMinutes.some((d) => isSameDay(d.date, today))) {
      progress.dailyMinutes.push({ date: today, minutes: 0 })
      if (progress.dailyMinutes.length > 7) progress.dailyMinutes = progress.dailyMinutes.slice(-7)
    }
    if (progress.lastActiveDate && !isSameDay(progress.lastActiveDate, today)) {
      const yesterday = daysAgoISO(1)
      progress.streakDays = isSameDay(progress.lastActiveDate, yesterday) ? progress.streakDays + 1 : 1
      progress.lastActiveDate = today
    } else if (!progress.lastActiveDate) {
      progress.lastActiveDate = today
    }
  }

  private upsertWrongItem(studentId: string, q: Question, yourAnswer: string, source: AnswerPayload['source'], kind: string) {
    const list = this.db.wrongItems[studentId] ?? (this.db.wrongItems[studentId] = [])
    const key = `q:${q.id}`
    const found = list.find((w) => w.key === key)
    if (found) {
      found.wrongTimes += 1
      found.yourAnswer = yourAnswer
      found.lastWrongAt = todayISO()
      found.reviewStreak = 0
      found.status = 'active'
    } else {
      list.unshift({
        key,
        source,
        kind,
        unitId: q.unitId,
        question: q.stem,
        yourAnswer,
        correctAnswer: q.answer,
        explain: q.explain,
        wrongTimes: 1,
        lastWrongAt: todayISO(),
        reviewStreak: 0,
        status: 'active',
      })
    }
  }

  private adjustMastery(studentId: string, module: ModuleKey, delta: number) {
    this.bumpProgress(studentId, (p) => {
      const cur = p.moduleMastery[module] ?? 50
      p.moduleMastery[module] = Math.max(5, Math.min(100, Math.round(cur + delta)))
    })
  }

  // ===== 身份与用户 =====

  async getDemoUsers(): Promise<User[]> {
    return this.allUsersSync().filter((u) => ['student', 'parent', 'teacher'].includes(u.role) && ['stu-001', 'parent-001', 'teacher-001'].includes(u.id))
  }

  async getCurrentUser(): Promise<User> {
    const u = this.allUsersSync().find((x) => x.id === this.db.currentUserId) ?? this.allUsersSync()[0]
    return u
  }

  async switchUser(userId: string): Promise<void> {
    this.db.currentUserId = userId
    this.notify()
  }

  async getAllUsers(): Promise<User[]> {
    return this.allUsersSync()
  }

  async setUserActive(userId: string, active: boolean): Promise<void> {
    this.db.userActive[userId] = active
    this.notify()
  }

  /** 学生进出小组：先从所有小组移除，再加入目标小组 */
  private setGroupMember(studentId: string, groupId: string | undefined) {
    this.groupsSync().forEach((g) => {
      const had = g.memberIds.includes(studentId)
      const should = g.id === groupId
      if (had === should) return
      const memberIds = should ? [...g.memberIds, studentId] : g.memberIds.filter((m) => m !== studentId)
      this.db.groupOverrides[g.id] = { ...this.db.groupOverrides[g.id], memberIds }
    })
  }

  /** 家长-孩子绑定关系与 childIds 同步 */
  private syncParentBindings(parentId: string, childIds: string[]) {
    const current = this.bindingsSync().filter((b) => b.parentId === parentId)
    current.forEach((b) => {
      if (childIds.includes(b.studentId)) return
      if (this.db.bindingsExtra.some((x) => x.id === b.id)) {
        this.db.bindingsExtra = this.db.bindingsExtra.filter((x) => x.id !== b.id)
      } else {
        this.db.removedBindingIds.push(b.id)
      }
    })
    childIds.forEach((sid) => {
      if (current.some((b) => b.studentId === sid)) return
      this.db.bindingsExtra.push({ id: `bd-u-${Date.now()}-${sid}`, parentId, studentId: sid, relation: '家长' })
    })
  }

  async createUser(data: NewUserData): Promise<User> {
    const prefix = data.role === 'student' ? 'stu' : data.role === 'parent' ? 'parent' : 'teacher'
    const user: User = {
      id: `${prefix}-u${Date.now()}`,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      active: true,
      classId: data.role === 'parent' ? undefined : 'class-701',
      groupId: data.role === 'student' ? data.groupId : undefined,
      childIds: data.role === 'parent' ? [...(data.childIds ?? [])] : undefined,
      teacherTitle: data.role === 'teacher' ? data.teacherTitle : undefined,
      bio: data.bio,
    }
    this.db.newUsers.push(user)
    if (data.role === 'student') {
      this.db.classOverrides = { ...this.db.classOverrides, studentIds: [...this.classSync().studentIds, user.id] }
      this.setGroupMember(user.id, data.groupId)
    }
    if (data.role === 'parent') this.syncParentBindings(user.id, data.childIds ?? [])
    this.notify()
    return user
  }

  async updateUser(userId: string, patch: NewUserData): Promise<void> {
    const user = this.userSync(userId)
    if (!user) return
    const next: Partial<User> = { ...this.db.userOverrides[userId], name: patch.name, avatar: patch.avatar, bio: patch.bio }
    if (user.role === 'student') {
      next.groupId = patch.groupId
      this.setGroupMember(userId, patch.groupId)
    }
    if (user.role === 'parent') {
      next.childIds = [...(patch.childIds ?? [])]
      this.syncParentBindings(userId, patch.childIds ?? [])
    }
    if (user.role === 'teacher') next.teacherTitle = patch.teacherTitle
    this.db.userOverrides[userId] = next
    this.notify()
  }

  async deleteUser(userId: string): Promise<void> {
    const user = this.userSync(userId)
    if (!user || this.db.currentUserId === userId) return
    // 班级名单
    this.db.classOverrides = { ...this.db.classOverrides, studentIds: this.classSync().studentIds.filter((x) => x !== userId) }
    // 小组成员
    this.setGroupMember(userId, undefined)
    // 家长绑定与 childIds
    this.db.bindingsExtra = this.db.bindingsExtra.filter((b) => b.studentId !== userId && b.parentId !== userId)
    this.bindingsSync()
      .filter((b) => b.studentId === userId || b.parentId === userId)
      .forEach((b) => this.db.removedBindingIds.push(b.id))
    if (user.role === 'student') {
      this.allUsersSync()
        .filter((p) => p.role === 'parent' && p.childIds?.includes(userId))
        .forEach((p) => {
          this.db.userOverrides[p.id] = { ...this.db.userOverrides[p.id], childIds: (p.childIds ?? []).filter((c) => c !== userId) }
        })
      // 学习相关记录一并删除
      delete this.db.progress[userId]
      delete this.db.wrongItems[userId]
      delete this.db.gameResults[userId]
      delete this.db.examRecords[userId]
      delete this.db.assignmentRecords[userId]
      delete this.db.listeningRecords[userId]
      delete this.db.readingRecords[userId]
      delete this.db.writingDrafts[userId]
      this.db.writingSubmissions = this.db.writingSubmissions.filter((s) => s.studentId !== userId)
      this.db.teacherComments = this.db.teacherComments.filter((c) => c.studentId !== userId)
    }
    delete this.db.userActive[userId]
    this.db.deletedUserIds.push(userId)
    this.db.newUsers = this.db.newUsers.filter((u) => u.id !== userId)
    this.notify()
  }

  async getStudents(): Promise<User[]> {
    return this.studentsSync().map((u) => ({ ...u, active: this.activeOf(u) }))
  }

  async getClass(): Promise<ClassInfo> {
    return this.classSync()
  }

  async getGroups(): Promise<GroupInfo[]> {
    return this.groupsSync()
  }

  async updateGroup(groupId: string, patch: Partial<Pick<GroupInfo, 'name' | 'motto' | 'memberIds' | 'points'>>): Promise<void> {
    this.db.groupOverrides[groupId] = { ...this.db.groupOverrides[groupId], ...patch }
    this.notify()
  }

  async getBindings(): Promise<ParentBinding[]> {
    return this.bindingsSync()
  }

  async addBinding(parentId: string, studentId: string, relation: string): Promise<void> {
    this.db.bindingsExtra.push({ id: `bd-${Date.now()}`, parentId, studentId, relation })
    this.notify()
  }

  async removeBinding(bindingId: string): Promise<void> {
    if (bindingId.startsWith('bd-') && !seedBindings.some((b) => b.id === bindingId)) {
      this.db.bindingsExtra = this.db.bindingsExtra.filter((b) => b.id !== bindingId)
    } else {
      this.db.removedBindingIds.push(bindingId)
    }
    this.notify()
  }

  // ===== 教材内容 =====

  async getUnits(): Promise<Unit[]> {
    return units
  }

  async getUnitDetail(unitId: string): Promise<Unit | undefined> {
    return units.find((u) => u.id === unitId)
  }

  async getWords(filter: WordFilter = {}): Promise<WordWithState[]> {
    const sid = this.viewStudentId()
    const states = this.db.wordStates[sid] ?? {}
    const kw = filter.keyword?.trim().toLowerCase()
    return words
      .filter((w) => {
        if (filter.unitId && w.unitId !== filter.unitId) return false
        if (filter.pos && w.pos !== filter.pos) return false
        const st = states[w.id] ?? defaultWordState()
        if (filter.mastery && st.status !== filter.mastery) return false
        if (filter.favorite && !st.favorite) return false
        if (kw && !(w.en.toLowerCase().includes(kw) || w.zh.includes(kw))) return false
        return true
      })
      .map((w) => {
        const st = states[w.id] ?? defaultWordState()
        return { ...w, mastery: st.status, favorite: st.favorite }
      })
  }

  async toggleFavoriteWord(wordId: string): Promise<void> {
    const sid = this.viewStudentId()
    const states = this.db.wordStates[sid] ?? (this.db.wordStates[sid] = {})
    const st = states[wordId] ?? (states[wordId] = defaultWordState())
    st.favorite = !st.favorite
    this.notify()
  }

  async setWordMastery(wordId: string, status: MasteryStatus): Promise<void> {
    const sid = this.viewStudentId()
    const states = this.db.wordStates[sid] ?? (this.db.wordStates[sid] = {})
    const st = states[wordId] ?? (states[wordId] = defaultWordState())
    st.status = status
    if (status === 'mastered') this.addExp(sid, 5)
    this.notify()
  }

  async getListeningPrograms(filter: ListeningFilter = {}): Promise<ListeningProgram[]> {
    return listeningPrograms.filter((p) => {
      if (filter.unitId && p.unitId !== filter.unitId) return false
      if (filter.type && p.type !== filter.type) return false
      if (filter.difficulty && p.difficulty !== filter.difficulty) return false
      return true
    })
  }

  async getListeningProgram(id: string): Promise<ListeningProgram | undefined> {
    return listeningPrograms.find((p) => p.id === id)
  }

  async getReadingArticles(filter: ReadingFilter = {}): Promise<ReadingArticle[]> {
    return readingArticles.filter((a) => {
      if (filter.unitId && a.unitId !== filter.unitId) return false
      if (filter.genre && a.genre !== filter.genre) return false
      if (filter.difficulty && a.difficulty !== filter.difficulty) return false
      return true
    })
  }

  async getReadingArticle(id: string): Promise<ReadingArticle | undefined> {
    return readingArticles.find((a) => a.id === id)
  }

  async getWritingTasks(filter: { unitId?: string } = {}): Promise<WritingTask[]> {
    return writingTasks.filter((t) => !filter.unitId || t.unitId === filter.unitId)
  }

  async getWritingTask(id: string): Promise<WritingTask | undefined> {
    return writingTasks.find((t) => t.id === id)
  }

  async getUnitQuiz(unitId: string): Promise<UnitQuiz> {
    const unit = units.find((u) => u.id === unitId)
    const bank = this.questionsSync().filter((q) => q.unitId === unitId).slice(0, 5)
    const need = 6 - bank.length
    const generated: Question[] = []
    if (need > 0) {
      const unitWords = words.filter((w) => w.unitId === unitId)
      const pool = [...unitWords]
      for (let i = 0; i < need && pool.length > 3; i++) {
        const idx = (i * 3 + 1) % pool.length
        const w = pool.splice(idx, 1)[0]
        const distractIdx = (i * 5 + 2) % words.length
        const d1 = words[distractIdx].zh === w.zh ? words[(distractIdx + 7) % words.length] : words[distractIdx]
        const d2 = words[(distractIdx + 13) % words.length].zh === w.zh ? words[(distractIdx + 21) % words.length] : words[(distractIdx + 13) % words.length]
        const options = [w.zh, d1.zh, d2.zh].filter((x, ii, arr) => arr.indexOf(x) === ii).slice(0, 3)
        if (!options.includes(w.zh)) options.push(w.zh)
        generated.push({
          id: `gen-${unitId}-${i}`,
          type: 'choice',
          module: 'vocabulary',
          unitId,
          stem: `「${w.en}」的中文意思是？`,
          options,
          answer: w.zh,
          explain: `${w.en} ${w.phonetic} ${w.pos} ${w.zh}。例句：${w.exampleEn}（${w.exampleZh}）`,
        })
      }
    }
    return {
      id: `quiz-${unitId}`,
      title: `${unit?.title ?? unitId} · 单元测验`,
      questions: [...bank, ...generated],
    }
  }

  // ===== 听力 / 阅读记录 =====

  async getListeningRecord(studentId: string, programId: string): Promise<ListeningRecord | undefined> {
    return this.db.listeningRecords[studentId]?.[programId]
  }

  async saveListeningProgress(studentId: string, programId: string, patch: Partial<Omit<ListeningRecord, 'programId'>>): Promise<void> {
    const map = this.db.listeningRecords[studentId] ?? (this.db.listeningRecords[studentId] = {})
    const cur = map[programId] ?? {
      programId,
      lastLine: 0,
      finished: false,
      bestScore: null,
      plays: 0,
      favorite: false,
      lastAt: todayISO(),
    }
    map[programId] = { ...cur, ...patch, programId, lastAt: todayISO() }
    this.notify()
  }

  async getReadingRecords(studentId: string): Promise<Record<string, ReadingRecord>> {
    return this.db.readingRecords[studentId] ?? {}
  }

  async saveReadingProgress(studentId: string, articleId: string, patch: Partial<Omit<ReadingRecord, 'articleId'>>): Promise<void> {
    const map = this.db.readingRecords[studentId] ?? (this.db.readingRecords[studentId] = {})
    const cur = map[articleId] ?? {
      articleId,
      lastParagraph: 0,
      finished: false,
      favorite: false,
      bestScore: null,
      lastAt: todayISO(),
    }
    map[articleId] = { ...cur, ...patch, articleId, lastAt: todayISO() }
    this.notify()
  }

  // ===== 题库 =====

  async getQuestions(filter: { unitId?: string; module?: string; type?: string; keyword?: string } = {}): Promise<Question[]> {
    const kw = filter.keyword?.trim().toLowerCase()
    return this.questionsSync().filter((q) => {
      if (filter.unitId && q.unitId !== filter.unitId) return false
      if (filter.module && q.module !== filter.module) return false
      if (filter.type && q.type !== filter.type) return false
      if (kw && !q.stem.toLowerCase().includes(kw)) return false
      return true
    })
  }

  async addQuestion(q: Question): Promise<void> {
    this.db.userQuestions.unshift(q)
    this.notify()
  }

  async deleteQuestion(id: string): Promise<void> {
    this.db.deletedQuestionIds.push(id)
    this.db.userQuestions = this.db.userQuestions.filter((q) => q.id !== id)
    this.notify()
  }

  // ===== 考试挑战 =====

  async getExams(): Promise<ExamChallenge[]> {
    return this.examsSync()
  }

  async getExam(id: string): Promise<ExamChallenge | undefined> {
    return this.examsSync().find((e) => e.id === id)
  }

  async getExamHistory(studentId: string): Promise<ExamRecord[]> {
    return [...(this.db.examRecords[studentId] ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  }

  async getExamRecordsForClass(): Promise<ExamRecord[]> {
    const all: ExamRecord[] = []
    Object.values(this.db.examRecords).forEach((rs) => all.push(...rs))
    return all.sort((a, b) => b.date.localeCompare(a.date))
  }

  async submitExam(studentId: string, exam: ExamChallenge, details: { questionId: string; yourAnswer: string; correct: boolean }[]): Promise<ExamRecord> {
    const total = exam.questions.length
    const correct = details.filter((d) => d.correct).length
    const score = Math.round((correct / total) * exam.totalScore)
    const modules: QuestionModule[] = ['vocabulary', 'grammar', 'listening', 'reading']
    const moduleScores = {} as Record<QuestionModule, number>
    modules.forEach((m) => {
      const qs = exam.questions.filter((q) => q.module === m)
      if (qs.length === 0) {
        moduleScores[m] = 0
        return
      }
      const ids = new Set(qs.map((q) => q.id))
      const c = details.filter((d) => ids.has(d.questionId) && d.correct).length
      moduleScores[m] = Math.round((c / qs.length) * (exam.totalScore / 4))
    })
    const record: ExamRecord = {
      id: `er-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId,
      date: todayISO(),
      score,
      total: exam.totalScore,
      moduleScores,
      details,
    }
    this.db.examRecords[studentId] = [...(this.db.examRecords[studentId] ?? []), record]
    // 错题入本
    exam.questions.forEach((q) => {
      const d = details.find((x) => x.questionId === q.id)
      if (d && !d.correct) this.upsertWrongItem(studentId, q, d.yourAnswer, 'exam', '考试挑战')
    })
    this.bumpProgress(studentId, (p) => {
      p.exp += score
      this.ensureToday(p)
      const today = p.dailyMinutes.find((d) => isSameDay(d.date, todayISO()))
      if (today) today.minutes += exam.durationMin
      p.todayMinutes = p.dailyMinutes.find((d) => isSameDay(d.date, todayISO()))?.minutes ?? p.todayMinutes
      p.weekMinutes = p.dailyMinutes.reduce((s, d) => s + d.minutes, 0)
    })
    this.notify()
    return record
  }

  async setExamPublished(examId: string, published: boolean): Promise<void> {
    this.db.examPublished[examId] = published
    this.notify()
  }

  async createExam(data: NewExamData): Promise<ExamChallenge> {
    const exam: ExamChallenge = {
      id: `exam-u-${Date.now()}`,
      title: data.title,
      subtitle: data.subtitle,
      unitIds: data.unitIds,
      durationMin: data.durationMin,
      totalScore: 100,
      published: false,
      questions: data.questions,
    }
    this.db.userExams.unshift(exam)
    this.notify()
    return exam
  }

  async deleteExam(examId: string): Promise<void> {
    this.db.deletedExamIds.push(examId)
    this.db.userExams = this.db.userExams.filter((e) => e.id !== examId)
    delete this.db.examPublished[examId]
    // 删除考试时，学生已有的成绩记录一并删除
    Object.keys(this.db.examRecords).forEach((sid) => {
      this.db.examRecords[sid] = this.db.examRecords[sid].filter((r) => r.examId !== examId)
    })
    this.notify()
  }

  // ===== 作业 =====

  async getAssignments(userId: string): Promise<AssignmentWithStatus[]> {
    const user = this.userSync(userId)
    if (!user) return []
    let list = this.assignmentsSync()
    if (user.role === 'teacher') {
      list = list.filter((a) => a.teacherId === user.id)
      return list.map((a) => ({ ...a, status: 'pending' as const }))
    }
    let studentId = user.id
    if (user.role === 'parent') studentId = user.childIds?.[0] ?? 'stu-001'
    const records = this.db.assignmentRecords[studentId] ?? {}
    const progress = this.db.progress[studentId]
    if (progress) {
      const done = Object.values(records).filter((r) => r.status === 'done').length
      progress.assignmentDone = done
      progress.assignmentTotal = list.length
    }
    return list.map((a) => ({
      ...a,
      status: records[a.id]?.status ?? 'pending',
      submittedAt: records[a.id]?.submittedAt,
      score: records[a.id]?.score,
    }))
  }

  async createAssignment(data: NewAssignmentData): Promise<Assignment> {
    const teacher = this.userSync(data.teacherId)
    const a: Assignment = {
      id: `asg-${Date.now()}`,
      teacherId: data.teacherId,
      teacherName: teacher?.name ?? '老师',
      classId: data.classId,
      title: data.title,
      type: data.type,
      unitId: data.unitId,
      description: data.description,
      questionIds: data.questionIds,
      writingTaskId: data.writingTaskId,
      dueDate: data.dueDate,
      createdAt: todayISO(),
    }
    this.db.assignmentsExtra.push(a)
    this.notify()
    return a
  }

  async getAssignmentStats(assignmentId: string): Promise<{ done: number; total: number }> {
    const students = this.studentsSync()
    let done = 0
    students.forEach((s) => {
      if (this.db.assignmentRecords[s.id]?.[assignmentId]?.status === 'done') done += 1
    })
    return { done, total: students.length }
  }

  async markAssignmentDone(assignmentId: string, studentId: string, score?: number): Promise<void> {
    const records = this.db.assignmentRecords[studentId] ?? (this.db.assignmentRecords[studentId] = {})
    const wasDone = records[assignmentId]?.status === 'done'
    records[assignmentId] = { status: 'done', submittedAt: new Date().toISOString(), score }
    if (!wasDone) {
      this.bumpProgress(studentId, (p) => {
        p.exp += 30
      })
      this.addExp(studentId, 0)
    }
    this.notify()
  }

  // ===== 写作 =====

  async saveWritingDraft(studentId: string, taskId: string, draft: { outline: string[]; content: string }): Promise<void> {
    const map = this.db.writingDrafts[studentId] ?? (this.db.writingDrafts[studentId] = {})
    map[taskId] = { taskId, ...draft, updatedAt: new Date().toISOString() }
    this.notify()
  }

  async getWritingDraft(studentId: string, taskId: string): Promise<WritingDraft | undefined> {
    return this.db.writingDrafts[studentId]?.[taskId]
  }

  async submitWriting(studentId: string, taskId: string, content: string): Promise<WritingSubmission> {
    const task = writingTasks.find((t) => t.id === taskId)
    const student = this.userSync(studentId)
    // 模拟评分：长度 + 重点词覆盖 + 句型覆盖
    const text = content.toLowerCase()
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    const kwHits = (task?.usefulWords ?? []).filter((w) => text.includes(w.en.toLowerCase())).length
    const ptHits = (task?.patterns ?? []).filter((p) => text.includes(p.pattern.split('...')[0].toLowerCase())).length
    let score = 55 + Math.min(25, Math.round(wordCount / 2)) + kwHits * 2 + ptHits * 2
    if (wordCount < 15) score = Math.min(score, 58)
    score = Math.max(40, Math.min(98, score))
    const missed = (task?.usefulWords ?? []).filter((w) => !text.includes(w.en.toLowerCase())).map((w) => w.en)
    const comment =
      wordCount < 15
        ? `本篇仅 ${wordCount} 词，篇幅不足要求。请对照任务要求补充细节，写满规定词数后再提交一次。`
        : `全文约 ${wordCount} 词，覆盖重点词汇 ${kwHits}/${task?.usefulWords.length ?? 0} 个、常用句型 ${ptHits} 处。` +
          (missed.length ? `建议补上：${missed.slice(0, 3).join(' / ')}。` : '重点词汇覆盖完整，继续保持！') +
          (score >= 90 ? ' 整体表达流畅，是一篇优秀的作文！' : score >= 75 ? ' 结构完整，注意句首字母大写和标点。' : ' 再对照范文梳理一下结构，多用本单元句型。')
    const sub: WritingSubmission = {
      id: `wsub-${Date.now()}`,
      taskId,
      taskTitle: task?.title ?? taskId,
      studentId,
      studentName: student?.name ?? '',
      content,
      submittedAt: new Date().toISOString(),
      score,
      comment,
      graded: false,
    }
    this.db.writingSubmissions.unshift(sub)
    // 若有写作类作业关联此任务，自动完成作业
    const asg = this.assignmentsSync().find((a) => a.writingTaskId === taskId)
    if (asg) this.markAssignmentDone(asg.id, studentId, score)
    this.bumpProgress(studentId, (p) => {
      p.exp += 20
    })
    this.adjustMastery(studentId, 'writing', 2)
    this.addStudyMinutes(studentId, 10)
    this.notify()
    return sub
  }

  async getWritingSubmissions(): Promise<WritingSubmission[]> {
    return this.db.writingSubmissions
  }

  async gradeWriting(submissionId: string, score: number, comment: string): Promise<void> {
    const sub = this.db.writingSubmissions.find((s) => s.id === submissionId)
    if (sub) {
      sub.score = score
      sub.comment = comment
      sub.graded = true
      this.notify()
    }
  }

  // ===== 答题与错题 =====

  async submitAnswer(payload: AnswerPayload): Promise<AnswerFeedback> {
    const { studentId, question, yourAnswer, source } = payload
    const correct = normalize(yourAnswer) === normalize(question.answer)
    if (!correct) {
      this.upsertWrongItem(studentId, question, yourAnswer, source, source === 'game' ? '小游戏' : question.type === 'fill' ? '填空' : question.type === 'judge' ? '判断' : question.module === 'grammar' ? '语法选择' : question.module === 'listening' ? '听力理解' : question.module === 'reading' ? '阅读理解' : '词汇选择')
      this.adjustMastery(studentId, question.module, -0.5)
    } else {
      this.adjustMastery(studentId, question.module, 0.5)
      const list = this.db.wrongItems[studentId] ?? []
      const found = list.find((w) => w.key === `q:${question.id}`)
      if (found && found.status === 'active') {
        found.reviewStreak += 1
        if (found.reviewStreak >= 2) found.status = 'mastered'
      }
    }
    this.bumpProgress(studentId, (p) => {
      p.exp += correct ? 10 : 2
    })
    this.addStudyMinutes(studentId, 2)
    return { correct, explain: question.explain }
  }

  async getWrongItems(studentId: string, filter: WrongFilter = {}): Promise<WrongItem[]> {
    const list = this.db.wrongItems[studentId] ?? []
    return list.filter((w) => {
      if (filter.unitId && w.unitId !== filter.unitId) return false
      if (filter.kind && w.kind !== filter.kind) return false
      if (filter.status && w.status !== filter.status) return false
      if (filter.minTimes && w.wrongTimes < filter.minTimes) return false
      return true
    })
  }

  async reviewWrongItem(studentId: string, key: string, correct: boolean): Promise<void> {
    const item = (this.db.wrongItems[studentId] ?? []).find((w) => w.key === key)
    if (!item) return
    if (correct) {
      item.reviewStreak += 1
      if (item.reviewStreak >= 2) item.status = 'mastered'
      this.addExp(studentId, 8)
    } else {
      item.reviewStreak = 0
      item.wrongTimes += 1
      item.status = 'active'
      item.lastWrongAt = todayISO()
    }
    this.notify()
  }

  // ===== 学习进度 =====

  async getStudentProgress(studentId: string): Promise<StudentProgress> {
    const p = this.db.progress[studentId]
    if (p) this.ensureToday(p)
    return p
  }

  async addStudyMinutes(studentId: string, minutes: number, _module?: string): Promise<void> {
    this.bumpProgress(studentId, (p) => {
      this.ensureToday(p)
      const today = todayISO()
      let entry = p.dailyMinutes.find((d) => isSameDay(d.date, today))
      if (!entry) {
        entry = { date: today, minutes: 0 }
        p.dailyMinutes.push(entry)
        if (p.dailyMinutes.length > 7) p.dailyMinutes = p.dailyMinutes.slice(-7)
      }
      entry.minutes += minutes
      p.todayMinutes = p.dailyMinutes.find((d) => isSameDay(d.date, today))?.minutes ?? p.todayMinutes
      p.weekMinutes = p.dailyMinutes.reduce((s, d) => s + d.minutes, 0)
    })
    this.notify()
  }

  async addExp(studentId: string, exp: number): Promise<void> {
    this.bumpProgress(studentId, (p) => {
      p.exp += exp
    })
    this.notify()
  }

  async adjustModuleMastery(studentId: string, module: ModuleKey, delta: number): Promise<void> {
    this.adjustMastery(studentId, module, delta)
  }

  async getBadges(studentId: string): Promise<Badge[]> {
    return this.db.progress[studentId]?.badges ?? []
  }

  // ===== 小游戏 =====

  async getGameContent(): Promise<GameContent> {
    return { scrambleSentences, grammarItems: grammarDetectItems }
  }

  async getGameResults(studentId: string, game?: GameKey): Promise<GameResult[]> {
    const list = this.db.gameResults[studentId] ?? []
    return game ? list.filter((r) => r.game === game) : list
  }

  async getTodayPlayCount(studentId: string, game: GameKey): Promise<number> {
    const today = todayISO()
    return (this.db.gameResults[studentId] ?? []).filter((r) => r.game === game && isSameDay(r.date, today)).length
  }

  async submitGameResult(studentId: string, result: Omit<GameResult, 'id' | 'studentId' | 'pointsGained' | 'date'>): Promise<GameResult> {
    const todayCount = await this.getTodayPlayCount(studentId, result.game)
    const pointsGained = todayCount < 3 ? Math.max(5, Math.min(50, Math.round(result.score / 12))) : 0
    const full: GameResult = {
      ...result,
      id: `g-${Date.now()}`,
      studentId,
      date: new Date().toISOString(),
      pointsGained,
    }
    this.db.gameResults[studentId] = [...(this.db.gameResults[studentId] ?? []), full]
    // 游戏错题写入错题本
    ;(result.wrongs ?? []).forEach((w, i) => {
      this.db.wrongItems[studentId] = this.db.wrongItems[studentId] ?? []
      this.db.wrongItems[studentId].unshift({
        key: `g:${result.game}:${Date.now()}:${i}`,
        source: 'game',
        kind: '小游戏',
        unitId: 'u1',
        question: w.question,
        yourAnswer: w.yourAnswer,
        correctAnswer: w.correctAnswer,
        explain: '来自小游戏的错配，去单词库复习一下再挑战吧！',
        wrongTimes: 1,
        lastWrongAt: todayISO(),
        reviewStreak: 0,
        status: 'active',
      })
    })
    this.bumpProgress(studentId, (p) => {
      p.exp += Math.round(result.score / 10)
    })
    this.notify()
    return full
  }

  // ===== 排行 =====

  async getClassLeaderboard(classId: string): Promise<LeaderboardEntry[]> {
    const groups = this.groupsSync()
    return this.studentsSync()
      .map((s) => {
        const base = seedStudentPoints[s.id] ?? 0
        const gained = (this.db.gameResults[s.id] ?? []).reduce((sum, r) => sum + r.pointsGained, 0)
        const g = groups.find((x) => x.memberIds.includes(s.id))
        return {
          studentId: s.id,
          name: s.name,
          groupId: g?.id ?? '',
          groupName: g?.name ?? '',
          points: base + gained,
          exp: this.db.progress[s.id]?.exp ?? 0,
        }
      })
      .sort((a, b) => b.points - a.points)
  }

  async getGroupStandings(classId: string): Promise<GroupStanding[]> {
    const groups = this.groupsSync()
    const rows = groups.map((g) => {
      const gained = g.memberIds.reduce((sum, mid) => sum + (this.db.gameResults[mid] ?? []).reduce((s, r) => s + r.pointsGained, 0), 0)
      return { group: g, totalPoints: g.points + gained, rank: 0 }
    })
    rows.sort((a, b) => b.totalPoints - a.totalPoints)
    rows.forEach((r, i) => (r.rank = i + 1))
    return rows
  }

  async getExamLeaderboard(examId: string): Promise<{ studentId: string; name: string; score: number; date: string }[]> {
    const rows: { studentId: string; name: string; score: number; date: string }[] = []
    this.studentsSync().forEach((s) => {
      const records = (this.db.examRecords[s.id] ?? []).filter((r) => r.examId === examId)
      if (records.length === 0) return
      const best = records.reduce((a, b) => (b.score > a.score ? b : a))
      rows.push({ studentId: s.id, name: s.name, score: best.score, date: best.date })
    })
    return rows.sort((a, b) => b.score - a.score)
  }

  // ===== 家校 =====

  async getTeacherComments(studentId: string): Promise<TeacherComment[]> {
    return this.db.teacherComments.filter((c) => c.studentId === studentId)
  }

  async addTeacherComment(studentId: string, text: string): Promise<void> {
    this.db.teacherComments.unshift({
      id: `tc-${Date.now()}`,
      teacherId: 'teacher-001',
      teacherName: '林晚晴',
      studentId,
      date: todayISO(),
      text,
    })
    this.notify()
  }

  async getParentReport(studentId: string): Promise<ParentReport> {
    const progress = await this.getStudentProgress(studentId)
    const wrongs = await this.getWrongItems(studentId)
    const exams = await this.getExamHistory(studentId)
    const unitRows = Object.entries(progress.unitCompletion).map(([uid, v]) => ({
      unitId: uid,
      unitTitle: units.find((u) => u.id === uid)?.title ?? uid,
      completion: v,
    }))
    const masteryEntries = Object.entries(progress.moduleMastery) as [ModuleKey, number][]
    masteryEntries.sort((a, b) => b[1] - a[1])
    const wrongCount: Record<string, number> = {}
    wrongs.forEach((w) => {
      const m = w.question.match(/[A-Za-z'-]+/)
      const word = m?.[0] ?? w.question.slice(0, 12)
      wrongCount[word] = (wrongCount[word] ?? 0) + w.wrongTimes
    })
    const topWrong = Object.entries(wrongCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([question, times]) => ({ question, times }))
    const weakest = masteryEntries[masteryEntries.length - 1]?.[0] ?? 'writing'
    const strongest = masteryEntries[0]?.[0] ?? 'vocabulary'
    const moduleNames: Record<ModuleKey, string> = {
      vocabulary: '词汇',
      grammar: '语法',
      listening: '听力',
      reading: '阅读',
      writing: '写作',
    }
    const daysActive = progress.dailyMinutes.filter((d) => d.minutes > 0).length
    const report: ParentReport = {
      studentId,
      weekLabel: weekLabelOf(),
      generatedAt: new Date().toLocaleString('zh-CN'),
      totalMinutes: progress.weekMinutes,
      daysActive,
      finishedTasks: progress.assignmentDone,
      unitSummary: unitRows,
      strongest,
      weakest,
      topWrongWords: topWrong,
      examScores: exams.slice(0, 4).map((e) => ({ title: e.examTitle, score: e.score, total: e.total, date: e.date })),
      summaryText: `本周共学习 ${progress.weekMinutes} 分钟（${daysActive} 天有学习记录），完成 ${progress.assignmentDone}/${progress.assignmentTotal} 项作业，连续学习 ${progress.streakDays} 天。${moduleNames[strongest]}表现最佳（掌握度 ${progress.moduleMastery[strongest]}%），${moduleNames[weakest]}相对薄弱（${progress.moduleMastery[weakest]}%）。`,
      suggestion:
        weakest === 'writing'
          ? '建议每天在写作工坊仿写 2 个本单元句型，每周完成 1 篇短文并对照范文修改。'
          : weakest === 'grammar'
            ? '建议重读本单元语法讲解，并完成 5 道语法专项练习，错题两天后复习一次。'
            : '建议保持当前节奏，每周完成 1 个单元测验巩固所学内容。',
    }
    return report
  }

  // ===== 管理端 =====

  async browseCollections(): Promise<BrowseCollection[]> {
    const asRows = (arr: unknown[], label: string, name: string): BrowseCollection => ({
      name,
      label,
      count: arr.length,
      rows: arr as Record<string, unknown>[],
    })
    return [
      asRows(this.allUsersSync(), '全部用户（含角色与状态）', 'users'),
      asRows(this.bindingsSync(), '家长绑定关系', 'bindings'),
      asRows(units, '教材单元', 'units'),
      asRows(words, '单词库', 'words'),
      asRows(listeningPrograms, '听力节目', 'listening'),
      asRows(readingArticles, '阅读文章', 'reading'),
      asRows(writingTasks, '写作任务', 'writing'),
      asRows(this.questionsSync(), '题库（内置+教师新增）', 'questions'),
      asRows(this.examsSync(), '考试挑战', 'exams'),
      asRows(this.assignmentsSync(), '作业', 'assignments'),
      asRows(this.db.writingSubmissions, '写作提交', 'writingSubmissions'),
      asRows(this.db.examRecords['stu-001'] ?? [], '学生考试成绩', 'examRecords'),
      asRows(this.db.gameResults['stu-001'] ?? [], '学生游戏成绩', 'gameResults'),
      asRows(this.db.wrongItems['stu-001'] ?? [], '学生错题', 'wrongItems'),
      asRows(Object.values(this.db.progress), '学习进度', 'progress'),
    ]
  }

  async resetDemoData(): Promise<void> {
    clearAllStorage()
  }

  storageKB(): number {
    return storageUsageKB()
  }
}
