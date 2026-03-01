import type { RootState } from "@/store/store";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";


interface Props{
    children :React.ReactNode
}

export default function PublicRote({children}:Props){
    const token = useSelector((state:RootState)=>state.auth.token)

    if(token){
        return <Navigate to="/company/dashboard" replace/>
    }
    return <>{children}</>
}