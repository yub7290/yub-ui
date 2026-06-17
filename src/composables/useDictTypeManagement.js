import { ref, reactive, onMounted } from 'vue'
import { getDictTypePage, deleteDictType, changeDictTypeStatus } from '@/api/system/dictType'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useDictTypeManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    code: '',
    name: '',
    status: null
  })

  const dialogVisible = ref(false)
  const editId = ref(null)

  // 字典数据管理
  const dataDialogVisible = ref(false)
  const currentDictType = ref(null)

  onMounted(() => { fetchData() })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getDictTypePage({
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

  function handleQuery() { pageNum.value = 1; fetchData() }
  function handleReset() { queryParams.code = ''; queryParams.name = ''; queryParams.status = null; pageNum.value = 1; fetchData() }
  function handleAdd() { editId.value = null; dialogVisible.value = true }
  function handleEdit(id) { editId.value = id; dialogVisible.value = true }

  /** 打开字典数据管理 */
  function handleDataManage(row) {
    currentDictType.value = { id: row.id, name: row.name, code: row.code }
    dataDialogVisible.value = true
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该字典类型吗？', '删除确认', { type: 'warning' })
      await deleteDictType(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch { /* cancel */ }
  }

  async function handleStatusChange(row, checked) {
    const status = checked ? 1 : 0
    row._statusLoading = true
    try {
      await changeDictTypeStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '字典已启用' : '字典已停用')
    } catch { /* handled */ } finally {
      row._statusLoading = false
    }
  }

  return {
    loading, tableData, total, pageNum, pageSize, queryParams,
    dialogVisible, editId, dataDialogVisible, currentDictType,
    fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDelete,
    handleStatusChange, handleDataManage
  }
}
