import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { resendOtpApi, verifyOtpApi } from "@/api/authapi";
import { setToken } from "@/store/slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";

export default function verifyOtp() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const email = location.state?.email || ""

    const [otp, setOtp] = useState("");
    const [timeLeft,setTimeLeft] = useState(60)
    const [canResend , setCanResend] = useState(false)

    useEffect(()=>{
        if(timeLeft>0){
            const timerId = setTimeout(()=>setTimeLeft(timeLeft-1),1000)
            return ()=>clearTimeout(timerId)
        }else{
            setCanResend(true)
        }
    },[timeLeft])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await verifyOtpApi(email, otp)
            
            dispatch(setToken(data.token))
            navigate('/company/dashboard')
            
        } catch (error) {
            console.log("otp verification failed", error)
        }
    }

    const handleResend = async () =>{
        try{
            await resendOtpApi(email)
            setTimeLeft(60)
            setCanResend(false)
            console.log("otp resent successfully")
        }catch(error){
            console.log("resend otp failed",error)
        }
    }

    return (
        <div>
            <h1>Verify OTP</h1>
            <p>An OTP has been sent to {email}</p>
            <form onSubmit={handleSubmit}>
                <input name="otp" placeholder="enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button type="submit">Verify & Login</button>
            </form>
            <div style={{marginTop: '20px'}}>
                {timeLeft > 0 ? (
                    <p>Time remaining:{timeLeft}s</p>
                ):(
                    <p>otp expired or not recieved</p>
                )}

                {canResend && (
                    <button type="button" onClick={handleResend}>
                        Resend OTP
                    </button>
                )}
                
            </div>
        </div>
    )
}