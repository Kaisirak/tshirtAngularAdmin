angular.module("app.tables", [])

/********************************/
/* MODULAR TABLES DYNAMIC TEST  */
/********************************/

.controller("TablesCtrl", ["$scope", "$filter", "$http", "$modal", "$sce", "$rootScope",
  function($scope, $filter, $http, $modal, $sce, $rootScope) {
  var init;

  $scope.loaded = false;
  $scope.tableName = "";
  $scope.allProperties = [""];
  $scope.editableProperties = [{}];
  $scope.content =  [];
  $scope.displayOnly = false;
  $scope.customOrder = false;

/*
  $scope.allProperties = [""];
  $scope.editableProperties = [{}];
  $scope.content =  [ {id: 3, ip: "654.367.6.59", address: "acnnbenda.com", date: "12-01-2014", name: "gfgrte", subject: "thet subject", category: "Thintertesit on", position: "up", brand: "brandname", carriedMethod: "UPS", title: "gfgrte", publish: "no", slug: "someslug", registryName: "rewew33r", productId: "SOFA34", productName: "Big Sofa", code:"LEL54", firstName:"Henri", lastName:"Golo", fullName: "Henri Golo the First", email: "golo.henri@lol.com", eventDate:"12-32-1234", privacy: "yes", itemCount: 7, status: "Updated", orderNumber: "RE425", fraudCheck: "yes", returnsPending: "yes", unsettled: "true", total: 1346 , active: "yes", date_modified: "12-03-2014"},
                      {id: 4, ip: "65.367.6.59", address: "ac65nnbenda.com", date: "12-05-2014", name: "g6666te", subject: "th8et subject", category: "T99tertesit on", position: "uiuyp", brand: "briiandname", carriedMethod: "UPSS", title: "gfgrrwete", publish: "yes", slug: "someslug", registryName: "rewtew33r", productId: "SOFA2", productName: "Small Sofa", code:"LEL54", firstName:"Hefff", lastName:"Gfffolo", fullName: "Henfflo the Second", email: "golo.hengggri@lol.com", eventDate:"12-04-2234", privacy: "yes", itemCount: 9, status: "Updated", orderNumber: "RE625", fraudCheck: "yes", returnsPending: "yes", unsettled: "false", total: 1346 , active: "yes", date_modified: "12-03-2014"}
                    ];

  // *** END GET DATA FROM API CALL ***/

  $scope.searchKeywords = "";
  $scope.filteredStores = [];
  $scope.row = "";

/*  $scope.$on("newtoken", function(event, req)
  {
    req.url = req.url.match(/.+(?=\?)/g)[0];
    $http.get(req.url).then(
      function(response) {
        if (response.data)
          $scope.content = angular.copy(response.data.result);
        $scope.search();
      },
      function(error){
        console.log(error);
      }
    );
  }); */

  $scope.export = function(exportType){
    var hiddenElement = document.createElement('a');

    if (exportType == 'csv')
    {
      hiddenElement.href = 'data:attachment/csv,' + encodeURI($scope.convertToCSV($scope.content));
      hiddenElement.download = 'exported' + $scope.tableName + 'CSV.csv';
    }
    else if (exportType == 'json')
    {
      hiddenElement.href = 'data:attachment/json,' + encodeURI(angular.toJson($scope.content, true));
      hiddenElement.download = 'exported' + $scope.tableName + 'JSON.json';
    }
    hiddenElement.target = '_blank';
    hiddenElement.click();
  };

  $scope.convertToCSV = function(objArray){
    var str = '';

    if (objArray.length == 0 || objArray.length == 'undefined')
      return str;
    for (var index in objArray[0])
    {
      if (index == '$$hashKey')
        {
          str = str.slice(0, str.length - 1);
          str += '\r\n';
        }
      else
      {
        var isMultiWord = index.match(/\S+/gm);
        if (isMultiWord && isMultiWord.length > 1)
          str += '"';
        str += index;
        if (isMultiWord && isMultiWord.length > 1)
          str += '"';
        str += ',';
      }
    }
    for (var i = 0; i < objArray.length; i++)
    {
      for (var index in objArray[i])
      {
        if (index == '$$hashKey')
        {
          str = str.slice(0, str.length - 1);
          str += '\r\n';
        }
        else
        {
          var isMultiWord = true;
          var myprop = objArray[i][index].toString().match(/\S+/gm);
          if (myprop && myprop.length == 1)
            isMultiWord = false;
          if (isMultiWord)
            str += '"';
          str += objArray[i][index];
          if (isMultiWord)
            str += '"';
          str += ',';
        }
      }
    }
    return str;
  };

  $scope.select = function(page) {
    var end, start;
    return start = (page - 1) * $scope.numPerPage,
    end = start + $scope.numPerPage,
    $scope.currentPageStores = $scope.filteredStores.slice(start, end)
  };
  $scope.setTableName = function(name) {
    $scope.tableName = name;
  };
  $scope.displayContent = function(mystore, myproperty){
    if (myproperty == 'date_modified' || myproperty == 'date_created')
      return ($filter('date')(mystore[myproperty], "MM-dd-yyyy 'at' h:mma", 'UTC'));
    else if (myproperty == 'returnsPending')
      return ($filter('date')(mystore[myproperty], "MMMM-dd-yyyy", 'UTC'));
    else
      return (mystore[myproperty]);
  };
  $scope.setDisplayOnly = function(){
      $scope.displayOnly = true;
  };

  $scope.setCustomOrder = function(){
    $scope.customOrder = true;
  };

  $scope.setContent = function(){
    $http.get('/api/' + $scope.tableName).then(
      function(response) {
        // SET CONTENT
        //console.log(response);
        if (response.data.code == 400 && response.data.status == "Bad Request")
          console.log(response.data.error);
        else if (response.data.code == 200)
        {
          $scope.content = angular.copy(response.data.result);
          $scope.loaded = true;
        }
        //REFRESH TABLE
        $scope.search();
      },
      function(error){
        console.log(error);
        $scope.loaded = true;
      }
    );

  };
  $scope.setAllProperties = function(props) {
    $scope.allProperties = props;
  };
  $scope.setEditableProperties = function(props) {
    $scope.editableProperties = props;
  };
  $scope.onFilterChange = function() {
    return $scope.select(1),
    $scope.currentPage = 1,
    $scope.row = ""
  };
  $scope.onNumPerPageChange = function() {
    return $scope.select(1),
    $scope.currentPage = 1
  };
  $scope.onOrderChange = function() {
    return $scope.select(1),
    $scope.currentPage = 1
  };
  $scope.search = function() {
    return $scope.filteredStores = $filter("filter")($scope.content, $scope.searchKeywords),
    $scope.onFilterChange()
  };
  $scope.order = function(rowName) {
    return $scope.row !== rowName ? ($scope.row = rowName, $scope.filteredStores = $filter("orderBy")($scope.content, rowName), $scope.onOrderChange()) :
    void 0
  };
  $scope.openNewElem = function() {
    var modalInstance = $modal.open({
      templateUrl: "modalNewElem.html",
      controller: "ModalNewElemCtrl",
      size: "lg",
      resolve: {
        canEdit: function(){
          return($scope.editableProperties)
        }
      }
    });
    modalInstance.result.then(
      function(newelem) {
        $http.post('/api/' + $scope.tableName, newelem).then(
          function(response) {

            newelem.id = response.data.result;
            $scope.content.push(newelem);
            $scope.search();
            },
            function(error){
              console.log(error);
            }
        );
      },
      function() {
        console.log("Cancelled Adding New Elem");
      }
    );
  };
  $scope.openEditElem = function(elemToEdit) {
    var modalInstance = $modal.open({
      templateUrl: "modalEditElem.html",
      controller: "ModalEditElemCtrl",
      size: "lg",
      resolve: {
        modalElemToEdit: function(){
          return(elemToEdit)
        },
        canEdit: function(){
          return($scope.editableProperties)
        }
      }
    });
    modalInstance.result.then(
        function(editedElem) {

          $http.put('/api/' + $scope.tableName + '/' + editedElem.id, editedElem).then(
            function(response) {
              var indexToEdit = 0;
              for (var i = 0; i < $scope.content.length && editedElem.id != $scope.content[i].id; i++)
                indexToEdit++;
              $scope.content[indexToEdit] = editedElem;

              indexToEdit = 0;
              for (var i = 0; i < $scope.currentPageStores.length && editedElem.id != $scope.currentPageStores[i].id; i++)
                indexToEdit++;
              $scope.currentPageStores[indexToEdit] = editedElem;

              indexToEdit = 0;
              for (var i = 0; i < $scope.filteredStores.length && editedElem.id != $scope.filteredStores[i].id; i++)
                indexToEdit++;
              $scope.filteredStores[indexToEdit] = editedElem;
            },
            function(error){
              console.log(error);
            }
          );
        },
        function() {
          console.log("Cancelled Editing Elem");
        }
      );
    };
    $scope.order = function(rowName) {
      return $scope.row !== rowName ? ($scope.row = rowName, $scope.filteredStores = $filter("orderBy")($scope.content, rowName), $scope.onOrderChange()) :
      void 0
    };
    $scope.removeElem = function(idToRemove){
      $http.delete('/api/' + $scope.tableName + '/' + idToRemove).then(
        function(response) {

          var indexToRemove = 0;
          for (var i = 0; i < $scope.content.length && idToRemove != $scope.content[i].id; i++) {
            indexToRemove++;
          }
          $scope.content.splice(indexToRemove, 1);

          indexToRemove = 0;
          for (var i = 0; i < $scope.currentPageStores.length && idToRemove != $scope.currentPageStores[i].id; i++) {
            indexToRemove++;
          }
          $scope.currentPageStores.splice(indexToRemove, 1);

          indexToRemove = 0;
          for (var i = 0; i < $scope.filteredStores.length && idToRemove != $scope.filteredStores[i].id; i++) {
            indexToRemove++;
          }
          $scope.filteredStores.splice(indexToRemove, 1);
        },
        function(error){
          console.log(error);
        }
      );
    };
    $scope.numPerPageOpt = [3, 5, 10, 20],
    $scope.numPerPage = $scope.numPerPageOpt[2],
    $scope.currentPage = 1,
    $scope.currentPageStores = [],
    $scope.$watch("content.length", function(newVal) {
      return $rootScope.$broadcast($scope.tableName + ":changed", newVal)
    }),
    (init = function() {
      return $scope.search(),
      $scope.select($scope.currentPage)
    })()
}])

