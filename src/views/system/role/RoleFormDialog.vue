<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="600px"
    :before-close="() => visible = false"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="90px"
      v-loading="menuLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入角色名称" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色编码" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入角色编码"
              :disabled="isEdit"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="请输入角色描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      <el-divider />
      <el-form-item label="菜单权限" prop="menuIds">
        <div style="width: 100%; border: 1px solid #dcdfe6; border-radius: 4px; padding: 12px; max-height: 300px; overflow-y: auto;">
          <el-tree
            v-if="menuTreeData.length > 0"
            ref="menuTreeRef"
            :data="menuTreeData"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            show-checkbox
            :default-checked-keys="checkedMenuKeys"
            default-expand-all
          />
          <el-empty v-else :image-size="60" description="暂无菜单数据" />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useRoleFormDialog } from '@/composables/useRoleFormDialog'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  roleId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isEdit, submitting, formRef, menuTreeRef,
  menuTreeData, menuLoading, checkedMenuKeys,
  formData, rules, handleOpen, handleSubmit
} = useRoleFormDialog(props, emit)
</script>
