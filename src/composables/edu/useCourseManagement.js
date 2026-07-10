import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { getCoursePage, deleteCourse, changeCourseStatus, setCourseRecommended } from '@/api/edu/course'
import { getMajorTree, deleteMajor, batchUpdateMajorSort } from '@/api/edu/major'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 课程管理页逻辑（含左侧「课程分类」即专业的 CRUD 与拖拽排序）
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

  // ===== 左侧「课程分类（专业）」侧边栏状态 =====
  const majorTree = ref([])
  const selectedMajorId = ref(null)
  const treeRef = ref(null)
  const filterText = ref('')
  const expandedKeys = ref([])

  // 专业新增/编辑对话框状态
  const majorDialogVisible = ref(false)
  const majorEditId = ref(null)
  const majorDialogKey = ref(0)

  watch(() => queryParams.majorId, (newVal) => {
    selectedMajorId.value = newVal
  })

  onMounted(() => {
    fetchData()
    loadMajorTree()
  })

  /** 加载专业树（供侧边栏使用，展示全部含禁用的分类以便管理） */
  async function loadMajorTree() {
    try {
      const res = await getMajorTree()
      const data = Array.isArray(res.data) ? res.data : []
      aggregateCourseCount(data)
      majorTree.value = data
      // 默认展开全部，方便管理
      expandedKeys.value = collectAllIds(data)
    } catch {
      majorTree.value = []
    }
  }

  /** 收集树中所有节点 ID */
  function collectAllIds(nodes, acc = []) {
    nodes.forEach(node => {
      acc.push(node.id)
      if (node.children && node.children.length) {
        collectAllIds(node.children, acc)
      }
    })
    return acc
  }

  /** 聚合课程数：父级显示自己+所有子孙的课程数之和 */
  function aggregateCourseCount(nodes) {
    nodes.forEach(node => {
      if (node.children && node.children.length) {
        aggregateCourseCount(node.children)
        node.totalCount =
          (node.courseCount || 0) +
          node.children.reduce((sum, child) => sum + (child.totalCount || 0), 0)
      } else {
        node.totalCount = node.courseCount || 0
      }
    })
  }

  /** 获取节点及其所有子节点的ID */
  function getDescendantIds(node) {
    let ids = [node.id]
    if (node.children && node.children.length) {
      for (const child of node.children) {
        ids = ids.concat(getDescendantIds(child))
      }
    }
    return ids
  }

  /** 处理侧边栏专业选择（点击筛选课程） */
  function handleMajorSelect(nodeData) {
    let majorIds = []

    if (nodeData) {
      if (nodeData.children && nodeData.children.length) {
        majorIds = getDescendantIds(nodeData)
      } else {
        majorIds = [nodeData.id]
      }
    }

    selectedMajorId.value = nodeData ? nodeData.id : null
    queryParams.majorId = majorIds.length > 0 ? majorIds.join(',') : null
    pageNum.value = 1
    fetchData()
  }

  /** 侧边栏搜索过滤 */
  function handleTreeFilter() {
    treeRef.value && treeRef.value.filter(filterText.value)
  }

  function treeFilterMethod(value, data) {
    if (!value) return true
    return data.name && data.name.toLowerCase().includes(value.toLowerCase())
  }

  function onNodeExpand(node) {
    if (!expandedKeys.value.includes(node.data.id)) {
      expandedKeys.value = [...expandedKeys.value, node.data.id]
    }
  }

  function onNodeCollapse(node) {
    expandedKeys.value = expandedKeys.value.filter(id => id !== node.data.id)
  }

  // ===== 专业 CRUD =====

  /** 新增分类：parentId=0 表示顶级分类 */
  function handleMajorAdd(parentId) {
    majorEditId.value = null
    nextTick(() => {
      majorEditId.value = parentId && parentId !== 0 ? `add_${parentId}` : 'add_0'
      majorDialogKey.value++
      nextTick(() => {
        majorDialogVisible.value = true
      })
    })
  }

  /** 编辑分类 */
  function handleMajorEdit(id) {
    majorEditId.value = null
    nextTick(() => {
      majorEditId.value = id
      majorDialogKey.value++
      nextTick(() => {
        majorDialogVisible.value = true
      })
    })
  }

  /** 删除分类 */
  async function handleMajorDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该分类吗？若其下存在子分类或课程将阻止删除。', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await deleteMajor(id)
      ElMessage.success('删除成功')
      // 若当前筛选包含该分类，则重置为「全部课程」
      const currentIds = queryParams.majorId ? queryParams.majorId.split(',') : []
      if (selectedMajorId.value === id || currentIds.includes(String(id))) {
        queryParams.majorId = null
        selectedMajorId.value = null
        fetchData()
      }
      await loadMajorTree()
    } catch {
      // 取消操作
    }
  }

  /** 专业对话框保存成功 */
  async function handleMajorDialogSuccess() {
    await loadMajorTree()
  }

  // ===== 拖拽排序 =====

  /** 是否允许放置：禁止拖入自身或其子树，避免循环 */
  function allowDrop(draggingNode, dropNode, type) {
    const dragId = draggingNode.data.id
    let newParentId
    if (type === 'inner') {
      newParentId = dropNode.data.id
    } else {
      const parentData = dropNode.parent && dropNode.parent.data
      newParentId = parentData ? parentData.id : 0
    }
    if (newParentId === dragId) return false
    // 不能移动到自身的子孙下
    if (newParentId !== 0 && isDescendantOf(dragId, newParentId)) return false
    return true
  }

  /** 判断 nodeId 是否位于 ancestorId 的子树内 */
  function isDescendantOf(ancestorId, nodeId) {
    const walk = (list) => {
      for (const n of list) {
        if (n.id === ancestorId) {
          return contains(n, nodeId)
        }
        if (n.children && n.children.length) {
          if (walk(n.children)) return true
        }
      }
      return false
    }
    return walk(majorTree.value)
  }

  function contains(node, id) {
    if (node.id === id) return true
    if (node.children) {
      for (const c of node.children) {
        if (contains(c, id)) return true
      }
    }
    return false
  }

  /** 递归收集排序项（el-tree 拖拽后数据已被就地更新） */
  function collectOrder(nodes, parentId, items) {
    nodes.forEach((node, index) => {
      items.push({ id: node.id, parentId: parentId, sort: index })
      if (node.children && node.children.length) {
        collectOrder(node.children, node.id, items)
      }
    })
  }

  /** 拖拽落点：持久化新的层级与顺序 */
  async function handleNodeDrop() {
    const items = []
    collectOrder(majorTree.value, 0, items)
    try {
      await batchUpdateMajorSort({ items })
      ElMessage.success('排序已保存')
    } catch {
      // 失败则回滚：重新从服务端加载
      await loadMajorTree()
    }
  }

  // ===== 课程 CRUD =====

  async function fetchData() {
    loading.value = true
    try {
      const res = await getCoursePage({
        queryParam: { ...queryParams },
        pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
      })
      const data = res.data
      tableData.value = (data.records || []).map(row => ({
        ...row,
        _statusLoading: false,
        _recommendLoading: false
      }))
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
    selectedMajorId.value = null
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
    row._recommendLoading = true
    try {
      await setCourseRecommended(row.id, newVal)
      row.recommended = newVal
      ElMessage.success(newVal === 1 ? '已设为推荐课程' : '已取消推荐')
    } catch {
      // 错误已处理
    } finally {
      row._recommendLoading = false
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
    // 侧边栏分类相关
    majorTree,
    selectedMajorId,
    treeRef,
    filterText,
    expandedKeys,
    majorDialogVisible,
    majorEditId,
    majorDialogKey,
    handleTreeFilter,
    treeFilterMethod,
    onNodeExpand,
    onNodeCollapse,
    handleMajorAdd,
    handleMajorEdit,
    handleMajorDelete,
    handleMajorDialogSuccess,
    allowDrop,
    handleNodeDrop,
    // 课程相关
    fetchData,
    handleQuery,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleSetRecommended,
    handleShowOverview,
    handleMajorSelect
  }
}
