import { ref, reactive, onMounted } from 'vue'
import { getCourseOrderPage, refundCourseOrder } from '@/api/edu/courseOrder'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 课程订单管理页逻辑
 *
 * @returns {object} 课程订单管理页响应式状态和方法
 */
export function useCourseOrderManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    orderNo: '',
    userName: '',
    courseName: '',
    status: null,
    startTime: '',
    endTime: ''
  })

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getCourseOrderPage({
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
      orderNo: '',
      userName: '',
      courseName: '',
      status: null,
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

  async function handleRefund(row) {
    try {
      await ElMessageBox.confirm(
        '确认对该订单进行退款？退款金额将退回用户余额。',
        '退款确认',
        { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
      )
      await refundCourseOrder(row.id)
      ElMessage.success('退款成功')
      fetchData()
    } catch {
      // 取消或错误已由拦截器处理
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
    handleSizeChange,
    handleCurrentChange,
    handleRefund
  }
}
