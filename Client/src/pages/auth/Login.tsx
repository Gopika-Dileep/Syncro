import { loginApi } from "@/api/authapi";
import { useState} from "react";


export default function Login(){
    const [form,setform] = useState({email:"",password:""})

    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setform({...form,[e.target.name]:e.target.value})
    }

    const handleSubmit=async (e:React.FormEvent)=>{
        e.preventDefault()
        try{
            const data = await loginApi(form.email,form.password)
            console.log("login successful",data)

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