<template>
  <div class="t-page">
    <YubPageHeader title="我的课程" subtitle="查看与管理你开设的课程">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增课程
      </el-button>
    </YubPageHeader>

    <!-- 搜索区 -->
    <div class="t-toolbar">
      <div class="t-toolbar__filters">
        <el-input
          v-model="queryParams.name"
          placeholder="课程名称"
          clearable
          style="width: 200px"
          :prefix-icon="Search"
          @keyup.enter="handleQuery"
          @clear="handleQuery"
        />
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 130px"
          @change="handleQuery"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </div>
      <div class="t-toolbar__actions">
        <el-button @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 主体：分类 + 列表 -->
    <div class="course-split">
      <aside class="course-aside t-card">
        <div class="aside-title">课程分类</div>
        <div
          class="aside-item"
          :class="{ active: !selectedMajorId }"
          @click="handleMajorSelect(null)"
        >
          全部课程
        </div>
        <el-tree
          v-loading="treeLoading"
          :data="majorTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          highlight-current
          :current-node-key="selectedMajorId"
          class="course-tree"
          @node-click="handleMajorSelect"
        >
          <template #default="{ data }">
            <span class="tree-label">{{ data.name }}</span>
          </template>
        </el-tree>
      </aside>

      <section class="course-list t-card">
        <div class="list-head">
          <span class="list-head__title">课程列表</span>
          <span class="t-muted" style="font-size:13px">共 {{ total }} 门</span>
        </div>

        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
        >
          <el-table-column type="index" label="#" width="48" align="center" />
          <el-table-column prop="name" label="课程名称" min-width="160" show-overflow-tooltip />
          <el-table-column label="价格" width="90" align="center">
            <template #default="{ row }">
              <span v-if="row.isFree === 1" style="color: var(--t-accent-strong)">免费</span>
              <span v-else>{{ row.totalPrice ? '¥' + row.totalPrice : '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="内容" min-width="150" align="center">
            <template #default="{ row }">
              <span class="meta-tag">章 {{ row.chapterCount || 0 }}</span>
              <span class="meta-tag">题 {{ row.questionCount || 0 }}</span>
              <span class="meta-tag">卷 {{ row.examCount || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="majorName" label="专业" width="110" show-overflow-tooltip />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch
                :model-value="row.status === 1"
                :loading="row._statusLoading"
                @change="(val) => handleStatusChange(row, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleShowOverview(row.id)">综述</el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div class="t-empty">
              <el-icon :size="40"><Notebook /></el-icon>
              <p class="t-empty__text">暂无课程</p>
            </div>
          </template>
        </el-table>

        <div class="t-pagination" v-if="total > 0">
          <span class="t-pagination__total">共 <b>{{ total }}</b> 条数据</span>
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
      </section>
    </div>

    <!-- 新增/编辑 -->
    <CourseFormDialog
      v-model="dialogVisible"
      :course-id="editCourseId"
      @success="fetchData"
    />

    <!-- 综述抽屉 -->
    <el-drawer v-model="overviewVisible" title="课程综述" size="420px">
      <div v-if="overviewData" class="overview">
        <div class="overview__row">
          <span class="overview__label">课程名称</span>
          <span class="overview__value">{{ overviewData.name }}</span>
        </div>
        <div class="overview__row">
          <span class="overview__label">所属专业</span>
          <span class="overview__value">{{ overviewData.majorName || '-' }}</span>
        </div>
        <div class="overview__row">
          <span class="overview__label">价格</span>
          <span class="overview__value">
            <span v-if="overviewData.isFree === 1" style="color: var(--t-accent-strong)">免费</span>
            <span v-else>{{ overviewData.totalPrice ? '¥' + overviewData.totalPrice : '-' }}</span>
          </span>
        </div>
        <el-divider />
        <div class="overview__metrics">
          <div class="metric">
            <div class="metric__value">{{ overviewData.studentCount || 0 }}</div>
            <div class="metric__label">学员</div>
          </div>
          <div class="metric">
            <div class="metric__value">{{ overviewData.viewCount || 0 }}</div>
            <div class="metric__label">浏览</div>
          </div>
          <div class="metric">
            <div class="metric__value">{{ overviewData.chapterCount || 0 }}</div>
            <div class="metric__label">章节</div>
          </div>
          <div class="metric">
            <div class="metric__value">{{ overviewData.questionCount || 0 }}</div>
            <div class="metric__label">试题</div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { Plus, Search, Notebook } from '@element-plus/icons-vue'
import YubPageHeader from '@/components/YubPageHeader.vue'
import CourseFormDialog from '@/views/edu/course/CourseFormDialog.vue'
import { useCourseManagement } from '@/composables/edu/useCourseManagement'

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  dialogVisible, editCourseId, overviewVisible, overviewData,
  majorTree, selectedMajorId, treeLoading,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit,
  handleDelete, handleStatusChange, handleShowOverview, handleMajorSelect
} = useCourseManagement()
</script>

<style scoped>
.course-split {
  display: flex;
  gap: 22px;
  align-items: flex-start;
}

.course-aside {
  width: 260px;
  flex-shrink: 0;
  padding: 0;
  align-self: stretch;
  max-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.aside-title {
  padding: 16px 18px;
  font-weight: 600;
  color: var(--t-text, #16201c);
  border-bottom: 1px solid var(--t-border, #ECEFEE);
}

.aside-item {
  padding: 11px 18px;
  cursor: pointer;
  color: var(--t-text-2, #3d4843);
  font-size: 14px;
  transition: all 0.18s ease;
}

.aside-item:hover {
  background: var(--t-surface-2, #FBFCFB);
  color: var(--t-accent-strong, #0A7355);
}

.aside-item.active {
  background: var(--t-accent-soft, #EEF8F3);
  color: var(--t-accent-strong, #0A7355);
  font-weight: 600;
  box-shadow: inset 3px 0 0 var(--t-accent, #0c8e68);
}

.course-tree {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}

.course-tree :deep(.el-tree-node__content) {
  height: 38px;
  padding: 0 16px;
  color: var(--t-text-2, #3d4843);
}

.course-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--t-accent-soft, #EEF8F3);
  color: var(--t-accent-strong, #0A7355);
  font-weight: 600;
}

.tree-label {
  font-size: 14px;
}

.course-list {
  flex: 1;
  padding: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.list-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--t-border, #ECEFEE);
}

.list-head__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--t-text, #16201c);
}

.meta-tag {
  display: inline-block;
  font-size: 12px;
  color: var(--t-text-muted, #8a958f);
  background: var(--t-surface-2, #FBFCFB);
  border: 1px solid var(--t-border, #ECEFEE);
  border-radius: 6px;
  padding: 1px 7px;
  margin: 0 2px;
}

/* 综述 */
.overview__row {
  display: flex;
  padding: 10px 0;
  font-size: 14px;
  line-height: 1.6;
}

.overview__label {
  width: 84px;
  flex-shrink: 0;
  color: var(--t-text-muted, #8a958f);
}

.overview__value {
  color: var(--t-text, #16201c);
  font-weight: 500;
}

.overview__metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.metric {
  background: var(--t-surface-2, #FBFCFB);
  border: 1px solid var(--t-border, #ECEFEE);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.metric__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--t-accent-strong, #0A7355);
}

.metric__label {
  font-size: 12px;
  color: var(--t-text-muted, #8a958f);
  margin-top: 4px;
}

@media (max-width: 860px) {
  .course-split {
    flex-direction: column;
  }
  .course-aside {
    width: 100%;
    max-height: 260px;
  }
}
</style>
