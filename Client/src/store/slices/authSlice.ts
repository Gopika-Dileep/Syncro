import {createSlice} from "@reduxjs/toolkit"

interface AuthState{
    token :string | null
    role : string | null
    isInitialized:boolean
}

const initialState :AuthState ={
    token:null,
    role:null,
    isInitialized:false
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        setToken :(state,action) =>{
            state.token = action.payload
        },
        setRole :(state,action)=>{
            state.role = action.payload
        },
        logout:(state) =>{
            state.token = null
        },
        setInitialized:(state)=>{
            state.isInitialized = true 
        }
    },
})

export const {setToken, setRole, logout,setInitialized} = authSlice.actions
export default authSlice.reducer