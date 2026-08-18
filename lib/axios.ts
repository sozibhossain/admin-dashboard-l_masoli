import axios from "axios"
import { getSession, signOut } from "next-auth/react"

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8002/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to attach access token
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ redirect: true, callbackUrl: "/login" })
    }
    return Promise.reject(error)
  }
)

export default axiosInstance