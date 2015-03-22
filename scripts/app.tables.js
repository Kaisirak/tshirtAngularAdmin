angular.module("app.tables", [])

/********************************/
/* MODULAR TABLES DYNAMIC TEST  */
/********************************/

.controller("TablesCtrl", ["$scope", "$filter", "$http", "$modal", "$sce", "$rootScope", "$routeParams",
  function($scope, $filter, $http, $modal, $sce, $rootScope,$routeParams) {
  var init;

  $scope.loaded = false;
  $scope.tableName = "";
  $scope.allProperties = [""];
  $scope.editableProperties = [{}];
  $scope.content =  [];
  $scope.displayOnly = false;
  $scope.disableDelete = false;
  $scope.customOrder = false;
  $scope.modelRoute = "";

  // *** END GET DATA FROM API CALL ***/

  $scope.searchKeywords = "";
  $scope.filteredStores = [];
  $scope.row = "";

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

  $scope.setModelRoute = function(route) {
    $scope.modelRoute = route;
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
    if (typeof mystore[myproperty] !== 'undefined')
      mystore[myproperty] = mystore[myproperty].toString();
    if (myproperty == 'date_modified' || myproperty == 'date_created')
      return ($filter('date')(mystore[myproperty], "MM-dd-yyyy 'at' h:mma", 'UTC'));
    else if (myproperty == 'returnsPending')
      return ($filter('date')(mystore[myproperty], "MMMM-dd-yyyy", 'UTC'));
    else if (myproperty == 'url')
      return("<a href='" + mystore[myproperty] + "'>" + mystore[myproperty] + "</a>");
    else if (myproperty == 'image')
      return("<img class='img-responsive' src='" + mystore[myproperty].url + "'>");
    else if (myproperty == 'image_url')
      return("<img class='img-responsive' src='" + mystore[myproperty] + "'>");
    else if (myproperty == 'thumbnail')
      return("<img class='img-responsive' src='" + mystore[myproperty] + "' width='200'>");
    else if (myproperty == 'internal_link')
      return ("<a href='category/" + mystore['categoryId'] + "'>" + mystore['categoryId'] + "</a>");
    else if (myproperty == 'edit')
      return ("<a class='btn btn-info' href='/artworks/designs/edit/"+ mystore['id']+"'>Edit</a>");
    else
      return (mystore[myproperty]);
  };

  $scope.deleteEntry = function(id) {

  };

  $scope.setDisplayOnly = function(){
      $scope.displayOnly = true;
  };

  $scope.setDisableDelete = function(){
      $scope.disableDelete = true;
  };

  $scope.setCustomOrder = function(){
    $scope.customOrder = true;
  };

  $scope.setContent = function(ApiRoute,SubContent,WithToken){
    ApiRoute = typeof ApiRoute !== 'undefined' && ApiRoute !== '' ? ApiRoute : $scope.tableName;
    var url = "";
    if ($routeParams.param)
        url = $scope.main.api_url+"/"+ApiRoute+"/"+$routeParams.param;
    else
        url = $scope.main.api_url+"/"+ApiRoute;
    if (typeof WithToken !== 'undefined' && WithToken == 'yes')
      url = url + '?access_token='+$rootScope.oauth;
      console.log('uRl : '+url );
    $http.get(url).then(
      function(response) {
        // SET CONTENT
        console.log(response);
        if (response.status == 400 && response.statusText == "Bad Request")
          console.log(response.data.error);
        else if (response.status == 200)
        {
          if (typeof SubContent !== 'undefined' && SubContent !== '')
            $scope.content = angular.copy(response.data[SubContent]);
          else
            $scope.content = angular.copy(response.data);
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
      $http.delete($scope.main.api_url+'/admin/'+$scope.tableName+'/'+idToRemove).then(
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
