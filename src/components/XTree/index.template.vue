<template>
  <div class="bc-filter-object-tree">
    <div class="object-container-header" v-show="!hideSearchBar">
      <label class="fuzzy-search">
        <input type="text" v-model.trim="keywords"
               @keyup.enter="search()"/>
        <span class="bc-query-icon icon"
              @click="search()"></span>
      </label>

      <span class="bc-refresh-icon icon"
            @click="refresh()"></span>
      <span class="bc-brush-icon icon"
            @click="clear()"></span>
    </div>
    <div class="object-container-body" :style="{'top':hideSearchBar?'10px':'40px'}">
      <ul class="bd-object-tree" v-show="!noData && !dataError && !loading">
        <template v-for="node in treeData">
          <TreeNode :node="node"
                    :key="node.objectId"
                    :select-mode="selectMode"
                    :select-object-type="selectObjectType"
                    @update-more="loadMore"
                    @node-click="nodeClick"
                    @node-check="nodeCheck"
                    @update-expanded="expandChange">
            <slot #node></slot>
          </TreeNode>

        </template>
      </ul>

      <div v-show="noData" class="bc-control-info " style="display: none;">
        <span v-once>{{ words.noMatchResult }}</span>
      </div>

      <div v-show="dataError" class="bc-control-error " style="display: none;">
        <span v-once>{{ words.dataErrorTip }}</span>
      </div>

      <div v-show="loading" class="bc-control-loading" style="display: none;">
        <span v-once>{{ words.loadingTip }}</span>
      </div>

    </div>
  </div>
</template>

<script>
export default {}
</script>
