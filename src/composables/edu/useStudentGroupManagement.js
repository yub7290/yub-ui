import { ref, reactive, onMounted } from 'vue'
import { getStudentGroupPage } from '@/api/edu/studentGroup'

/**
 * 学员组管理页逻辑
 *
 * @returns {object} 学员组管理页响应式状态和方法
 */
export function useStudentGroupManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(20)

  const queryParams = reactive({
    name: ''
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getStudentGroupPage({
        queryParam: { ...queryParams },
        pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
      })
      const data = res.data
      tableData.value = data.records || []
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
    pageNum.value = 1
    fetchData()
  }

  onMounted(() => {
    fetchData()
  })

  return {
    loading,
    tableData,
    total,
    pageNum,
    pageSize,
    queryParams,
    fetchData,
    handleQuery,
    handleReset
  }
}
