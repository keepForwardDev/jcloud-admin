import Vue from 'vue'
import VueRouter from 'vue-router'

// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import request from '@/libs/request.js'
import store from '@/store/index'
import util from '@/libs/util.js'
// 路由数据
import routes from './routes'
import layoutHeaderAside from '@/layout/header-aside'
import { getMenus } from '@/menu/index'
// 动态路由
let asyncRouter
const _import = require('@/libs/util.import.' + process.env.NODE_ENV)
// fix vue-router NavigationDuplicated
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return VueRouterPush.call(this, location).catch(err => err)
}
const VueRouterReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace (location) {
  return VueRouterReplace.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

// 导出路由 在 main.js 里使用
const router = new VueRouter({
  routes
})
/**
 * 路由拦截
 * 权限验证
 */
router.beforeEach(async (to, from, next) => {
  // 确认已经加载多标签页数据 https://github.com/d2-projects/d2-admin/issues/201
  await store.dispatch('d2admin/page/isLoaded')
  // 确认已经加载组件尺寸设置 https://github.com/d2-projects/d2-admin/issues/198
  await store.dispatch('d2admin/size/isLoaded')
  // 进度条
  NProgress.start()
  // 关闭搜索面板
  store.commit('d2admin/search/set', false)
  const userId = store.state.d2admin.user.info.id
  if (userId) {
    next()
  } else {
    if (to.path === '/login') {
      next()
    } else {
      store.state.d2admin.setting.openUnLoginBox = true
      request.get('/user/info').then(res => {
        if (res.code === 1) {
          store.state.d2admin.user.info = res.data
          asyncRouter = res.data.menus.filter(item => item.name === '后台管理')
          go(to, next)
        } else {
          next('/login')
        }
        store.state.d2admin.setting.openUnLoginBox = false
      })
    }
  }
})

router.afterEach(to => {
  // 进度条
  NProgress.done()
  // 多页控制 打开新的页面
  store.dispatch('d2admin/page/open', to)
  // 更改标题
  util.title(to.meta.title)
})

// 动态路由在这里实现
async function go (to, next) {
  if (asyncRouter.length > 0) {
    const adminRoutes = asyncRouter[0]
    router.addRoutes(filterAsyncRouter(adminRoutes.routers))
    const menu = getMenus(adminRoutes.routers)
    const menuHeader = [{
      path: '/index',
      title: '首页',
      icon: 'home'
    }, ...menu]
    // 设置顶栏菜单
    store.state.d2admin.menu.header = menuHeader
    // 初始化菜单搜索功能
    store.commit('d2admin/search/init', menuHeader)
    store.commit('d2admin/page/init', adminRoutes.routers)
    // 设置侧边栏
    store.state.d2admin.menu.allSide = menu
    next(to.path)
  } else {
    next()
  }
}

function filterAsyncRouter (routes) {
  const allRoutes = []
  for (let j = 0; j < routes.length; j++) {
    const route = routes[j]
    const component = route.component
    if (!component) {
      route.component = layoutHeaderAside
    } else {
      const pathSrc = route.component
      route.component = _import(pathSrc)
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    allRoutes.push(route)
  }
  return allRoutes
}
export default router
