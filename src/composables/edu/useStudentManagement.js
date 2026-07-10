import { ref, reactive, onMounted } from 'vue'
import {
  getStudentPage,
  deleteStudent,
  deleteStudentBatch,
  changeStudentStatus,
  batchDisableStudents,
  resetStudentPassword
} from '@/api/edu/student'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 学员管理页逻辑
 *
 * @returns {object} 学员管理页响应式状态和方法
 */
export function useStudentManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    name: '',
    phone: '',
    account: '',
    status: null
  })

  const dialogVisible = ref(false)
  const editId = ref(null)
  const selectedIds = ref([])

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getStudentPage({
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
    queryParams.phone = ''
    queryParams.account = ''
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

  function handleSelectionChange(rows) {
    selectedIds.value = rows.map(r => r.id)
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该学员吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteStudent(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      // 取消操作
    }
  }

  async function handleBatchDelete() {
    if (selectedIds.value.length === 0) {
      ElMessage.warning('请先选择要删除的学员')
      return
    }
    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 位学员吗？`, '批量删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteStudentBatch(selectedIds.value)
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } catch {
      // 取消操作
    }
  }

  async function handleStatusChange(row, checked) {
    const status = checked ? 1 : 0
    row._statusLoading = true
    try {
      await changeStudentStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '学员已启用' : '学员已停用')
    } catch {
      // 错误已处理
    } finally {
      row._statusLoading = false
    }
  }

  async function handleBatchDisable() {
    if (selectedIds.value.length === 0) {
      ElMessage.warning('请先选择要禁用的学员')
      return
    }
    try {
      await ElMessageBox.confirm(`确定要禁用选中的 ${selectedIds.value.length} 位学员吗？`, '批量禁用确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await batchDisableStudents(selectedIds.value)
      ElMessage.success('批量禁用成功')
      selectedIds.value = []
      fetchData()
    } catch {
      // 取消操作
    }
  }

  async function handleResetPassword(id) {
    try {
      await ElMessageBox.confirm('确定要将该学员的密码重置为默认密码（123456）吗？', '重置密码', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await resetStudentPassword(id)
      ElMessage.success('密码重置成功')
    } catch {
      // 取消操作
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
    selectedIds,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleStatusChange,
    handleBatchDisable,
    handleResetPassword,
    handleSelectionChange
  }
}
