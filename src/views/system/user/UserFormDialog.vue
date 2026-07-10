<template>
  <YubDialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="520px"
    destroy-on-close
    @open="handleOpen"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="账号" prop="account">
        <el-input v-model="formData.account" :disabled="isEdit" placeholder="请输入账号" maxlength="50" autocomplete="off" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input v-model="formData.password" type="password" show-password placeholder="请输入密码" maxlength="100" autocomplete="new-password" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="formData.nickName" placeholder="请输入昵称" maxlength="50" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="20" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="100" />
      </el-form-item>
      <el-form-item label="所属部门" prop="deptId">
        <el-tree-select
          v-model="formData.deptId"
          :data="deptOptions"
          :props="{ label: 'deptName', children: 'children', value: 'id' }"
          placeholder="请选择所属部门"
          check-strictly
          clearable
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="角色" prop="roleIds">
        <el-select v-model="formData.roleIds" multiple placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="停用"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </YubDialog>
</template>

<script setup>
import YubDialog from '@/components/YubDialog.vue'
import { useUserFormDialog } from '@/composables/useUserFormDialog'

const props = defineProps({
  modelValue: Boolean,
  userId: { type: Number, default: null }
})
const emit = defineEmits(['update:modelValue', 'success'])

const { visible, isEdit, submitting, formRef, roleOptions, deptOptions, formData, rules, handleOpen, handleSubmit } = useUserFormDialog(props, emit)
</script>
