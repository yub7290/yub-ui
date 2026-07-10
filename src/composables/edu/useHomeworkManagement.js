import { ref, reactive, onMounted } from 'vue'
import { getHomeworkPage, deleteHomework } from '@/api/edu/homework'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 作业批改管理页逻辑
 *
 * @returns {object} 作业批改管理页响应式状态和方法
 */
export function useHomeworkManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    courseId: null,
    studentName: '',
    status: null
  })

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getHomeworkPage({
        queryParam: { ...queryParams },
        pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
      })
      const data = res.data
      if (Array.isArray(data)) {
        tableData.value = data
        total.value = data.length
      } else {
        tableData.value = data.list || data.records || []
        total.value = data.total || 0
      }
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
    queryParams.courseId = null
    queryParams.studentName = ''
    queryParams.status = null
    pageNum.value = 1
    fetchData()
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该作业批改记录吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteHomework(id)
      ElMessage.success('删除成功')
      fetchData()
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
    fetchData,
    handleQuery,
    handleReset,
    handleDelete
  }
}
