import { ref, reactive, onMounted, nextTick } from 'vue'
import { getDeptTree, deleteDept, changeDeptStatus } from '@/api/system/dept'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 部门管理页逻辑
 *
 * @returns {object} 部门管理页响应式状态和方法
 */
export function useDeptManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const tableKey = ref(0)

  const queryParams = reactive({
    deptName: '',
    status: null
  })

  const dialogVisible = ref(false)
  const editDeptId = ref(null)
  const dialogKey = ref(0)

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const params = {}
      if (queryParams.deptName) params.deptName = queryParams.deptName
      if (queryParams.status !== null && queryParams.status !== '') params.status = queryParams.status
      const res = await getDeptTree(params)
      tableData.value = res.data || []
      tableKey.value++
    } catch {
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  function handleQuery() {
    fetchData()
  }

  function handleReset() {
    queryParams.deptName = ''
    queryParams.status = null
    fetchData()
  }

  function handleAdd(parentId) {
    editDeptId.value = null
    nextTick(() => {
      editDeptId.value = parentId !== undefined ? `add_${parentId}` : 'add_0'
      dialogKey.value++
      nextTick(() => {
        dialogVisible.value = true
      })
    })
  }

  function handleEdit(id) {
    editDeptId.value = null
    nextTick(() => {
      editDeptId.value = id
      dialogKey.value++
      nextTick(() => {
        dialogVisible.value = true
      })
    })
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该部门吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteDept(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      // 取消操作
    }
  }

  async function handleStatusChange(row, checked) {
    const status = checked ? 1 : 0
    row._statusLoading = true
    try {
      await changeDeptStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '部门已启用' : '部门已停用')
      fetchData()
    } catch {
      // 错误已处理
    } finally {
      row._statusLoading = false
    }
  }

  return {
    loading,
    tableData,
    tableKey,
    queryParams,
    dialogVisible,
    editDeptId,
    dialogKey,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange
  }
}
