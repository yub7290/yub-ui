<template>
  <div class="ai-config-tab">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px" label-position="left">
      <el-form-item label="启用AI助教" prop="enabled">
        <el-switch v-model="formData.enabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        <div class="form-tip">启用后，学生可在课程详情页使用AI助教进行对话</div>
      </el-form-item>

      <el-form-item label="模型名称" prop="model">
        <el-select v-model="formData.model" placeholder="请选择模型" style="width:300px">
          <el-option label="DeepSeek V4 Flash" value="deepseek-v4-flash" />
          <el-option label="Mimo V2.5" value="mimo-v2.5" />
        </el-select>
        <div class="form-tip">选择AI对话使用的模型</div>
      </el-form-item>

      <el-form-item label="每日对话限制" prop="dailyLimit">
        <el-input-number v-model="formData.dailyLimit" :min="1" :max="1000" style="width:200px" />
        <div class="form-tip">每个学生每天最多可对话次数（默认100次）</div>
      </el-form-item>

      <el-form-item label="温度参数" prop="temperature">
        <el-slider v-model="formData.temperature" :min="0" :max="2" :step="0.01" show-input style="width:300px" />
        <div class="form-tip">控制回复的随机性，值越高回复越多样（默认0.70）</div>
      </el-form-item>

      <el-form-item label="最大Token数" prop="maxTokens">
        <el-input-number v-model="formData.maxTokens" :min="100" :max="32000" :step="100" style="width:200px" />
        <div class="form-tip">单次回复最大Token数（默认2000）</div>
      </el-form-item>

      <el-form-item label="系统提示词" prop="systemPrompt">
        <el-input
          v-model="formData.systemPrompt"
          type="textarea"
          :rows="6"
          placeholder="请输入AI助教的角色设定提示词"
          maxlength="2000"
          show-word-limit
        />
        <div class="form-tip">设定AI助教的角色和行为，学生提问时AI会参考此提示词回复</div>
      </el-form-item>
    </el-form>

    <div class="tab-footer">
      <el-button type="primary" :loading="submitting" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { getAiConfig, saveAiConfig } from '@/api/edu/aiConfig'
import { ElMessage } from 'element-plus'

const props = defineProps({ courseId: { type: Number, default: null } })
const emit = defineEmits(['change'])

const submitting = ref(false)
const formRef = ref(null)

const formData = reactive({
  enabled: 0,
  model: 'deepseek-v4-flash',
  dailyLimit: 100,
  temperature: 0.70,
  maxTokens: 2000,
  systemPrompt: '你是一个专业的课程AI助教，专门帮助学生解答关于课程的问题。请用简洁、专业的语言回答学生的问题。'
})

const formRules = {
  enabled: [{ required: true, message: '请选择启用状态', trigger: 'change' }],
  dailyLimit: [{ required: true, message: '请设置每日对话限制', trigger: 'blur' }]
}

async function fetchConfig() {
  if (!props.courseId) return
  try {
    const r = await getAiConfig(props.courseId)
    const d = r.data
    if (d) {
      formData.enabled = d.enabled ?? 0
      formData.model = d.model || 'deepseek-v4-flash'
      formData.dailyLimit = d.dailyLimit ?? 100
      formData.temperature = d.temperature ?? 0.70
      formData.maxTokens = d.maxTokens ?? 2000
      formData.systemPrompt = d.systemPrompt || '你是一个专业的课程AI助教，专门帮助学生解答关于课程的问题。请用简洁、专业的语言回答学生的问题。'
    }
  } catch {
    // 使用默认值
  }
}

watch(() => props.courseId, (val) => { if (val) fetchConfig() }, { immediate: true })

async function handleSave() {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }
  submitting.value = true
  try {
    await saveAiConfig({ ...formData, courseId: props.courseId })
    ElMessage.success('AI助教配置保存成功')
    emit('change')
  } catch {
    // 错误由全局处理
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ai-config-tab { min-height: 300px; padding: 20px 0; max-width: 700px; }
.form-tip { font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.4; }
.tab-footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
</style>
