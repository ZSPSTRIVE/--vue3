import axios from 'axios'
import router from '../router'

const request = axios.create({
  baseURL: 'http://13.94.43.150:3001',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      console.log('发送请求:', {
        url: config.url,
        method: config.method,
        headers: { Authorization: `Bearer ${token}` }
      })
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('未找到token')
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('接收到的响应:', response)
    return response.data
  },
  error => {
    console.error('请求错误:', error.response)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    return Promise.reject(error.response?.data?.error || '服务器错误')
  }
)

export default request 