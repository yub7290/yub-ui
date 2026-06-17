<template>
  <el-dialog
    :title="isEdit ? '编辑学员' : '新增学员'"
    v-model="visible"
    width="820px"
    :close-on-click-modal="false"
    @open="handleOpen"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- ===== 基本信息 ===== -->
        <el-tab-pane label="基本信息" name="basic">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="头像">
                <div class="avatar-uploader" @click="avatarInput.click()">
                  <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon" :size="28"><Plus /></el-icon>
                </div>
                <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="handleAvatarUpload" />
                <span class="avatar-hint">支持 JPG/PNG，建议 200×200px</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="账号" prop="account">
                <el-input v-model="formData.account" :disabled="isEdit" placeholder="请输入账号" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item v-if="!isEdit" label="密码提示">
                <el-input value="默认密码：admin123" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="formData.name" placeholder="请输入姓名" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="拼音缩写">
                <el-input v-model="formData.pinyinAbbr" placeholder="自动生成，可编辑" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学员编号">
                <el-input v-model="formData.studentNo" placeholder="请输入学员编号" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="学员组">
                <el-input v-model="formData.groupId" placeholder="请输入学员组ID" type="number" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-select v-model="formData.gender" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in genderOptions" :key="item.id" :label="item.label" :value="Number(item.value)" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号" prop="idCard">
                <el-input v-model="formData.idCard" placeholder="请输入身份证号" maxlength="18" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="状态">
                <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- ===== 联系方式 ===== -->
        <el-tab-pane label="联系方式" name="contact">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="移动电话">
                <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="20" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电话公开">
                <el-switch v-model="formData.phonePublic" :active-value="1" :inactive-value="0" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="固定电话">
                <el-input v-model="formData.fixedPhone" placeholder="请输入固定电话" maxlength="20" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="固话公开">
                <el-switch v-model="formData.fixedPhonePublic" :active-value="1" :inactive-value="0" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="QQ">
                <el-input v-model="formData.qq" placeholder="请输入QQ" maxlength="20" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="微信">
                <el-input v-model="formData.wechat" placeholder="请输入微信" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮编">
                <el-input v-model="formData.zipCode" placeholder="请输入邮编" maxlength="10" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="住址">
                <el-input v-model="formData.address" placeholder="请输入住址" maxlength="200" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="通讯地址">
                <el-input v-model="formData.mailingAddress" placeholder="请输入通讯地址" maxlength="200" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="紧急联系人">
                <el-input v-model="formData.emergencyContact" placeholder="请输入紧急联系人" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="紧急电话">
                <el-input v-model="formData.emergencyPhone" placeholder="请输入紧急电话" maxlength="20" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- ===== 更多信息 ===== -->
        <el-tab-pane label="更多信息" name="more">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="出生年月">
                <el-date-picker v-model="formData.birthDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="年龄">
                <el-input :model-value="computedAge !== null ? computedAge : ''" disabled placeholder="自动计算" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学历">
                <el-select v-model="formData.education" placeholder="请选择" clearable style="width: 100%">
                  <el-option v-for="item in educationOptions" :key="item.id" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="专业">
                <el-input v-model="formData.major" placeholder="请输入专业" maxlength="100" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="籍贯">
                <el-select v-model="formData.nativePlace" placeholder="请选择" clearable filterable style="width: 100%">
                  <el-option v-for="item in nativePlaceOptions" :key="item.id" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="学校">
                <el-input v-model="formData.school" placeholder="请输入学校" maxlength="200" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="民族">
                <el-select v-model="formData.nationality" placeholder="请选择" clearable filterable style="width: 100%">
                  <el-option v-for="item in nationalityOptions" :key="item.id" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="签名">
            <el-input v-model="formData.signature" placeholder="请输入签名" maxlength="500" type="textarea" :rows="2" />
          </el-form-item>
        </el-tab-pane>

        <!-- ===== 个人介绍 ===== -->
        <el-tab-pane label="个人介绍" name="bio">
          <RichEditor v-model="formData.bio" />
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import RichEditor from '@/components/RichEditor.vue'
import { useStudentFormDialog } from '@/composables/edu/useStudentFormDialog'

const props = defineProps({
  modelValue: Boolean,
  studentId: { type: Number, default: null }
})
const emit = defineEmits(['update:modelValue', 'success'])

const avatarInput = ref(null)

const {
  visible, isEdit, submitting, formRef, activeTab, avatarUrl, computedAge,
  genderOptions, educationOptions, nationalityOptions, nativePlaceOptions,
  formData, rules, handleOpen, handleSubmit, handleAvatarUpload
} = useStudentFormDialog(props, emit)
</script>

<style scoped>
.avatar-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.2s;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.avatar-uploader .avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-uploader-icon {
  color: #8c939d;
}
.avatar-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #999;
}
</style>
