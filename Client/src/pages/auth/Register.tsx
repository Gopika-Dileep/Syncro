import { registerApi } from "@/api/authapi"
import { useState } from "react"
import { useNavigate } from "react-router-dom"


export default function Register() {

    const navigate = useNavigate()

    const [form,setform] = useState({name:"",email:"",password:"",companyName:""})

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        setform({...form,[e.target.name]:e.target.value})
    }

    const handleSubmit = async (e:React.FormEvent)=>{
        e.preventDefault();
        try{
            const data = await registerApi(form.name,form.email,form.password,form.companyName)
            console.log("register success:",data)
            
            navigate('/verify-otp',{state:{email:form.email}})
        }catch (error){
            console.log("register failed:",error)
        }
    }

    return (
        <div>
            <h1>Create Account </h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="name" value= {form.name} onChange={handleChange}/>
                <input name="companyName" placeholder="company Name"  value={form.companyName} onChange={handleChange}/>
                <input name="email" placeholder="email" value={form.email} onChange={handleChange}/>
                <input name="password" placeholder="password" value={form.password} onChange={handleChange}/>
                <button type="submit">Register</button>
        </form>
        </div>
    )
}