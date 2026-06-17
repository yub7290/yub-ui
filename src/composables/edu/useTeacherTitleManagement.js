import { ref, reactive, onMounted } from 'vue'
import { getTeacherTitlePage, deleteTeacherTitle, changeTeacherTitleStatus } from '@/api/edu/teacherTitle'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 教师职称管理页逻辑
 *
 * @returns {object} 教师职称管理页响应式状态和方法
 */
export function useTeacherTitleManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    name: '',
    status: null
  })

  const dialogVisible = ref(false)
  const editId = ref(null)

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getTeacherTitlePage({
        queryParam: { ...queryParams },
        pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
      })
      const data = res.data
      tableData.value = (data.records || []).map(row => ({ ...row, _statusLoading: false }))
      total.value = data.total || 0
    } catch {
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  function handleQuery() {
    pageNum.value = 1
    fetchData()
  }

  function handleReset() {
    queryParams.name = ''
    queryParams.status = null
    pageNum.value = 1
    fetchData()
  }

  function handleAdd() {
    editId.value = null
    dialogVisible.value = true
  }

  function handleEdit(id) {
    editId.value = id
    dialogVisible.value = true
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该教师职称吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteTeacherTitle(id)
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
      await changeTeacherTitleStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '职称已启用' : '职称已停用')
    } catch {
      // 错误已处理
    } finally {
      row._statusLoading = false
    }
  }

  return {
    loading,
    tableData,
    total,
    pageNum,
    pageSize,
    queryParams,
    dialogVisible,
    editId,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange
  }
}
