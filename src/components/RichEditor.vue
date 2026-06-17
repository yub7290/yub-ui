<template>
  <div class="rich-editor">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      mode="default"
      class="editor-toolbar"
    />
    <Editor
      :defaultConfig="editorConfig"
      :defaultContent="defaultContent"
      mode="default"
      style="height: 420px; overflow-y: auto;"
      @onCreated="onCreated"
      @onChange="onChange"
      @onDestroyed="onDestroyed"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, onBeforeUnmount, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = shallowRef(null)
const defaultContent = ref([])

// 工具栏配置：排除不需要的菜单
const toolbarConfig = {
  excludeKeys: [
    'fullScreen',
    'group-video',
    'insertVideo',
    'codeBlock',
    'codeSelectLang',
    'todo'
  ]
}

// 编辑器配置
const editorConfig = {
  placeholder: '请输入内容...',
  // 自定义图片上传
  MENU_CONF: {
    uploadImage: {
      // 最多上传文件数量
      maxNumberOfFiles: 5,
      // 单个文件大小限制 5MB
      maxFileSize: 5 * 1024 * 1024,
      // 允许的文件类型
      allowedFileTypes: ['image/*'],
      // 自定义上传
      async customUpload(file, insertFn) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('directory', 'edu/editor')
        try {
          const { default: request } = await import('@/utils/request')
          const res = await request.post('/edu/upload/image', formData)
          if (res.code === 200 && res.data) {
            insertFn(res.data)
          } else {
            ElMessage.error('图片上传失败: ' + (res.message || '未知错误'))
          }
        } catch (e) {
          ElMessage.error('图片上传失败: ' + (e.message || '网络错误'))
        }
      }
    }
  }
}

function onCreated(editor) {
  editorRef.value = editor
  // 设置初始内容
  if (props.modelValue) {
    try {
      editor.setHtml(props.modelValue)
    } catch {
      // 忽略设置错误
    }
  }
}

function onChange(editor) {
  emit('update:modelValue', editor.getHtml())
}

function onDestroyed() {
  editorRef.value = null
}

// 监听外部 modelValue 变化
watch(() => props.modelValue, (val) => {
  if (editorRef.value && val !== undefined && val !== editorRef.value.getHtml()) {
    editorRef.value.setHtml(val || '')
  }
})

// 组件销毁时销毁编辑器
onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy()
    editorRef.value = null
  }
})
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>

<style scoped>
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
.editor-toolbar {
  border-bottom: 1px solid #dcdfe6;
}
</style>
