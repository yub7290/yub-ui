<template>
  <YubDialog
    v-model="visible"
    :title="isEdit ? '编辑Banner' : '新增Banner'"
    width="600px"
    destroy-on-close
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="90px"
    >
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
      <el-form-item label="图片" prop="imageUrl" required>
        <div class="upload-wrapper">
          <el-upload :show-file-list="false" :before-upload="handleImageUpload" accept="image/*" :disabled="uploading">
            <el-button type="primary" :loading="uploading">{{ uploading ? '上传中...' : '选择图片' }}</el-button>
          </el-upload>
          <div class="upload-preview" v-if="formData.imageUrl">
            <el-image :src="formData.imageUrl" style="width:120px;height:68px;border-radius:4px;margin-left:12px" fit="cover" :preview-src-list="[formData.imageUrl]" />
            <el-button link type="danger" size="small" @click="formData.imageUrl = ''" style="margin-left:4px">删除</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="链接URL" prop="linkUrl">
        <el-input v-model="formData.linkUrl" placeholder="请输入链接URL（可选）" maxlength="500" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </YubDialog>
</template>

<script setup>
import YubDialog from '@/components/YubDialog.vue'
import { useBannerFormDialog } from '@/composables/useBannerFormDialog'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  bannerId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isEdit, submitting, uploading, formRef,
  formData, rules, handleOpen, handleSubmit, handleImageUpload
} = useBannerFormDialog(props, emit)
</script>

<style scoped>
.upload-wrapper { display: flex; align-items: flex-start; }
.upload-preview { display: flex; align-items: center; }
</style>
