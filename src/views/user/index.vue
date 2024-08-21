<template>
  <div class="app-container" style="border: 2px solid #DCDFE6;text-align:left;border-radius: 8px;margin: 10px auto;width:98%;">
    <div>
      <div style="margin: 10px 0;">
        <!-- 添加按钮 -->
        <el-button type="success" icon="el-icon-plus" style="float: right;" size="small" @click="handleAddUser">添加</el-button>
      </div>

      <!-- 查询输入框 -->
      <div style="margin: 10px 0;">
        <el-input v-model="search" placeholder="请输入用户名" style=" width: 20%" clearable />
        <el-button type="primary" style="margin-left: 5px" class="w-50 m-2" icon="el-icon-search" size="small" @click="fetchData">
          查询
        </el-button>
        <el-button
          type="warning"
          size="small"
          icon="el-icon-refresh-right"
          @click="reSetSearch"
        >重置</el-button>
      </div>
    </div>

    <!-- 表格组件 -->
    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      stripe
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="用户账户:">
              <span>{{ scope.row.id }}</span>
            </el-form-item>
            <el-form-item label="用户名称:">
              <span>{{ scope.row.username }}</span>
            </el-form-item>
            <el-form-item label="用户密码:">
              <span>{{ scope.row.password }}</span>
            </el-form-item>
            <!-- <el-form-item label="用户角色:">
              <span v-for="role in scope.row.roles" :key="role" style="margin-right:5px">{{ role }}</span>
            </el-form-item> -->
            <el-form-item label="用户介绍:">
              <span>{{ scope.row.introduction }}</span>
            </el-form-item>
            <el-form-item label="联系方式:">
              <span>{{ scope.row.phone }}</span>
            </el-form-item>
            <el-form-item label="邮箱地址:">
              <span>{{ scope.row.email }}</span>
            </el-form-item>
            <el-form-item label="用户头像:">
              <el-image :src="scope.row.avatar" style="width: 60px; height: 60px" />
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="序号" width="80px" align="center" sortable>
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="账号" width="width" align="center" sortable>
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>

      <el-table-column label="用户名称" width="width" align="center" sortable>
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>

      <!-- <el-table-column label="用户角色" width="width" align="center">
        <template slot-scope="scope">
          <el-tag v-for="(role, index) in scope.row.roles" :key="index" style="margin-right:5px" :type="index%2 === 0 ? 'success' : 'warning'">{{ role }}</el-tag>
        </template>
      </el-table-column> -->

      <el-table-column
        fixed="right"
        label="操作"
        width="200px"
        align="center"
      >
        <template #default="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 添加/更新弹窗 -->
    <el-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '修改用户信息'"
      width="30%"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="100px"
        :rules="rules"
        :validate-on-rule-change="false"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" style="width: 80%" />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input v-model="form.password" style="width: 80%" />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="确认密码" prop="checkPass">
          <el-input v-model="form.checkPass" style="width: 80%" />
        </el-form-item>
        <!-- <el-form-item label="用户角色" prop="roles">
          <el-select v-model="form.roles" multiple placeholder="请选择" style="width: 80%">
            <el-option
              v-for="item in roles"
              :key="item.key"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="form.phone" style="width: 80%" />
        </el-form-item>
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="form.email" style="width: 80%" />
        </el-form-item>
        <el-form-item label="用户介绍" prop="introduction">
          <el-input v-model="form.introduction" style="width: 80%" />
        </el-form-item>
        <el-form-item :model="form" label="用户头像">
          <el-input v-model="form.avatar" style="width: 80%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="danger" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUser('form')">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>

import { addUser, updateUser, deleteUser, queryUser, getList } from '@/api/user'
// import { getRoles } from '@/api/role'

