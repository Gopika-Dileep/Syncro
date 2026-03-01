import {createSlice} from "@reduxjs/toolkit"

interface AuthState{
    token :string | null
    isInitialized:boolean
}

const initialState :AuthState ={
    token:null,
    isInitialized:false
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        setToken :(state,action) =>{
            state.token = action.payload
        },
        logout:(state) =>{
            state.token = null
        },
        setInitialized:(state)=>{
            state.isInitialized = true 
        }
    },
})

export const {setToken, logout,setInitialized} = authSlice.actions
export default authSlice.reducer