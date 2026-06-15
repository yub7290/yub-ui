import { ref, reactive, watch, computed } from 'vue'
import { createMenu, updateMenu, getMenuDetail } from '@/api/system/menu'
import { ElMessage } from 'element-plus'

/**
 * 菜单表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useMenuFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)

  const formData = reactive({
    parentId: 0,
    name: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    menuType: 1,
    permission: '',
    status: 1
  })

  const rules = {
    name: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { max: 50, message: '菜单名称长度不能超过50个字符', trigger: 'blur' }
    ],
    path: [
      { max: 200, message: '路由路径长度不能超过200个字符', trigger: 'blur' }
    ],
    component: [
      { max: 200, message: '组件路径长度不能超过200个字符', trigger: 'blur' }
    ],
    icon: [
      { max: 50, message: '图标长度不能超过50个字符', trigger: 'blur' }
    ],
    permission: [
      { max: 100, message: '权限标识长度不能超过100个字符', trigger: 'blur' }
    ]
  }

  /** 父菜单名称显示 */
  const parentName = computed(() => {
    if (!props.menuTree || props.menuTree.length === 0) return ''
    const findName = (list, id) => {
      for (const item of list) {
        if (item.id === id) return item.name
        if (item.children) {
          const found = findName(item.children, id)
          if (found) return found
        }
      }
      return ''
    }
    if (formData.parentId === 0) return '顶级菜单'
    return findName(props.menuTree, formData.parentId) || '顶级菜单'
  })

  watch(() => props.modelValue, (val) => {
    visible.value = val
  })

  watch(visible, (val) => {
    emit('update:modelValue', val)
    if (!val) {
      resetForm()
    }
  })

  // 监听 editMenuId 变化，决定新增还是编辑
  watch(() => props.editMenuId, (val) => {
    if (val !== null && val !== undefined) {
      // 新增模式：editMenuId 为 "add_{parentId}"
      if (typeof val === 'string' && val.startsWith('add_')) {
        const parentId = parseInt(val.replace('add_', ''), 10)
        formData.parentId = parentId
      }
    }
  })

  async function handleOpen() {
    if (props.editMenuId) {
      if (typeof props.editMenuId === 'string' && props.editMenuId.startsWith('add_')) {
        // 新增模式
        isEdit.value = false
        const parentId = parseInt(props.editMenuId.replace('add_', ''), 10)
        formData.parentId = parentId
      } else {
        // 编辑模式
        isEdit.value = true
        const res = await getMenuDetail(props.editMenuId)
        const data = res.data
        formData.parentId = data.parentId
        formData.name = data.name
        formData.path = data.path || ''
        formData.component = data.component || ''
        formData.icon = data.icon || ''
        formData.sort = data.sort || 0
        formData.menuType = data.menuType
        formData.permission = data.permission || ''
        formData.status = data.status
      }
    }
  }

  function resetForm() {
    formData.parentId = 0
    formData.name = ''
    formData.path = ''
    formData.component = ''
    formData.icon = ''
    formData.sort = 0
    formData.menuType = 1
    formData.permission = ''
    formData.status = 1
    isEdit.value = false
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  async function handleSubmit() {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitting.value = true
    try {
      if (isEdit.value) {
        await updateMenu({
          id: props.editMenuId,
          parentId: formData.parentId,
          name: formData.name,
          path: formData.path,
          component: formData.component,
          icon: formData.icon,
          sort: formData.sort,
          menuType: formData.menuType,
          permission: formData.permission,
          status: formData.status
        })
        ElMessage.success('编辑成功')
      } else {
        await createMenu({
          parentId: formData.parentId,
          name: formData.name,
          path: formData.path,
          component: formData.component,
          icon: formData.icon,
          sort: formData.sort,
          menuType: formData.menuType,
          permission: formData.permission,
          status: formData.status
        })
        ElMessage.success('新增成功')
      }
      visible.value = false
      emit('success')
    } catch {
      // 错误已由 request.js 拦截器处理
    } finally {
      submitting.value = false
    }
  }

  function handleParentSelect(id) {
    formData.parentId = id
  }

  return {
    visible,
    isEdit,
    submitting,
    formRef,
    formData,
    rules,
    parentName,
    handleOpen,
    handleSubmit,
    handleParentSelect
  }
}
