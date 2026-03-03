import { addEmployeeApi, type AddEmployeeForm } from "@/api/companyApi";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const initialForm: AddEmployeeForm ={
    name: "",
    email:"",
    designation:"",
    date_of_joining:"",
    date_of_birth:"",
    phone:"",
    address:"",
    skills:"",
}

export default function AddEmployee(){
    const navigate = useNavigate()

    const [form, setForm] = useState<AddEmployeeForm>(initialForm)
    const [error,setError] = useState("")
    const [success,setSuccess] = useState("")

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        setForm({...form,[e.target.name]:e.target.value})
    }

    const handleSubmit = async (error:React.FormEvent)=>{
        error.preventDefault()
        setError("")
        setSuccess("")
        try{
            const data = await addEmployeeApi(form)
            console.log("Employee added:",data)
            setSuccess("Employee added! Invitation email sent.")
            setTimeout(()=>navigate("/company/employees"),2000)
        }catch(err:unknown){
            const msg = err instanceof Error? err.message :"Failed to add employee"
            setError(msg)
        }
    }

    return(
        <div>
            <h1>Add Employee</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <input name="name" placeholder="Full name" value={form.name} onChange={handleChange}/>
                </div>
                <div>
                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange}/>
                </div>
                <div>
                    <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange}/>
                </div>
                <div>
                    <input name="date_of_joining" placeholder="date of joining" value={form.date_of_joining} onChange={handleChange}/>
                </div>
                <div>
                    <input name="date_of_birth" placeholder="date of birth" value={form.date_of_birth} onChange={handleChange}/>
                </div>
                <div>
                    <input name="phone" placeholder="phone" value={form.phone} onChange={handleChange}/>
                </div>
                <button type="submit">Add Employee</button>
                <button type="button" onClick={()=>navigate("/company/dashboard")}>Cancel</button>
            </form>
            {success  && <p style={{color:"green"}}>{success}</p>}
            {error && <p style={{color:"red"}}>{error}</p>}
        </div>
    )
}