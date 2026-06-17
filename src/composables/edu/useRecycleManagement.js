import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 回收站通用逻辑
 *
 * @param {Function} fetchFn 获取列表函数
 * @param {Function} restoreFn 恢复函数
 * @param {Function} deleteFn 彻底删除函数
 * @param {string} entityName 实体名称（用于提示）
 * @returns {object} 回收站页响应式状态和方法
 */
export function useRecycleManagement(fetchFn, restoreFn, deleteFn, entityName) {
  const loading = ref(false)
  const tableData = ref([])

  onMounted(() => {
    fetchData()
  })

  async function fetchData() {
    loading.value = true
    try {
      const res = await fetchFn()
      tableData.value = res.data || []
    } catch {
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  async function handleRestore(id) {
    try {
      await ElMessageBox.confirm(`确定要恢复该${entityName}吗？`, '恢复确认', {
        type: 'info',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await restoreFn(id)
      ElMessage.success('恢复成功')
      fetchData()
    } catch {
      // 取消操作
    }
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm(
        `确定要彻底删除该${entityName}吗？删除后将无法恢复！`,
        '彻底删除确认',
        {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      )
      await deleteFn(id)
      ElMessage.success('已彻底删除')
      fetchData()
    } catch {
      // 取消操作
    }
  }

  return {
    loading,
    tableData,
    fetchData,
    handleRestore,
    handleDelete
  }
}
