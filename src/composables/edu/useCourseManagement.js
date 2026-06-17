import { ref, reactive, onMounted } from 'vue'
import { getCoursePage, deleteCourse, changeCourseStatus, setCourseRecommended } from '@/api/edu/course'
import { getMajorTree } from '@/api/edu/major'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 课程管理页逻辑
 *
 * @returns {object} 课程管理页响应式状态和方法
 */
export function useCourseManagement() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  const queryParams = reactive({
    name: '',
    majorId: null,
    status: null
  })

  const dialogVisible = ref(false)
  const editCourseId = ref(null)
  const overviewVisible = ref(false)
  const overviewData = ref(null)
  const majorOptions = ref([])

  onMounted(() => {
    fetchData()
    loadMajorOptions()
  })

  /** 加载专业列表（供筛选下拉使用） */
  async function loadMajorOptions() {
    try {
      const res = await getMajorTree({ status: 1 })
      majorOptions.value = Array.isArray(res.data) ? flattenTree(res.data) : []
    } catch {
      majorOptions.value = []
    }
  }

  /** 将专业树展开为平面列表 */
  function flattenTree(nodes) {
    const result = []
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name })
      if (node.children && node.children.length) {
        result.push(...flattenTree(node.children))
      }
    }
    return result
  }

  async function fetchData() {
    loading.value = true
    try {
      const res = await getCoursePage({
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
    queryParams.majorId = null
    queryParams.status = null
    pageNum.value = 1
    fetchData()
  }

  function handleAdd() {
    editCourseId.value = null
    dialogVisible.value = true
  }

  function handleEdit(id) {
    editCourseId.value = id
    dialogVisible.value = true
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该课程吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteCourse(id)
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
      await changeCourseStatus(row.id, status)
      row.status = status
      ElMessage.success(checked ? '课程已启用' : '课程已停用')
    } catch {
      // 错误已处理
    } finally {
      row._statusLoading = false
    }
  }

  async function handleSetRecommended(row) {
    const newVal = row.recommended === 1 ? 0 : 1
    try {
      await setCourseRecommended(row.id, newVal)
      row.recommended = newVal
      ElMessage.success(newVal === 1 ? '已设为推荐课程' : '已取消推荐')
    } catch {
      // 错误已处理
    }
  }

  async function handleShowOverview(id) {
    try {
      const { getCourseOverview } = await import('@/api/edu/course')
      const res = await getCourseOverview(id)
      overviewData.value = res.data
      overviewVisible.value = true
    } catch {
      // 错误已处理
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
    editCourseId,
    overviewVisible,
    overviewData,
    majorOptions,
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleSetRecommended,
    handleShowOverview
  }
}
