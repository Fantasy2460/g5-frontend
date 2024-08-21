<template>
  <div class="app-container" style="border: 2px solid #DCDFE6;text-align:left;border-radius: 8px;margin: 10px auto;width:98%;">

    <!-- 查询 -->
    <div style="margin: 10px 0">
      <el-select v-model="search" multiple placeholder="请选择用户角色" style="width: 20%;margin: 0 10px">
        <el-option
          v-for="item in roles"
          :key="item.key"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-search"
        @click="fetchData"
      >查询</el-button>
      <el-button
        type="warning"
        size="small"
        icon="el-icon-refresh-right"
        @click="reSetSearch"
      >重置</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      stripe
    >
      <el-table-column label="序号" width="80px" align="center" sortable>
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="用户名称" width="width" align="center" sortable>
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>

      <el-table-column label="用户角色" width="width" align="center">
        <template slot-scope="scope">
          <el-tag v-for="(role, index) in scope.row.roles" :key="index" style="margin-right:5px" :type="index%2 === 0 ? 'success' : 'warning'">{{ role }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        fixed="right"
        label="操作"
        width="150px"
        align="center"
      >
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
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

    <!-- 编辑弹窗 -->
    <el-dialog
      v-if="dialogVisible"
      :title="form.username"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="100px"
        :rules="rules"
        :validate-on-rule-change="false"
      >
        <el-form-item label="用户角色" prop="roles">
          <el-select v-model="form.roles" multiple placeholder="请选择" style="width: 80%">
            <el-option
              v-for="item in roles"
              :key="item.key"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
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

import { getRoles } from '@/api/role'
import { getUserRoles, updateUserRole } from '@/api/user'

const defaultRole = {
  id: '',
  username: '',
  roles: [],
  rolesId: []
}

export default {
  name: 'Role',
  data() {
    return {
      form: Object.assign({}, defaultRole),
      search: null,
      // 当前页数
      currentPage: 1,
      // 当前页总数
      pageSize: 5,
      totalNum: 0,
      // 表单可视化控制
      dialogVisible: false,
      list: [],
      roles: [],
      // 加载
      listLoading: true,
      rules: {
        roles: [{ required: true, message: '用户角色必须选择', trigger: 'change' }]
      }
    }
  },
  created() {
    this.fetchData()
    this.handleRoles()
  },
  methods: {
    // 每页显示的条数
    handleSizeChange(val) {
      // 改变每页显示的条数
      this.pageSize = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentPage = 1
    },
    // 调取角色信息
    handleRoles() {
      getRoles().then(response => {
        this.roles = response.data
      })
    },
    // 显示第几页
    handleCurrentChange(val) {
      // 改变默认的页数
      this.currentPage = val
    },
    // 判断1是不是2的子集
    getResult(arr1, arr2) {
      return arr1.every(item => {
        return arr2.includes(item)
      })
    },
    reSetSearch() {
      this.search = null
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      if (this.search === null) {
        getUserRoles().then(response => {
          this.list = response.data
          this.totalNum = response.data.length
        })
      } else {
        getUserRoles().then(response => {
          this.list = response.data
          this.totalNum = response.data.length
          const num = this.totalNum
          for (let index = num - 1; index >= 0; index--) {
            if (!this.getResult(this.search, this.list[index].roles)) {
              this.list.splice(index, 1)
              this.totalNum--
            }
          }
        })
      }
      this.listLoading = false
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
      this.dialogType = 'update'
    },
    async confirmUser(formName) {
      // 校验新增/更新表单是否存在不合法数据
      console.log(this.form)
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
      var tmp = Object.assign({}, defaultRole);

      if (text === 'success') {
        // 循环根据roles为rolesId赋值
        for (let index = 0; index < this.roles.length; index++) {
          if (this.form.roles.indexOf(this.roles[index].name) >= 0) {
            tmp.id = this.form.id;
            tmp.roles.push(this.roles[index].name);
            tmp.rolesId.push(this.roles[index].id);
            tmp.username = this.form.username;
            // tmp.roles.push(this.roles[index].id)
          }
        }
        const { code, message } = await updateUserRole(tmp)
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === tmp.id) {
            this.list.splice(index, 1, Object.assign({}, tmp))
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
            message: '修改失败'
          })
        }
        this.form = Object.assign({}, defaultRole)
        this.dialogVisible = false
      }
    }
  }
}
</script>

<style type="text/css" scoped>
</style>
