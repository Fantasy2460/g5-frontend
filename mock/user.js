const Mock = require('mockjs')

const users = [
  {
    token: '111111',
    id: '111111',
    username: 'rookie',
    password: '111111',
    roles: ['admin'],
    introduction: 'I am a super administrator',
    phone: '13540025536',
    email: '1564@qq.com',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
  },
  {
    username: 'cookie',
    id: '222222',
    password: '222222',
    token: '222222',
    roles: ['editor'],
    introduction: 'I am an editor',
    phone: '13977546633',
    email: '1564@qq.com',
    avatar: 'https://manong-authority.oss-cn-guangzhou.aliyuncs.com/avatar/2022/05/16/fe664c1e45bb4e39a719cd3f6d95232a-male.jpg'
  },
  {
    username: 'oookie',
    id: '333333',
    password: '333333',
    token: '333333',
    roles: ['visitor'],
    introduction: 'I am an editor',
    phone: '13977546633',
    email: '1564@qq.com',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
  }
]

for (let i = 0; i < 27; i++) {
  users.push(Mock.mock({
    token: '@id',
    id: '@id',
    username: '@cname',
    password: '123456',
    roles: ['admin', 'editor', 'visitor'],
    introduction: 'I am a super administrator and an editor',
    phone: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
    email: '@email',
    avatar: 'https://manong-authority.oss-cn-guangzhou.aliyuncs.com/avatar/2022/05/16/fe664c1e45bb4e39a719cd3f6d95232a-male.jpg'
  }))
}

module.exports = [
  // user login
  {
    url: '/vue-element-admin/user/login',
    type: 'post',
    response: config => {
      const { username, password } = config.body
      let token
      users.forEach(user => {
        if (user.username === username && user.password === password) {
          token = user.token
        }
      })

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: '账户或者密码不正确，请重新输入！'
        }
      }

      return {
        code: 20000,
        data: { token }
      }
    }
  },

  // get user info
  {
    url: '/vue-element-admin/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      let info
      users.forEach(user => {
        if (user.token === token) {
          info = user
        }
      })

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: '获取用户信息失败！'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/vue-element-admin/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  // 用户信息列表
  {
    url: '/vue-admin-template/user/list',
    type: 'get',
    response: config => {
      return {
        code: 20000,
        data: {
          total: users.length,
          items: users
        }
      }
    }
  },

  // 新增用户
  {
    url: '/vue-element-admin/user',
    type: 'post',
    response: {
      code: 20000,
      data: {
        id: Mock.mock('@id')
      }
    }
  },

  // 修改用户
  {
    url: '/vue-element-admin/user/[A-Za-z0-9]',
    type: 'put',
    response: {
      code: 20000,
      data: {
        status: 'success'
      }
    }
  },

  // 删除用户
  {
    url: '/vue-element-admin/user/[A-Za-z0-9]',
    type: 'delete',
    response: {
      code: 20000,
      data: {
        status: 'success'
      }
    }
  },

  // 查询用户
  {
    url: '/vue-element-admin/query/[A-Za-z0-9]',
    type: 'get',
    response: config => {
      return {
        code: 20000,
        data: {
          total: users.length,
          items: users
        }
      }
    }
  },

  // 获取用户角色列表
  {
    url: '/vue-admin-template/user/roles',
    type: 'get',
    response: config => {
      return {
        code: 20000,
        data: {
          total: users.length,
          items: users
        }
      }
    }
  },

  // 修改用户角色
  {
    url: '/vue-element-admin/user/role/[A-Za-z0-9]',
    type: 'put',
    response: {
      code: 20000,
      data: {
        status: 'success'
      }
    }
  }
]
