import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getAccessToken, getRole, setRole } from '@/utils/auth'
import { setTheme } from '@/utils/theme'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/teacher/login',
    name: 'TeacherLogin',
    component: () => import('@/views/login/TeacherLogin.vue'),
    meta: { requiresAuth: false }
  },
  // 教师端路由 — 使用独立布局
  {
    path: '/teacher',
    component: () => import('@/layout/teacher/TeacherLayout.vue'),
    meta: { requiresAuth: true, userType: 'TEACHER' },
    children: [
      {
        path: '',
        redirect: '/teacher/home'
      },
      {
        path: 'home',
        name: 'TeacherHome',
        component: () => import('@/layout/teacher/TeacherHome.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'course',
        name: 'TeacherCourse',
        component: () => import('@/views/teacher/course/index.vue'),
        meta: { title: '我的课程' }
      },
      {
        path: 'student',
        name: 'TeacherStudent',
        component: () => import('@/views/teacher/student/index.vue'),
        meta: { title: '我的学生' }
      },
      {
        path: 'homework',
        name: 'TeacherHomework',
        component: () => import('@/views/teacher/homework/index.vue'),
        meta: { title: '作业批改' }
      },
      {
        path: 'homework/:id',
        name: 'TeacherHomeworkDetail',
        component: () => import('@/views/edu/homework/detail.vue'),
        meta: { title: '批改详情' }
      },
      {
        path: 'announcement',
        name: 'TeacherAnnouncement',
        component: () => import('@/views/teacher/announcement/index.vue'),
        meta: { title: '课程公告' }
      },
      {
        path: 'exam',
        name: 'TeacherExam',
        component: () => import('@/views/teacher/exam/index.vue'),
        meta: { title: '考试管理' }
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: () => import('@/views/teacher/profile/index.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },
  // 管理端路由 — 使用侧边栏布局
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true, userType: 'ADMIN' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '仪表盘', hideTagsView: true }
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
      {
        path: 'edu/content',
        name: 'EduContent',
        redirect: '/edu/course',
        meta: { title: '学习内容', icon: 'Notebook' }
      },
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
      {
        path: 'edu/knowledge/relation',
        name: 'EduKnowledgeRelation',
        component: () => import('@/views/edu/knowledge/relation.vue'),
        meta: { title: '知识关系', icon: 'Link' }
      },
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
        path: 'edu/notice',
        name: 'EduNotice',
        component: () => import('@/views/edu/notice/index.vue'),
        meta: { title: '通知', icon: 'Bell' }
      },
      {
        path: 'edu/news',
        name: 'EduNews',
        component: () => import('@/views/edu/news/index.vue'),
        meta: { title: '新闻咨询', icon: 'Memo' }
      },
      {
        path: 'edu/cache',
        name: 'EduCache',
        component: () => import('@/views/edu/cache/index.vue'),
        meta: { title: '缓存管理', icon: 'Cpu' }
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
        path: 'edu/student-group',
        name: 'EduStudentGroup',
        component: () => import('@/views/edu/studentGroup/index.vue'),
        meta: { title: '学员组', icon: 'UserFilled' }
      },
      {
        path: 'edu/certificate',
        name: 'EduCertificate',
        component: () => import('@/views/placeholder/index.vue'),
        meta: { title: '学习证明', icon: 'Trophy' }
      },
      {
        path: 'edu/weight',
        name: 'EduWeight',
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
      },
      {
        path: 'edu/fund',
        name: 'EduFund',
        component: () => import('@/views/edu/fund/index.vue'),
        meta: { title: '资金管理', icon: 'Wallet' }
      },
      {
        path: 'edu/fund/transaction',
        name: 'EduTransaction',
        component: () => import('@/views/edu/fund/transaction.vue'),
        meta: { title: '交易流水', icon: 'List' }
      },
      {
        path: 'edu/fund/course-order',
        name: 'EduCourseOrder',
        component: () => import('@/views/edu/fund/course-order.vue'),
        meta: { title: '课程订单', icon: 'ShoppingCart' }
      },
      {
        path: 'edu/homework',
        name: 'EduHomework',
        component: () => import('@/views/edu/homework/index.vue'),
        meta: { title: '作业批改', icon: 'Edit' }
      },
      {
        path: 'edu/homework/:id',
        name: 'EduHomeworkDetail',
        component: () => import('@/views/edu/homework/detail.vue'),
        meta: { title: '批改详情', icon: 'Edit', activeMenu: '/edu/homework' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 判断目标路由是否为教师端路由
 */
function isTeacherRoute(path) {
  return path.startsWith('/teacher') && !path.startsWith('/teacher/login')
}

router.beforeEach(async (to, from, next) => {
  const store = useUserStore()
  const publicPages = ['/login', '/teacher/login']

  if (publicPages.includes(to.path)) {
    if (store.token) {
      const activeRole = store.activeRole
      next(activeRole === 'TEACHER' ? '/teacher/home' : '/')
    } else {
      next()
    }
    return
  }

  const needTeacher = isTeacherRoute(to.path)
  const checkRole = needTeacher ? 'TEACHER' : 'ADMIN'
  setTheme(checkRole)
  // 单会话单身份：把当前导航的目标身份写入会话，作为本标签页的身份边界
  setRole(checkRole)
  // 校验：本会话既要存在 token，身份还必须与目标路由匹配
  const hasToken = !!getAccessToken() && getRole() === checkRole

  if (!hasToken) {
    const loginPath = needTeacher ? '/teacher/login' : '/login'
    next({ path: loginPath, query: { redirect: to.fullPath } })
    return
  }

  // 切换角色或刷新页面后：先同步 UI 活跃角色，再按角色加载（已缓存则跳过）
  store.setActiveRoleState(checkRole)
  if (!store.userInfo) {
    try {
      await store.ensureUserInfo(checkRole)
    } catch {
      next({ path: needTeacher ? '/teacher/login' : '/login' })
      return
    }
  }
  next()
})

export default router
