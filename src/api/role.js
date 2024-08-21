import request from '@/utils/request'

export async function getRoutes() {
  return await request.get('/api/permission/getList')
}

export async function addRoute(data) {
  return await request.post('/api/permission/addPermission', data)
}

export async function updateRoute(data) {
  return await request.put('/api/permission/permission-permission/updatePermission', data)
}

export async function deleteRoute(id) {
  const params = { id: id }
  return await request.delete('/api/permission/permission-permission/deletePermission', params)
}

export async function getRoles() {
  return await request.get('/api/role/role-role/getList')
}

export async function addRole(data) {
  return await request.post('/api/role/role-role/addRole', data)
}

export async function updateRole(data) {
  return await request.put('/api/role/role-role/updateRole', data)
}

export async function deleteRole(id) {
  const params = { id: id }
  return await request.delete('/api/role/role-role/deleteRole', params)
}

export async function updatePermissions(data) {
  return await request.put('/api/role/role-role/updatePermissions', data)
}

export async function updateRoles(data) {
  return await request.put('/api/permission/permission-role/updateRoles', data)
}
