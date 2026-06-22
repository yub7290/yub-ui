import { ref, reactive, onMounted } from 'vue'
import {
  getTeacherPage,
  deleteTeacher,
  deleteTeacherBatch,
  resetTeacherPassword,
  changeTeacherStatus,
  setTeacherRecommended
} from '@/api/edu/teacher'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 教师管理页逻辑
 *
 * @returns {object} 教师管理页响应式状态和方法
 */
export function useTeacherManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    account: '',
    name: '',
    phone: '',
    titleId: null,
    education: '',
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
      const res = await getTeacherPage({
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
    queryParams.account = ''
    queryParams.name = ''
    queryParams.phone = ''
    queryParams.titleId = null
    queryParams.education = ''
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
      await ElMessageBox.confirm('确定要删除该教师吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteTeacher(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      // 取消操作
    }
  }

  async function handleBatchDelete() {
    if (selectedIds.value.length === 0) {
      ElMessage.warning('请先选择要删除的教师')
      return
    }
    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 位教师吗？`, '批量删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteTeacherBatch(selectedIds.value)
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } catch {
      // 取消操作
    }
  }

  async function handleResetPwd(id) {
    try {
      await ElMessageBox.confirm('确定要将该教师的密码重置为默认密码（admin123）吗？', '重置密码', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await resetTeacherPassword(id)
      ElMessage.success('密码重置成功')
    } catch {
      // 取消操作
    }
  }

  async function handleStatusChange(row, checked) {
    const status = checked ? 1 : 0
    row._statusLoading = true
    try {
      await changeTeacherStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '教师已启用' : '教师已停用')
    } catch {
      // 错误已处理
    } finally {
      row._statusLoading = false
    }
  }

  async function handleSetRecommended(row, checked) {
    const recommended = checked ? 1 : 0
    row._recommendLoading = true
    try {
      await setTeacherRecommended(row.id, recommended)
      row.recommended = recommended
      ElMessage.success(checked ? '已设为推荐教师' : '已取消推荐')
    } catch {
      // 错误已处理
    } finally {
      row._recommendLoading = false
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
    handleResetPwd,
    handleStatusChange,
    handleSetRecommended,
    handleSelectionChange
  }
}
