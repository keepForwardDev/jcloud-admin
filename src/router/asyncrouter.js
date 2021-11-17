import layoutHeaderAside from '@/layout/header-aside'
// 由于懒加载页面太多的话会造成webpack热更新太慢，所以开发环境不使用懒加载，只有生产环境使用懒加载
const _import = require('@/libs/util.import.' + process.env.NODE_ENV)
/**
 * 获取菜单信息
 * @param item 路由节点
 * @param path 上级路由path
 * @returns {{}}
 */
function addRoute (children, item, path) {
  const route = {
    path: item.path,
    name: item.name,
    component: item.component,
    meta: item.meta,
    hidden: item.hidden
  }
  if (item.redirect) {
    route.redirect = item.redirect
  }
  if (path) {
    route.path = path + (item.path.startsWith('/') ? item.path : ('/' + item.path))
  }
  if (route.children) {
    delete route.children
  }
  if (route.component) {
    const pathSrc = route.component
    route.component = _import(pathSrc)
  } else {
    delete route.component
  }
  children.push(route)
  return route
}

/**
 * 循环获取菜单
 * @param parent
 * @param path
 * @returns {{}}
 */
function cycleGetRoute (children, parent, path) {
  const route = addRoute(children, parent, path)
  if (parent.children && parent.children.length > 0) {
    parent.children.forEach(item => {
      cycleGetRoute(children, item, route.path)
    })
  }
}

function filterAsyncRouter (menu) {
  const children = []
  if (menu.children) {
    menu.children.forEach(item => {
      cycleGetRoute(children, item, '')
    })
  }
  return {
    path: menu.path,
    title: menu.title,
    icon: menu.icon,
    component: layoutHeaderAside,
    children: children
  }
}

/**
 * 处理成扁平化路由
 * @param menus
 * @returns {[]}
 */
export function filterAsyncRouters (menus) {
  const array = []
  for (let i = 0; i < menus.length; i++) {
    array.push(filterAsyncRouter(menus[i]))
  }
  return array
}
