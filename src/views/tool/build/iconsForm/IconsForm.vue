<template>
  <ul class="icon-ul">
    <li
        v-for="icon in iconList"
        :key="icon"
        :class="active===icon?'active-item':''"
        @click="onSelect(icon)">
      <i :class="icon"/>
      <div>{{ icon }}</div>
    </li>
  </ul>
</template>
<script>
import iconList from '@/views/tool/build/iconsForm/icon.json'

const originList = iconList.map(name => `el-icon-${name}`)

export default {
  props: ['current', 'keywords'],
  data() {
    return {
      iconList: originList,
      active: null
    }
  },
  watch: {
    keywords(val) {
      if (val) {
        this.iconList = originList.filter(name => name.indexOf(val) > -1)
      } else {
        this.iconList = originList
      }
    }
  },
  created() {
    this.active = this.current
  },
  methods: {
    onSelect(icon) {
      this.active = icon
      this.$emit('select', icon)
    }
  },
  $dialogClass: ['icon-form-picker']
}
</script>
<style lang="scss">
.icon-form-picker {
  .icon-ul {
    margin: 0;
    padding: 0;
    font-size: 0;

    li {
      list-style-type: none;
      text-align: center;
      font-size: 14px;
      display: inline-block;
      width: 16.66%;
      box-sizing: border-box;
      height: 108px;
      padding: 15px 6px 6px 6px;
      cursor: pointer;
      overflow: hidden;

      &:hover {
        background: #f2f2f2;
      }

      &.active-item {
        background: #e1f3fb;
        color: #7a6df0
      }

      > i {
        font-size: 30px;
        line-height: 50px;
      }
    }
  }

  .el-dialog {
    border-radius: 8px;
    margin-bottom: 0;
    margin-top: 4vh !important;
    display: flex;
    flex-direction: column;
    max-height: 92vh;
    overflow: hidden;
    box-sizing: border-box;

    .el-dialog__header {
      padding-top: 14px;
    }

    .el-dialog__body {
      margin: 0 20px 20px 20px;
      padding: 0;
      overflow: auto;
    }
  }
}
</style>
