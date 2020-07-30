/* Layout */
import Layout from '@/layout'

//  login:require('login/index').default // 同步的方式
//  login:()=>import('login/index')      // 异步的方式
// 页面
const map = {
    PagePermission: () => import('@/views/permission/page'),
    DirectivePermission: () => import('@/views/permission/directive'),
    RolePermission: () => import('@/views/permission/role'),
    Form: () => import('@/views/form/index'),
}

function setMap(component) {

    let key = Object.keys(map).find((val) => {
        return val == component;
    })

    return map[key];
}

// // 遍历后台传来的路由字符串，转换为组件对象
export function filterAsyncRouter(asyncRouterMap) {
    const accessedRouters = asyncRouterMap.filter(route => {
        if (route.component) {
            if (route.component === 'Layout') {
                route.component = Layout
            } else {
                route.component = setMap(route.component) // 导入组件
            }
        }
        if (route.children && route.children.length) {
            route.children = filterAsyncRouter(route.children)
        }
        return true
    })

    return accessedRouters
}

