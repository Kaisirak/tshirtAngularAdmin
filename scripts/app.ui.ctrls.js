angular.module("app.ui.ctrls", [])
.controller("NotifyCtrl", ["$scope", "logger",
function($scope, logger) {
  $scope.notify = function(type) {
    switch (type) {
      case "info": return logger.log("Heads up! This alert needs your attention, but it's not super important.");
      case "success": return logger.logSuccess("Well done! You successfully read this important alert message.");
      case "warning": return logger.logWarning("Warning! Best check yo self, you're not looking too good.");
      case "error": return logger.logError("Oh snap! Change a few things up and try submitting again.");
      case "addedrole": return logger.log("A new role has been added.");
      case "changedrole": return logger.log("Changed user role.");
      case "addeduser": return logger.log("Added a user.");
      case "addedelem": return logger.log("Added a Table Entry");
      case "editedelem": return logger.log("Modified a Table Entry");
      case "loginerror": return logger.logError("Login or password not found");
    }
  };

  $scope.$on('loginerror', function(event, args){
    $scope.notify('loginerror');
  });
}])
.controller("AlertDemoCtrl", ["$scope",
function($scope) {
  return $scope.alerts = [{type: "success", msg: "Well done! You successfully read this important alert message."},
                          {type: "info",msg: "Heads up! This alert needs your attention, but it is not super important."},
                          {type: "warning",msg: "Warning! Best check yo self, you're not looking too good."},
                          {type: "danger",msg: "Oh snap! Change a few things up and try submitting again."}
                        ],
  $scope.addAlert = function() {
    var num, type;
    switch (num = Math.ceil(4 * Math.random()), type = void 0, num) {
      case 0: type = "info";
      break;
      case 1: type = "success";
      break;
      case 2: type = "info";
      break;
      case 3: type = "warning";
      break;
      case 4: type = "danger"
    }
    return $scope.alerts.push({type: type, msg: "Another alert!"})
  },
  $scope.closeAlert = function(index) {
    return $scope.alerts.splice(index, 1)
  }
}])
.controller("ProgressDemoCtrl", ["$scope",
function($scope) {
  return $scope.max = 200, $scope.random = function() {
    var type, value;
    value = Math.floor(100 * Math.random() + 10), type = void 0, type = 25 > value ? "success" : 50 > value ? "info" : 75 > value ? "warning" :
    "danger", $scope.showWarning = "danger" === type || "warning" === type, $scope.dynamic = value, $scope.type = type
  },
  $scope.random()
}])

.controller("AccordionDemoCtrl", ["$scope",
function($scope) {
  $scope.oneAtATime = !0, $scope.groups = [{
    title: "Dynamic Group Header - 1",
    content: "Dynamic Group Body - 1"
  },
  {
    title: "Dynamic Group Header - 2",
    content: "Dynamic Group Body - 2"
  },
  {
    title: "Dynamic Group Header - 3",
    content: "Dynamic Group Body - 3"
  }], $scope.items = ["Item 1", "Item 2", "Item 3"], $scope.addItem = function() {
    var newItemNo;
    newItemNo = $scope.items.length + 1, $scope.items.push("Item " + newItemNo)
  }
}])

.controller("CollapseDemoCtrl", ["$scope",
function($scope) {
  return $scope.isCollapsed = !1
}])

