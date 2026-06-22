import { ref, reactive, onMounted } from 'vue'
import { getBannerPage, deleteBanner } from '@/api/system/banner'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * Banner管理页逻辑
 *
 * @returns {object} Banner管理页响应式状态和方法
 */
export function useBannerManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    status: null
  })

  const dialogVisible = ref(false)
  const editId = ref(null)

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await getBannerPage({
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
    queryParams.status = null
    pageNum.value = 1
    fetchData()
  }

  function handleAdd() {
    editId.value = null
    dialogVisible.value = true
  }

  function handleEdit(id) {
    editId.value = id
    dialogVisible.value = true
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该Banner吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteBanner(id)
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
    dialogVisible,
    editId,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete
  }
}
