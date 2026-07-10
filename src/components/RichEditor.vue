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
      :style="{ height: height, overflowY: 'auto' }"
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
  modelValue: { type: String, default: '' },
  /** 编辑器高度 */
  height: { type: String, default: '320px' }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = shallowRef(null)
const defaultContent = ref([])

const toolbarConfig = {
  excludeKeys: [
    'fullScreen',
    'codeBlock',
    'codeSelectLang',
    'todo'
  ]
}

const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      maxNumberOfFiles: 5,
      maxFileSize: 5 * 1024 * 1024,
      allowedFileTypes: ['image/*'],
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
  if (props.modelValue) {
    try {
      editor.setHtml(props.modelValue)
    } catch {
      // Ignore invalid editor HTML.
    }
  }
}

function onChange(editor) {
  emit('update:modelValue', editor.getHtml())
}

function onDestroyed() {
  editorRef.value = null
}

watch(() => props.modelValue, (val) => {
  if (editorRef.value && val !== undefined && val !== editorRef.value.getHtml()) {
    editorRef.value.setHtml(val || '')
  }
})

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
