<template>
  <div class="recycle-page">
    <div class="table-wrapper">
      <div class="table-header">
        <div class="table-title">试卷回收站</div>
      </div>
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="title" label="试卷标题" min-width="200" />
        <el-table-column prop="subtitle" label="副标题" min-width="140" />
        <el-table-column prop="updateTime" label="删除时间" width="180" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleRestore(row.id)">恢复</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">彻底删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="回收站为空" :image-size="60" />
        </template>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { getRecycleExamList, restoreExam, deleteExamRecycle } from '@/api/edu/recycle'
import { useRecycleManagement } from '@/composables/edu/useRecycleManagement'

const { loading, tableData, handleRestore, handleDelete } = useRecycleManagement(
  getRecycleExamList, restoreExam, deleteExamRecycle, '试卷'
)
</script>

<style scoped>
@import '@/assets/css/user-management.css';
</style>
