import request from '@/utils/request'

export async function getMenuList() {
  return await request.get('/api/sysUser/getMenuList')
}

export async function login(data) {
  return await request.login('/api/user/user-user/login', data)
}

export async function getInfo() {
  return await request.get('/api/sysUser/sysUser-sysUser/getInfo')
}

export async function logout(param) {
  return await request.post('/api/sysUser/sysUser-sysUser/loginOut', param)
}

// 获取用户信息列表
export async function getList() {
  return await request.get('/api/user/user-user/getList')
}

// 新增用户
export async function addUser(data) {
  return await request.post('/api/user/user-user/addUser', data)
}

// 修改用户
export async function updateUser(data) {
  return await request.put('/api/user/user-user/updateUser', data)
}

// 删除用户
export async function deleteUser(id) {
  // 方便前端从数据中读取id 直接传后端会在id里面寻找id 导致查找失败
  const params = { id: id }
  return await request.delete('/api/user/user-user/deleteUser', params)
}

// 查询用户
export async function queryUser(username) {
  // 方便前端从数据中读取id 直接传后端会在id里面寻找id 导致查找失败
  const params = { username: username }
  return await request.get('/api/user/user-user/queryUser', params)
}

// 获取所有用户角色列表
export async function getUserRoles() {
  return await request.get('/api/user/user-role/roles')
}

// 更新用户角色
export async function updateUserRole(data) {
  return await request.put('/api/user/user-role/updateRoles', data)
}
