<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-content">
          <div class="brand-logo-wrap">
            <img src="../../static/logo1.png" alt="智慧教育" class="brand-logo" />
            <span class="brand-name">智慧教育系统</span>
          </div>
          <div class="brand-slogan">
            <p class="slogan-text">智慧育人，启迪未来</p>
          </div>
        </div>
      </div>

      <div class="login-form-wrapper">
        <h2 class="form-title">账户登录</h2>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          size="large"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="account">
            <el-input
              v-model="loginForm.account"
              placeholder="请输入账号"
              :prefix-icon="User"
              autofocus
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item prop="captchaCode">
            <div class="captcha-wrapper">
              <el-input
                v-model="loginForm.captchaCode"
                placeholder="验证码"
                :prefix-icon="Key"
                class="captcha-input"
                clearable
              />
              <img
                :src="captchaImage"
                class="captcha-img"
                @click="refreshCaptcha"
                alt="验证码"
                title="点击刷新验证码"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="login-btn"
              size="large"
              @click="handleLogin"
            >
              <span v-if="!loading">登 录</span>
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <span>© {{ currentYear }} 智慧教育系统</span>
          <span class="footer-divider">|</span>
          <span>技术支持团队</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, Lock, Key } from '@element-plus/icons-vue'
import { useLogin } from '@/composables/useLogin'

const { formRef, loading, captchaImage, rememberMe, loginForm, rules, currentYear, handleLogin, refreshCaptcha } = useLogin()
</script>

<style scoped>
@import '@/assets/css/login.css';
</style>
