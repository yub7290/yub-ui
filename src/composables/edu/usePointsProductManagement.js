import { ref, reactive, onMounted } from 'vue'
import {
  getPointsProductPage,
  deletePointsProduct,
  changePointsProductStatus
} from '@/api/edu/pointsProduct'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 积分商品管理页逻辑
 *
 * @returns {object} 积分商品管理页响应式状态和方法
 */
export function usePointsProductManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    name: '',
    status: null
  })

  const dialogVisible = ref(false)
  const editProductId = ref(null)

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getPointsProductPage({
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
    queryParams.name = ''
    queryParams.status = null
    pageNum.value = 1
    fetchData()
  }

  function handleAdd() {
    editProductId.value = null
    dialogVisible.value = true
  }

  function handleEdit(id) {
    editProductId.value = id
    dialogVisible.value = true
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该积分商品吗？删除后不可恢复。', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deletePointsProduct(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      // 取消操作
    }
  }

  async function handleStatusChange(row, checked) {
    row._statusLoading = true
    try {
      await changePointsProductStatus(row.id, checked ? 1 : 0)
      row.status = checked ? 1 : 0
      ElMessage.success('状态已更新')
    } catch {
      // 回滚
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
    editProductId,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange
  }
}
