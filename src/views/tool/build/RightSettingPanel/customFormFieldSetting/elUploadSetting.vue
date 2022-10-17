<template>
  <div>
    <el-form-item label="文件字段名">
      <el-input v-model="activeData.name" placeholder="请输入上传文件字段名"/>
    </el-form-item>
    <el-form-item label="文件类型">
      <el-select
          v-model="activeData.accept"
          placeholder="请选择文件类型"
          :style="{ width: '100%' }"
          clearable>
        <el-option label="图片" value="image/*"/>
        <el-option label="视频" value="video/*"/>
        <el-option label="音频" value="audio/*"/>
        <el-option label="excel" value=".xls,.xlsx"/>
        <el-option label="word" value=".doc,.docx"/>
        <el-option label="pdf" value=".pdf"/>
        <el-option label="txt" value=".txt"/>
      </el-select>
    </el-form-item>
    <el-form-item label="文件大小">
      <el-input v-model.number="activeData.fileSize" placeholder="请输入文件大小">
        <el-select slot="append" v-model="activeData.sizeUnit" :style="{ width: '66px' }">
          <el-option label="KB" value="KB"/>
          <el-option label="MB" value="MB"/>
          <el-option label="GB" value="GB"/>
        </el-select>
      </el-input>
    </el-form-item>
    <el-form-item label="上传地址">
      <el-input v-model="activeData.action" placeholder="请输入上传地址" clearable/>
    </el-form-item>
    <el-form-item label="列表类型">
      <el-radio-group v-model="activeData['list-type']" size="small">
        <el-radio-button label="text">
          text
        </el-radio-button>
        <el-radio-button label="picture">
          picture
        </el-radio-button>
        <el-radio-button label="picture-card">
          picture-card
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item
        v-show="'picture-card' !== activeData['list-type']"
        label="按钮文字">
      <el-input v-model="activeData.buttonText" placeholder="请输入按钮文字"/>
    </el-form-item>


    <el-form-item v-if="activeData.multiple !== undefined" label="多选文件">
      <el-switch v-model="activeData.multiple"/>
    </el-form-item>
    <el-form-item v-if="activeData['auto-upload'] !== undefined" label="自动上传">
      <el-switch v-model="activeData['auto-upload']"/>
    </el-form-item>
  </div>
</template>
<script>
export default {
  name: 'ElUploadSetting',
  props: {
    activeData: {
      type: Object,
      require: true
    }
  }
}
</script>
