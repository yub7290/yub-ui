<template>
  <el-dialog
    class="yub-dialog"
    :model-value="modelValue"
    :title="title"
    :width="width"
    :destroy-on-close="destroyOnClose"
    :close-on-click-modal="closeOnClickModal"
    :before-close="beforeClose"
    append-to-body
    align-center
    @update:model-value="$emit('update:modelValue', $event)"
    @open="$emit('open')"
  >
    <div class="yub-dialog__body">
      <slot />
    </div>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: [String, Number], default: '600px' },
  destroyOnClose: { type: Boolean, default: true },
  closeOnClickModal: { type: Boolean, default: false },
  beforeClose: { type: Function, default: undefined }
})

defineEmits(['update:modelValue', 'open'])

// 弹框打开时锁定 body 滚动，关闭时恢复
watch(() => props.modelValue, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.yub-dialog__body {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}
</style>

<!-- 非 scoped：append-to-body 后 .el-dialog 已脱离组件作用域，必须用全局类定位 -->
<style>
.yub-dialog {
  height: 82vh;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 94vw;
}

.yub-dialog > .el-dialog__header {
  flex-shrink: 0;
  margin-right: 0;
}

.yub-dialog > .el-dialog__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.yub-dialog > .el-dialog__footer {
  flex-shrink: 0;
}
</style>
