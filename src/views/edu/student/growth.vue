<template>
  <div class="growth-page">
    <div class="page-head">
      <div>
        <div class="page-title">{{ home.studentName || '学员' }} · 成长档案</div>
        <div class="page-sub">基于学习记录、练习记录、考试记录实时计算</div>
      </div>
      <el-button @click="router.back()">返回</el-button>
    </div>

    <el-row :gutter="14" class="metric-row">
      <el-col :span="6">
        <div class="metric">
          <span class="label">成长值</span>
          <strong>{{ home.growthValue || 0 }}</strong>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="metric">
          <span class="label">今日学习</span>
          <strong>{{ home.todayStats?.duration || 0 }} 分钟</strong>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="metric">
          <span class="label">连续学习</span>
          <strong>{{ home.todayStats?.streak || 0 }} 天</strong>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="metric">
          <span class="label">本周练习</span>
          <strong>{{ home.weekDone?.questions || 0 }} 题</strong>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="14">
      <el-col :span="14">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel-title">周报告</div>
          </template>
          <el-table :data="weekReports" border height="280">
            <el-table-column prop="weekName" label="周次" width="130" />
            <el-table-column prop="totalScore" label="综合分" width="90" align="center" />
            <el-table-column prop="totalDiff" label="变化" width="90" align="center">
              <template #default="{ row }">
                <span :class="row.totalDiff >= 0 ? 'up' : 'down'">{{ row.totalDiff >= 0 ? '+' : '' }}{{ row.totalDiff }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalDuration" label="学习时长(h)" width="120" align="center" />
            <el-table-column prop="studyDays" label="学习天数" width="100" align="center" />
            <el-table-column label="能力维度" min-width="220">
              <template #default="{ row }">
                <el-tag v-for="item in row.abilityList" :key="item.name" size="small" class="ability-tag">
                  {{ item.name }} {{ item.current }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel-title">知识掌握</div>
          </template>
          <el-select v-model="currentSubject" placeholder="选择课程" clearable style="width: 100%; margin-bottom: 12px" @change="loadGraph">
            <el-option v-for="item in subjects" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
          <div v-if="graphNodes.length" class="knowledge-list">
            <div v-for="node in graphNodes" :key="node.id" class="knowledge-item">
              <span>{{ node.name }}</span>
              <el-progress :percentage="node.mastery || 0" :stroke-width="8" />
            </div>
          </div>
          <el-empty v-else description="暂无知识掌握数据" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="panel">
      <template #header>
        <div class="panel-title">本周计划</div>
      </template>
      <div class="plan-summary">
        <span>周次：{{ weekPlan.weekName || '-' }}</span>
        <span>薄弱点：{{ weekPlan.weakPoints || '-' }}</span>
        <span>学习 {{ weekPlan.weekTotal?.duration || 0 }} 分钟</span>
        <span>练习 {{ weekPlan.weekTotal?.questions || 0 }} 题</span>
      </div>
      <el-table :data="weekPlan.dailyPlanList || []" border>
        <el-table-column prop="weekday" label="日期" width="100">
          <template #default="{ row }">{{ row.weekday }} {{ row.date }}</template>
        </el-table-column>
        <el-table-column label="完成情况" width="220">
          <template #default="{ row }">
            {{ row.durationDone }}/{{ row.durationTarget }} 分钟，
            {{ row.questionDone }}/{{ row.questionTarget }} 题
          </template>
        </el-table-column>
        <el-table-column label="任务">
          <template #default="{ row }">
            <el-tag v-for="task in row.tasks" :key="task.taskId" size="small" class="ability-tag" :type="task.done ? 'success' : 'info'">
              {{ task.title }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getStudentGrowthHome,
  getStudentGrowthSubjectGraph,
  getStudentGrowthSubjects,
  getStudentGrowthWeekPlan,
  getStudentGrowthWeekReports
} from '@/api/edu/student'

const route = useRoute()
const router = useRouter()
const studentId = computed(() => Number(route.params.id || route.query.id || 0))
const home = ref({})
const weekReports = ref([])
const subjects = ref([])
const currentSubject = ref('')
const subjectGraph = ref({ preNodes: [], coreNode: null, nextNodes: [] })
const weekPlan = ref({})

const graphNodes = computed(() => {
  const nodes = []
  if (subjectGraph.value.coreNode?.id) nodes.push(subjectGraph.value.coreNode)
  nodes.push(...(subjectGraph.value.preNodes || []), ...(subjectGraph.value.nextNodes || []))
  return nodes
})

async function loadGraph() {
  if (!studentId.value) return
  const res = await getStudentGrowthSubjectGraph(studentId.value, currentSubject.value)
  subjectGraph.value = res.data || { preNodes: [], coreNode: null, nextNodes: [] }
}

async function loadData() {
  if (!studentId.value) return
  const [homeRes, weekRes, subjectRes, planRes] = await Promise.all([
    getStudentGrowthHome(studentId.value),
    getStudentGrowthWeekReports(studentId.value),
    getStudentGrowthSubjects(studentId.value),
    getStudentGrowthWeekPlan(studentId.value, 0)
  ])
  home.value = homeRes.data || {}
  weekReports.value = weekRes.data || []
  subjects.value = subjectRes.data || []
  currentSubject.value = subjects.value[0]?.key || ''
  weekPlan.value = planRes.data || {}
  await loadGraph()
}

onMounted(loadData)
</script>

<style scoped>
.growth-page { display: flex; flex-direction: column; gap: 14px; }
.page-head { display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 20px; font-weight: 700; color: #1f2937; }
.page-sub { margin-top: 4px; font-size: 13px; color: #64748b; }
.metric { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.metric .label { color: #64748b; font-size: 13px; }
.metric strong { color: #1f2937; font-size: 24px; }
.panel { border-radius: 8px; }
.panel-title { font-weight: 700; color: #1f2937; }
.ability-tag { margin: 2px 4px 2px 0; }
.up { color: #16a34a; }
.down { color: #dc2626; }
.knowledge-list { display: flex; flex-direction: column; gap: 12px; }
.knowledge-item { display: grid; grid-template-columns: 110px 1fr; gap: 10px; align-items: center; font-size: 13px; color: #334155; }
.plan-summary { display: flex; flex-wrap: wrap; gap: 18px; color: #475569; font-size: 13px; margin-bottom: 12px; }
</style>
