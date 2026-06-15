<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑部门' : '新增部门'"
    width="550px"
    :before-close="() => visible = false"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="上级部门">
        <el-tree-select
          v-model="formData.parentId"
          :data="deptTreeForSelect"
          :props="{ label: 'deptName', children: 'children', value: 'id' }"
          placeholder="请选择上级部门"
          check-strictly
          style="width: 100%"
          :disabled="isEdit"
        />
        <div class="parent-hint" v-if="!isEdit">
          当前选择：<strong>{{ parentName }}</strong>
        </div>
      </el-form-item>
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="formData.deptName" placeholder="请输入部门名称" maxlength="50" />
      </el-form-item>
      <el-form-item label="部门编码" prop="deptCode">
        <el-input v-model="formData.deptCode" placeholder="可选" maxlength="50" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="停用"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useDeptFormDialog } from '@/composables/useDeptFormDialog'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editDeptId: { type: [Number, String], default: null },
  deptTree: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isEdit, submitting, formRef,
  formData, rules, parentName,
  handleOpen, handleSubmit
} = useDeptFormDialog(props, emit)

/** 上级部门树选择器数据（增加顶级部门选项） */
const deptTreeForSelect = computed(() => {
  const root = { id: 0, deptName: '顶级部门', children: props.deptTree }
  return [root]
})
</script>

<style scoped>
.parent-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
