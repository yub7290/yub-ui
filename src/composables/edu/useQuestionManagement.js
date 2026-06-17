import { ref, reactive, onMounted } from 'vue'
import { getQuestionPage, deleteQuestion, changeQuestionStatus } from '@/api/edu/question'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 试题管理页逻辑
 *
 * @returns {object} 试题管理页响应式状态和方法
 */
export function useQuestionManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    questionType: null,
    difficulty: null,
    courseId: null,
    status: null
  })

  const dialogVisible = ref(false)
  const editQuestionId = ref(null)

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getQuestionPage({
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
    queryParams.questionType = null
    queryParams.difficulty = null
    queryParams.courseId = null
    queryParams.status = null
    pageNum.value = 1
    fetchData()
  }

  function handleAdd() {
    editQuestionId.value = null
    dialogVisible.value = true
  }

  function handleEdit(id) {
    editQuestionId.value = id
    dialogVisible.value = true
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该试题吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteQuestion(id)
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
      await changeQuestionStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '试题已启用' : '试题已停用')
    } catch {
      // 错误已处理
    } finally {
      row._statusLoading = false
    }
  }

  const questionTypeMap = { 0: '单选', 1: '多选', 2: '判断', 3: '简答', 4: '填空' }

  return {
    loading,
    tableData,
    total,
    pageNum,
    pageSize,
    queryParams,
    dialogVisible,
    editQuestionId,
    questionTypeMap,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange
  }
}
