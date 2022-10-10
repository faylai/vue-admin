<template>
  <el-row :gutter="15">
    <el-form
        ref="elForm"
        :model="formData"
        :rules="rules"
        size="medium"
        label-width="100px">
      <el-col :span="24">
        <el-form-item label="生成类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio
                v-for="(item, index) in typeOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="showFileName" label="文件名" prop="fileName">
          <el-input v-model="formData.fileName" placeholder="请输入文件名" clearable/>
        </el-form-item>
      </el-col>
    </el-form>
  </el-row>
</template>
<script>
export default {
  inheritAttrs: false,
  props: ['showFileName'],
  data() {
    return {
      formData: {
        fileName: undefined,
        type: 'file'
      },
      rules: {
        fileName: [{
          required: true,
          message: '请输入文件名',
          trigger: 'blur'
        }],
        type: [{
          required: true,
          message: '生成类型不能为空',
          trigger: 'change'
        }]
      },
      typeOptions: [{
        label: '页面',
        value: 'file'
      }, {
        label: '弹窗',
        value: 'dialog'
      }]
    }
  },
  mounted() {
    if (this.showFileName) {
      this.formData.fileName = `${+new Date()}.vue`
    }
  },
  methods: {
    confirm(dialog) {
      this.$refs.elForm.validate(valid => {
        if (!valid) return
        this.$emit('confirm', { ...this.formData })
        dialog.close()
      })
    }
  },
  $dialogButton: {
    confirmButton: true,
    cancelButton: true
  }
}
</script>
