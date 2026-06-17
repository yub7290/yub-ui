import { ref, reactive, watch } from 'vue'
import { getDictDataPage, deleteDictData } from '@/api/system/dictData'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useDictDataManagement(props, emit) {
  const visible = ref(false)
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)

  const formDialogVisible = ref(false)
  const editId = ref(null)

  const queryParams = reactive({
    label: '',
    status: null
  })

  watch(() => props.modelValue, (val) => { visible.value = val })
  watch(visible, (val) => {
    emit('update:modelValue', val)
  })

  async function fetchData() {
    if (!props.dictType) return
    loading.value = true
    try {
      const res = await getDictDataPage({
        queryParam: { typeId: props.dictType.id, label: queryParams.label, status: queryParams.status },
        pageParam: { pageNum: 1, pageSize: 999 }
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

  function handleAdd() {
    editId.value = null
    formDialogVisible.value = true
  }

  function handleEdit(id) {
    editId.value = id
    formDialogVisible.value = true
  }

  async function handleDelete(id) {
    try {
      await ElMessageBox.confirm('确定要删除该字典数据吗？', '删除确认', { type: 'warning' })
      await deleteDictData(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch { /* cancel */ }
  }

  return {
    visible, loading, tableData, total, queryParams,
    formDialogVisible, editId,
    fetchData, handleAdd, handleEdit, handleDelete
  }
}
