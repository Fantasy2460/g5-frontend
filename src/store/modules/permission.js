import { constantRoutes } from '@/router'
import { getMenuList } from '@/api/user'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    // 判断是否有相应的权限
    if (hasPermission(roles, tmp)) {
      // 获取组件
      const component = tmp.component
      // 判断该路由使用有组件
      if (route.component) {
        // 判断是否是根组件
        if (component === 'layout/Layout') {
          tmp.component = Layout
        } else {
          // 获取对应的具体的组件信息
          tmp.component = (resolve) => require([`@/views${component}`], resolve)
        }
      }
      // 判断是否有子菜单
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      getMenuList().then(res => {
        let accessedRoutes// 存放对应权限的路由信息
        // 如果状态码为200，则表示成功
        if (res.code === 20000) {
          accessedRoutes = filterAsyncRoutes(res.data, roles)
        }
        // 将路由信息保存到store中
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
