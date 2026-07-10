<template>
  <div class="points-product-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="商品名称">
          <el-input v-model="queryParams.name" placeholder="商品名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <div class="table-header">
        <div class="table-title">积分商品列表</div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }"
      >
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" label="商品名称" min-width="160">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
            <el-tag v-if="row.productType === 2 && row.studyCardTitle && row.name !== row.studyCardTitle" size="small" type="info" style="margin-left: 6px">{{ row.studyCardTitle }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.productType === 2 ? 'success' : 'info'" size="small">
              {{ row.productType === 2 ? '学习卡' : '实物商品' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="row.imageUrl"
              :preview-src-list="[row.imageUrl]"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 4px"
              :preview-teleported="true"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="requiredPoints" label="所需积分" width="100" align="center" />
        <el-table-column prop="stockCount" label="库存数量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :loading="row._statusLoading"
             
             
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button link type="primary" size="small" style="color: #f56c6c" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-state">
            <el-icon :size="56" color="#cbd5e1"><ShoppingCart /></el-icon>
            <p>暂无数据</p>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 分页栏 -->
    <div class="pagination-bar">
      <div class="pagination-left">
        <span class="total-text">共 <b>{{ total }}</b> 条数据</span>
      </div>
      <div class="pagination-right">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          :pager-count="5"
          layout="sizes, prev, pager, next, jumper"
          background
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <PointsProductFormDialog
      v-model="dialogVisible"
      :product-id="editProductId"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import { Plus, ShoppingCart } from '@element-plus/icons-vue'
import { usePointsProductManagement } from '@/composables/edu/usePointsProductManagement'
import PointsProductFormDialog from './PointsProductFormDialog.vue'

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  dialogVisible, editProductId,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDelete, handleStatusChange
} = usePointsProductManagement()
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.points-product-management {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
