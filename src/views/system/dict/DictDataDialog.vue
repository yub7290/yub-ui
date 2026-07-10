<template>
  <YubDialog
    v-model="visible"
    :title="dictType ? '字典数据管理 - ' + dictType.name : '字典数据管理'"
    width="700px"
    destroy-on-close
    @open="fetchData"
  >
    <div style="margin-bottom: 12px; color: #999; font-size: 13px;">字典编码：{{ dictType ? dictType.code : '-' }}</div>

    <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
      <el-input v-model="queryParams.label" placeholder="字典标签" clearable style="width: 180px" />
      <el-button type="primary" size="small" @click="fetchData">查询</el-button>
      <el-button size="small" @click="queryParams.label = ''; fetchData()">重置</el-button>
      <div style="flex:1"></div>
      <el-button type="primary" size="small" @click="handleAdd"><el-icon><Plus /></el-icon>新增</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%" max-height="400"
      :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column prop="label" label="字典标签" min-width="140" />
      <el-table-column prop="value" label="字典值" min-width="140" />
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div style="text-align:center;padding:32px;color:#999"><p>暂无数据</p></div>
      </template>
    </el-table>

    <DictDataFormDialog v-model="formDialogVisible" :dict-type="dictType" :data-id="editId" @success="fetchData" />

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </YubDialog>
</template>

<script setup>
import YubDialog from '@/components/YubDialog.vue'
import { Plus } from '@element-plus/icons-vue'
import DictDataFormDialog from './DictDataFormDialog.vue'
import { useDictDataManagement } from '@/composables/useDictDataManagement'

const props = defineProps({
  modelValue: Boolean,
  dictType: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, loading, tableData, total, queryParams,
  formDialogVisible, editId,
  fetchData, handleAdd, handleEdit, handleDelete
} = useDictDataManagement(props, emit)
</script>
