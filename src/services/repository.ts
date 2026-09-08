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

/**
 * 统一数据访问接口。
 * 页面与组件只允许调用此接口；本阶段由 MockRepository 实现（localStorage + Mock 数据），
 * 下一阶段可无缝替换为真实 API 实现。
 */
export interface Repository {
  // —— 身份与用户 ——
  getDemoUsers(): Promise<User[]>
  getCurrentUser(): Promise<User>
  switchUser(userId: string): Promise<void>
  getAllUsers(): Promise<User[]>
  setUserActive(userId: string, active: boolean): Promise<void>
  createUser(data: NewUserData): Promise<User>
  updateUser(userId: string, patch: NewUserData): Promise<void>
  deleteUser(userId: string): Promise<void>
  getStudents(): Promise<User[]>
  getClass(): Promise<ClassInfo>
  getGroups(): Promise<GroupInfo[]>
  updateGroup(groupId: string, patch: Partial<Pick<GroupInfo, 'name' | 'motto' | 'memberIds' | 'points'>>): Promise<void>
  getBindings(): Promise<ParentBinding[]>
  addBinding(parentId: string, studentId: string, relation: string): Promise<void>
  removeBinding(bindingId: string): Promise<void>

  // —— 教材内容 ——
  getUnits(): Promise<Unit[]>
  getUnitDetail(unitId: string): Promise<Unit | undefined>
  getWords(filter?: WordFilter): Promise<WordWithState[]>
  toggleFavoriteWord(wordId: string): Promise<void>
  setWordMastery(wordId: string, status: MasteryStatus): Promise<void>
  getListeningPrograms(filter?: ListeningFilter): Promise<ListeningProgram[]>
  getListeningProgram(id: string): Promise<ListeningProgram | undefined>
  getReadingArticles(filter?: ReadingFilter): Promise<ReadingArticle[]>
  getReadingArticle(id: string): Promise<ReadingArticle | undefined>
  getWritingTasks(filter?: { unitId?: string }): Promise<WritingTask[]>
  getWritingTask(id: string): Promise<WritingTask | undefined>
  getUnitQuiz(unitId: string): Promise<UnitQuiz>

  // —— 听力 / 阅读记录 ——
  getListeningRecord(studentId: string, programId: string): Promise<ListeningRecord | undefined>
  saveListeningProgress(studentId: string, programId: string, patch: Partial<Omit<ListeningRecord, 'programId'>>): Promise<void>
  getReadingRecords(studentId: string): Promise<Record<string, ReadingRecord>>
  saveReadingProgress(studentId: string, articleId: string, patch: Partial<Omit<ReadingRecord, 'articleId'>>): Promise<void>

  // —— 题目 / 题库 ——
  getQuestions(filter?: { unitId?: string; module?: string; type?: string; keyword?: string }): Promise<Question[]>
  addQuestion(q: Question): Promise<void>
  deleteQuestion(id: string): Promise<void>

  // —— 考试挑战 ——
  getExams(): Promise<ExamChallenge[]>
  getExam(id: string): Promise<ExamChallenge | undefined>
  getExamHistory(studentId: string): Promise<ExamRecord[]>
  getExamRecordsForClass(): Promise<ExamRecord[]>
  submitExam(studentId: string, exam: ExamChallenge, details: { questionId: string; yourAnswer: string; correct: boolean }[]): Promise<ExamRecord>
  setExamPublished(examId: string, published: boolean): Promise<void>
  createExam(data: NewExamData): Promise<ExamChallenge>
  deleteExam(examId: string): Promise<void>

  // —— 作业 ——
  getAssignments(userId: string): Promise<AssignmentWithStatus[]>
  createAssignment(data: NewAssignmentData): Promise<Assignment>
  getAssignmentStats(assignmentId: string): Promise<{ done: number; total: number }>
  markAssignmentDone(assignmentId: string, studentId: string, score?: number): Promise<void>

  // —— 写作 ——
  saveWritingDraft(studentId: string, taskId: string, draft: { outline: string[]; content: string }): Promise<void>
  getWritingDraft(studentId: string, taskId: string): Promise<WritingDraft | undefined>
  submitWriting(studentId: string, taskId: string, content: string): Promise<WritingSubmission>
  getWritingSubmissions(): Promise<WritingSubmission[]>
  gradeWriting(submissionId: string, score: number, comment: string): Promise<void>

  // —— 答题与错题 ——
  submitAnswer(payload: AnswerPayload): Promise<AnswerFeedback>
  getWrongItems(studentId: string, filter?: WrongFilter): Promise<WrongItem[]>
  reviewWrongItem(studentId: string, key: string, correct: boolean): Promise<void>

  // —— 学习进度 ——
  getStudentProgress(studentId: string): Promise<StudentProgress>
  addStudyMinutes(studentId: string, minutes: number, module?: string): Promise<void>
  addExp(studentId: string, exp: number): Promise<void>
  adjustModuleMastery(studentId: string, module: ModuleKey, delta: number): Promise<void>
  getBadges(studentId: string): Promise<Badge[]>

  // —— 小游戏 ——
  getGameResults(studentId: string, game?: GameKey): Promise<GameResult[]>
  getTodayPlayCount(studentId: string, game: GameKey): Promise<number>
  submitGameResult(studentId: string, result: Omit<GameResult, 'id' | 'studentId' | 'pointsGained' | 'date'>): Promise<GameResult>
  getGameContent(): Promise<GameContent>

  // —— 排行 ——
  getClassLeaderboard(classId: string): Promise<LeaderboardEntry[]>
  getGroupStandings(classId: string): Promise<GroupStanding[]>
  getExamLeaderboard(examId: string): Promise<{ studentId: string; name: string; score: number; date: string }[]>

  // —— 家校 ——
  getTeacherComments(studentId: string): Promise<TeacherComment[]>
  addTeacherComment(studentId: string, text: string): Promise<void>
  getParentReport(studentId: string): Promise<ParentReport>

  // —— 管理端 ——
  browseCollections(): Promise<BrowseCollection[]>
  resetDemoData(): Promise<void>
  storageKB(): number

  // —— 变更通知 ——
  subscribe(cb: () => void): () => void
}
