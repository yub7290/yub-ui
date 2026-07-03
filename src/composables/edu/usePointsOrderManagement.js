import { ref, reactive, onMounted } from 'vue'
import {
  getPointsOrderPage,
  shipPointsOrder
} from '@/api/edu/pointsOrder'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 积分订单管理页逻辑
 *
 * @returns {object} 积分订单管理页响应式状态和方法
 */
export function usePointsOrderManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    orderNo: '',
    exchangeCode: '',
    status: null
  })

  /** 发货对话框 */
  const shipDialogVisible = ref(false)
  const shipOrderId = ref(null)

  /** 详情对话框 */
  const detailDialogVisible = ref(false)
  const detailOrder = ref(null)

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getPointsOrderPage({
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
    queryParams.orderNo = ''
    queryParams.exchangeCode = ''
    queryParams.status = null
    pageNum.value = 1
    fetchData()
  }

  function handleDetail(row) {
    detailOrder.value = row
    detailDialogVisible.value = true
  }

  function handleShip(row) {
    shipOrderId.value = row.id
    shipDialogVisible.value = true
  }

  async function handleShipConfirm(data) {
    try {
      await shipPointsOrder(shipOrderId.value, data)
      ElMessage.success('发货成功')
      shipDialogVisible.value = false
      fetchData()
    } catch {
      // 错误已由 request 拦截器处理
    }
  }

  return {
    loading,
    tableData,
    total,
    pageNum,
    pageSize,
    queryParams,
    shipDialogVisible,
    shipOrderId,
    detailDialogVisible,
    detailOrder,
    fetchData,
    handleQuery,
    handleReset,
    handleDetail,
    handleShip,
    handleShipConfirm
  }
}
