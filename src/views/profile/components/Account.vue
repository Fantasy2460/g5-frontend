<template>
  <el-form ref="account" :model="account" :rules="rules">
    <el-form-item label="账户">
      <el-input v-model.trim="account.id" disabled />
    </el-form-item>
    <el-form-item label="用户名" prop="name">
      <el-input v-model.trim="account.name" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model.trim="account.password" />
    </el-form-item>
    <el-form-item label="确认密码" prop="checkPass">
      <el-input v-model.trim="account.checkPass" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model.trim="account.email" />
    </el-form-item>
    <el-form-item label="个性签名" prop="introduction">
      <el-input v-model.trim="account.introduction" />
    </el-form-item>
    <el-form-item label="联系方式" prop="phone">
      <el-input v-model.trim="account.phone" />
    </el-form-item>
    <el-form-item label="用户头像:">
      <el-image :src="account.avatar" style="width: 60px; height: 60px" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">确认修改</el-button>
    </el-form-item>
  </el-form>
</template>

<script>

import { deepClone } from '@/utils'
import { updateUser } from '@/api/user'

const defaultUser = {
  id: '',
  name: '',
  password: '',
  checkPass: '',
  role: '',
  phone: '',
  email: '',
  introduction: '',
  avatar: ''
}

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          id: '',
          name: '',
          password: '',
          role: '',
          phone: '',
          email: '',
          introduction: '',
          avatar: ''
        }
      }
    }
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.account.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      account: Object.assign({}, defaultUser),
      checkPass: '',
      rules: {
        name: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空！', trigger: 'blur' },
          { pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$)([^\u4e00-\u9fa5\s]){6,20}$/, message: '密码请由6-20位英文字母、数字或者符号组成', trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        introduction: [
          { pattern: /[*]{0,100}/, message: '个人介绍长度不要超过100个字符哦', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '联系方式不能为空！', trigger: 'blur' },
          { pattern: /1[3|5|7|8|]\d{9}/, message: '请输入正确格式的电话号码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱地址不能为空！', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9-._]+@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,6})$/, message: '请输入正确格式的邮箱地址', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    async submit() {
      const { code } = await updateUser(this.account.id, this.account)
      if (code === 20000) {
        this.updateUser()
        this.$message({
          message: '个人资料修改成功！',
          type: 'success',
          duration: 5 * 1000
        })
      }
    },
    getUser() {
      this.account = deepClone(this.user)
    },
    updateUser() {
      this.user.id = this.account.id
      this.user.name = this.account.name
      this.user.password = this.account.password
      this.user.introduction = this.account.introduction
      this.user.phone = this.account.phone
      this.user.email = this.account.email
    }
  }
}
</script>
