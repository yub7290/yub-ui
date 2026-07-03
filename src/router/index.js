import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'system/user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'system/role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' }
      },
      {
        path: 'system/menu',
        name: 'Menu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: { title: '菜单管理', icon: 'Menu' }
      },
      {
        path: 'system/dept',
        name: 'Dept',
        component: () => import('@/views/system/dept/index.vue'),
        meta: { title: '部门管理', icon: 'Organization' }
      },
      {
        path: 'system/dict',
        name: 'DictType',
        component: () => import('@/views/system/dict/index.vue'),
        meta: { title: '数据字典', icon: 'Notebook' }
      },
      {
        path: 'system/banner',
        name: 'Banner',
        component: () => import('@/views/system/banner/index.vue'),
        meta: { title: 'Banner管理', icon: 'PictureFilled' }
      },
      // 教育模块 - 学习内容目录（重定向到课程）
      {
        path: 'edu/content',
        name: 'EduContent',
        redirect: '/edu/course',
        meta: { title: '学习内容', icon: 'Notebook' }
      },
      // 教育模块 - 专业管理
      {
        path: 'edu/major',
        name: 'EduMajor',
        component: () => import('@/views/edu/major/index.vue'),
        meta: { title: '专业管理', icon: 'Collection' }
      },
      {
        path: 'edu/course',
        name: 'EduCourse',
        component: () => import('@/views/edu/course/index.vue'),
        meta: { title: '课程管理', icon: 'List' }
      },
      {
        path: 'edu/question',
        name: 'EduQuestion',
        component: () => import('@/views/edu/question/index.vue'),
        meta: { title: '试题库', icon: 'Document' }
      },
      {
        path: 'edu/knowledge',
        name: 'EduKnowledge',
        component: () => import('@/views/edu/knowledge/index.vue'),
        meta: { title: '知识点', icon: 'Reading' }
      },
      // 教育模块 - 教师管理
      {
        path: 'edu/teacher',
        name: 'EduTeacher',
        component: () => import('@/views/edu/teacher/index.vue'),
        meta: { title: '教师信息', icon: 'User' }
      },
      {
        path: 'edu/teacher-title',
        name: 'EduTeacherTitle',
        component: () => import('@/views/edu/teacher-title/index.vue'),
        meta: { title: '教师职称', icon: 'Collection' }
      },
      {
        path: 'edu/study-card',
        name: 'EduStudyCard',
        component: () => import('@/views/edu/study-card/index.vue'),
        meta: { title: '学习卡', icon: 'Ticket' }
      },
      {
        path: 'edu/announcement',
        name: 'EduAnnouncement',
        component: () => import('@/views/edu/announcement/index.vue'),
        meta: { title: '课程公告', icon: 'Message' }
      },
      {
        path: 'edu/student',
        name: 'EduStudent',
        component: () => import('@/views/edu/student/index.vue'),
        meta: { title: '学员信息', icon: 'UserFilled' }
      },
      {
        path: 'edu/student/:id/growth',
        name: 'EduStudentGrowth',
        component: () => import('@/views/edu/student/growth.vue'),
        meta: { title: '成长档案', icon: 'TrendCharts' }
      },
      {
        path: 'edu/certificate',
        name: 'EduCertificate',
        // TODO: implement certificate feature - placeholder for now
        component: () => import('@/views/placeholder/index.vue'),
        meta: { title: '学习证明', icon: 'Trophy' }
      },
      {
        path: 'edu/weight',
        name: 'EduWeight',
        // TODO: implement weight feature - placeholder for now
        component: () => import('@/views/placeholder/index.vue'),
        meta: { title: '学习权重', icon: 'ScaleToOriginal' }
      },
      {
        path: 'edu/recycle/major',
        name: 'EduRecycleMajor',
        component: () => import('@/views/edu/recycle/major.vue'),
        meta: { title: '专业回收', icon: 'Delete' }
      },
      {
        path: 'edu/recycle/course',
        name: 'EduRecycleCourse',
        component: () => import('@/views/edu/recycle/course.vue'),
        meta: { title: '课程回收', icon: 'Delete' }
      },
      {
        path: 'edu/recycle/question',
        name: 'EduRecycleQuestion',
        component: () => import('@/views/edu/recycle/question.vue'),
        meta: { title: '试题回收', icon: 'Delete' }
      },
      {
        path: 'edu/recycle/exam',
        name: 'EduRecycleExam',
        component: () => import('@/views/edu/recycle/exam.vue'),
        meta: { title: '试卷回收', icon: 'Delete' }
      },
      // 教育模块 - 积分管理
      {
        path: 'edu/points/setting',
        name: 'EduPointsSetting',
        component: () => import('@/views/edu/points-setting/index.vue'),
        meta: { title: '积分设置', icon: 'Setting' }
      },
      {
        path: 'edu/points-product',
        name: 'EduPointsProduct',
        component: () => import('@/views/edu/points-product/index.vue'),
        meta: { title: '积分商店', icon: 'ShoppingCart' }
      },
      {
        path: 'edu/points-order',
        name: 'EduPointsOrder',
        component: () => import('@/views/edu/points-order/index.vue'),
        meta: { title: '积分订单', icon: 'List' }
      },
      {
        path: 'edu/points-verify',
        name: 'EduPointsVerify',
        component: () => import('@/views/edu/points-order/verify.vue'),
        meta: { title: '兑换核销', icon: 'Check' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const store = useUserStore()
  if (to.path === '/login') {
    if (store.token) {
      next('/')
    } else {
      next()
    }
    return
  }
  if (!store.token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  // 刷新页面后重新获取用户信息（恢复菜单树）
  if (!store.userInfo) {
    try {
      await store.getUserInfo()
    } catch {
      next({ path: '/login' })
      return
    }
  }
  next()
})

export default router
