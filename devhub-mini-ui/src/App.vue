<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <header class="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-slate-800 tracking-tight">DevHub Mini</h1>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 text-slate-400 text-sm border border-slate-200">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <span>按下 Ctrl + K 检索...</span>
        </div>
        <el-button type="primary" size="large" class="!rounded-lg !font-medium" @click="openDialog">
          + 新建代码片段
        </el-button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto p-6 md:p-8" v-loading="loading" element-loading-text="正在从 Apifox 同步数据...">
      <el-empty v-if="snippets.length === 0 && !loading" description="暂无代码资产，点击右上角新建" class="mt-20" />

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <el-card
          v-for="snippet in snippets"
          :key="snippet.id"
          class="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
          :body-style="{ padding: '0px' }"
        >
          <div class="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 class="font-semibold text-slate-800 truncate pr-2 text-base">{{ snippet.title }}</h3>
            <el-tag :type="getTagType(snippet.language)" effect="light" class="!rounded-md border-none font-medium">
              {{ snippet.language }}
            </el-tag>
          </div>

          <div class="bg-slate-900 p-4 relative">
            <button
              @click="copyCode(snippet.code)"
              class="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
              title="复制代码"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
            <pre class="text-emerald-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap m-0 leading-relaxed"><code>{{ snippet.code }}</code></pre>
          </div>

          <div class="px-5 py-3 bg-white flex justify-end gap-2">
            <el-button type="primary" link size="small" class="!font-medium" @click="handleEdit(snippet.id)">
              编辑片段
            </el-button>
            <el-popconfirm
              title="危险操作：确定要删除吗？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="deleteSnippet(snippet.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small" class="!font-medium">删除片段</el-button>
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </div>
    </main>

    <el-dialog
      v-model="dialogVisible"
      :title="formData.id ? '✏️ 编辑代码资产' : '✨ 沉淀代码资产'"
      width="90%"
      style="max-width: 500px; border-radius: 16px;"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        @submit.prevent
        class="mt-2"
      >
        <el-form-item label="代码标题" prop="title">
          <el-input v-model="formData.title" placeholder="例如：Axios 全局拦截器" size="large" class="!rounded-lg" />
        </el-form-item>

        <el-form-item label="编程语言" prop="language">
          <el-select v-model="formData.language" placeholder="请选择一门编程语言" size="large" class="w-full">
            <el-option label="JavaScript" value="JavaScript" />
            <el-option label="Vue" value="Vue" />
            <el-option label="Java" value="Java" />
            <el-option label="Python" value="Python" />
            <el-option label="CSS" value="CSS" />
          </el-select>
        </el-form-item>

        <el-form-item label="代码正文" prop="code">
          <el-input v-model="formData.code" type="textarea" :rows="6" placeholder="// 在此粘贴你的代码片段..." resize="none" class="font-mono" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2 pt-2">
          <el-button size="large" class="!rounded-lg" @click="dialogVisible = false" :disabled="loading">取 消</el-button>
          <el-button type="primary" size="large" class="!rounded-lg" @click="submitForm(formRef)" :loading="loading">
            保 存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
// ✨ 引入我们封装好的 API 接口层
import { snippetApi } from './api/snippet' 

// --- 1. 响应式状态声明 ---
const snippets = ref([])
const loading = ref(false) // 全局加载状态

const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null, // 新增 ID 字段，用于区分是新建还是编辑
  title: '',
  language: '',
  code: ''
})

// --- 2. 核心考点：原生表单校验规则 ---
const rules = reactive({
  title: [
    { required: true, message: '必须填写代码标题', trigger: 'blur' },
    { min: 3, max: 20, message: '标题长度需要在 3 到 20 个字符之间', trigger: 'blur' }
  ],
  language: [
    { required: true, message: '请必须选择一门编程语言', trigger: 'change' }
  ],
  code: [
    { required: true, message: '代码正文绝对不能为空', trigger: 'blur' }
  ]
})

// --- 3. 业务逻辑 (网络请求 CRUD) ---

// 接口 1: 获取列表 (GET)
const fetchSnippets = async () => {
  loading.value = true
  try {
    const data = await snippetApi.getList()
    // 兼容 Apifox 直接返回数组或被包裹的 data 对象
    snippets.value = Array.isArray(data) ? data : (data.list || [])
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    loading.value = false
  }
}

// 页面挂载时拉取 Mock 数据
onMounted(() => {
  fetchSnippets()
})

// 打开弹窗 (重置数据)
const openDialog = () => {
  formData.id = null
  formData.title = ''
  formData.language = ''
  formData.code = ''
  if (formRef.value) formRef.value.resetFields()
  dialogVisible.value = true
}

// 接口 2: 获取单条详情并回显到表单 (GET)
const handleEdit = async (id) => {
  loading.value = true
  try {
    const data = await snippetApi.getOne(id)
    formData.id = data.id || id
    formData.title = data.title
    formData.language = data.language
    formData.code = data.code
    dialogVisible.value = true
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    loading.value = false
  }
}

// 接口 3 & 4: 提交表单 (新增 POST / 更新 PUT)
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (formData.id) {
          // 存在 ID，执行更新操作
          await snippetApi.update(formData.id, formData)
          ElMessage.success('✨ 代码资产更新成功！')
        } else {
          // 不存在 ID，执行新增操作
          await snippetApi.create(formData)
          ElMessage.success('✨ 代码资产沉淀成功！')
        }
        dialogVisible.value = false
        await fetchSnippets() // 重新拉取列表
      } catch (error) {
        // 异常已在 Axios 拦截器中统一处理抛出提示
      } finally {
        loading.value = false
      }
    } else {
      ElMessage.error('表单校验未通过，请检查红色提示项')
    }
  })
}

// 接口 5: 删除代码片段 (DELETE)
const deleteSnippet = async (id) => {
  loading.value = true
  try {
    await snippetApi.remove(id)
    ElMessage.success('已将该代码片段移入回收站')
    await fetchSnippets() // 删除后刷新列表
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 一键复制辅助功能
const copyCode = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('代码已成功复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动选择复制')
  }
}

// Element-Plus 标签动态颜色分发
const getTagType = (lang) => {
  const colorMap = {
    'JavaScript': 'warning',
    'Vue': 'success',
    'Java': 'danger',
    'Python': 'info',
    'CSS': 'primary'
  }
  return colorMap[lang] || 'info'
}
</script>

<style>
/* 全局覆盖 Element Plus 的默认弹窗圆角 */
.el-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}
.el-dialog__header {
  margin-right: 0 !important;
  padding-bottom: 16px !important;
  border-bottom: 1px solid #f1f5f9;
}
</style>