.controller("ModalNewElemCtrl", ["$scope", "$modalInstance", "canEdit",
  function($scope, $modalInstance, canEdit) {
    $scope.editableProperties = canEdit;
    $scope.elemToAdd = {};
    $scope.addNewElem = function() {
      $scope.elemToAdd.date_modified = new Date();
      $scope.elemToAdd.date_created = new Date();
      $modalInstance.close($scope.elemToAdd);
    };
    $scope.cancel = function() {
      $modalInstance.dismiss("cancel")
    };
    $scope.addFrom = function(property){
      $scope.elemToAdd[property] = parseInt($scope.elemToAdd[property], 10) + 1;
    };
    $scope.subFrom = function(property){
      $scope.elemToAdd[property] = parseInt($scope.elemToAdd[property], 10) - 1;
    };
  }
])

.controller("ModalEditElemCtrl", ["$scope", "$modalInstance", "modalElemToEdit", "canEdit",
  function($scope, $modalInstance, modalElemToEdit, canEdit) {
    $scope.editableProperties = canEdit;
    $scope.newEditedElem = angular.copy(modalElemToEdit);
    for (var i = 0; i < $scope.editableProperties.length; i++)
      $scope.newEditedElem[$scope.editableProperties[i].name] = angular.copy(modalElemToEdit[$scope.editableProperties[i].name]);
    $scope.saveElem = function(){
      $scope.newEditedElem.date_modified = new Date();
      $modalInstance.close($scope.newEditedElem);
    };
    $scope.addFrom = function(property){
      $scope.newEditedElem[property] = parseInt($scope.newEditedElem[property], 10) + 1;
    };
    $scope.subFrom = function(property){
      $scope.newEditedElem[property] = parseInt($scope.newEditedElem[property], 10) - 1;
    };
    $scope.cancel = function() {
      $modalInstance.dismiss("cancel");
    };
  }
])

