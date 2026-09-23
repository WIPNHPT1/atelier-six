import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './layout/AppShell'

const TodayPage = lazy(() => import('../features/today/TodayPage'))
const OnboardingPage = lazy(() => import('../features/onboarding/OnboardingPage'))
const CoursePage = lazy(() => import('../features/course/CoursePage'))
const CourseModulePage = lazy(() => import('../features/course/CourseModulePage'))
const LibraryPage = lazy(() => import('../features/library/LibraryPage'))
const ChordDetailPage = lazy(() => import('../features/library/ChordDetailPage'))
const LessonPage = lazy(() => import('../features/lesson/LessonPage'))
const PractisePage = lazy(() => import('../features/practise/PractisePage'))
const DrillsPage = lazy(() => import('../features/drills/DrillsPage'))
const TunerPage = lazy(() => import('../features/tuner/TunerPage'))
const ProgressPage = lazy(() => import('../features/progress/ProgressPage'))
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'))
const DesignPage = lazy(() => import('../features/design/DesignPage'))

export const routeObjects = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <TodayPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/course', element: <CoursePage /> },
      { path: '/course/:module', element: <CourseModulePage /> },
      { path: '/library', element: <LibraryPage /> },
      { path: '/library/:chord', element: <ChordDetailPage /> },
      { path: '/lesson/:id', element: <LessonPage /> },
      { path: '/practise', element: <PractisePage /> },
      { path: '/drills', element: <DrillsPage /> },
      { path: '/tuner', element: <TunerPage /> },
      { path: '/progress', element: <ProgressPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/design', element: <DesignPage /> },
    ],
  },
]

export const router = createBrowserRouter(routeObjects)
