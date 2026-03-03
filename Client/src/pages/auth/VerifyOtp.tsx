import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { verifyOtpApi } from "@/api/authapi";
import { setToken } from "@/store/slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";

export default function verifyOtp() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const email = location.state?.email || ""
    const [otp, setOtp] = useState("");

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

    return (
        <div>
            <h1>Verify OTP</h1>
            <p>An OTP has been sent to {email}</p>
            <form onSubmit={handleSubmit}>
                <input name="otp" placeholder="enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button type="submit">Verify & Login</button>
            </form>
        </div>
    )
}