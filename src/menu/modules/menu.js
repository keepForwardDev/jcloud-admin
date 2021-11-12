import { adminMenu } from '@/router/modules/admin'
// 将所有的菜单放到这里
const routers = [adminMenu]
/**
 * 获取菜单信息
 * @param item 路由节点
 * @param path 上级路由path
 * @returns {{}}
 */
function getMenuInfo(item, path) {
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
    icon: item.icon,
    children: indexChildren
  }
  menus.push(menu)
})
export default menus
