import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import Landing from '@/features/public/pages/Landing'
import Login from '@/features/auth/pages/Login'
import Register from '@/features/auth/pages/Register'
import VerifyOtp from '@/features/auth/pages/VerifyOtp'
import ForgetPassword from '@/features/auth/pages/ForgotPassword'
import ResetPassword from '@/features/auth/pages/ResetPassword'
import CompanyDashboard from '@/features/company/pages/CompanyDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AuthInitializer from './components/AuthInitializer'
import PublicRoute from './components/PublicRoute'
import CompanyLayout from './layouts/CompanyLayout'
import Employees from '@/features/company/pages/Employees'
import Projects from '@/features/company/pages/Projects'
import Notifications from '@/features/company/pages/Notifications'
import Settings from '@/features/company/pages/Settings'
import AddEmployee from '@/features/company/pages/AddEmployee'
import EmployeeLayout from './layouts/EmployeeLayout'
import EmployeeDashboard from '@/features/employee/pages/EmployeeDashboard'
import Sprints from '@/features/employee/pages/Sprints'
import Backlogs from '@/features/employee/pages/Backlogs'
import Teams from '@/features/company/pages/Teams'
import GetEmployee from '@/features/company/pages/GetEmployee'
import EmployeeProjects from '@/features/employee/pages/Projects'
import AddProject from '@/features/employee/pages/AddProject'
import Tasks from './features/employee/pages/Task'
import Team from './features/employee/pages/Team'

function App() {
  return (
    <div>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <AuthInitializer>
          <Routes>
            <Route path='/' element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
            <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} />
            <Route path='/verify-otp' element={<PublicRoute><VerifyOtp /></PublicRoute>} />
            <Route path='/forgot-password' element={<PublicRoute><ForgetPassword /></PublicRoute>} />
            <Route path='/reset-password' element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route
              path='/company'
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout />
                </ProtectedRoute>
              }
            >
              <Route path='dashboard' element={<CompanyDashboard />} />
              <Route path='employees' element={<Employees />} />
              <Route path='employees/:userId' element={<GetEmployee />} />
              <Route path='employees/add' element={<AddEmployee />} />
              <Route path='employees/edit/:userId' element={<AddEmployee />} />
              <Route path='projects' element={<Projects />} />
              <Route path='teams' element={<Teams />} />
              <Route path='notifications' element={<Notifications />} />
              <Route path='settings' element={<Settings />} />
            </Route>
            <Route
              path='/employee'
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route path='dashboard' element={<EmployeeDashboard />} />
              <Route path='projects' element={<EmployeeProjects />} />
              <Route path='projects/add' element={<AddProject />} />
              <Route path='projects/edit/:projectId' element={<AddProject />} />
              <Route path='backlogs' element={<Backlogs />} />
              <Route path='sprints' element={<Sprints />} />
              <Route path='tasks' element={<Tasks/>}/>
              <Route path='teams'  element={<Team/>}/>
              <Route path='notifications' element={<Notifications />} />
              <Route path='settings' element={<Settings />} />
            </Route>
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </div>
  )

}

export default App