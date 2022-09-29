<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="归属部门" prop="deptId">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30"/>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50"/>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password/>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-form-item label="用户性别">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option
                v-for="dict in CONSTANCE.sex"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
                v-for="dict in CONSTANCE.userStatus"
                :key="dict.value"
                :label="dict.value">{{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-form-item label="岗位">
          <el-select v-model="form.postIds" multiple placeholder="请选择岗位">
            <el-option
                v-for="dict in CONSTANCE.job"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="角色">

        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>

</template>

<script>
import constance from '@/views/components-demo/user/constance'

export default {
  name: 'UserForm',
  mixins: [constance],
  props: {
    form: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      // 表单校验
      rules: {
        userName: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '用户昵称不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '用户密码不能为空', trigger: 'blur' },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    confirm(dialog) {
      console.log('xxx')
      dialog.close()
    },
    test() {
      console.log('test')
    }
  },
  $dialogButton: {
    confirmButton: true,
    cancelButton: false,
    buttons: [
      {
        text: '回退',
        trigger: 'test'
      }
    ]
  }
}
</script>

<style scoped>

</style>
