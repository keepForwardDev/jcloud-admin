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
  // next()
  // 如果要登录需要放开这里
  const token = util.cookies.get('jtoken')
  const path = to.path
  if ((token && token !== 'undefined')) {
    // 已登录，判断有无获取用户信息
    if (store.state.d2admin.user.id) {
      next()
    } else { // 否则获取用户信息
      request.get()
    }
  } else {
    next({
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    })
    NProgress.done()
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
// function go(to, next) {
//   asyncRouter = filterAsyncRouter(asyncRouter)
//   router.addRoutes(asyncRouter)
//   next({ ...to, replace: true })
// }
//
// function filterAsyncRouter(routes) {
//   return routes.filter((route) => {
//     const component = route.component
//     if (component) {
//       if (route.component === 'Layout') {
//         route.component = Layout
//       } else {
//         const pathSrc = route.component
//         route.component = (resolve) => require([`@/views${pathSrc}`], resolve)
//       }
//       if (route.children && route.children.length) {
//         route.children = filterAsyncRouter(route.children)
//       }
//       return true
//     }
//   })
// }
export default router
