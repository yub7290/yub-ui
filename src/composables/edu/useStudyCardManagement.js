import { ref, reactive, onMounted } from 'vue'
import {
  getStudyCardPage,
  deleteStudyCard,
  changeStudyCardStatus,
  getInstancePage,
  batchGenerateInstances
} from '@/api/edu/studyCard'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 学习卡管理页逻辑
 *
 * @returns {object} 学习卡管理页响应式状态和方法
 */
export function useStudyCardManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    title: '',
    status: null
  })

  const dialogVisible = ref(false)
  const editStudyCardId = ref(null)

  /** 实例管理相关状态 */
  const instanceDialogVisible = ref(false)
  const instanceCardId = ref(null)
  const instanceDialogTitle = ref('')

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getStudyCardPage({
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
    queryParams.title = ''
    queryParams.status = null
    pageNum.value = 1
    fetchData()
  }

  function handleAdd() {
    editStudyCardId.value = null
    dialogVisible.value = true
  }

  function handleEdit(id) {
    editStudyCardId.value = id
    dialogVisible.value = true
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该学习卡吗？删除后不可恢复。', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteStudyCard(id)
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
      await changeStudyCardStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '学习卡已启用' : '学习卡已停用')
    } catch {
      // 错误已处理
    } finally {
      row._statusLoading = false
    }
  }

  function handleShowInstances(row) {
    instanceCardId.value = row.id
    instanceDialogTitle.value = `${row.title} - 卡号管理`
    instanceDialogVisible.value = true
  }

  async function handleBatchGenerate(row) {
    try {
      const { value } = await ElMessageBox.prompt('请输入生成数量', '批量生成卡号', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[1-9]\d*$/,
        inputErrorMessage: '请输入正整数',
        inputValue: '10'
      })
      const count = parseInt(value, 10)
      if (count > 0) {
        await batchGenerateInstances(row.id, count)
        ElMessage.success(`已生成 ${count} 张卡号`)
        fetchData()
      }
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
    editStudyCardId,
    instanceDialogVisible,
    instanceCardId,
    instanceDialogTitle,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleShowInstances,
    handleBatchGenerate
  }
}
