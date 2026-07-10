<template>
  <YubDialog title="订单发货" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" width="480px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="快递公司" prop="expressCompany">
        <el-select v-model="form.expressCompany" placeholder="请选择快递公司" style="width: 100%">
          <el-option v-for="item in expressOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="快递单号" prop="expressNo">
        <el-input v-model="form.expressNo" placeholder="请输入快递单号" maxlength="30" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleConfirm">确认发货</el-button>
    </template>
  </YubDialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import YubDialog from '@/components/YubDialog.vue'
import { getDictOptions } from '@/api/system/dictData'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const formRef = ref(null)
const submitting = ref(false)
const expressOptions = ref([])

const form = reactive({
  expressCompany: '',
  expressNo: ''
})

const rules = {
  expressCompany: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
  expressNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }]
}

watch(() => props.modelValue, (visible) => {
  if (visible) {
    form.expressCompany = ''
    form.expressNo = ''
    loadExpressOptions()
  }
})

async function loadExpressOptions() {
  try {
    const res = await getDictOptions('express_company')
    expressOptions.value = (res.data || []).map(item => ({
      label: item.label,
      value: item.value
    }))
  } catch {
    expressOptions.value = []
  }
}

async function handleConfirm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    emit('confirm', {
      expressCompany: form.expressCompany,
      expressNo: form.expressNo
    })
  } finally {
    submitting.value = false
  }
}
</script>
