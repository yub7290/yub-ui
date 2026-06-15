import { ref, reactive, watch, computed } from 'vue'
import { createDept, updateDept, getDeptDetail } from '@/api/system/dept'
import { ElMessage } from 'element-plus'

/**
 * 部门表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useDeptFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)

  const formData = reactive({
    parentId: 0,
    deptName: '',
    deptCode: '',
    sort: 0,
    status: 1
  })

  const rules = {
    deptName: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { max: 50, message: '部门名称长度不能超过50个字符', trigger: 'blur' }
    ],
    deptCode: [
      { max: 50, message: '部门编码长度不能超过50个字符', trigger: 'blur' }
    ]
  }

  /** 上级部门名称显示 */
  const parentName = computed(() => {
    if (!props.deptTree || props.deptTree.length === 0) return ''
    const findName = (list, id) => {
      for (const item of list) {
        if (item.id === id) return item.deptName
        if (item.children) {
          const found = findName(item.children, id)
          if (found) return found
        }
      }
      return ''
    }
    if (formData.parentId === 0) return '顶级部门'
    return findName(props.deptTree, formData.parentId) || '顶级部门'
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

  // 监听 editDeptId 变化，决定新增还是编辑
  watch(() => props.editDeptId, (val) => {
    if (val !== null && val !== undefined) {
      // 新增模式：editDeptId 为 "add_{parentId}"
      if (typeof val === 'string' && val.startsWith('add_')) {
        const parentId = parseInt(val.replace('add_', ''), 10)
        formData.parentId = parentId
      }
    }
  })

  async function handleOpen() {
    if (props.editDeptId) {
      if (typeof props.editDeptId === 'string' && props.editDeptId.startsWith('add_')) {
        // 新增模式
        isEdit.value = false
        const parentId = parseInt(props.editDeptId.replace('add_', ''), 10)
        formData.parentId = parentId
      } else {
        // 编辑模式
        isEdit.value = true
        const res = await getDeptDetail(props.editDeptId)
        const data = res.data
        formData.parentId = data.parentId
        formData.deptName = data.deptName
        formData.deptCode = data.deptCode || ''
        formData.sort = data.sort || 0
        formData.status = data.status
      }
    }
  }

  function resetForm() {
    formData.parentId = 0
    formData.deptName = ''
    formData.deptCode = ''
    formData.sort = 0
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
        await updateDept({
          id: props.editDeptId,
          parentId: formData.parentId,
          deptName: formData.deptName,
          deptCode: formData.deptCode || null,
          sort: formData.sort,
          status: formData.status
        })
        ElMessage.success('编辑成功')
      } else {
        await createDept({
          parentId: formData.parentId,
          deptName: formData.deptName,
          deptCode: formData.deptCode || null,
          sort: formData.sort,
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
