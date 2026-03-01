import { loginApi } from "@/api/authapi";
import { setToken } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store/store";
import { useState} from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";


export default function Login(){

    const navigate = useNavigate()

    const  dispatch = useDispatch<AppDispatch>()
    const [form,setform] = useState({email:"",password:""})

    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setform({...form,[e.target.name]:e.target.value})
    }

    const handleSubmit=async (e:React.FormEvent)=>{
        e.preventDefault()
        try{
            const data = await loginApi(form.email,form.password)
            console.log("login successful",data)
            dispatch(setToken(data.token))
            navigate("/company/dashboard")
        }catch(error){
            console.log("login failed",error)
        }
    }


    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input name="email" placeholder="email" value={form.email} onChange={handleChange}/>
                <input name="password" placeholder="password"  value={form.password} onChange={handleChange}/>
                <button type="submit">sign in</button>
            </form>
        </div>
    )
}