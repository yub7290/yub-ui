import { ref, reactive, onMounted } from 'vue'
import { getUserPage, deleteUser, resetPassword, changeUserStatus } from '@/api/system/user'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 用户管理页逻辑
 *
 * @returns {object} 用户管理页响应式状态和方法
 */
export function useUserManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    account: '',
    nickName: '',
    phone: '',
    status: null
  })

  const dialogVisible = ref(false)
  const editUserId = ref(null)
  const drawerVisible = ref(false)
  const detailUserId = ref(null)

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getUserPage({
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
    queryParams.nickName = ''
    queryParams.phone = ''
    queryParams.status = null
    pageNum.value = 1
    fetchData()
  }

  function handleAdd() {
    editUserId.value = null
    dialogVisible.value = true
  }

  function handleEdit(id) {
    editUserId.value = id
    dialogVisible.value = true
  }

  function handleDetail(id) {
    detailUserId.value = id
    drawerVisible.value = true
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该用户吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteUser(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      // 取消操作
    }
  }

  async function handleResetPwd(id) {
    try {
      await ElMessageBox.confirm('确定要将密码重置为默认密码（123456）吗？', '重置密码', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await resetPassword(id)
      ElMessage.success('密码重置成功')
    } catch {
      // 取消操作
    }
  }

  async function handleStatusChange(row, checked) {
    const status = checked ? 1 : 0
    row._statusLoading = true
    try {
      await changeUserStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '用户已启用' : '用户已停用')
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
    editUserId,
    drawerVisible,
    detailUserId,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDetail,
    handleDelete,
    handleResetPwd,
    handleStatusChange
  }
}
