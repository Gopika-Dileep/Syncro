import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgetPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import CompanyDashboard from './pages/company/CompanyDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AuthInitializer from './components/AuthInitializer'
import PublicRote from './components/PublicRoute'
import CompanyLayout from './layouts/CompanyLayout'
import Employees from './pages/company/Employees'
import Projects from './pages/company/Projects'
import Notifications from './pages/company/Notifications'
import Settings from './pages/company/Settings'

function App(){
return(
  <div>
    <BrowserRouter>
    <AuthInitializer>
    <Routes>
      <Route path='/login' element={<PublicRote><Login/></PublicRote>}/>
      <Route path='register' element={<PublicRote><Register/></PublicRote>}/>
      <Route path='/forgot-password' element={<ForgetPassword/>}/>
      <Route path='/reset-password' element={<ResetPassword/>}/>
               <Route
                            path='/company'
                            element={
                                <ProtectedRoute>
                                    <CompanyLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path='dashboard'     element={<CompanyDashboard />} />
                            <Route path='employees'     element={<Employees />} />
                            <Route path='projects'      element={<Projects/>} />
                            <Route path='notifications' element={<Notifications />} />
                            <Route path='settings'      element={<Settings />} />
                        </Route>
    </Routes>
    </AuthInitializer>
    </BrowserRouter>
  </div>
)

}

export default App