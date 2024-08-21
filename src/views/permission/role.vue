<template>
  <div class="app-container" style="border: 2px solid #DCDFE6;text-align:left;border-radius: 8px;margin: 10px auto;width:98%;">
    <!-- 新增角色 -->
    <el-button type="success" icon="el-icon-plus" style="float:right;margin: 10px 0" @click="handleAddRole">新增角色</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="序号" width="50px">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色id">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色描述" width="250px">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="300px">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope)">修改</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope)">删除</el-button>
          <el-button type="warning" size="mini" icon="el-icon-setting" @click="handleAsign(scope)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      style="margin-top:20px;text-align: center;"
      :total="totalNum"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[5, 10, 20]"
      layout="prev, pager, next, jumper, ->, sizes, total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改角色信息': dialogType==='asign'?'角色分配权限':'新增角色信息'">
      <el-form
        ref="role"
        :model="role"
        label-width="80px"
        label-position="left"
        :rules="rules"
        :validate-on-rule-change="false"
      >
        <el-form-item v-show="dialogType!=='asign'" label="角色名称" prop="name">
          <el-input v-model="role.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item v-show="dialogType!=='asign'" label="角色描述" prop="description">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item v-show="dialogType==='asign'" label="菜单">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="path"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRole('role')">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { getRoutes, getRoles, addRole, deleteRole, updateRole, updatePermissions } from '@/api/role'

const defaultRole = {
  id: '',
  key: '',
  name: '',
  description: '',
  routes: []
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      totalNum: 0,
      // 当前页数
      currentPage: 1,
      // 当前页总数
      pageSize: 5,
      routes: [],
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      rules: {
        name: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '角色描述不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getRoutes()
    this.getRoles()
  },
  methods: {
    // 每页显示的条数
    handleSizeChange(val) {
      // 改变每页显示的条数
      this.pageSize = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentPage = 1
    },
    // 显示第几页
    handleCurrentChange(val) {
      // 改变默认的页数
      this.currentPage = val
    },
    async getRoutes() {
      const res = await getRoutes()
      this.serviceRoutes = res.data
      this.routes = this.generateRoutes(res.data)
    },
    async getRoles() {
      const res = await getRoles()
      this.rolesList = res.data
      this.totalNum = res.data.length
    },

    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes, basePath = '/') {
      const res = []

      if (routes === null) {
        return res
      }

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        // 当只有一级子菜单时是否只展示父菜单
        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          id: route.id,
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title
        }

        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },

    // 根据角色获取其拥有的权限数组
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        const routes = this.generateRoutes(this.role.routes)
        // 根据权限对tree结构节点进行选择
        this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    handleAsign(scope) {
      this.dialogType = 'asign'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        const routes = this.generateRoutes(this.role.routes)
        this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    async handleDelete({ $index, row }) {
      this.$confirm('确定删除该角色?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { code, message } = await deleteRole(row.id)
          if (code === 20000) {
            this.rolesList.splice($index, 1)
            this.$message({
              type: 'success',
              message: message
            })
          } else {
            this.$message({
              type: 'danger',
              message: message
            })
          }
        })
        .catch(err => { console.error(err) })
    },
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      if (routes === null) {
        return res
      }

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)

        // recursive child routes
        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },
    async confirmRole(formName) {
      let text
      this.$refs[formName].validate((valid) => {
        if (valid) {
          text = 'success'
          console.log('success submit!!')
        } else {
          console.log('error submit!!')
          return false
        }
      })
      if (text) {
        const checkedKeys = this.$refs.tree.getCheckedKeys()
        this.role.routes = this.generateTree(deepClone(this.serviceRoutes), '/', checkedKeys)
        console.log(this.role.routes)

        if (this.dialogType === 'edit') {
          // 只更新角色信息 防止角色路由提交
          // const temp = this.role.routes
          // this.role.routes = []
          const { message, code } = await updateRole(this.role)
          // this.role.routes = temp
          for (let index = 0; index < this.rolesList.length; index++) {
            // 2022年6月21日17:24:55将key改成id
            if (this.rolesList[index].id === this.role.id) {
              this.rolesList.splice(index, 1, Object.assign({}, this.role))
              break
            }
          }
          this.dialogVisible = false
          if (code === 20000) {
            this.$message({
              type: 'success',
              message: message
            })
          } else {
            this.$message({
              type: 'danger',
              message: message
            })
          }
        } else if (this.dialogType === 'new') {
          const { data, message, code } = await addRole(this.role)
          if (code === 20000) {
            this.role.key = data.key
            this.role.id = data.id
            this.rolesList.push(this.role)
            const { description, id, name } = this.role
            this.totalNum++
            this.dialogVisible = false
            this.$notify({
              title: 'Success',
              dangerouslyUseHTMLString: true,
              message: message + `
            <div>Role Key: ${id}</div>
            <div>Role Name: ${name}</div>
            <div>Description: ${description}</div>
          `,
              type: 'success'
            })
          } else {
            this.$message({
              type: 'danger',
              message: message
            })
          }
        } else {
          const { message, code } = await updatePermissions(this.role)
          for (let index = 0; index < this.rolesList.length; index++) {
            // 2022年6月21日17:24:55将key改成id
            if (this.rolesList[index].id === this.role.id) {
              this.rolesList.splice(index, 1, Object.assign({}, this.role))
              break
            }
          }
          this.dialogVisible = false
          if (code === 20000) {
            this.$message({
              type: 'success',
              message: message
            })
          } else {
            this.$message({
              type: 'danger',
              message: message
            })
          }
        }
      }
    },
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
