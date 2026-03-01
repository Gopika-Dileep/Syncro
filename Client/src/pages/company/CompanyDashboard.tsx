import { logoutApi } from "@/api/authapi";
import { logout } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CompanyDashboard(){
    const dispatch = useDispatch<AppDispatch>()
    const navigate =useNavigate()

    const handleLogout = async ()=>{
        try{
            await logoutApi()
        }catch(err) {
            console.log("logout API failed",err)
        }finally{
            dispatch(logout())
            navigate("/login")
        }
    }

    return (
        <div>
            <h1>Company Dashboard</h1>
            <p>Welcome! you are logged in.</p>
            <p>Token: token is there</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}