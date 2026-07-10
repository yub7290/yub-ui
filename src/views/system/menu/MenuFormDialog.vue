<template>
  <YubDialog
    v-model="visible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    width="650px"
    destroy-on-close
    @open="handleOpen"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <!-- 父菜单 -->
      <el-form-item label="上级菜单" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="menuTree"
          :props="{ label: 'name', children: 'children', value: 'id' }"
          placeholder="请选择上级菜单"
          check-strictly
          clearable
          style="width: 100%"
          :disabled="isEdit"
        />
        <div v-if="formData.parentId === 0 && !isEdit" class="form-tip">选择"顶级菜单"将创建一级目录</div>
      </el-form-item>

      <!-- 菜单名称 -->
      <el-form-item label="菜单名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入菜单名称" maxlength="50" />
      </el-form-item>

      <!-- 路由路径 + 图标 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="路由路径" prop="path">
            <el-input v-model="formData.path" placeholder="如 /system/menu" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图标" prop="icon">
            <el-select v-model="formData.icon" placeholder="请选择图标" clearable filterable style="width: 100%">
              <el-option
                v-for="icon in iconOptions"
                :key="icon"
                :label="icon"
                :value="icon"
              >
                <span style="display: flex; align-items: center; gap: 8px;">
                  <el-icon><component :is="icon" /></el-icon>
                  <span>{{ icon }}</span>
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 组件路径 + 排序 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="formData.component" placeholder="如 system/menu/index" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 菜单类型 + 状态 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单类型" prop="menuType">
            <el-select v-model="formData.menuType" style="width: 100%">
              <el-option label="目录" :value="0" />
              <el-option label="菜单" :value="1" />
              <el-option label="按钮" :value="2" />
            </el-select>
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

      <!-- 权限标识 -->
      <el-form-item label="权限标识" prop="permission">
        <el-input v-model="formData.permission" placeholder="如 system:menu:add" maxlength="100" />
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
import { useMenuFormDialog } from '@/composables/useMenuFormDialog'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editMenuId: { type: [Number, String], default: null },
  menuTree: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isEdit, submitting, formRef, formData, rules,
  handleOpen, handleSubmit
} = useMenuFormDialog(props, emit)

// Element Plus 图标列表（已验证全部为 @element-plus/icons-vue 有效图标）
const iconOptions = [
  // ===== 导航 / 布局 =====
  'Menu', 'Fold', 'Expand', 'ArrowDown', 'ArrowUp',
  'ArrowLeft', 'ArrowRight', 'ArrowDownBold', 'ArrowUpBold',
  'ArrowLeftBold', 'ArrowRightBold',
  'DArrowLeft', 'DArrowRight', 'Back', 'Right', 'Bottom', 'Top',
  'HomeFilled', 'Grid', 'List', 'Rank', 'Operation',

  // ===== 系统 / 设置 =====
  'Setting', 'Tools', 'Switch', 'SwitchFilled', 'Bell', 'BellFilled',
  'Refresh', 'RefreshRight', 'RefreshLeft', 'FullScreen', 'ScaleToOriginal',
  'SetUp', 'CircleCheck', 'CircleClose', 'CirclePlus',
  'CircleCheckFilled', 'CircleCloseFilled', 'CirclePlusFilled',
  'Warning', 'WarningFilled', 'InfoFilled', 'SuccessFilled', 'QuestionFilled',

  // ===== 用户 / 角色 =====
  'User', 'UserFilled', 'Avatar', 'Female', 'Male',
  'Key', 'Unlock', 'Lock',

  // ===== 部门 / 组织 =====
  'OfficeBuilding', 'School', 'House',
  'Platform', 'Connection', 'Share',

  // ===== 文档 / 文件 =====
  'Document', 'DocumentAdd', 'DocumentRemove', 'DocumentChecked', 'DocumentCopy',
  'DocumentDelete',
  'Folder', 'FolderAdd', 'FolderRemove', 'FolderChecked', 'FolderDelete',
  'Files', 'CopyDocument', 'Reading', 'Notebook',
  'Tickets', 'Memo', 'Collection', 'CollectionTag',

  // ===== 数据 / 统计 =====
  'DataAnalysis', 'DataBoard', 'DataLine', 'PieChart', 'Histogram',
  'TrendCharts', 'Odometer', 'Monitor', 'Cpu',
  'Sell', 'ShoppingCart', 'ShoppingCartFull',
  'Wallet', 'Coin', 'Money', 'Goods', 'Box',

  // ===== 通信 / 消息 =====
  'Message', 'ChatDotSquare', 'ChatLineSquare',
  'ChatDotRound', 'ChatLineRound', 'ChatSquare', 'ChatRound',
  'Postcard', 'Notification', 'AlarmClock',
  'Cellphone', 'Phone', 'Iphone',

  // ===== 编辑 / 操作 =====
  'Edit', 'EditPen',
  'Plus', 'Minus', 'Close', 'Check',
  'Select', 'Remove', 'Delete', 'DeleteFilled',
  'Upload', 'UploadFilled', 'Download',
  'View', 'Hide', 'Search', 'ZoomIn', 'ZoomOut',
  'Sort', 'SortDown', 'SortUp', 'Filter',

  // ===== 文件类型 =====
  'Picture', 'PictureFilled', 'PictureRounded',
  'VideoCamera', 'VideoCameraFilled',
  'Microphone', 'Headset', 'Film', 'Mute',
  'Printer', 'ForkSpoon', 'KnifeFork', 'Food', 'Coffee',

  // ===== 时间 / 日历 =====
  'Clock', 'Timer', 'AlarmClock', 'Watch',
  'Calendar',

  // ===== 方向 / 位置 =====
  'Location', 'LocationFilled', 'LocationInformation',
  'Compass', 'TurnOff', 'Place',
  'MapLocation', 'Position',

  // ===== 状态 / 标志 =====
  'Star', 'StarFilled', 'Flag', 'SemiSelect',
  'Help', 'HelpFilled', 'Info', 'Loading', 'MuteNotification',

  // ===== 其他 =====
  'Link', 'Paperclip', 'Magnet',
  'Sunny', 'Sunrise', 'Sunset', 'Moon', 'Cloudy',
  'ColdDrink', 'HotWater', 'IceCream', 'IceDrink',
  'Umbrella', 'Brush', 'MagicStick',
  'Basketball', 'Football', 'Baseball', 'Trophy',
  'GoldMedal', 'Medal',
  'Aim', 'Grape', 'Cherry', 'Apple', 'Pear',
  'Orange', 'Watermelon', 'Lollipop', 'IceCreamSquare'
]
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
