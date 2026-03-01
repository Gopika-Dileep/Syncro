import React, { useState } from "react";
import { forgotPasswordApi } from "../../api/authapi"

export default function ForgetPassword(){
    const [email,setEmail] = useState('')
    const [message , setMessage] = useState('')
    const [error , setError] = useState('')

    const handleSubmit = async (e:React.FormEvent) =>{
        e.preventDefault()
        setMessage("")
        setError("")
        try{
            const data = await forgotPasswordApi(email)
            console.log("forgot password response:" ,data)
            setMessage(data.message)
        }catch (err:unknown){
            const msg = err instanceof Error ? err.message :"something went wrong"
            setError(msg)
        }
    }

    return (
        <div>
            <h1>Forget Password</h1>
            <form onSubmit={handleSubmit}>
                <input type="mail" placeholder="enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                <button type="submit">send reset link</button>
            </form>
            {message && <p style={{color:"green"}}>{message}</p>}
            {error && <p style={{color:"red"}}>{error}</p>}
        
        </div>
    )
}