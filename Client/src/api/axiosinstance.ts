import axios from 'axios'

const axiosInstance = axios.create({
    baseURL:
        "http://localhost:5000/api",
    headers: {
        "content-Type":
            "application/json",
    },
})

axiosInstance.interceptors.request.use((config) => {
    return config
},
    (error) => {
        return Promise.reject(error)
    }
)

axiosInstance.interceptors.response.use((response) => {
    return response
},
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized-token may be expired")
        }
        return Promise.reject(error)
    }
)

export default axiosInstance



