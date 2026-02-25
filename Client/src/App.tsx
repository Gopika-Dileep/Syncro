import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

function App(){
return(
  <div>
    <BrowserRouter>
    <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='register' element={<Register/>}/>
    </Routes>
    </BrowserRouter>
  </div>
)

}

export default App