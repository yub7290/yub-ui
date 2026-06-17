import { ref, reactive, nextTick, watch } from 'vue'
import { createRole, updateRole, getRoleDetail } from '@/api/system/role'
import { getMenuTree } from '@/api/system/menu'
import { ElMessage } from 'element-plus'

/**
 * 角色表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useRoleFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)
  const menuTreeRef = ref(null)
  const menuTreeData = ref([])
  const menuLoading = ref(false)

  // 菜单树已选节点 key
  const checkedMenuKeys = ref([])

  const formData = reactive({
    name: '',
    code: '',
    sort: 0,
    status: 1,
    description: ''
  })

  const rules = {
    name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { max: 50, message: '角色名称长度不能超过50个字符', trigger: 'blur' }
    ],
    code: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: '角色编码只能包含字母、数字和下划线', trigger: 'blur' },
      { max: 50, message: '角色编码长度不能超过50个字符', trigger: 'blur' }
    ],
    description: [
      { max: 200, message: '描述长度不能超过200个字符', trigger: 'blur' }
    ]
  }

  watch(() => props.modelValue, (val) => {
    visible.value = val
  })

  watch(visible, (val) => {
    emit('update:modelValue', val)
    if (!val) {
      resetForm()
    }
  })

  async function handleOpen() {
    await loadMenuTree()
    if (props.roleId) {
      isEdit.value = true
      const res = await getRoleDetail(props.roleId)
      const data = res.data
      formData.name = data.name
      formData.code = data.code
      formData.sort = data.sort || 0
      formData.status = data.status
      formData.description = data.description || ''
      checkedMenuKeys.value = data.menuIds || []
      // 在 el-tree 挂载后设置已选节点
      await nextTick()
      if (menuTreeRef.value) {
        menuTreeRef.value.setCheckedKeys(checkedMenuKeys.value)
      }
    } else {
      isEdit.value = false
    }
  }

  async function loadMenuTree() {
    menuLoading.value = true
    try {
      const res = await getMenuTree()
      menuTreeData.value = res.data || []
    } catch {
      menuTreeData.value = []
    } finally {
      menuLoading.value = false
    }
  }

  function resetForm() {
    formData.name = ''
    formData.code = ''
    formData.sort = 0
    formData.status = 1
    formData.description = ''
    checkedMenuKeys.value = []
    isEdit.value = false
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  function getCheckedMenuIds() {
    if (menuTreeRef.value) {
      const checked = menuTreeRef.value.getCheckedKeys()
      const halfChecked = menuTreeRef.value.getHalfCheckedKeys()
      return [...checked, ...halfChecked]
    }
    return checkedMenuKeys.value
  }

  async function handleSubmit() {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }

    const menuIds = getCheckedMenuIds()
    if (menuIds.length === 0) {
      ElMessage.warning('请至少选择一个菜单权限')
      return
    }

    submitting.value = true
    try {
      if (isEdit.value) {
        await updateRole({
          id: props.roleId,
          name: formData.name,
          sort: formData.sort,
          status: formData.status,
          description: formData.description,
          menuIds: menuIds
        })
        ElMessage.success('编辑成功')
      } else {
        await createRole({
          name: formData.name,
          code: formData.code,
          sort: formData.sort,
          status: formData.status,
          description: formData.description,
          menuIds: menuIds
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

  return {
    visible,
    isEdit,
    submitting,
    formRef,
    menuTreeRef,
    menuTreeData,
    menuLoading,
    checkedMenuKeys,
    formData,
    rules,
    handleOpen,
    handleSubmit
  }
}
