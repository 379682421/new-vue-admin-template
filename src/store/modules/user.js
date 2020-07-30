import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles:[],
    menus:[],
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_MENUS: (state, menus) => {
    state.menus = menus
  },
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { roles, name, avatar } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        // 后台传入menus菜单
        const menus = [
          {
              path: '/permission',
              component: 'Layout',
              redirect: '/permission/page',
              alwaysShow: true, // will always show the root menu
              name: 'Permission',
              meta: {
                  title: '权限',
                  icon: 'lock',
                  roles: ['admin', 'editor'] // you can set roles in root nav
              },
              children: [
                  {
                      path: 'page',
                      component: 'PagePermission',
                      name: 'PagePermission',
                      meta: {
                          title: '页面权限',
                          roles: ['admin'] // or you can only set roles in sub nav
                      }
                  },
                  {
                      path: 'directive',
                      component: 'DirectivePermission',
                      name: 'DirectivePermission',
                      meta: {
                          title: '指令权限'
                          // if do not set roles, means: this page does not require permission
                      }
                  },
                  {
                      path: 'role',
                      component: 'RolePermission',
                      name: 'RolePermission',
                      meta: {
                          title: '角色权限',
                          roles: ['admin']
                      }
                  }
              ]
          },
          {
              path: '/form',
              component: 'Layout',
              children: [
                  {
                      path: 'index',
                      name: 'Form',
                      component: 'Form',
                      meta: { title: '表单', icon: 'form' }
                  }
              ]
          },
          // 404 page must be placed at the end !!!
          { path: '*', redirect: '/404', hidden: true }
      ];

      data.menus = menus;

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_MENUS', menus)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state , dispatch}) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },

  // dynamically modify permissions
  // async changeRoles({ commit, dispatch }, role) {
  //   const token = role + '-token'

  //   commit('SET_TOKEN', token)
  //   setToken(token)

  //   const { roles } = await dispatch('getInfo')

  //   resetRouter()

  //   // generate accessible routes map based on roles
  //   const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
  //   // dynamically add accessible routes
  //   router.addRoutes(accessRoutes)

  //   // reset visited views and cached views
  //   dispatch('tagsView/delAllViews', null, { root: true })
  // }
  
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

