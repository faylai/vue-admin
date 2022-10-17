<template>
  <div>
    <ListOptionEditor :activeData="activeData"></ListOptionEditor>
  </div>
</template>
<script>
import ListOptionEditor from './components/ListOptionEditor'

export default {
  name: 'ElSelectSetting',
  components: {
    ListOptionEditor
  },
  props: {
    activeData: {
      type: Object,
      require: true
    }
  }
}
</script>
