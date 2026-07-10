<template>
  <YubDialog
    v-model="visible"
    :title="isEdit ? '编辑积分商品' : '新增积分商品'"
    width="600px"
    destroy-on-close
    @open="handleOpen"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="商品类型">
        <el-radio-group v-model="formData.productType">
          <el-radio :value="1">实物商品</el-radio>
          <el-radio :value="2">学习卡</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.productType === 2" label="选择学习卡" prop="studyCardId">
        <el-select
          v-model="formData.studyCardId"
          placeholder="请选择学习卡"
          style="width: 100%"
          filterable
          @change="handleStudyCardChange"
        >
          <el-option
            v-for="card in studyCardOptions"
            :key="card.id"
            :label="card.title"
            :value="card.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="商品名称" prop="name">
        <el-input v-model="formData.name" :placeholder="formData.productType === 2 ? '自动填充' : '请输入商品名称'" maxlength="100" :disabled="formData.productType === 2" />
      </el-form-item>

      <el-form-item v-if="formData.productType === 1" label="商品图片">
        <div class="upload-wrapper">
          <el-upload :show-file-list="false" :before-upload="handleImageUpload" accept="image/*" :disabled="uploading">
            <el-button type="primary" :loading="uploading" size="small">{{ uploading ? '上传中...' : '选择图片' }}</el-button>
          </el-upload>
          <div class="upload-preview" v-if="formData.imageUrl">
            <el-image :src="formData.imageUrl" style="width:80px;height:80px;border-radius:4px;margin-left:12px" fit="cover" :preview-src-list="[formData.imageUrl]" />
            <el-button link type="danger" size="small" @click="formData.imageUrl = ''" style="margin-left:4px">删除</el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="所需积分" prop="requiredPoints">
        <el-input-number v-model="formData.requiredPoints" :min="0" style="width: 100%" />
      </el-form-item>

      <el-form-item v-if="formData.productType === 1" label="库存数量">
        <el-input-number v-model="formData.stockCount" :min="0" style="width: 100%" />
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
import { usePointsProductFormDialog } from '@/composables/edu/usePointsProductFormDialog'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  productId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isEdit, submitting, uploading, formRef,
  formData, rules, studyCardOptions,
  handleOpen, handleSubmit, handleImageUpload, handleStudyCardChange
} = usePointsProductFormDialog(props, emit)
</script>

<style scoped>
.upload-wrapper { display: flex; align-items: flex-start; }
.upload-preview { display: flex; align-items: center; }
</style>
