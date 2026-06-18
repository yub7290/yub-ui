<template>
  <div class="course-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="课程名称">
          <el-input v-model="queryParams.name" placeholder="课程名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="queryParams.majorId" placeholder="全部" clearable style="width: 160px">
            <el-option v-for="item in majorOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
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
        <div class="table-title">课程列表</div>
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
        <el-table-column prop="name" label="课程名称" min-width="160" />
        <el-table-column label="价格" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.isFree === 1" style="color: #38daa6">免费</span>
            <span v-else>{{ row.totalPrice ? '¥' + row.totalPrice : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="信息" min-width="200" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info" class="info-tag">章节 {{ row.chapterCount || 0 }}</el-tag>
            <el-tag size="small" type="info" class="info-tag">试题 {{ row.questionCount || 0 }}</el-tag>
            <el-tag size="small" type="info" class="info-tag">试卷 {{ row.examCount || 0 }}</el-tag>
            <el-tag size="small" type="info" class="info-tag">视频 {{ row.videoCount || 0 }}</el-tag>
            <el-tag size="small" type="info" class="info-tag">学员 {{ row.studentCount || 0 }}</el-tag>
            <el-tag size="small" type="info" class="info-tag">浏览 {{ row.viewCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="majorName" label="专业" width="120" />
        <el-table-column prop="teacher" label="教师" width="100" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :loading="row._statusLoading"
              @change="(val) => handleStatusChange(row, val)"
              size="small"
              active-color="#38daa6"
              inactive-color="#cbd5e1"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleShowOverview(row.id)">综述</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button
              link
              :type="row.recommended === 1 ? 'warning' : 'primary'"
              size="small"
              @click="handleSetRecommended(row)"
            >
              {{ row.recommended === 1 ? '取消推荐' : '推荐' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-state">
            <el-icon :size="56" color="#cbd5e1"><FolderOpened /></el-icon>
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
    <CourseFormDialog
      v-model="dialogVisible"
      :course-id="editCourseId"
      @success="fetchData"
    />

    <!-- 课程综述抽屉 -->
    <el-drawer
      v-model="overviewVisible"
      title="课程综述"
      size="400px"
    >
      <template v-if="overviewData">
        <div class="overview-container">
          <div class="overview-section">
            <h4>基本信息</h4>
            <div class="overview-item">
              <span class="label">课程名称：</span>
              <span class="value">{{ overviewData.name }}</span>
            </div>
            <div class="overview-item" v-if="overviewData.majorName">
              <span class="label">专业：</span>
              <span class="value">{{ overviewData.majorName }}</span>
            </div>
            <div class="overview-item" v-if="overviewData.teacher">
              <span class="label">教师：</span>
              <span class="value">{{ overviewData.teacher }}</span>
            </div>
          </div>
          <div class="overview-section">
            <h4>资费信息</h4>
            <div class="overview-item">
              <span class="label">价格：</span>
              <span class="value">
                <span v-if="overviewData.isFree === 1" style="color: #38daa6">免费</span>
                <span v-else>{{ overviewData.totalPrice ? '¥' + overviewData.totalPrice : '-' }}</span>
              </span>
            </div>
          </div>
          <div class="overview-section">
            <h4>运营数据</h4>
            <div class="overview-item">
              <span class="label">学员数：</span>
              <span class="value">{{ overviewData.studentCount || 0 }}</span>
            </div>
            <div class="overview-item">
              <span class="label">浏览数：</span>
              <span class="value">{{ overviewData.viewCount || 0 }}</span>
            </div>
          </div>
          <div class="overview-section">
            <h4>内容数据</h4>
            <div class="overview-item">
              <span class="label">章节数：</span>
              <span class="value">{{ overviewData.chapterCount || 0 }}</span>
            </div>
            <div class="overview-item">
              <span class="label">试题数：</span>
              <span class="value">{{ overviewData.questionCount || 0 }}</span>
            </div>
            <div class="overview-item">
              <span class="label">试卷数：</span>
              <span class="value">{{ overviewData.examCount || 0 }}</span>
            </div>
            <div class="overview-item">
              <span class="label">视频数：</span>
              <span class="value">{{ overviewData.videoCount || 0 }}</span>
            </div>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import { useCourseManagement } from '@/composables/edu/useCourseManagement'
import CourseFormDialog from './CourseFormDialog.vue'

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  dialogVisible, editCourseId, overviewVisible, overviewData, majorOptions,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDelete,
  handleStatusChange, handleSetRecommended, handleShowOverview
} = useCourseManagement()
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.course-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 140px);
  padding: 0;
}
.info-tag {
  margin: 2px;
}
.overview-container {
  padding: 0 16px;
}
.overview-section {
  margin-bottom: 24px;
}
.overview-section h4 {
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  color: #1a2332;
}
.overview-item {
  display: flex;
  margin-bottom: 8px;
  line-height: 1.8;
}
.overview-item .label {
  color: #64748b;
  width: 80px;
  flex-shrink: 0;
}
.overview-item .value {
  color: #1a2332;
  font-weight: 500;
}
</style>
