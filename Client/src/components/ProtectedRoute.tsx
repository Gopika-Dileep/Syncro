import type { RootState } from "@/store/store"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

interface Props{
    children:React.ReactNode


}

export default function ProtectedRoute({children}:Props){
    const token = useSelector((state:RootState)=>state.auth.token)
    const isInitialized = useSelector((state:RootState)=>state.auth.isInitialized)
    if(!isInitialized){
        return <div>Loading...</div>
    }
    if(!token){
        return <Navigate to='/login' replace />
    }

    return <>{children}</>
}