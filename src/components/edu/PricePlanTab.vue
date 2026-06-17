<template>
  <div class="price-plan-tab">
    <!-- 免费设置开关 -->
    <el-form label-width="140px" class="pricing-form">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="完全免费">
            <el-switch :model-value="isFree" :active-value="1" :inactive-value="0" @update:model-value="emit('update:isFree', $event)" @change="onFreeChange" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="限时免费">
            <el-switch :model-value="isFreeLimited" :active-value="1" :inactive-value="0" @update:model-value="emit('update:isFreeLimited', $event)" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="允许试学">
            <el-switch :model-value="allowTrial" :active-value="1" :inactive-value="0" @update:model-value="emit('update:allowTrial', $event)" />
          </el-form-item>
        </el-col>
      </el-row>
      <template v-if="isFreeLimited === 1">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="免费开始时间">
              <el-date-picker :model-value="freeStartTime" type="datetime" placeholder="选择开始时间" style="width:100%" @update:model-value="emit('update:freeStartTime', $event)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="免费结束时间">
              <el-date-picker :model-value="freeEndTime" type="datetime" placeholder="选择结束时间" style="width:100%"
                @update:model-value="val => { const d = new Date(val); d.setHours(23,59,59,999); emit('update:freeEndTime', d) }" />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </el-form>

    <!-- 价格方案列表 -->
    <div class="plan-section">
      <div class="plan-header">
        <span class="plan-title">价格方案</span>
        <el-button type="primary" size="small" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加价格
        </el-button>
      </div>
      <el-table :data="planList" v-loading="loading" border stripe size="small" style="width:100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column label="价格" min-width="160">
          <template #default="{ row }">
            {{ row.months }}月 / {{ row.price }}元
          </template>
        </el-table-column>
        <el-table-column label="抵用券" width="120" align="center">
          <template #default="{ row }">
            可抵 {{ row.voucherAmount || 0 }} 元
          </template>
        </el-table-column>
        <el-table-column prop="status" label="使用" width="80" align="center">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" size="small" active-color="#38daa6" inactive-color="#cbd5e1"
              @change="(v) => handleToggle(row, v)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">修改</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div style="text-align:center;padding:24px;color:#999">暂无价格方案，点击"添加价格"创建</div>
        </template>
      </el-table>
    </div>

    <!-- 新增/编辑价格方案对话框 -->
    <el-dialog v-model="dialogVisible" :title="editPlan ? '修改价格方案' : '新增价格方案'" width="420px" :close-on-click-modal="false" @open="handleDialogOpen">
      <el-form ref="formRef" :model="planForm" :rules="planRules" label-width="100px">
        <el-form-item label="学习月数" prop="months">
          <el-input-number v-model="planForm.months" :min="1" :max="120" style="width:100%" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="planForm.price" :min="0" :precision="2" :step="100" style="width:100%" />
        </el-form-item>
        <el-form-item label="抵用券">
          <el-input-number v-model="planForm.voucherAmount" :min="0" :precision="2" :step="10" style="width:100%" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="planForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getPricePlanList, createPricePlan, updatePricePlan, deletePricePlan } from '@/api/edu/pricePlan'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  courseId: { type: Number, default: null },
  isFree: { type: Number, default: 0 },
  isFreeLimited: { type: Number, default: 0 },
  freeStartTime: { type: String, default: null },
  freeEndTime: { type: String, default: null },
  allowTrial: { type: Number, default: 0 }
})

const emit = defineEmits([
  'update:isFree', 'update:isFreeLimited',
  'update:freeStartTime', 'update:freeEndTime', 'update:allowTrial'
])

const loading = ref(false)
const planList = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editPlan = ref(null)
const formRef = ref(null)

const planForm = reactive({
  months: 1,
  price: 0,
  voucherAmount: 0,
  status: 1
})

const planRules = {
  months: [{ required: true, message: '请输入学习月数', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

watch(() => props.courseId, (val) => { if (val) fetchPlans() })

function fetchPlans() {
  if (!props.courseId) return
  loading.value = true
  getPricePlanList(props.courseId).then(res => { planList.value = res.data || [] }).catch(() => { planList.value = [] }).finally(() => { loading.value = false })
}

function handleAdd() { editPlan.value = null; dialogVisible.value = true }
function handleEdit(row) { editPlan.value = row; dialogVisible.value = true }

function handleDialogOpen() {
  if (editPlan.value) {
    planForm.months = editPlan.value.months
    planForm.price = editPlan.value.price
    planForm.voucherAmount = editPlan.value.voucherAmount || 0
    planForm.status = editPlan.value.status
  } else {
    planForm.months = 1; planForm.price = 0; planForm.voucherAmount = 0; planForm.status = 1
    if (formRef.value) formRef.value.resetFields()
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }
  submitting.value = true
  try {
    if (editPlan.value) {
      await updatePricePlan({ id: editPlan.value.id, courseId: props.courseId, ...planForm })
      ElMessage.success('修改成功')
    } else {
      await createPricePlan({ courseId: props.courseId, ...planForm })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchPlans()
  } catch { /* handled */ } finally { submitting.value = false }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该价格方案吗？', '删除确认', { type: 'warning' })
    await deletePricePlan(id)
    ElMessage.success('删除成功')
    fetchPlans()
  } catch { /* cancel */ }
}

async function handleToggle(row, checked) {
  try {
    await updatePricePlan({ id: row.id, courseId: props.courseId, months: row.months, price: row.price, voucherAmount: row.voucherAmount, status: checked ? 1 : 0 })
    row.status = checked ? 1 : 0
  } catch { /* handled */ }
}

function onFreeChange(val) { /* 如果完全免费，可自动触发相关逻辑 */ }
</script>

<style scoped>
.price-plan-tab { padding: 8px 0; }
.pricing-form { margin-bottom: 16px; }
.plan-section { border-top: 1px solid #ebeef5; padding-top: 16px; }
.plan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.plan-title { font-weight: 600; color: #1a2332; font-size: 14px; }
</style>
