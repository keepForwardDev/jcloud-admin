import layoutHeaderAside from '@/layout/header-aside'
import { cloneDeep } from 'lodash'
// 由于懒加载页面太多的话会造成webpack热更新太慢，所以开发环境不使用懒加载，只有生产环境使用懒加载
const _import = require('@/libs/util.import.' + process.env.NODE_ENV)
/**
 * 在这里定义菜单数据，开始是头部菜单，然后是左边菜单children，如果是父级，需要将component定义为null
 */
const menus = {
  path: '/m',
  title: '元数据管理',
  icon: 'flask',
  children: [
    {
      path: 'index',
      name: 'meta-index',
      meta: {
        title: '元数据首页',
        icon: 'home'
      },
      component: _import('metadata/index')
    },
    {
      path: 'metadata',
      name: 'meta-input-manage',
      meta: {
        title: '元数据采集管理',
        icon: 'anchor'
      },
      redirect: { name: 'database-setting' },
      children: [{
        path: 'database',
        name: 'database-setting',
        component: _import('metadata/database-setting'),
        meta: {
          title: '数据源配置',
          icon: 'database',
          cache: true
        }
      }, {
        path: 'task',
        name: 'task-setting',
        component: _import('metadata/task-setting'),
        meta: {
          title: '任务配置',
          icon: 'tasks',
          cache: false
        }
      }, {
        path: 'logs',
        name: 'input-logs',
        component: _import('metadata/input-logs'),
        meta: {
          title: '采集日志',
          icon: 'list',
          cache: true
        }
      }]
    },
    {
      path: 'datamap',
      name: 'meta-datamap',
      meta: {
        title: '数据地图',
        icon: 'map'
      },
      redirect: { name: 'meta-manage' },
      children: [{
        path: 'metainfo',
        name: 'meta-info',
        component: _import('metadata/meta-manage'),
        meta: {
          title: '元数据管理',
          icon: 'maxcdn',
          cache: true
        }
      }, {
        path: 'relation',
        name: 'meta-relation',
        component: _import('metadata/meta-relation'),
        meta: {
          title: '数据血缘',
          icon: 'connectdevelop',
          cache: false
        }
      }]
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
export const metaDataMenu = menus

export default {
  path: menus.path,
  title: menus.title,
  icon: menus.icon,
  component: layoutHeaderAside,
  children: children
}
