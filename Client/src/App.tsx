import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import ForgetPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import CompanyDashboard from './pages/company/CompanyDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AuthInitializer from './components/AuthInitializer'
import PublicRoute from './components/PublicRoute'
import CompanyLayout from './layouts/CompanyLayout'
import Employees from './pages/company/Employees'
import Projects from './pages/company/Projects'
import Notifications from './pages/company/Notifications'
import Settings from './pages/company/Settings'
import AddEmployee from './pages/company/AddEmployee'
import EmployeeLayout from './layouts/EmployeeLayout'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import Sprints from './pages/employee/Sprints'
import Backlogs from './pages/employee/Backlogs'
import Teams from './pages/company/Teams'
import GetEmployee from './pages/company/GetEmployee'

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
              <Route path='projects' element={<Projects />} />
              <Route path='backlogs' element={<Backlogs />} />
              <Route path='sprints' element={<Sprints />} />
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