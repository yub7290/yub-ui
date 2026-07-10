<template>
  <div class="cache-management">
    <el-card class="stat-card" shadow="never">
      <div class="card-accent"></div>
      <div class="stat-content">
        <div class="stat-item">
          <div class="stat-value">{{ stats.totalKeys }}</div>
          <div class="stat-label">缓存键总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ (stats.namespaces || []).length }}</div>
          <div class="stat-label">监控命名空间</div>
        </div>
        <div class="stat-actions">
          <el-button type="danger" :loading="clearingAll" @click="handleClearAll">
            <el-icon><Delete /></el-icon>清空全部业务缓存
          </el-button>
          <el-button :loading="loading" @click="fetchStats">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <div class="table-wrapper">
      <div class="table-header">
        <div class="table-title">缓存命名空间</div>
      </div>
      <el-table :data="stats.namespaces" v-loading="loading" border stripe style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
        <el-table-column prop="prefix" label="命名空间前缀" min-width="200" />
        <el-table-column label="键数" width="140" align="center">
          <template #default="{ row }">{{ row.keyCount }}</template>
        </el-table-column>
        <el-table-column label="示例键（前 20 条）" min-width="280">
          <template #default="{ row }">
            <span v-if="!row.sampleKeys || row.sampleKeys.length === 0" class="muted">—</span>
            <el-popover v-else trigger="hover" placement="top" :width="360">
              <div class="sample-list">
                <div v-for="(k, i) in row.sampleKeys" :key="i" class="sample-item">{{ k }}</div>
              </div>
              <template #reference>
                <span class="sample-ref">{{ row.sampleKeys.slice(0, 3).join('、') }} …</span>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" size="small" :loading="row.__clearing"
              @click="handleClear(row)">清理</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCacheStats, clearCache, clearAllCache } from '@/api/edu/cache'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Refresh, FolderOpened } from '@element-plus/icons-vue'

const loading = ref(false)
const clearingAll = ref(false)
const stats = reactive({ totalKeys: 0, namespaces: [] })

function fetchStats() {
  loading.value = true
  getCacheStats().then(r => {
    const d = r.data || {}
    stats.totalKeys = d.totalKeys || 0
    stats.namespaces = (d.namespaces || []).map(n => ({ ...n, __clearing: false }))
  }).catch(() => {
    stats.totalKeys = 0
    stats.namespaces = []
  }).finally(() => { loading.value = false })
}

function handleClear(row) {
  ElMessageBox.confirm(`确定要清理命名空间 ${row.prefix} 下的全部缓存吗？`, '清理确认', { type: 'warning' })
    .then(() => {
      row.__clearing = true
      return clearCache(row.prefix)
    })
    .then(() => { ElMessage.success(`已清理 ${row.prefix}`); fetchStats() })
    .catch(() => {})
    .finally(() => { row.__clearing = false })
}

function handleClearAll() {
  ElMessageBox.confirm('确定要清空全部受监控的业务缓存吗？（不会清空整个 Redis）', '全量清理确认', { type: 'warning' })
    .then(() => {
      clearingAll.value = true
      return clearAllCache()
    })
    .then(() => { ElMessage.success('已清空全部业务缓存'); fetchStats() })
    .catch(() => {})
    .finally(() => { clearingAll.value = false })
}

onMounted(() => { fetchStats() })
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.cache-management { display: flex; flex-direction: column; height: 100%; gap: 12px; }
.stat-card { position: relative; }
.stat-content { display: flex; align-items: center; gap: 40px; padding: 6px 10px; }
.stat-item { text-align: center; }
.stat-value { font-size: 26px; font-weight: 700; color: #0195ff; }
.stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
.stat-actions { margin-left: auto; display: flex; gap: 10px; }
.muted { color: #cbd5e1; }
.sample-ref { color: #64748b; cursor: pointer; }
.sample-list { max-height: 240px; overflow: auto; }
.sample-item { font-size: 12px; color: #475569; padding: 2px 0; word-break: break-all; }
</style>
