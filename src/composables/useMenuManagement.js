import { ref, reactive, onMounted, nextTick } from 'vue'
import { getMenuTree, deleteMenu, changeMenuStatus } from '@/api/system/menu'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 菜单管理页逻辑
 *
 * @returns {object} 菜单管理页响应式状态和方法
 */
export function useMenuManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const tableKey = ref(0)

  const queryParams = reactive({
    name: '',
    status: null
  })

  const dialogVisible = ref(false)
  const editMenuId = ref(null)
  const dialogKey = ref(0)

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const params = {}
      if (queryParams.name) params.name = queryParams.name
      if (queryParams.status !== null && queryParams.status !== '') params.status = queryParams.status
      const res = await getMenuTree(params)
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
    queryParams.name = ''
    queryParams.status = null
    fetchData()
  }

  function handleAdd(parentId) {
    editMenuId.value = null
    nextTick(() => {
      editMenuId.value = parentId !== undefined ? `add_${parentId}` : 'add_0'
      dialogKey.value++
      nextTick(() => {
        dialogVisible.value = true
      })
    })
  }

  function handleEdit(id) {
    editMenuId.value = null
    nextTick(() => {
      editMenuId.value = id
      dialogKey.value++
      nextTick(() => {
        dialogVisible.value = true
      })
    })
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该菜单吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteMenu(id)
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
      await changeMenuStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '菜单已启用' : '菜单已停用')
      // 重新加载树以同步状态
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
    editMenuId,
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
