import type { RootState } from "@/store/store"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

interface Props{
    children:React.ReactNode
    allowedRoles?:string[]
}

export default function ProtectedRoute({children,allowedRoles}:Props){
    const token = useSelector((state:RootState)=>state.auth.token)
    const role = useSelector((state:RootState)=>state.auth.role)
    const isInitialized = useSelector((state:RootState)=>state.auth.isInitialized)
    if(!isInitialized){
        return <div>Loading...</div>
    }
    if(!token){
        return <Navigate to='/login' replace />
    }

    if(allowedRoles && role && !allowedRoles.includes(role)){
        if(role === "employee"){
            return <Navigate to="/employee/dashboard" replace/>
        }else{
            return <Navigate to="/company/dashboard" replace/>
        }
    }

    return <>{children}</>
}