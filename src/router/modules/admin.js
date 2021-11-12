import layoutHeaderAside from '@/layout/header-aside'
import { cloneDeep } from 'lodash'
// 由于懒加载页面太多的话会造成webpack热更新太慢，所以开发环境不使用懒加载，只有生产环境使用懒加载
const _import = require('@/libs/util.import.' + process.env.NODE_ENV)
/**
 * 在这里定义菜单数据，开始是头部菜单，然后是左边菜单children，如果是父级，需要将component定义为null
 */
const menus = {
  path: '/admin',
  title: '后台管理',
  icon: 'fa fa-adn',
  redirect: '/admin/index',
  children: [
    {
      path: 'index',
      name: 'admin-index',
      meta: {
        title: '首页',
        icon: 'home'
      },
      component: _import('admin/index')
    },
    {
      path: 'user',
      name: 'admin-user',
      meta: {
        title: '账号管理',
        icon: 'user-circle'
      },
      component: _import('admin/user')
    },
    {
      path: 'clients',
      name: 'admin-clients',
      meta: {
        title: '应用管理',
        icon: 'table'
      },
      component: _import('admin/clients')
    },
    {
      path: 'department',
      name: 'admin-department',
      meta: {
        title: '部门管理',
        icon: 'th-large'
      },
      component: _import('admin/department')
    },
    {
      path: 'menu',
      name: 'admin-menu',
      meta: {
        title: '菜单管理',
        icon: 'list-ul'
      },
      component: _import('admin/menu')
    },
    {
      path: 'role',
      name: 'admin-role',
      meta: {
        title: '角色管理',
        icon: 'pagelines'
      },
      component: _import('admin/role')
    },
    {
      path: 'privileges',
      name: 'admin-privileges',
      meta: {
        title: '自定义权限',
        icon: 'meanpath'
      },
      component: _import('admin/create-privileges')
    }
  ]
}

/**
 * 获取菜单信息
 * @param item 路由节点
 * @param path 上级路由path
 * @returns {{}}
 */
function addRoute (children, item, path) {
  const route = cloneDeep(item)
  if (path) {
    route.path = path + (item.path.startsWith('/') ? item.path : ('/' + item.path))
  }
  if (route.children) {
    delete route.children
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
const children = []
if (menus.children) {
  menus.children.forEach(item => {
    cycleGetRoute(children, item, '')
  })
}
export const adminMenu = menus
export default {
  path: menus.path,
  title: menus.title,
  icon: menus.icon,
  redirect: menus.redirect,
  component: layoutHeaderAside,
  children: children
}
