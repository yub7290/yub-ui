<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑专业' : '新增专业'"
    width="750px"
    :before-close="() => visible = false"
    @open="handleOpen"
    destroy-on-close
  >
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="上级专业">
                <el-input :model-value="parentName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="专业名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入专业名称" maxlength="100" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="别名" prop="alias">
                <el-input v-model="formData.alias" placeholder="请输入别名" maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序" prop="sort">
                <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="展示图片">
            <div class="upload-wrapper">
              <el-upload
                :show-file-list="false"
                :before-upload="handleImageUpload"
                accept="image/*"
                :disabled="uploading"
              >
                <el-button type="primary" :loading="uploading">
                  {{ uploading ? '上传中...' : '选择图片' }}
                </el-button>
              </el-upload>
              <div class="upload-preview" v-if="formData.imageUrl">
                <el-image
                  :src="formData.imageUrl"
                  style="width: 120px; height: 80px; border-radius: 4px; margin-left: 12px;"
                  fit="cover"
                  :preview-src-list="[formData.imageUrl]"
                />
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="formData.imageUrl = ''"
                  style="margin-left: 4px;"
                >删除</el-button>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="说明" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="2"
              placeholder="请输入说明"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 详情（富文本） -->
      <el-tab-pane label="详情" name="detail">
        <RichEditor v-model="formData.detail" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useMajorFormDialog } from '@/composables/edu/useMajorFormDialog'
import RichEditor from '@/components/RichEditor.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editMajorId: { type: [Number, String], default: null },
  majorTree: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isEdit, submitting, uploading, formRef,
  formData, rules, parentName, activeTab,
  handleOpen, handleSubmit, handleImageUpload
} = useMajorFormDialog(props, emit)
</script>

<style scoped>
.upload-wrapper {
  display: flex;
  align-items: flex-start;
}
.upload-preview {
  display: flex;
  align-items: center;
}
</style>
