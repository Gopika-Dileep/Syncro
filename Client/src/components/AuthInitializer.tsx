import { refreshTokenApi } from "@/api/authapi"
import { setInitialized, setRole, setToken, } from "@/store/slices/authSlice"
import type { AppDispatch } from "@/store/store"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

interface Props{
    children :React.ReactNode
}

export default function AuthInitializer({children}:Props){
    const dispatch = useDispatch<AppDispatch>()
    useEffect(()=>{
        const tryRefresh = async()=>{
            try{
                const data = await refreshTokenApi()
                dispatch(setToken(data.token))
                dispatch(setRole(data.role))
            }catch(error){
                console.error("Failed to refresh token:", error)
            }finally{
                dispatch(setInitialized())
            }

        }
        tryRefresh()
    },[dispatch])

    return <>{children}</>
}