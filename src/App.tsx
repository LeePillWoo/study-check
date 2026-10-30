import { Navigate, Route, Routes } from 'react-router'
import AppShell from './layout/AppShell'
import HomePage from './pages/HomePage'
import SubjectFormPage from './pages/SubjectFormPage'
import SubjectsPage from './pages/SubjectsPage'
import ChildFormPage from './pages/settings/ChildFormPage'
import ChildrenPage from './pages/settings/ChildrenPage'
import SettingsPage from './pages/settings/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="subjects/new" element={<SubjectFormPage />} />
        <Route path="subjects/:subjectId" element={<SubjectFormPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/children" element={<ChildrenPage />} />
        <Route path="settings/children/new" element={<ChildFormPage />} />
        <Route path="settings/children/:childId" element={<ChildFormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
