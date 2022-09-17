angular.module("PlatformBase").
controller("vTreeController", ["$scope",
  "bizCommon",
  "TreeService",
  "$interval",
  "TipService",
  "BizPageManager",
  "BizControlResolver",
  "I18n",
  "$q",
  "$timeout",
  "Utils",
  function($scope, bizCommon, TreeService, $interval, TipService, BizPageManager, BizControlResolver, I18n, $q,
    $timeout, Utils) {
    var self = this;
    I18n.attachToScope($scope, BizControlResolver.getControlPathName("xTree"));

    function $digest(cb) {
      $timeout(cb, 100);
    }

    void function initConfig() {
      $scope.static = angular.isDefined($scope.static) ? $scope.static : true;
      $scope.vehicleUrl = BizControlResolver.getControlTemplateUrl("xTree",
        $scope.static === true ? "node" : "nodeDynamic");
      $scope.selectMode = angular.isDefined($scope.selectMode) ? $scope.selectMode : "multiple";
      $scope.showIcon = angular.isDefined($scope.showIcon) ? $scope.showIcon : true;
      $scope.showObjectCode = angular.isDefined($scope.showObjectCode) ? $scope.showObjectCode : true;
      $scope.sync = angular.isDefined($scope.sync) ? $scope.sync : true;
      $scope.outerDisabled = angular.isDefined($scope.outerDisabled) ? $scope.outerDisabled : false;
      $scope.selectLeaves = $scope.selectLeaves || [];
      $scope.selectBranches = $scope.selectBranches || [];
      $scope.selectNodes = $scope.selectNodes || [];
      $scope.initParams = $scope.initParams || {};
      $scope.queryKeywords = "";
      $scope.lastSearchKeyWords = "";
      $scope.loading = true;
      $scope.api = $scope.api || {};
      $scope.searchFieldName = $scope.searchFieldName || "keywords";
      if (angular.isDefined($scope.selectId) && !angular.isDefined($scope.initIds)) {
        $scope.initIds = $scope.selectId;
      }

      $scope.api.findNodeById = function(id) {
        return self.vm.$findNode({objectId: id});
      };
      $scope.api.refreshTreeData = function(restoreSingleSelectState, ifDeletedRestoreParent) {
        var selectId = false;
        var selectNode = $scope.selectNode;
        if (restoreSingleSelectState && $scope.selectMode === "single" && $scope.selectId) {
          selectId = $scope.selectId;
          if (ifDeletedRestoreParent) {
            selectId = selectNode.parentNode.objectId;
          }
        }
        self.clearSelectResult();
        self.getTreeData(function() {
          if (restoreSingleSelectState && selectId) {
            var $findNode = $scope.api.findNodeById(selectId);
            if ($findNode) {
              self.vm.nodeClick($findNode);
            }
          }
        });
      };

      $scope.api.clearSelectResult = function() {
        self.clearSelectResult();
      };

      //展开某个节点
      $scope.api.loadNodes = function(node) {
        var $findNode = $scope.api.findNodeById(node.objectId);
        self.vm.$set($findNode, "expanded", !node.expanded);
      };

      //展开全部节点
      $scope.api.expandAllNodes = function() {
      };

    }();

    void function initApi() {
      var eventEmitter = self.eventEmitter = new EventEmitter();
      if (angular.isFunction($scope.onApi)) {
        $timeout(function() {
          $scope.api.eventEmitter = eventEmitter;
          $scope.onApi();
        });
      }
    }();
    void function initNodePromise() {
      var dtd = $q.defer();
      $scope.nodePromise = $scope.nodePromise || function() {
        $timeout(function() {
          dtd.resolve([{
            "parentId": "0fbc56b2836c408b8385ca2ad0a515c8",
            "objectName": "请初始化 nodePromise",
            "objectId": "808D3A23D3D54038B1B42EA9BFFB8327",
            "children": [],
            "onlineCount": "0",
            "objectCount": "0",
            "objectType": "Org"
          }]);
        });
        return dtd.promise;
      };

      $scope.nodePromise = Utils.promiseVersionControl($scope.nodePromise);

    }();

    self.checkKeywords = function(keywords) {
      if (keywords.length >= 2) {
        return true;
      } else {
        TipService.addTip($scope.words.queryKeywordsTip.replace("3", "2"), "warning", false);
        return false;
      }
    };

    self.exeNodeAppendixFn = function(node) {
      if ($scope.iconNs && node.objectType) {
        var objectType = node.objectType;
        var cls = TreeService.getNodeIconByObjectType($scope.iconNs, objectType);
        //增加子类型的图标
        if (angular.isNumber(node.nodeDataType) || angular.isString(node.nodeDataType)) {
          var clsSub = TreeService.getNodeIconByObjectType($scope.iconNs,
            [objectType, node.nodeDataType].join(""));
          if (clsSub != "es-bc-info-icon") {
            cls = clsSub;
          }
        }
        if (cls) {
          node.iconCls = cls;
        }
      }
      if (angular.isFunction($scope.nodeAppendixFn)) {
        node._appendixValue = $scope.nodeAppendixFn(node);
      }

      if (angular.isFunction($scope.nodeAppendixIconFn)) {
        node._appendixIcon = $scope.nodeAppendixIconFn(node);
      }
      return node;
    };

    //获取车辆节点数据
    self.getTreeData = function(cb, vm) {
      vm.loading = true;
      var params = self.resetParams(vm);
      $scope.nodePromise(params).then(function(data) {
        var vehicleData = TreeService.structureTreeData(data, null);
        var node = data[0];
        vm.noData = !node;
        vm.loading = false;
        vm.dataError = false;
        vm.vehicleDataError = false;
        cb && cb(vehicleData);
      }, function() {
        vm.dataError = true;
        vm.loading = false;
      });
    };

    self.resetParams = function(vm) {
      var keywords = vm.keywords || "";
      var params = {};
      keywords = keywords.trim();
      if (keywords != "") {
        params[$scope.searchFieldName] = keywords;
        vm.isSearched = true;
      } else {
        vm.isSearched = false;
      }
      if ($scope.initParams) {
        _.extend(params, $scope.initParams);
      }
      return params;
    };

    self.restoreSelection = function(findInVm, $set) {
      var i = 0, $node;
      if ($scope.selectNode) {
        $set(findInVm($scope.selectNode), "selected", true);
      } else {
        for (i = 0; i < $scope.selectNodes.length; i++) {
          $node = findInVm($scope.selectNodes[i]);
          $set($node, "selected", true);
          self.changeNodeHierarchyLineStatus($node, findInVm, $set);
        }
      }
    };

    //清除所有选择的节点
    self.clearSelectResult = function(findInVm, $set) {
      $digest(function() {
        $scope.selectLeaves = [];
        $scope.selectBranches = [];
        $scope.selectNodes = [];
        $scope.selectNode = null;
        $scope.selectId = "";
        $scope.selectLeaveIds = "";
        $scope.selectBranchIds = "";
        self.eventEmitter.trigger("clear");
      });
    };

    self.synSingleSelection = function(node, isSearched) {
      $digest(function() {
        $scope.selectNode = node;
        $scope.selectId = node.objectId;
        $scope.selectNodes = [];
        $scope.selectNodes.push(node);
        $scope.isSearched = isSearched;
      });
    };

    self.synMultiSelection = function(vehicleData, isSearched) {
      var selection = TreeService.getSyncSelectedBranchesAndLeaves(vehicleData);
      var selectBranches = [];
      var selectLeaves = [];
      var selectNodes = [];
      _.each(selection.branches || [], function(node) {
        selectBranches.push(node);
        selectNodes.push(node);
      });

      _.each(selection.leaves || [], function(node) {
        selectLeaves.push(node);
        selectNodes.push(node);
      });

      function idMapper(nodes) {
        return _.map(nodes, function(node) {
          return node.objectId;
        });
      }

      $digest(function() {
        $scope.selectLeaves = selectLeaves;
        $scope.selectBranches = selectBranches;
        $scope.selectNodes = selectNodes;
        $scope.selectLeaveIds = idMapper(selectLeaves).join(",");
        $scope.selectBranchIds = idMapper(selectBranches).join(",");
        $scope.isSearched = isSearched;
      });
    };

    self.updateChildrenSelectState = function(objects, selected, findInVm, $set) {
      var i = 0, ln = objects.length, object;
      for (; i < ln; i++) {
        object = findInVm(objects[i]);
        $set(object, "selected", selected);
        $set(object, "checkState", selected ? 2 : 0);
        object.children && this.updateChildrenSelectState(object.children, selected, findInVm, $set);
      }
    };

    self.changeNodeHierarchyLineStatus = function(node, findInVm, $set) {
      var parent = node.parentNode, selectedLn, $parent;
      $set(findInVm(node), "checkState", node.selected ? 2 : 0);
      // 修改父级状态
      while (parent) {
        $parent = findInVm(parent);
        selectedLn = getSelectedChildrenSize(parent);
        if (selectedLn == parent.children.length) {
          $set($parent, "selected", true);
          $set($parent, "checkState", 2);
        } else if (selectedLn == 0) {
          $set($parent, "selected", false);
          $set($parent, "checkState", 0);
        } else if (selectedLn < parent.children.length) {
          $set($parent, "selected", false);
          $set($parent, "checkState", 1);
        }
        parent = parent.parentNode;
      }

      // 修改子孙状态
      if (node.children && node.children.length) {
        self.updateChildrenSelectState(node.children, node.selected, findInVm, $set);
      }

      function getSelectedChildrenSize(parent) {
        var children = parent.children, ln = children.length, i = 0, rs = 0;
        for (; i < ln; i++) {
          if (children[i].selected) {
            rs++;
          }else if(children[i].checkState==1){
            rs=rs+0.5
          }
        }
        return rs;
      }
    };

  }]);