.controller("RoleCtrl", ["$scope", "$http", "$modal", "$log", "$filter",
function($scope, $http, $modal, $log, $filter) {
  $scope.userList = [];
  $scope.userListPending = [];
  $scope.roleList = [];
  $scope.newUserEmail = {mail: ''};

  $scope.getUserListPending = function(){
    $http.get('/api/site/invitations').then(
      function(response){
        $scope.userListPending = response.data.result;
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.removePendingUser = function(idToRemove){
    $http.post('/api/site/uninvite', {id: idToRemove}).then(
      function(response){
        var indexToRemove = 0;
        for (var i = 0; i < $scope.userListPending.length && idToRemove != $scope.userListPending[i].id; i++)
        {
          indexToRemove++;
        }
        $scope.userListPending.splice(indexToRemove, 1);
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.getUserList = function(){
    $http.get('/api/clientaccount').then(
      function(response){
        for (var i = 0; i < response.data.result.length; i++)
        {
          $http.get('/api/acl/association/' + response.data.result[i].id).then(
            function(responseUser){
              $scope.userList.push(responseUser.data.result);
            },
            function(error){
              console.log(error);
            }
          );
        }
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.getRoleList = function(){
    $http.get('/api/acl/role').then(
      function(response){
        $scope.roleList = response.data.result;
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.findRole = function(roleToFind) {
    var rolefound = $filter('filter')($scope.roleList, function(arrayToCheck) {return arrayToCheck.id == roleToFind;})[0];
    return (rolefound != null ? $scope.translateName(rolefound) : "Undefined Role");
  };

  $scope.translateName = function(objToTranslate){
    return(objToTranslate.name);
  };

  $scope.translateRights = function(objToTranslate){
    if (objToTranslate.categories['order'].access == true &&
      objToTranslate.categories['content'].access == true &&
      objToTranslate.categories['customer'].access == true &&
      objToTranslate.categories['marketing'].access == true &&
      objToTranslate.categories['merchandise'].access == true &&
      objToTranslate.categories['setting'].access == true &&
      objToTranslate.categories['theme'].access == true)
      return ("Full Access");
    else if (objToTranslate.categories['order'].access == false &&
      objToTranslate.categories['content'].access == false &&
      objToTranslate.categories['customer'].access == false &&
      objToTranslate.categories['marketing'].access == false &&
      objToTranslate.categories['merchandise'].access == false &&
      objToTranslate.categories['setting'].access == false &&
      objToTranslate.categories['theme'].access == false)
      return ("No Access (Not Set Yet)");
    else
      return ("Not Yet Defined Role");
  };

  $scope.addUser = function(useremail) {
    $http.post('/api/site/invite', {email: useremail}).then(
      function(response){
        $scope.userListPending.push({email: useremail, id: response.data.result, date_created: "Just Sent..."});
        $scope.newUserEmail.mail = '';
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.openNewRole = function() {
    var modalInstance = $modal.open({
      templateUrl: "modalNewRole.html",
      controller: "ModalNewRoleCtrl"
    });
    modalInstance.result.then(function(usertoadd) {
      $http.post('/api/acl/role', {name: usertoadd}).then(
        function(response){
          $http.get('/api/acl/role/' + response.data.result).then(
            function(responseUser){
              console.log(responseUser);
              $scope.roleList.push(responseUser.data.result[0]);
              //{id: response.data.result, name: usertoadd, date_created: Date(), date_modified: Date(), categories: {content: {access: true, id: 3}}}
            },
            function(error){
              console.log(error);
            }
          );
        },
        function(error){
          console.log(error);
        }
      );
    }, function() {
      console.log("Cancelled Adding New Role");
    });
  };

  $scope.openRights = function(role) {
    var modalInstance = $modal.open({
      templateUrl: "modalUserRights.html",
      controller: "ModalUserRightsCtrl",
      resolve: {
        selectedRole: function() {
          return role;
        }
      }
    });
  };

  $scope.openUserRole = function(user) {
    var modalInstance = $modal.open({
      templateUrl: "modalUserRole.html",
      controller: "ModalUserRoleCtrl",
      resolve: {
        selectedUser: function() {
          return user;
        },
        modalRoleList: function() {
          return $scope.roleList;
        }
      }
    });
    modalInstance.result.then(
      function(changedrole) {
        $http.post('/api/acl/updateuser', {role_id: changedrole, user_id: user.user_id}).then(
          function(response){
            user.role_id = changedrole;
          },
          function(error){
            console.log(error);
          }
        );
      },
      function(error) {
        console.log(error);
      }
    );
  };
  
  $scope.deleteRole = function(roleToDelete) {
    $http.delete('/api/acl/' + roleToDelete.id).then(
      function(response){
        var indexToRemove = 0;
        for (var j = 0; j < $scope.userList.length; j++)
        {
          if (roleToDelete.id == $scope.userList[j].role_id); //$scope.userList[j].role = 0;
        }
        for (var i = 0; i < $scope.roleList.length && roleToDelete.id != $scope.roleList[i].id; i++)
        {
          indexToRemove++;
        }
        $scope.roleList.splice(indexToRemove, 1);
      },
      function(error){
        console.log(error);
      }
    );
  };
}])

.controller("ModalUserRightsCtrl", ["$scope", "$http", "$modalInstance", "selectedRole",
function($scope, $http, $modalInstance, selectedRole) {
  $scope.role = selectedRole;
  $scope.modules = {setting: {name: "Settings", icon: "fa-cogs", iconcolor: "btn-primary", toggledOnAccess: false},
                    theme: {name: "Themes", icon: "fa-file-image-o", iconcolor: "btn-success", toggledOnAccess: false},
                    content: {name: "Site Content", icon: "fa-newspaper-o", iconcolor: "btn-success", toggledOnAccess: false},
                    merchandise: {name: "Merchandise", icon: "fa-gift", iconcolor: "btn-warning", toggledOnAccess: false},
                    order: {name: "Orders", icon: "fa-money", iconcolor: "btn-danger", toggledOnAccess: false},
                    marketing: {name: "Marketing", icon: "fa-pie-chart", iconcolor: "btn-warning", toggledOnAccess: false},
                    customer: {name: "Customers", icon: "fa-users", iconcolor: "btn-primary", toggledOnAccess: false}
                  };
  console.log($scope.role);
  angular.forEach($scope.modules, function(value, key) {
    $scope.modules[key].toggledOnAccess = $scope.role.categories[key].access;
  });

  $scope.modulesToArray = function() {
    var moduleArray = [];

    angular.forEach($scope.modules, function(value, key) {
      if ($scope.modules[key].toggledOnAccess == false)
        moduleArray.push(key);
    });
    return moduleArray;
  };

  $scope.ok = function() {
    $http.post('/api/acl/rules/create', {role_id: $scope.role.id, rights: $scope.modulesToArray()}).then(
      function(response){

      },
      function(error){
        console.log(error);
      }
    );
    angular.forEach($scope.modules, function(value, key) {
      $scope.role.categories[key].access = $scope.modules[key].toggledOnAccess;
    });
    $modalInstance.close($scope.role);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss("cancel")
  };
  $scope.toggleAccess = function(instanceNb) {
    $scope.modules[instanceNb].toggledOnAccess = !$scope.modules[instanceNb].toggledOnAccess;
  };
}])

.controller("ModalNewRoleCtrl", ["$scope", "$modalInstance",
function($scope, $modalInstance) {
  $scope.maname = '';
  $scope.addRole = function(rolename) {
    $scope.maname = rolename;
    $modalInstance.close($scope.maname);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss("cancel")
  };
}])

.controller("ModalUserRoleCtrl", ["$scope", "$modalInstance", "selectedUser", "modalRoleList",
function($scope, $modalInstance, selectedUser, modalRoleList) {
  $scope.modalUser = selectedUser;
  $scope.newRole = $scope.modalUser.role_id;
  $scope.modalRoleList = modalRoleList;
  $scope.saveRole = function(newrole) {
    $modalInstance.close(newrole);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss("cancel")
  };
}])

.controller("PaginationDemoCtrl", ["$scope",
function($scope) {
  return $scope.totalItems = 64, $scope.currentPage = 4, $scope.maxSize = 5, $scope.setPage = function(pageNo) {
    return $scope.currentPage = pageNo
  },
  $scope.bigTotalItems = 175, $scope.bigCurrentPage = 1
}])
.controller("TabsDemoCtrl", ["$scope",
function($scope) {
  return $scope.tabs = [], $scope.navType = "pills"
}
])
.controller("TreeDemoCtrl", ["$scope",
function($scope) {
  return $scope.list = [  {id: 1,title: "Item 1",items: []},
                          {id: 2,title: "Item 2",items: [{id: 21,title: "Item 2.1",items: [{id: 211,title: "Item 2.1.1",items: []},{id: 212,title: "Item 2.1.2",items: []}]},{id: 22,title: "Item 2.2",items: [{id: 221,title: "Item 2.2.1",items: []},{id: 222,title: "Item 2.2.2",items: []}]}]},
                          {id: 3,title: "Item 3",items: []},
                          {id: 4,title: "Item 4", items: [{id: 41,title: "Item 4.1",items: []}]},
                          {id: 5,title: "Item 5",items: []},
                          {id: 6,title: "Item 6",items: []},
                          {id: 7,title: "Item 7", items: []}
                        ],
  $scope.selectedItem = {},
  $scope.options = {},
  $scope.remove = function(scope) {
    scope.remove()
  },
  $scope.toggle = function(scope) {
    scope.toggle()
  },
  $scope.newSubItem = function(scope) {
    var nodeData;
    nodeData = scope.$modelValue, nodeData.items.push({
      id: 10 * nodeData.id + nodeData.items.length,
      title: nodeData.title + "." + (nodeData.items.length + 1),
      items: []
    })
  }
}
])
.controller("MapDemoCtrl", ["$scope", "$http", "$interval",
function($scope, $http, $interval) {
  var i, markers;
  for (markers = [], i = 0; 8 > i;) markers[i] = new google.maps.Marker({
    title: "Marker: " + i
  }), i++;
  $scope.GenerateMapMarkers = function() {
    var d, lat, lng, loc, numMarkers;
    for (d = new Date, $scope.date = d.toLocaleString(), numMarkers = Math.floor(4 * Math.random()) + 4, i = 0; numMarkers > i;) lat = 43.66 + Math.random() /
      100, lng = -79.4103 + Math.random() / 100, loc = new google.maps.LatLng(lat, lng), markers[i].setPosition(loc), markers[i].setMap($scope.map),
      i++
    },
    $interval($scope.GenerateMapMarkers, 2e3)
  }]);