export default {
  name: 'User',
  data() {
    // 校验验证密码是否一致且非空
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      // 搜索框信息
      search: '',
      // 当前页数
      currentPage: 1,
      // 当前页总数
      pageSize: 5,
      // 添加/更新表单数据
      form: {
        id: '',
        username: '',
        password: '',
        checkPass: '',
        // roles: [],
        introduction: '',
        avatar: '',
        phone: '',
        email: ''
      },
      // 表单校验
      rules: {
        username: [
          { required: true, message: '用户名不能为空！', trigger: 'blur' },
          { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空！', trigger: 'blur' },
          { pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$)([^\u4e00-\u9fa5\s]){6,20}$/, message: '密码请由6-20位英文字母、数字或者符号组成', trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        // roles: [
        //   { required: true, message: '用户角色必须选择', trigger: 'change' }
        // ],
        phone: [
          { required: true, message: '联系方式不能为空！', trigger: 'blur' },
          { pattern: /1[3|5|7|8|]\d{9}/, message: '请输入正确格式的电话号码', trigger: 'blur' }
        ],
        introduction: [
          { pattern: /[*]{0,100}/, message: '个人介绍长度不要超过100个字符哦', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱地址不能为空！', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9-._]+@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,6})$/, message: '请输入正确格式的邮箱地址', trigger: 'blur' }
        ]
      },
      // 表单可视化控制
      dialogVisible: false,
      // 表单种类控制
      dialogType: 'update',
      // 用户列表
      list: [],
      // 角色列表
      // roles: [],
      // 加载
      listLoading: true,
      // 分页总数
      totalNum: 0
    }
  },
  created() {
    this.fetchData()
    // this.handleRoles()
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

    reSetSearch() {
      this.search = ''
      this.fetchData()
    },

    // 更新列表
    fetchData() {
      this.listLoading = true
      if (this.search === '') {
        getList().then(response => {
          this.list = response.data
          this.totalNum = response.data.length
        })
      } else {
        queryUser(this.search).then(response => {
          // 因为没有实现后端 只能在前端做简单单字段查询
          this.totalNum = response.data.length
          this.list = response.data
          // const num = this.totalNum
          // for (let index = num - 1; index >= 0; index--) {
          //   if (this.list[index].id !== this.search) {
          //     this.list.splice(index, 1)
          //     this.totalNum--
          //   }
          // }
        })
      }
      this.listLoading = false
    },

    // 调取角色信息
    // handleRoles() {
    //   getRoles().then(response => {
    //     this.roles = response.data.roles
    //   })
    // },

    // 删除用户
    handleDelete(row) {
      this.$confirm('确认删除该用户?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { message, code } = await deleteUser(row.id)
          if (code === 20000) {
            for (var index in this.list) {
              if (row.id === this.list[index].id) {
                this.list.splice(index, 1)
              }
            }
            this.totalNum--
            this.$message({
              type: 'success',
              message: message
            })
          } else {
            this.$message({
              type: 'danger',
              message: '删除失败'
            })
          }
        })
        .catch(err => { console.error(err) })
    },

    // 点击添加按钮 对话框显示
    handleAddUser() {
      this.dialogVisible = true
      this.dialogType = 'add'
      this.form = {}
      this.form.avatar = 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
    },

    // 点击编辑按钮 对话框显示
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
      this.dialogType = 'update'
    },

    // 确定新增/更新
    async confirmUser(formName) {
      // 校验新增/更新表单是否存在不合法数据
      let text
      this.$refs[formName].validate((valid) => {
        if (valid) {
          text = 'success'
          console.log('success submit')
        } else {
          console.log('error submit!!')
          return false
        }
      })
      if (text) {
        if (this.dialogType === 'update') {
        // 更新
          const { message, code } = await updateUser(this.form)
          for (let index = 0; index < this.list.length; index++) {
            if (this.list[index].id === this.form.id) {
              this.list.splice(index, 1, Object.assign({}, this.form))
              break
            }
          }
          if (code === 20000) {
            this.$message({
              type: 'success',
              message: message
            })
          } else {
            this.$message({
              type: 'error',
              message: '更新失败'
            })
          }
          this.form = {}
          this.dialogType = 'update'
          this.dialogVisible = false
        } else {
          const { data, message, code } = await addUser(this.form)
          this.form.id = data.id
          this.list.push(this.form)
          if (code === 20000) {
            this.$message({
              type: 'success',
              message: message
            })
          } else {
            this.$message({
              type: 'error',
              message: '新增失败'
            })
          }
          this.totalNum++
          this.form = {}
          this.dialogType = 'update'
          this.dialogVisible = false
        }
      }
    }
  }
}
</script>

<style type="text/css" scoped>
.demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>

