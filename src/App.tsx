import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RoleLayout } from './components/layout/RoleLayout'

import { LoginPage } from './pages/LoginPage'
import { StudentHomePage } from './pages/student/StudentHomePage'
import { UnitsPage, UnitDetailPage } from './pages/student/UnitsPage'
import { WordsPage } from './pages/student/WordsPage'
import { ListeningPage } from './pages/student/ListeningPage'
import { ListeningPlayerPage } from './pages/student/ListeningPlayerPage'
import { ReadingPage } from './pages/student/ReadingPage'
import { ReadingDetailPage } from './pages/student/ReadingDetailPage'
import { WritingPage } from './pages/student/WritingPage'
import { WritingDetailPage } from './pages/student/WritingDetailPage'
import { ExamListPage } from './pages/student/ExamListPage'
import { ExamTakePage } from './pages/student/ExamTakePage'
import { UnitQuizPage } from './pages/student/UnitQuizPage'
import { WrongBookPage } from './pages/student/WrongBookPage'
import { ProgressPage } from './pages/student/ProgressPage'
import GamesPage from './pages/student/GamesPage'
import GamePlayPage from './pages/student/GamePlayPage'
import LeaderboardPage from './pages/student/LeaderboardPage'
import AssignmentTakePage from './pages/student/AssignmentTakePage'

import { ParentHomePage } from './pages/parent/ParentHomePage'
import { ParentReportPage } from './pages/parent/ParentReportPage'

import { TeacherHomePage } from './pages/teacher/TeacherHomePage'
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage'
import { TeacherGroupsPage } from './pages/teacher/TeacherGroupsPage'
import { TeacherContentPage } from './pages/teacher/TeacherContentPage'
import { TeacherBankPage } from './pages/teacher/TeacherBankPage'
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage'
import { TeacherGradingPage } from './pages/teacher/TeacherGradingPage'
import { TeacherExamsPage } from './pages/teacher/TeacherExamsPage'
import { TeacherAnalyticsPage } from './pages/teacher/TeacherAnalyticsPage'

import { AdminHomePage } from './pages/teacher/AdminHomePage'
import { AdminUsersPage } from './pages/teacher/AdminUsersPage'
import { AdminBindingsPage } from './pages/teacher/AdminBindingsPage'
import { AdminContentPage } from './pages/teacher/AdminContentPage'
import { AdminClassesPage } from './pages/teacher/AdminClassesPage'
import { AdminDataPage } from './pages/teacher/AdminDataPage'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/student" element={<RoleLayout />}>
            <Route index element={<StudentHomePage />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="units/:unitId" element={<UnitDetailPage />} />
            <Route path="words" element={<WordsPage />} />
            <Route path="listening" element={<ListeningPage />} />
            <Route path="listening/:programId" element={<ListeningPlayerPage />} />
            <Route path="reading" element={<ReadingPage />} />
            <Route path="reading/:articleId" element={<ReadingDetailPage />} />
            <Route path="writing" element={<WritingPage />} />
            <Route path="writing/:taskId" element={<WritingDetailPage />} />
            <Route path="exam" element={<ExamListPage />} />
            <Route path="exam/:examId" element={<ExamTakePage />} />
            <Route path="quiz/:unitId" element={<UnitQuizPage />} />
            <Route path="wrong-book" element={<WrongBookPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="games/:gameId" element={<GamePlayPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="assignment/:assignmentId" element={<AssignmentTakePage />} />
          </Route>

          <Route path="/parent" element={<RoleLayout />}>
            <Route index element={<ParentHomePage />} />
            <Route path="report" element={<ParentReportPage />} />
          </Route>

          <Route path="/teacher" element={<RoleLayout />}>
            <Route index element={<TeacherHomePage />} />
            <Route path="students" element={<TeacherStudentsPage />} />
            <Route path="groups" element={<TeacherGroupsPage />} />
            <Route path="content" element={<TeacherContentPage />} />
            <Route path="bank" element={<TeacherBankPage />} />
            <Route path="assignments" element={<TeacherAssignmentsPage />} />
            <Route path="grading" element={<TeacherGradingPage />} />
            <Route path="exams" element={<TeacherExamsPage />} />
            <Route path="analytics" element={<TeacherAnalyticsPage />} />
            <Route path="ranking" element={<TeacherAnalyticsPage ranking />} />
            <Route path="school" element={<AdminHomePage />} />
            <Route path="school/users" element={<AdminUsersPage />} />
            <Route path="school/bindings" element={<AdminBindingsPage />} />
            <Route path="school/content" element={<AdminContentPage />} />
            <Route path="school/classes" element={<AdminClassesPage />} />
            <Route path="school/data" element={<AdminDataPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
