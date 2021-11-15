import { uniqueId } from 'lodash'

/**
 * @description 给菜单数据补充上 path 字段
 * @description https://github.com/d2-projects/d2-admin/issues/209
 * @param {Array} menu 原始的菜单数据
 */
export function supplementPath (menu) {
  return menu.map(e => ({
    ...e,
    path: e.path || uniqueId('d2-menu-empty-'),
    ...e.children ? {
      children: supplementPath(e.children)
    } : {}
  }))
}

/**
 * 获取菜单信息
 * @param item 路由节点
 * @param path 上级路由path
 * @returns {{}}
 */
function getMenuInfo (item, path) {
  const obj = {}
  if (path) {
    obj.path = path + (item.path.startsWith('/') ? item.path : ('/' + item.path))
  } else {
    obj.path = item.path
  }
  obj.title = item.meta.title
  if (item.meta.icon) {
    obj.icon = item.meta.icon
  }
  return obj
}

/**
 * 循环获取菜单
 * @param parent
 * @param path
 * @returns {{}}
 */
function cycleGetMenu (parent, path) {
  const obj = getMenuInfo(parent, path)
  if (parent.children && parent.children.length > 0) {
    obj.children = []
    parent.children.forEach(item => {
      obj.children.push(cycleGetMenu(item, obj.path))
    })
  }
  return obj
}

/**
 * 生成菜单
 * @param routers
 * @returns {[]}
 */
export function getMenus (routers) {
  const menus = []
  routers.forEach(item => {
    const indexChildren = []
    if (item.children) {
      item.children.forEach(r => {
        indexChildren.push(cycleGetMenu(r, item.path))
      })
    }
    const menu = {
      path: item.path,
      title: item.title,
      icon: item.meta.icon,
      children: indexChildren
    }
    menus.push(menu)
  })
  return menus
}
