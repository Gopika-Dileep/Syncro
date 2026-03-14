import { logoutApi } from "@/api/authapi";
import { logout } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
     const dispatch = useDispatch<AppDispatch>()

     const navigate = useNavigate()

     const handleLogout = async()=>{
        try{
            await logoutApi()
        }catch(err){
            console.log("error logout",err)
        }finally{
            dispatch(logout())
            navigate('/login')
        }
     }

     return(
        <div>
            <h1>Employee Dashboard</h1>
            <p>Welcome ! you are logged in </p>
            <button onClick={handleLogout}>Logout</button>
        </div>
     )
}