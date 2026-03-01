import { resetPasswordApi } from "@/api/authapi";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";



export default function ResetPassword(){
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const token = searchParams.get("token") ?? ""

    const [newPassword , setNewPassword] = useState("")
    const [message , setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e:React.FormEvent) =>{
        e.preventDefault()
        setMessage("")
        setError("")
        try{
            const data = await resetPasswordApi(token,newPassword)
            console.log("Reset password response:",data)
            setMessage(data.message)
            setTimeout(()=>navigate('/login'),2000)
        }catch(err:unknown){
            const msg = err  instanceof Error ? err.message:"Reset failed"
            setError(msg)
        }
    }

    return(
        <div>
            <h1>Reset Password</h1>

            {!token && <p style={{color:"red"}}>Invalid or missing</p>}

            <form onSubmit={handleSubmit}>
                <input type="password" placeholder="Enter new passwor" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required/>
                <button type="submit" disabled={!token}>Reset Password</button>
            </form>
            {message && <p style={{ color: "green" }}>{message}</p>}
            {error   && <p style={{ color: "red" }}>{error}</p>}
        </div>
    )
}