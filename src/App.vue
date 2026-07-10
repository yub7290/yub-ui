<template>
  <router-view />
</template>

<style>
html, body {
  height: 100%;
  overflow: hidden;
  margin: 0 !important;
}
body.el-popup-parent--hidden {
  overflow: hidden !important;
}
.el-main {
  overflow: auto;
}
body.el-popup-parent--hidden .el-main {
  overflow: hidden !important;
}
.el-dialog__body {
  max-height: 70vh;
  overflow: hidden;
}
.el-overlay {
  position: fixed;
  inset: 0;
  overflow: hidden;
}
/* 管理端使用 Element Plus 原生蓝色主题，不做覆盖 */
/* 教师端通过 theme.js 动态设置绿色主题变量 */
</style>
