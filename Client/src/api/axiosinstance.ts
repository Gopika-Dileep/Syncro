import { setToken, logout } from '@/store/slices/authSlice'
import { store } from '@/store/store'
import axios from 'axios'
import { ENDPOINTS } from '@/constants/endpoints'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "content-Type" : "application/json" },
    withCredentials:true
})

axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().auth.token
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
},
(error) => {
    return Promise.reject(error)
}
)

axiosInstance.interceptors.response.use((response) => {
    return response
},
    async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 403 && error.response.data?.message?.toLowerCase().includes("blocked")) {
            store.dispatch(logout());
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}${ENDPOINTS.AUTH.REFRESH}`,
                    {},
                    { withCredentials: true }
                )
                const newToken = res.data.token
                store.dispatch(setToken(newToken))
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return axiosInstance(originalRequest)
            } catch {
                store.dispatch(logout())
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance



