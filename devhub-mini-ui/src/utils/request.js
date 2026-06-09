// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 1. 创建 Axios 实例
const service = axios.create({
  // 加上单引号！
  baseURL: 'http://127.0.0.1:4523/m1/8411981-8180267-default', 
  timeout: 8000
})

// 2. 请求拦截器
service.interceptors.request.use(
  config => {
    // 模拟获取本地 Token 并在请求头携带
    const token = localStorage.getItem('devhub_token') || 'mock-jwt-token-123'
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求发送异常:', error)
    return Promise.reject(error)
  }
)

// 3. 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data

    // ✨ 绿色通道 1：如果是纯数组（如获取列表），直接放行
    if (Array.isArray(res)) return res
    
    // ✨ 绿色通道 2：如果是没有 code 属性的纯对象（如获取单条详情），直接放行
    if (res && typeof res === 'object' && res.code === undefined) {
      return res
    }

    // 常规通道：如果后端返回了标准的包裹格式 { code: 200, data: {...} }
    if (res.code !== undefined && res.code !== 200 && res.code !== 0) { 
      ElMessage.error(res.message || '业务处理失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    
    return res.data !== undefined ? res.data : res
  },
// ... 下面的 error 保持不变
  error => {
    // ... 下面的 error 处理代码保持不变 ...
    // 实验要求：异常分类捕获与提示
    let errMsg = '网络请求异常，请稍后重试'
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errMsg = '请求超时，请检查网络环境'
    } else if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401: errMsg = '登录鉴权过期，请重新登录'; break;
        case 403: errMsg = '无权访问该接口'; break;
        case 404: errMsg = '请求的接口地址不存在 (404)'; break;
        case 500: errMsg = '服务器内部错误 (500)'; break;
        default: errMsg = `接口报错: ${status}`
      }
    }
    ElMessage.error(errMsg)
    return Promise.reject(error)
  }
)

export default service