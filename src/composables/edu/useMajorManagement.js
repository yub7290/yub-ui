import { ref, reactive, onMounted, nextTick } from 'vue'
import { getMajorTree, deleteMajor, changeMajorStatus, changeMajorRecommended } from '@/api/edu/major'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 专业管理页逻辑
 *
 * @returns {object} 专业管理页响应式状态和方法
 */
export function useMajorManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const tableKey = ref(0)

  const queryParams = reactive({
    name: '',
    status: null
  })

  const dialogVisible = ref(false)
  const editMajorId = ref(null)
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
      const res = await getMajorTree(params)
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
    editMajorId.value = null
    nextTick(() => {
      editMajorId.value = parentId !== undefined ? `add_${parentId}` : 'add_0'
      dialogKey.value++
      nextTick(() => {
        dialogVisible.value = true
      })
    })
  }

  function handleEdit(id) {
    editMajorId.value = null
    nextTick(() => {
      editMajorId.value = id
      dialogKey.value++
      nextTick(() => {
        dialogVisible.value = true
      })
    })
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该专业吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteMajor(id)
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
      await changeMajorStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '专业已启用' : '专业已停用')
      fetchData()
    } catch {
      // 错误已处理
    } finally {
      row._statusLoading = false
    }
  }

  async function handleRecommendedChange(row, checked) {
    const val = checked ? 1 : 0
    row._recommendedLoading = true
    try {
      await changeMajorRecommended(row.id, val)
      row.recommended = val
      fetchData()
    } catch {
      // 错误已处理
    } finally {
      row._recommendedLoading = false
    }
  }

  return {
    loading,
    tableData,
    tableKey,
    queryParams,
    dialogVisible,
    editMajorId,
    dialogKey,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleRecommendedChange
  }
}
