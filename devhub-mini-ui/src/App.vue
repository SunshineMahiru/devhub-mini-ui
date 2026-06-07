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

    <main class="max-w-7xl mx-auto p-6 md:p-8">
      <el-empty v-if="snippets.length === 0" description="暂无代码资产，点击右上角新建" class="mt-20" />

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

          <div class="px-5 py-3 bg-white flex justify-end">
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
      title="✨ 沉淀代码资产"
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
          <el-input
            v-model="formData.title"
            placeholder="例如：Axios 全局拦截器"
            size="large"
            class="!rounded-lg"
          />
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
          <el-input
            v-model="formData.code"
            type="textarea"
            :rows="6"
            placeholder="// 在此粘贴你的代码片段..."
            resize="none"
            class="font-mono"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2 pt-2">
          <el-button size="large" class="!rounded-lg" @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" size="large" class="!rounded-lg" @click="submitForm(formRef)">
            保 存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// --- 1. 初始化数据 (✨ 彻底修复了 <\/script> 报错问题) ---
const snippets = ref([
  {
    id: 1,
    title: 'Axios 拦截器极简配置',
    language: 'JavaScript',
    code: 'axios.interceptors.response.use(\n  res => res.data,\n  err => {\n    if (err.response?.status === 401) {\n      localStorage.clear()\n      router.push("/login")\n    }\n    return Promise.reject(err)\n  }\n)'
  },
  {
    id: 2,
    title: 'Vue3 组合式 API 模板',
    language: 'Vue',
    // 这里的 <\/script> 加入了反斜杠，完美绕过了 Vite 编译器的误杀
    code: '<script setup>\nimport { ref, reactive } from "vue"\n\nconst count = ref(0)\n<\/script>\n\n<template>\n  <div @click="count++">{{ count }}</div>\n</template>'
  },
  {
    id: 3,
    title: 'Tailwind 居中容器',
    language: 'CSS',
    code: '@layer utilities {\n  .flex-center {\n    @apply flex items-center justify-center;\n  }\n}'
  }
])

// --- 2. 表单与弹窗控制 ---
const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({
  title: '',
  language: '',
  code: ''
})

// --- 3. 核心考点：原生表单校验规则 ---
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

// 打开弹窗重置数据
const openDialog = () => {
  formData.title = ''
  formData.language = ''
  formData.code = ''
  if (formRef.value) {
    formRef.value.resetFields()
  }
  dialogVisible.value = true
}

// --- 4. 业务逻辑 (CRUD) ---
// 创建 (Create)
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      snippets.value.unshift({
        id: Date.now(),
        title: formData.title,
        language: formData.language,
        code: formData.code
      })
      dialogVisible.value = false
      ElMessage({ message: '✨ 代码资产沉淀成功！', type: 'success' })
    } else {
      ElMessage.error('表单校验未通过，请检查红色提示项')
    }
  })
}

// 删除 (Delete)
const deleteSnippet = (id) => {
  snippets.value = snippets.value.filter(s => s.id !== id)
  ElMessage.success('已将该代码片段移入回收站')
}

// 一键复制辅助功能 (提升前端逼真度)
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
/* 全局覆盖 Element Plus 的默认弹窗圆角，使其无缝融入 Tailwind 风格 */
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