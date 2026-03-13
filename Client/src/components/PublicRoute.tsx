import type { RootState } from "@/store/store";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";


interface Props{
    children :React.ReactNode
}

export default function PublicRote({children}:Props){
    const token = useSelector((state:RootState)=>state.auth.token)
    const role = useSelector((state:RootState)=>state.auth.role)

    if(token){
        if(role=="employee"){
            return <Navigate to="/employee/dashboard" replace/>
        }
        return <Navigate to="/company/dashboard" replace/>
    }
    return <>{children}</>
}