/********************************/
/* MODULAR TABLES DYNAMIC END   */
/********************************/

// THEME CONTROLLERS

.controller("MyThemesCtrl", ["$scope", "$http", "$filter", "$modal", "$location",
function($scope, $http, $filter, $modal, $location) {
  $scope.myThemes = [];

  $scope.openEditTheme = function(clickedID) {
    $location.path('/themes/mythemes/edit/' + clickedID);
  };

  $scope.getThemes = function(){
    $http.get('/api/theme').then(
      function(response){
        $scope.myThemes = response.data.result;
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.removeTheme = function(clickedID){
    $http.delete('/api/theme/' + clickedID).then(
      function(response){
        var indexToRemove = 0;
        for (var i = 0; i < $scope.myThemes.length && clickedID != $scope.myThemes[i].id; i++)
          indexToRemove++;
        $scope.myThemes.splice(indexToRemove, 1);
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.resetTheme = function(clickedObj){
    clickedObj.loading = true;
    $http.post('/api/theme/reset', {theme_store_id: clickedObj.id}).then(
      function(response){
        clickedObj.loading = false;
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.setTheme = function(clickedID){
    $http.post('/api/theme/setcurrenttheme', {theme_store_id: clickedID}).then(
      function(response){
        //console.log(response);
        for (var i = 0; i < $scope.myThemes.length; i++)
        {
          if ($scope.myThemes[i].id != clickedID)
            $scope.myThemes[i].current = false;
          else
            $scope.myThemes[i].current = true;
        }
      },
      function(error){
        console.log(error);
      }
    );
  };

}])

.controller("ThemeStoreCtrl", ["$scope", "$http", "$filter", "$modal",
function($scope, $http, $filter, $modal) {
  $scope.themeList = [];

  $scope.installTheme = function(clickedObj){
    clickedObj.loading = true;
    $http.post('/api/theme/download', {theme_store_id: clickedObj.id}).then(
      function(response){
        clickedObj.is_downloaded = true;
        clickedObj.loading = false;
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.getThemeStore = function(){
    $http.get('/api/theme').then(
      function(responseTheme){

        var downloaded_themes = [];
        for (var i = 0; i < responseTheme.data.result.length; i++)
          downloaded_themes.push(responseTheme.data.result[i].theme_store_id);

        $http.get('/api/themestore').then(
          function(responseStore){
            $scope.themeList = responseStore.data.result;
            for (var i = 0; i < $scope.themeList.length; i++)
            {
              if (downloaded_themes.indexOf($scope.themeList[i].id) > -1)
                $scope.themeList[i].is_downloaded = true;
              else
                $scope.themeList[i].is_downloaded = false;
            }
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
  };

}])

.controller("OrderNotificationCtrl", ["$scope", "$http",
function($scope, $http) {
  $scope.notifType = 'placed';
}
])

// ORDER DETAILS

.controller("SingleOrderCtrl", ["$scope", "$http", "$routeParams", "$modal",
  function($scope, $http, $routeParams, $modal) {

    $scope.ID = $routeParams.orderid != undefined ? parseInt($routeParams.orderid) : undefined;
    $scope.snapID = $routeParams.snapid != undefined ? parseInt($routeParams.snapid) : undefined;

    $scope.statusType = ['placed', 'pending', 'cancelled', 'shipped', 'return', 'return-update'];

    $scope.items;

    $scope.snapshots = [];

    $scope.singleOrder = {
      shipping_first_name: '',
      shipping_last_name: '',
      shipping_street_line1: '',
      shipping_street_line2: '',
      shipping_city: '',
      shipping_zip: '',
      shipping_state: '',
      shipping_country: '',
      shipping_method: '',
      billing_first_name: '',
      billing_last_name: '',
      billing_street_line1: '',
      billing_street_line2: '',
      billing_city: '',
      billing_zip: '',
      billing_state: '',
      billing_country: '',
      email: '',
      coupon_code: "",
      subtotal: 0,
      total: 0,
      tax: 0,
      shipping_rate: 0,
      unsettled: 0,
      charge_amount: 0,
      date_modified: "",
      status: "",
      card_last4: "",
      card_type: "",
      transaction_type: "",
      transaction_id: "",
      transaction_status: "",
      fraud_check: false,
      fraud_results: {maxmind:""}
    };

    $scope.recursItems = function(where, items_index, previous_list, current_list){
        var diff_list = [];
        for(it_index in previous_list){
            if (previous_list[it_index] != current_list[it_index] && it_index != "date_created" && it_index != "date_modified"){
                for(items_val_index in $scope.snapshots[where].details){
                    if ($scope.snapshots[where].details[items_val_index].key == 'items'){
                        if ($scope.snapshots[where].details[items_val_index].value[items_index] == undefined)
                            $scope.snapshots[where].details[items_val_index].value[items_index] = [];

                        $scope.snapshots[where].details[items_val_index].value[items_index].push({
                            'key': it_index,
                            'after': previous_list[it_index],
                            'before': current_list[it_index]
                        });
                    }
                }
            }
        }
    }

    $scope.getSnapshotDetails = function(index){
        $scope.snapshots[index-1].details = [];
        for(detail_index in $scope.snapshots[index-1].decoded){

            if ($scope.snapshots[index-1].decoded[detail_index] != $scope.snapshots[index].decoded[detail_index] && detail_index != "date_created" && detail_index != "date_modified"){
                switch(detail_index){
                    case 'items':
                        $scope.snapshots[index-1].details.push({
                            'key': 'items',
                            'value': []
                        });

                        for(items_index in $scope.snapshots[index-1].decoded[detail_index]){
                            if ($scope.snapshots[index-1].decoded[detail_index] && $scope.snapshots[index].decoded[detail_index]){
                                $scope.recursItems(index-1, items_index, $scope.snapshots[index-1].decoded[detail_index][items_index], $scope.snapshots[index].decoded[detail_index][items_index]);
                            }
                        }
                        break;
                    case 'fraud_results':
                        for (fraud in $scope.snapshots[index-1].decoded[detail_index]){
                            $scope.snapshots[index-1].details.push({
                                'key': 'fraud_results',
                                'value': fraud+" ("+$scope.snapshots[index-1].decoded[detail_index][fraud]+")"
                            });
                        }
                        break;
                    default:
                        $scope.snapshots[index-1].details.push({
                            'key': detail_index,
                            'after': $scope.snapshots[index-1].decoded[detail_index] == undefined ? "n/c" : $scope.snapshots[index-1].decoded[detail_index],
                            'before': $scope.snapshots[index].decoded[detail_index] == undefined ? "n/c" : $scope.snapshots[index].decoded[detail_index],
                        });
                        break;
                }
            }
        }
    }

    $scope.manageSnapshots = function(){
        if ($scope.snapID != undefined){
            $scope.singleOrder = {
              shipping_first_name: '',
              shipping_last_name: '',
              shipping_street_line1: '',
              shipping_street_line2: '',
              shipping_city: '',
              shipping_zip: '',
              shipping_state: '',
              shipping_country: '',
              shipping_method: '',
              billing_first_name: '',
              billing_last_name: '',
              billing_street_line1: '',
              billing_street_line2: '',
              billing_city: '',
              billing_zip: '',
              billing_state: '',
              billing_country: '',
              email: '',
              coupon_code: "",
              subtotal: 0,
              total: 0,
              tax: 0,
              shipping_rate: 0,
              unsettled: 0,
              charge_amount: 0,
              date_modified: "",
              status: "",
              card_last4: "",
              card_type: "",
              transaction_type: "",
              transaction_id: "",
              transaction_status: "",
              fraud_check: false,
              fraud_results: {maxmind:""}
            };

            angular.extend($scope.singleOrder, $scope.snapshots[$scope.snapID - 1].decoded);

            $scope.items = $scope.snapshots[$scope.snapID - 1].decoded.items;

            $scope.getSnapshotDetails($scope.snapID);
        }else{
            for(snap_index in $scope.snapshots){
                if (snap_index > 1)
                    $scope.getSnapshotDetails(snap_index);
            }
        }
    }

    $scope.getContent = function(id){
      $http.get('/api/order/' + id).then(
        function(response){
          angular.extend($scope.singleOrder, response.data.result);

          $http.get('/api/ordersnapshot?query=order_id:'+id+'&sort=id:-1').success(function(success){
              $scope.snapshots = success.result;
              $scope.manageSnapshots();
          });


          //GET ITEMS OF ORDER
          if ($scope.snapID == undefined){
              $http.get('/api/order/' + id + '/items').then(
                function(response){
                    $scope.items = angular.copy(response.data.result);
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

    $scope.openShippingAddressEdit = function() {
      var modalInstance = $modal.open({
        templateUrl: "modalEditShippingAddress.html",
        controller: "ModalEditAddressCtrl",
        resolve: {
          addressInfo: function(){
            return($scope.singleOrder)
          }
        }
      });
      modalInstance.result.then(
        function(newAddressInfo) {
          $http.put('/api/order/' + $scope.ID, newAddressInfo).then(
            function(response){
              angular.extend($scope.singleOrder, newAddressInfo);
            },
            function(error){
              console.log('shipping edit error');
            }
          );
        },
        function() {
          console.log("Cancelled Editing Info");
        }
      );
    };

    $scope.openBillingAddressEdit = function() {
      var modalInstance = $modal.open({
        templateUrl: "modalEditBillingAddress.html",
        controller: "ModalEditAddressCtrl",
        resolve: {
          addressInfo: function(){
            return($scope.singleOrder)
          }
        }
      });
      modalInstance.result.then(
        function(newAddressInfo) {
          $http.put('/api/order/' + $scope.ID, newAddressInfo).then(
            function(response){
              angular.extend($scope.singleOrder, newAddressInfo);
            },
            function(error){
              console.log('billing edit error');
            }
          );

        },
        function() {
          console.log("Cancelled Editing Info");
        }
      );
    };
  }
])

.controller("ModalEditAddressCtrl", ["$scope", "$modalInstance", "addressInfo",
function($scope, $modalInstance, addressInfo) {
  $scope.infoToAdd = angular.copy(addressInfo);
  $scope.shippingType = ['UPS', 'USPS', 'AMAZON'];

  $scope.saveInfo = function() {
    $modalInstance.close($scope.infoToAdd);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss("cancel")
  };
}
])

// FILES PAGE

.controller("FilesCtrl", ["$scope", "$http",
  function($scope, $http) {
    $scope.files = [];

    $scope.addFile = function(newFileToAdd){
      $http.post('/api/files', newFileToAdd).then(
        function(response){
          console.log(response)
        },
        function(error){

        }
      );
    };

    $scope.fileChanged = function(element) {
      var onefile = element.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        $scope.$apply(function() {
          $scope.prevfile = e.target.result;
          $scope.addFile($scope.prevfile);
        });
      };
      reader.readAsDataURL(onefile);
    };

    $scope.getFiles = function(){
      $http.get('/api/files').then(function(response){
        $scope.files = response.data.result;
        },
        function(error){

        }
      );
    };

    $scope.removeFile = function(fileIndex) {
      $http.delete('/api/files/' + fileIndex).then(function(response){
        console.log(response);
        //$scope.files.splice(fileIndex, 1);
        },function(error){

        }
      );
    };
}])

// PLUGIN LIBRARY PAGE

.controller("PluginsCtrl", ["$scope", "$http", "$modal",
function($scope, $http, $modal) {
  $scope.pluginList = [{name: "Amazon", description: "Automatically import orders from your amazon merchant account", link: "We have based our integration of this plugin on amazon order API and amazon product API", full_description: "<h4>Amazon Orders Synchronization</h4><p>The Orders API section of Amazon MWS helps you build simple applications that retrieve only the order information that you need. This enables you to develop fast, flexible, custom applications in areas like order synchronization, order research, and demand-based decision support tools.</p><h4>Amazon Products Synchronization</h4><p>The Products API section of Amazon MWS helps you get information to match your products to existing product listings on Amazon Marketplace websites and to make sourcing and pricing decisions for listing those products on Amazon Marketplace websites. The Products API returns product attributes, current Marketplace pricing information, and a variety of other product and listing information.</p>"},
{name: "Ebay", description: "Ebay integration ", link: "We have based our integration of this plugin on amazon order API and amazon product API", full_description: "<h4>Amazon Orders Synchronization</h4><p>The Orders API section of Amazon MWS helps you build simple applications that retrieve only the order information that you need. This enables you to develop fast, flexible, custom applications in areas like order synchronization, order research, and demand-based decision support tools.</p><h4>Amazon Products Synchronization</h4><p>The Products API section of Amazon MWS helps you get information to match your products to existing product listings on Amazon Marketplace websites and to make sourcing and pricing decisions for listing those products on Amazon Marketplace websites. The Products API returns product attributes, current Marketplace pricing information, and a variety of other product and listing information.</p>"}];

  $scope.getPluginList = function(){
    $http.get('/api/plugins').then(
      function(response){
        console.log(response);
      },
      function(error){
        console.log(error);
      }
    );
  };

  $scope.openPluginModal = function(elem) {
    var modalInstance = $modal.open({
      templateUrl: "modalPlugins.html",
      controller: "ModalPluginCtrl",
      resolve: {
        plugin: function(){
          return(elem)
        }
      }
    });
    modalInstance.result.then(
      function(install) {
        console.log(install);
      },
      function() {
        console.log("Cancelled Editing Info");
      }
    );
  };

}])

.controller("ModalPluginCtrl", ["$scope", "$modalInstance", "plugin",
function($scope, $modalInstance, plugin) {
  $scope.currentPlugin = plugin;
  $scope.downloadPlugin = function() {
    console.log(plugin);
  };
  $scope.installPlugin = function() {
    $modalInstance.close(true);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss("cancel")
  };
}])

// EDIT THEME PAGE

.controller("EditThemeCtrl", ["$scope", "$http", "$sce", "$filter", "$modal", "$location", "$routeParams",
function($scope, $http, $sce, $filter, $modal, $location, $routeParams) {
  $scope.currentid = $routeParams.themeid;

  /* NOT USED
  $scope.currentTheme = {
                          current:
                          {
                            branding:
                            {
                              branding_colors:
                              {
                                'brand-primary': "000000",
                                'brand-second': "000000"
                              },
                              feedback_states:
                              {
                                'brand-success': "000000",
                                'state-success-text': "000000",
                                'brand-info': "000000",
                                'state-info-text': "000000",
                                'brand-warning': "000000",
                                'state-warning-text': "000000",
                                'brand-danger': "000000",
                                'state-danger-text': "000000"
                              }
                            },
                            logo_images_and_colors:
                            {
                              logo_background:
                              {
                                'logo-custom': true,
                                'logo-custom-upload': "filepath",
                                'logo-custom-center': true,
                                'favicon-image': false,
                                'favicon-upload': "path",
                                'site-bg-image': "No Background Image",
                                'site-bg-image-custom': "path",
                                'site-bg-image-display': "tiled"
                              },
                              toolbar:
                              {
                                'toolbar-bg-color': "7fff00",
                                'toolbar-bg-color-none': false,
                                'toolbar-text-color': "987765",
                                'toolbar-text-color-hover': "123345",
                                'toolbar-border-style': "none",
                                'toolbar-border-color': "000000",
                                'toolbar-border-search': true,
                                'search-border-color': "000000"
                              },
                              footer_colors:
                              {
                                'footer-background-color': "000000",
                                'footer-bg-color-remove': true,
                                'footer-text-color': "000000",
                                'footer-heading-color': "000000",
                                'footer-heading-underline': "000000",
                                'footer-heading-underline-color': "000000",
                                'footer-link-color': "000000",
                                'footer-link-color-hover': "000000",
                                'footer-border-style': "none",
                                'footer-border-color': "020202"
                              },
                              content_border_color:
                              {
                                'site-border-color': "",
                                'content-background-color': "",
                                'content-background-transparent': true,
                                'text-color': "",
                                'heading-color': "",
                                'link-color': "",
                                'link-color-hover': "",
                                'price-color': ""
                              },
                              buttons:
                              {
                                'btn-bg-color': "",
                                'btn-bg-color-hover': "",
                                'btn-text-color': "",
                                'btn-text-color-hover': "",
                                'btn-border-radius': "15px"
                              },
                              borders:
                              {
                                'general-border-style': "solid",
                                'general-border-color': "",
                              },
                              tabs:
                              {
                                'tab-bg-color': "",
                                'tab-bg-color-none': true,
                                'tab-active-bg-color': "",
                                'tab-active-bg-color-none': ""
                              }
                            },
                            typography:
                            {
                              base_styles:
                              {
                                'base-typeface': "Times New Roman",
                                'body-font-size': "14px",
                                'body-line-height': "22px",

                              },
                              navigation_styles:
                              {
                                'google-nav-font':"Lucida",
                                'nav-font-size': "14px"
                              },
                              heading_styles:
                              {
                                'google-header-font': "Open Sans",
                                'header-weight': "regular",
                                'header-font-style': "none",
                                'site-heading-font-size' : "22px"
                              },
                              headings:
                              {
                                'main-heading-font-size': "72px",
                                'h2-font-size': "36px",
                                'sub-heading-h3-font-size' : "24px",
                                'h4-font-size': "24px",
                                'h5-font-size': "22px",
                                'h6-font-size': "20px",
                              },
                              button_styles:
                              {
                                'btn-font-size': "14px",
                                'btn-line-height': "32px",
                                'btn-font-style': "none",
                                'btn-font-weight': "bold"
                              }
                            },
                            navigation:
                            {
                              base_styles:
                              {
                                'navigation-alignment': "right",
                                'navigation-center': "0",
                                'nav-right-padding': "70",
                                'nav-link-color': "888888",
                                'nav-link-hover-color': "222222",
                                'selected-nav-link-color': "ffffff",
                                'nav-dropdown-background-color': "",
                                'nav-dropdown-link-color': "222222",
                                'nav-dropdown-link-hover-color': "",
                                'show-dropdown-arrow': true,
                                'dropdown-arrow': "none",
                                'display-blog-dropdown': false,
                                'display-collection-dropdown': true
                              }
                            },
                            footer:
                            {
                              general:
                              {
                                'footer-linklist-title': "Quick Links",
                                'footer-linklist': "none",
                                'footer-blog-post-header': "Latest News",
                                'dropdownMenu1': "Dropdown",
                                'footer-display-newsletter': true,
                                'footer-newsletter-title': "Newsletter",
                                'mailing-list-form-action': "/url-mailchimp",
                                'newsletter-btn-color': "#50b3da",
                                'newsletter-btn-hover-color': "#51a7ca",
                                'newsletter-btn-text-color': "#ffffff",
                                'newsleter-btn-hover-text-color': "#ffffff",
                                'enable-social-links': false,
                                'social-icons': "light",
                                'footer-social-title': "Follow Us",
                                'twitter-link': "",
                                'facebook-link': "",
                                'google-link': "",
                                'youtube-link': "",
                                'vimeo-link': "",
                                'pinterest-link': "",
                                'instagram-link': "",
                                'tumblr-link': "",
                                'atom-link': "",
                                'accept-visa': false,
                                'accept-mastercard': false,
                                'accept-amex': false,
                                'accept-cirrus': false,
                                'accept-delta': false,
                                'accept-discover': false,
                                'accept-westernunion': false,
                                'accept-paypal': false,
                                'accept-bitcoin': false
                              }
                            },
                            homepage:
                            {
                              homepage_content:
                              {
                                'frontpage-collection': "frontpage",
                                'homepage': "Welcome"
                              },
                              slideshow_settings:
                              {
                                'display-slideshow': true,
                                'slideshow-speed': "6 seconds",
                                'slideshow-transition': "fade",
                                'slideshow–arrows': "light",
                                'slider-nav-opacity': "90%"
                              },
                              slideshow_images:
                              {
                                'display-slide-1': true,
                                'slide-1-link': "/collection/all",
                                'slide-1-alt': "",
                                'display-slide-2': true,
                                'slide-2-link': "/collection/all",
                                'slide-2-alt': "",
                                'display-slide-3': true,
                                'slide-3-link': "/collection/all",
                                'slide-3-alt': "",
                                'display-slide-4': true,
                                'slide-4-link': "/collection/all",
                                'slide-4-alt': "",
                                'display-slide-5': true,
                                'slide-5-link': "/collection/all",
                                'slide-5-alt': "",
                                'display-slide-6': true,
                                'slide-6-link': "/collection/all",
                                'slide-6-alt': "",
                              },
                              featured_products:
                              {
                                'show-fp-images': false,
                                'fp-image-1-link': "/collection/all",
                                'fp-image-1-alt': "",
                                'fp-image-2-link': "/collection/all",
                                'fp-image-2-alt': "",
                                'fp-image-3-link': "/collection/all",
                                'fp-image-3-alt': "",
                                'show-collections': false,
                                'frontpage-collections': "main"
                              }
                            },
                            product_page:
                            {
                              'enable-product-image-zoom': true,
                              'display-quantity-dropdown': false,
                              'show-social': false,
                              'show-related-products': false,
                              'thumbnails-position': "below main image"
                            },
                            product_collection:
                            {
                              'collection-tags': true,
                              'pagination-limit': "24",
                              'show-photo-border': true,
                              'product-photo-border-color': "#dddddd",
                              'products-per-row': "4",
                              'product-opacity-hover': "70%",
                              'show-sale-circle': true,
                              'sale-bg-color': "#50b3da",
                              'sale-text-color': "#ffffff",
                              'product-vendor': true
                            },
                            blog_page:
                            {
                              'display-blog-tags': true,
                              'blog-tag-background-color': "#ECECEC",
                              'blog-tag-background-hover-color': "#CCCCCC",
                              'blog-tag-font-color': "#666666",
                              'blog-tag-font-hover-color': "#333333"
                            },
                            cart:
                            {
                              'icon-cart': "light",
                              'icon-cart-opacity': "80%",
                              'display-cart–note': true,
                              'display-extra-checkout-buttons': false,
                              'use-featured': false,
                              'featured-products': "dropdown",
                            },
                            additional_layout:
                            {
                              'custom-layout': "custom"
                            }
                          }
                        };
  $scope.themedata = {
                      fontsize: ['11px', '12px', '13px', '14px', '15px', '16px'],
                      lineheight: ['10px', '12px', '14px', '16px', '18px', '20px', '22px'],
                      basetypeface: ['Helvetica', 'Impact', 'Lucida', 'Verdana', 'Georgia', 'Times New Roman'],
                      googlefont: ['Helvetica', 'Impact', 'Lucida', 'Verdana', 'Georgia', 'Times New Roman'],
                      fontweight: ['regular', 'bold', 'light'],
                      fontstyle: ['none', 'uppercase', 'lowercase'],
                      border: ['none', 'solid', 'dotted', 'dashed'],
                      shade: ['none', 'light', 'dark'],
                      link: ['None', 'Footer', 'Main Menu'],
                      alignment: ['On The Right', 'Below'],
                      number: ['2', '4', '8', '12', '16', '24'],
                      opacity: ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
                      speed: ['1 second', '2 seconds', '3 seconds', '4 seconds', '5 seconds', '6 seconds'],
                      effect: ['fade', 'slide'],
                      background: ['No Background Image', 'Custom Image', 'Background Image Style 1', 'Background Image Style 2'],
                      tile: ['Not Tiled', 'Stretched', 'Tiled'],
                      content: ['Front Page', 'About Us']
                      };
  */
  $scope.editthemedata = "";
  $scope.loading = false;

  $scope.setConfig = function() {
    //SAVE CONFIG
    $scope.loading = true;
  };

  $scope.getConfig = function(){
    $http.get('/api/themeconfig/Getthemesettingshtml?id=' + $scope.currentid).then(
      function(response){
        console.log(response.data.result);
        $scope.editthemedata = $sce.trustAsHtml(response.data.result);
      },
      function(error){

      }
    );
  };

}]);
