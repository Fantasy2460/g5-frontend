<template>
  <div class="app-container" style="border: 2px solid #DCDFE6;text-align:left;border-radius: 8px;margin: 10px auto;width:98%;">
    <!-- 新增按钮 -->
    <el-button type="success" style="float:right;margin: 10px 0" @click="handleAddRoute">新增权限</el-button>

    <!-- 表格 -->
    <template>
      <el-table
        :data="allRoutes"
        style="width: 100%;margin-top:30px;"
        border
        stripe
      >
        <el-table-column type="expand" align="center">
          <template v-if="props.row.children" slot-scope="props">
            <el-table :data="props.row.children" style="width: 100%;" border stripe>
              <el-table-column label="序号" align="center" width="50px">
                <template slot-scope="child">
                  ({{ child.$index + 1 }})
                </template>
              </el-table-column>
              <el-table-column label="子级菜单标题" align="center">
                <template slot-scope="child">
                  {{ child.row.title }}
                </template>
              </el-table-column>
              <el-table-column label="子级菜单路径" align="center">
                <template slot-scope="child">
                  {{ child.row.path }}
                </template>
              </el-table-column>
              <!-- <el-table-column
                label="父组件地址"
                align="center"
              >
                <template slot-scope="scope">
                  {{ scope.row.component }}
                </template>
              </el-table-column> -->

              <el-table-column
                label="已分配角色"
                align="center"
              >
                <template v-if="scope.row.roles" slot-scope="scope">
                  <el-tag v-for="(role, index) in scope.row.roles" :key="index" style="margin-right:5px" :type="index%2 === 0 ? 'success' : 'warning'">{{ role }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" label="操作" width="300px">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEditSon(scope,props)">修改</el-button>
                  <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDeleteSon(scope,props)">删除</el-button>
                  <el-button type="warning" size="mini" icon="el-icon-setting" @click="handleAssignSon(scope,props)">分配权限</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column
          label="序号"
          align="center"
          width="50px"
        >
          <template slot-scope="scope">
            {{ scope.$index +1 }}
          </template>
        </el-table-column>

        <el-table-column
          label="菜单标题"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.title }}
          </template>
        </el-table-column>

        <el-table-column
          label="菜单路径"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.path }}
          </template>
        </el-table-column>

        <!-- <el-table-column
          label="父组件地址"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.component }}
          </template>
        </el-table-column> -->

        <el-table-column
          label="图标"
          align="center"
          width="50px"
        >
          <template slot-scope="scope">
            <svg-icon :icon-class="scope.row.icon" />
          </template>
        </el-table-column>

        <el-table-column
          label="已分配角色"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag v-for="(role, index) in scope.row.roles" :key="index" style="margin-right:5px" :type="index%2 === 0 ? 'success' : 'warning'">{{ role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope)">修改</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope)">删除</el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting" @click="handleAssign(scope)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 新增/修改对话框 -->
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :title="dialogType==='update'?'修改权限信息': dialogType==='assign'?'角色分配权限':'新增权限信息'">
      <el-form
        ref="route"
        label-width="100px"
        label-position="left"
        :model="route"
        :rules="rules"
        :validate-on-rule-change="false"
      >
        <div style="margin: 20px">
          <el-radio v-if="dialogType === 'new'" v-show="dialogType !== 'assign'" v-model="radio" label="1" border>添加目录</el-radio>
          <el-radio v-if="dialogType === 'new'" v-model="radio" label="2" border>添加菜单</el-radio>
        </div>
        <el-form-item v-show="dialogType !== 'assign'" label="菜单路径" prop="path">
          <el-input v-model="route.path" />
        </el-form-item>
        <el-form-item v-if="radio !== '1'" v-show="dialogType !== 'assign'" label="父组件" prop="father">
          <el-input v-model="father" :readonly="true" @click.native="parentVisible=true" />
        </el-form-item>
        <el-form-item v-show="dialogType !== 'assign'" label="组件路径">
          <el-input v-model="route.component" />
        </el-form-item>
        <el-form-item v-if="radio === '1'" v-show="dialogType !== 'assign'" label="图标">
          <template>
            <div class="chooseIcons">
              <el-popover ref="icon" v-model="popoverVisible" width="100%" placement="bottom" trigger="click">
                <span
                  slot="reference"
                  style="
                  display: inline-block;
                  width: 200px;
                  height: 33px;
                  line-height: 33px;
                  "
                >
                  <svg-icon :icon-class="userChooseIcon" />
                  {{ userChooseIcon }}
                </span>
                <div class="iconList">
                  <svg-icon
                    v-for="item,index in iconList"
                    :key="index"
                    :icon-class="item"
                    class="SvgIcon"
                    style="font-size: 20px"
                    @click="setIcon(item)"
                  />
                </div>
              </el-popover>
            </div>
          </template>
        </el-form-item>
        <el-form-item v-show="dialogType !== 'assign'" label="菜单标题" prop="title">
          <el-input v-model="route.title" />
        </el-form-item>
        <el-form-item v-show="dialogType === 'assign'" label="分配角色">
          <el-select v-model="route.roles" multiple placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in roles"
              :key="item.key"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRoute('route')">确定</el-button>
      </div>
    </el-dialog>

    <!-- 选择父菜单对话框 -->
    <el-dialog v-if="parentVisible" :visible.sync="parentVisible" title="选择父菜单" width="250px">
      <el-tree
        :data="routes"
        :props="defaultProps"
        accordion
        :highlight-current="true"
        @node-click="handleNodeClick"
      />
    </el-dialog>

    <svg-icon />
  </div>
</template>

<script>

import path from 'path'
import { deepClone } from '@/utils'
import { getRoutes } from '@/api/role'
import elementIcons from '../icons/element-icons'
import SvgIcon from '@/components/SvgIcon/index.vue'
import { getRoles, addRoute, updateRoute, deleteRoute, updateRoles } from '@/api/role'

const defaultRoute = {
  id: 0,
  pid: 0,
  path: '',
  component: '',
  title: '',
  icon: '',
  roles: []
}

export default {
  components: {
    SvgIcon
  },
  data() {
    return {
      // 添加判断添加目录还是菜单   同时也表示是修改父权限还是子权限
      radio: '1',
      // 判断修改的是第几个父权限
      fatherIndex: -1,
      // 判断修改的是第几个子权限
      sonIndex: -1,
      // 菜单的目录信息
      father: '',
      route: Object.assign({}, defaultRoute),
      roles: [],
      routes: [],
      allRoutes: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      permission: [],
      dialogVisible: false,
      dialogType: 'new',
      parentVisible: false,
      popoverVisible: false,
      iconList: [],
      userChooseIcon: '',
      rules: {
        path: [
          { required: true, message: '权限路径不能为空', trigger: 'blur' }
        ],
        father: [
          { validate: this.father === '', message: '父组件路径不能为空', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // Mock: get all routes list from server
    this.getParentRoutes()
    this.getAllRoutes()
    this.getIconList()
    this.getRoles()
  },
  methods: {
    async confirmRoute(formName) {
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
        if (this.dialogType === 'update') {
          this.route.icon = this.userChooseIcon
          let success = 400
          // 更新
          if (this.radio === '1') {
            // 更新父权限
            const { code } = await updateRoute(this.route)
            success = code
            this.allRoutes.splice(this.fatherIndex, 1, Object.assign({}, this.route))
          } else {
            // 更新子权限
            // 父级组件没变
            if (this.route.father === this.father) {
              const { code } = await updateRoute(this.route)
              success = code
              this.allRoutes[this.fatherIndex].children.splice(this.sonIndex, 1, Object.assign({}, this.route))
            } else { // 父级组件发生变化
              this.allRoutes[this.fatherIndex].children.splice(this.sonIndex, 1)
              this.route.father = this.father
              const { code } = await updateRoute(this.route)
              success = code
              for (let j = 0; j < this.allRoutes.length; j++) {
                if (this.allRoutes[j].path === this.father) {
                  this.allRoutes[j].children.push(this.route)
                  break
                }
              }
            }
          }
          if (success === 20000) {
            this.$message({
              type: 'success',
              message: '修改成功'
            })
          } else {
            this.$message({
              type: 'error',
              message: '修改失败'
            })
          }
        } else if (this.dialogType === 'new') {
          this.route.icon = this.userChooseIcon
          for (let j = 0; j < this.allRoutes.length; j++) {
            if (this.allRoutes[j].path === this.father) {
              this.route.pid = this.allRoutes[j].id
              break
            }
          }
          const { code, data } = await addRoute(this.route)
          if (code === 20000) {
            this.route.icon = this.userChooseIcon
            this.route.id = data.id
            if (this.father === '') {
              this.allRoutes.push(this.route)
            } else {
              for (let j = 0; j < this.allRoutes.length; j++) {
                if (this.allRoutes[j].path === this.father) {
                  this.route.pid = this.allRoutes[j].id
                  this.allRoutes[j].children.push(this.route)
                  break
                }
              }
              console.log(this.route)
            }
            this.$message({
              type: 'success',
              message: '新增成功'
            })
          } else {
            this.$message({
              type: 'error',
              message: '新增失败'
            })
          }
          // 连接后端的时候一定要将这行注释  否则新增加的权限没有id  无法进行任何更新操作
          // this.getAllRoutes()
        } else { // 分配权限
          const { code } = await updateRoles(this.route)
          if (code === 20000) {
            if (this.radio === '1') {
            // 更新父权限
              this.route.icon = this.userChooseIcon
              this.allRoutes.splice(this.fatherIndex, 1, Object.assign({}, this.route))
            } else {
            // 更新子权限
            // 父级组件没变
              if (this.route.father === this.father) {
                this.allRoutes[this.fatherIndex].children.splice(this.sonIndex, 1, Object.assign({}, this.route))
              } else { // 父级组件发生变化
                this.allRoutes[this.fatherIndex].children.splice(this.sonIndex, 1)
                this.route.father = this.father
                for (let j = 0; j < this.allRoutes.length; j++) {
                  if (this.allRoutes[j].path === this.father) {
                    this.allRoutes[j].children.push(this.route)
                    break
                  }
                }
              }
            }
          }
        }
        this.father = ''
        this.route = Object.assign({}, defaultRoute)
        this.dialogVisible = false
      }
    },
    handleDelete(scope) {
      this.$confirm('确定删除该权限?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { code } = await deleteRoute(scope.row.id)
          if (code === 20000) {
            this.allRoutes.splice(scope.$index, 1)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          } else {
            this.$message({
              type: 'danger',
              message: '删除失败!请确认是否存在仍使用该权限的用户'
            })
          }
        })
        .catch(err => { console.error(err) })
    },
    handleDeleteSon(scope, props) {
      this.$confirm('确定删除该权限?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { code } = await deleteRoute(scope.row.id)
          if (code === 20000) {
            this.allRoutes[props.$index].children.splice(scope.$index, 1)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          } else {
            this.$message({
              type: 'danger',
              message: '删除失败!请确认是否存在仍使用该权限的用户'
            })
          }
        })
        .catch(err => { console.error(err) })
    },
    handleAssign(scope) {
      this.radio = '1'
      this.dialogVisible = true
      this.dialogType = 'assign'
      this.route = deepClone(scope.row)
      this.userChooseIcon = this.route.icon
      this.fatherIndex = scope.$index
      console.log(this.route)
    },
    handleAssignSon(scope, props) {
      this.radio = '2'
      this.dialogVisible = true
      this.dialogType = 'assign'
      this.route = deepClone(scope.row)
      this.father = props.row.path
      this.sonIndex = scope.$index
      this.fatherIndex = props.$index
    },
    handleEdit(scope) {
      this.radio = '1'
      this.dialogVisible = true
      this.dialogType = 'update'
      this.route = deepClone(scope.row)
      this.userChooseIcon = this.route.icon
      this.fatherIndex = scope.$index
    },
    handleEditSon(scope, props) {
      this.radio = '2'
      this.dialogVisible = true
      this.dialogType = 'update'
      this.route = deepClone(scope.row)
      this.father = props.row.path
      this.sonIndex = scope.$index
      this.fatherIndex = props.$index
    },
    handleAddRoute() {
      this.route = Object.assign({}, defaultRoute)
      this.userChooseIcon = ''
      this.father = ''
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    async getRoles() {
      const res = await getRoles()
      this.roles = res.data
      // this.totalNum = res.data.total
    },
    setIcon(icon) {
    // 将i的样式设为选中的样式el-icon-xxx
      this.userChooseIcon = icon
      // 将选中的图标传递给父组件
      // this.$emit('selecticon', icon)
      this.$refs['icon'].doClose()
    },
    getIconList() {
      this.iconList = elementIcons
    },
    async getAllRoutes() {
      const res = await getRoutes()
      this.serviceRoutes = res.data
      this.allRoutes = this.generateRoutes(res.data)
    },
    async getParentRoutes() {
      const res = await getRoutes()
      this.serviceRoutes = res.data
      this.routes = this.generateParentRoutes(res.data)
    },
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
    generateRoutes(routes, basePath = '/') {
      const res = []

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
          pid: route.pid,
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title,
          roles: route.meta && route.meta.roles,
          icon: route.meta && route.meta.icon,
          component: route.component
        }

        // 只能在父类菜单中添加子菜单
        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateParentRoutes(routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        // 当只有一级子菜单时是否只展示父菜单
        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title
        }

        // 只能在父类菜单中添加子菜单
        // recursive child routes
        // if (route.children) {
        //   data.children = this.generateRoutes(route.children, data.path)
        // }
        res.push(data)
      }
      return res
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
    },
    handleNodeClick(data) {
      this.parentVisible = false
      this.father = data.path
    }
  }
}
</script>

<style lang="scss" scoped>
.iconList {
width: 200px;
height: 150px;
overflow-y: scroll;
overflow-x: hidden;
display: flex;
justify-content: space-around;
flex-wrap: wrap;
.SvgIcon {
display: inline-block;
width: 24px;
height: 18px;
color: #000000;
font-size: 20px;
border: 1px solid #e6e6e6;
border-radius: 4px;
cursor: pointer;
text-align: center;
line-height: 45px;
margin: 5px;
&:hover {
color: orange;
border-color:orange;
}
}
}
.chooseIcons{
width: 175px;
background-color: #FFFFFF;
background-image: none;
border-radius: 4px;
border: 1px solid #DCDFE6;
box-sizing: border-box;
color: #606266;
display: inline-block;
font-size: inherit;
height: 33px;
line-height: 25px;
outline: none;
padding: 0 15px;
transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}
</style>
