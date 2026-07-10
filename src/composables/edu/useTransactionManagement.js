import { ref, reactive, onMounted } from 'vue'
import { getTransactionPage } from '@/api/edu/fund'

/**
 * 交易流水管理页逻辑
 *
 * @returns {object} 交易流水管理页响应式状态和方法
 */
export function useTransactionManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    userId: null,
    userName: '',
    transactionType: '',
    startTime: '',
    endTime: ''
  })

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getTransactionPage({
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
    Object.assign(queryParams, {
      userId: null,
      userName: '',
      transactionType: '',
      startTime: '',
      endTime: ''
    })
    pageNum.value = 1
    fetchData()
  }

  function handleSizeChange() {
    pageNum.value = 1
    fetchData()
  }

  function handleCurrentChange() {
    fetchData()
  }

  function setUserId(uid) {
    queryParams.userId = uid
    fetchData()
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
    handleSizeChange,
    handleCurrentChange,
    setUserId
  }
}
