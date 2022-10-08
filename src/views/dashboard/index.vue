<template>
  <div class="dashboard-container">
    <div class="dashboard-text">登录用户名: {{ name }}</div>

    <el-button @click="openDialog">
      <svg-icon icon-class="dashboard"/>
      嵌套dialog
    </el-button>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  methods: {
    openDialog() {
      const props = { value: 'el-input' }
      const dialog = this.$dialog('el-input', props)
      dialog.show({
        title: '展示一个 el-input 数据同步'
      }, function() {
        const instance = dialog.getComponentInstance()
        instance.$on('input', function(value) {
          props.value = value
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
