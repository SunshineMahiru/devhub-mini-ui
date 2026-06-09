// src/api/snippet.js (接口统一管理层)
import request from '../utils/request'

export const snippetApi = {
  // 1. 获取列表
  getList: (params) => request({ url: '/api/snippets', method: 'get', params }),
  // 2. 获取单条
  getOne: (id) => request({ url: `/api/snippets/${id}`, method: 'get' }),
  // 3. 新增
  create: (data) => request({ url: '/api/snippets', method: 'post', data }),
  // 4. 更新
  update: (id, data) => request({ url: `/api/snippets/${id}`, method: 'put', data }),
  // 5. 删除
  remove: (id) => request({ url: `/api/snippets/${id}`, method: 'delete' })
}

/* 响应数据模型约定 (JSON Schema):
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "@increment",                 // Apifox Mock 语法：自增ID
    "title": "@ctitle(5, 15)",          // Apifox Mock 语法：随机中文标题
    "language": "@pick(['Vue', 'JS'])", // Apifox Mock 语法：随机选取
    "code": "console.log('Mock!');" 
  }
}
*/