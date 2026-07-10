/**
 * 主题切换工具
 *
 * 管理端: 使用 Element Plus 原生蓝色主题，不覆盖 --el-color-primary
 * 教师端: 独立设计语言 —— 高级深绿主色 + 中性洁净底 + 留白，去渐变
 *
 * 设计语言统一通过 CSS 变量下发，供教师端所有页面与组件复用。
 */

/** 两套主题变量集 */
const THEMES = {
  ADMIN: {
    vars: {
      /* 不覆盖 --el-color-primary，保留 Element Plus 原生蓝 #409EFF */
      '--theme-primary-light': '#ecf5ff',
      '--theme-sidebar-bg': 'linear-gradient(180deg, #1a2332 0%, #0f1724 100%)',
      '--theme-sidebar-active': 'rgba(64,158,255,0.15)',
      '--theme-sidebar-text': 'rgba(255,255,255,0.68)',
      '--theme-sidebar-active-text': '#409EFF',
      '--theme-sidebar-hover': 'rgba(64,158,255,0.08)',
      '--theme-navbar-border': 'rgba(0,0,0,0.06)',
      '--theme-page-bg': '#f0f2f5',
      '--theme-card-shadow': '0 1px 3px rgba(0,0,0,0.06)',
      '--theme-card-radius': '8px'
    },
    name: '管理端'
  },
  TEACHER: {
    vars: {
      /* 深绿主色 (高级感，收敛不刺眼) */
      '--el-color-primary': '#0C8E68',
      '--el-color-primary-light-3': '#3FA886',
      '--el-color-primary-light-5': '#7CC0A6',
      '--el-color-primary-light-7': '#B8DECb',
      '--el-color-primary-light-8': '#D8EFE4',
      '--el-color-primary-light-9': '#EEF8F3',
      '--el-color-primary-dark-2': '#0A7355',

      /* 教师端设计语言令牌 */
      '--t-accent': '#0C8E68',
      '--t-accent-soft': '#EEF8F3',
      '--t-accent-strong': '#0A7355',
      '--t-page-bg': '#F6F8F7',
      '--t-surface': '#FFFFFF',
      '--t-surface-2': '#FBFCFB',
      '--t-border': '#ECEFEE',
      '--t-border-strong': '#E0E4E2',
      '--t-text': '#16201C',
      '--t-text-2': '#3D4843',
      '--t-text-muted': '#8A958F',
      '--t-text-faint': '#AEB8B2',
      '--t-radius-sm': '10px',
      '--t-radius': '14px',
      '--t-radius-lg': '20px',
      '--t-shadow-sm': '0 1px 2px rgba(16,24,20,0.05)',
      '--t-shadow': '0 1px 3px rgba(16,24,20,0.04), 0 8px 24px rgba(16,24,20,0.05)',
      '--t-shadow-pop': '0 6px 24px rgba(16,24,20,0.10)',

      /* 兼容旧引用 */
      '--theme-primary-light': '#EEF8F3',
      '--theme-navbar-border': 'rgba(16,24,20,0.07)',
      '--theme-page-bg': '#F6F8F7',
      '--theme-card-shadow': '0 1px 3px rgba(16,24,20,0.04), 0 8px 24px rgba(16,24,20,0.05)',
      '--theme-card-radius': '14px'
    },
    name: '教师端'
  }
}

/**
 * 收集所有可能需要清除的 CSS 变量 key
 */
const ALL_VAR_KEYS = new Set()
Object.values(THEMES).forEach(theme => {
  Object.keys(theme.vars).forEach(key => ALL_VAR_KEYS.add(key))
})
// 也包含可能被 TEACHER 设置过的 Element Plus 变量
const EP_KEYS = [
  '--el-color-primary', '--el-color-primary-light-3',
  '--el-color-primary-light-5', '--el-color-primary-light-7',
  '--el-color-primary-light-8', '--el-color-primary-light-9',
  '--el-color-primary-dark-2'
]
EP_KEYS.forEach(k => ALL_VAR_KEYS.add(k))

/**
 * 设置主题
 *
 * @param {'ADMIN'|'TEACHER'} userType 用户类型
 */
export function setTheme(userType) {
  const theme = THEMES[userType]
  if (!theme) return
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * 获取当前主题类型
 * @returns {'ADMIN'|'TEACHER'}
 */
export function getCurrentTheme() {
  return sessionStorage.getItem('role') || 'ADMIN'
}

/**
 * 清除主题设置 — 恢复 Element Plus 原生默认
 */
export function clearTheme() {
  const root = document.documentElement
  ALL_VAR_KEYS.forEach(key => {
    root.style.removeProperty(key)
  })
}
