angular.module("app", ["ngRoute", "ngAnimate", "ngCookies", "ui.bootstrap", "easypiechart", "mgo-angular-wizard", "textAngular", "ui.tree", "ngMap", "ngTagsInput",
"app.ui.ctrls", "app.ui.services", "app.controllers", "app.directives", "app.form.validation", "app.ui.form.ctrls",
  "app.map", "app.tables", "app.task", "app.localization", "app.chart.ctrls", "app.page.ctrls", "app.filters", "daterangepicker"])
.config(["$routeProvider", "$httpProvider", function($routeProvider, $httpProvider) {
  /* ROUTING IS DONE HERE */
  $routeProvider.when("/", {redirectTo: "/dashboard"})
    .when("/dashboard", {templateUrl: "views/dashboard.html"})
    .when("/404", {templateUrl: "views/misc/404.html"})
    .when("/settings/sitesettings", {templateUrl: "views/settings/sitesettings.html"})
    .when("/settings/users", {templateUrl: "views/settings/users.html"})
    .when("/settings/shippingmethods", {templateUrl: "views/settings/shippingmethods.html"})
    .when("/settings/fraudmanagement", {templateUrl: "views/settings/fraudmanagement.html"})
    .when("/settings/taxes", {templateUrl: "views/settings/taxes.html"})
    .when("/settings/tasks", {templateUrl: "views/settings/tasks.html"})
    .when("/settings/files", {templateUrl: "views/settings/files.html"})
    .when("/themes/templates", {templateUrl: "views/themes/templates.html"})
    .when("/themes/mythemes", {templateUrl: "views/themes/mythemes.html"})
    .when("/themes/mythemes/edit/:themeid", {templateUrl: "views/themes/edittheme.html"})
    .when("/themes/themestore", {templateUrl: "views/themes/themestore.html"})
    .when("/plugins/library", {templateUrl: "views/plugins/pluginslibrary.html"})
    .when("/sitecontent/import", {templateUrl: "views/sitecontent/import.html"})
    .when("/sitecontent/content", {templateUrl: "views/sitecontent/content.html"})
    .when("/sitecontent/widgets", {templateUrl: "views/sitecontent/widgets.html"})
    .when("/merchandise/categories", {templateUrl: "views/merchandise/categories.html"})
    .when("/merchandise/collections", {templateUrl: "views/merchandise/collections.html"})
    .when("/merchandise/products", {templateUrl: "views/merchandise/products.html"})
    .when("/orders", {templateUrl: "views/orders.html"})
    .when("/reports", {templateUrl: "views/reports.html"})
    .when("/orders/:orderid", {templateUrl: "views/orders/view.html"})
    .when("/orders/:orderid/snapshot/:snapid", {templateUrl: "views/orders/view.html"})
    .when("/marketing/contact", {templateUrl: "views/marketing/contact.html"})
    .when("/reports/item-sold", {templateUrl: "views/itemsold.html"})
    .when("/reports/order-revenue", {templateUrl: "views/orderrevenue.html"})
    .when("/reports/customer-revenue", {templateUrl: "views/customerrevenue.html"})
    .when("/marketing/emailsubscribers", {templateUrl: "views/marketing/emailsubscribers.html"})
    .when("/marketing/productreviews", {templateUrl: "views/marketing/productreviews.html"})
    .when("/marketing/coupons", {templateUrl: "views/marketing/coupons.html"})
    .when("/customers/customers", {templateUrl: "views/customers/customers.html"})
    .when("/customers/registries", {templateUrl: "views/customers/registries.html"})
    .when("/profile", {templateUrl: "views/misc/profile.html"})
    .when("/signin", {templateUrl: "views/misc/signin.html"})
    .when("/lock-screen", {templateUrl: "views/misc/lock-screen.html"})
    .when("/forgot-password", {templateUrl: "views/misc/forgot-password.html"})
    .otherwise({redirectTo: "/404"});

    $httpProvider.interceptors.push(function($q, $rootScope, $location, $injector) {
      return {
        'request': function(config) {
          if ((config.method === 'GET' || config.method === 'POST' || config.method === 'PUT' || config.method === 'DELETE') && config.url.indexOf("/api/") > -1 && config.url.indexOf("access_token=") == -1)
          {
              if ($rootScope.storePath == undefined)
                  $location.path('/signin');
            config.url = "http://admin.acendev/preview/" + $rootScope.storePath + config.url;
            if ($rootScope.oauth)
            {
              if (config.url.indexOf("?") == -1)
                config.url += '?';
              else
                config.url += '&';
              config.url += 'access_token=' + $rootScope.oauth;//  config.headers['Authorization'] = 'Bearer ' + $rootScope.oauth;
            }
          }
          return config;
        },
        'responseError': function(rejection) {
            switch(rejection.status){
                case 401:
                    $location.path('/signin');
                    break;
            }
            /*
                return $injector.get("$http").post('http://admin.acendev/preview/' + $rootScope.storePath + '/oauth/token', {username: "julesg@torreycommerce.com", password: "torreytorrey", grant_type: "password"}).then(
                function(success){
                  $rootScope.oauth = success.data.access_token;
                  $
                  var newReq = rejection.config;
                  var testRes = rejection.config.url.match(/[^?]+/g);
                  if (testRes && testRes[0])
                    newReq.url = testRes[0];
                //  rejection.config.headers['Authorization'] = 'Bearer ' + $rootScope.oauth;
                  newReq.url += '?access_token=' + $rootScope.oauth;
                  return $injector.get("$http")(newReq);
                //  $rootScope.$broadcast('newtoken', rejection.config);
                },
                function(fail){
                  console.log(fail);
                }
              );
             */
          return $q.reject(rejection);
        }
      }
    });

}])

.run(['$rootScope', '$cookieStore', function($rootScope, $cookieStore) {
  try{
      $rootScope.storePath = $cookieStore.get('store_path');
      $rootScope.oauth = $cookieStore.get('myaccess_token');
      $rootScope.refresh_oauth = $cookieStore.get('myrefresh_token');
  }catch(err){
      $rootScope.storePath = "";
      $rootScope.oauth = "";
      $rootScope.refresh_oauth = "";

      $cookieStore.put('store_path', '');
      $cookieStore.put('myaccess_token', '');
      $cookieStore.put('myrefresh_token', '');
  }
}])

/*/ OAUTH AUTOMATIC ACCESS TOKEN INJECTOR FOR $HTTP

$httpProvider.interceptors.push(['$rootScope', '$q', '$injector','$location', function ($rootScope, $q, $injector, $location) {
return function(promise) {
return promise.then(
function(response){ // SUCCESS
return response;
},
function (response) { // IF ERROR -> CHECK IF ERROR 401 OR 403 UNAUTHORIZED
if ((response.status === 401 || response.status === 403) && response.data.error)
{
var deferred = $q.defer(); // QUEUE DEFER TO WAIT WHEN ABLE TO REAUTH
$injector.get("$http").post('http://admin.acendev/preview/" + $scope.storePath + "/oauth/token', {client_id: "testadmin@acenda.com", client_secret: "ab440de6e970afadff53830ca27ec14a", grant_type: "client_credentials"}).then(
function(loginResponse) {
if (loginResponse.data)
{
console.log("SETTING NEW TOKEN TO ROOT");
$rootScope.oauth = angular.copy(loginResponse.data.access_token); // SET NEW TOKEN THEN RETRY
console.log($rootScope.oauth);
$injector.get("$http")(response.config).then(
function(response) {
deferred.resolve(response);
},
function(response) {
deferred.reject(); // INJECTOR ERROR
}
);
}
else
deferred.reject();
},
function(response) {
deferred.reject(); // TOKEN RETRY FAILED
$location.path('/signin');
return;
}
);
return deferred.promise;
}
return $q.reject(response); // QUEUE ERROR
}
);
};
}]
);

.run(['$rootScope', '$injector', function($rootScope, $injector) {
  $injector.get("$http").defaults.transformRequest = function(data, headersGetter) {
    if ($rootScope.oauth)
    {
      headersGetter()['Authorization'] = 'Bearer ' + $rootScope.oauth.access_token;
    }
    if (data)
      return angular.toJson(data);
  };
}]);

*/

angular.module("app.localization", [])
.factory("localize", ["$http", "$rootScope", "$window",
  function($http, $rootScope, $window) {
    var localize;
    return localize = {
    language: "",
    url: void 0,
    resourceFileLoaded: !1,
    successCallback: function(data) {
      return localize.dictionary = data, localize.resourceFileLoaded = !0, $rootScope.$broadcast("localizeResourcesUpdated")
    },
    setLanguage: function(value) {
      return localize.language = value.toLowerCase()
      .split("-")[0], localize.initLocalizedResources()
    },
    setUrl: function(value) {
      return localize.url = value, localize.initLocalizedResources()
    },
    buildUrl: function() {
      return localize.language || (localize.language = ($window.navigator.userLanguage || $window.navigator.language)
      .toLowerCase(), localize.language = localize.language.split("-")[0]), "i18n/resources-locale_" + localize.language + ".js"
    },
    initLocalizedResources: function() {
      var url;
      return url = localize.url || localize.buildUrl(), $http({
        method: "GET",
        url: url,
        cache: !1
      })
      .success(localize.successCallback)
      .error(function() {
        return $rootScope.$broadcast("localizeResourcesUpdated")
      })
    },
    getLocalizedString: function(value) {
      var result, valueLowerCase;
      return result = void 0, localize.dictionary && value ? (valueLowerCase = value.toLowerCase(), result = "" === localize.dictionary[
      valueLowerCase] ? value : localize.dictionary[valueLowerCase]) : result = value, result
    }
  }
}])

.controller("LangCtrl", ["$scope", "localize", function($scope, localize) {
  return $scope.lang = "English", $scope.setLang = function(lang) {
    switch (lang) {
      case "English": localize.setLanguage("EN-US");
        break;
      case "Español": localize.setLanguage("ES-ES");
        break;
      case "日本語": localize.setLanguage("JA-JP");
        break;
      case "中文": localize.setLanguage("ZH-TW");
        break;
      case "Deutsch": localize.setLanguage("DE-DE");
        break;
      case "français": localize.setLanguage("FR-FR");
        break;
      case "Italiano": localize.setLanguage("IT-IT");
        break;
      case "Portugal": localize.setLanguage("PT-BR");
        break;
      case "Русский язык": localize.setLanguage("RU-RU");
        break;
      case "한국어": localize.setLanguage("KO-KR")
      }
      return $scope.lang = lang
    },
    $scope.getFlag = function() {
      var lang;
      switch (lang = $scope.lang) {
        case "English": return "flags-american";
        case "Español": return "flags-spain";
        case "日本語": return "flags-japan";
        case "中文": return "flags-china";
        case "Deutsch": return "flags-germany";
        case "français": return "flags-france";
        case "Italiano": return "flags-italy";
        case "Portugal": return "flags-portugal";
        case "Русский язык": return "flags-russia";
        case "한국어": return "flags-korea"
      }
    }
}]);

angular.module("app.controllers", [])
.controller("AppCtrl", ["$rootScope", "$scope", "$location", "$http", "$rootScope", "$route", "$cookieStore","$modal", "$filter", "$window", "taskStorage", "filterFilter",
function($rootScope, $scope, $location, $http, $rootScope, $route, $cookieStore, $modal, $filter, $window, taskStorage, filterFilter) {
  var tasks;
  $scope.mySites = [];
  $scope.weeklyrevenue = 0.00;
  $scope.weeklyreturns = 0;
  $scope.weeklysignups = 0;
  $scope.weeklyorders = 0;
  $scope.storereadysteps = [];
  $scope.storesteps = [];

  $scope.messageList = [{author: "Test", text: "fsf fs fds fsdfdsfs", date_created: Date.now()},
                        {author: "Test2", text: "fsf fsgggfd fsdfdsfs", date_created: Date.now()},
                        {author: "Test3", text: "fsssaaaaaa  a a fs", date_created: Date.now()}];

  $scope.main = {
      brand: "Acenda",
      email: "",
      phone: "",
      stores: {},
      stores_count: 0,
      currentsite: "",
      firstname: "",
      lastname: ""
  };

  $scope.getDashboardData = function(){

    var lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    $http.get("/api/order?query=" + "{'status': 'shipped', 'date_created':{'$gt':'" + $filter('date')(lastWeek, "MM-dd-yyyy", 'UTC') + "'}}").then(
      function(response){
        var sum = 0;
        for(var i = 0; i < response.data.result.length; i++)
          sum += parseFloat(response.data.result[i].total);
        $scope.weeklyrevenue = sum;
      }, function(error){
        console.log(error);
      }
    );

    $http.get("/api/order?query=" + "'{'status':'pending'}'").then(
      function(response){
        $scope.weeklyorders = response.data.result.length;
      }, function(error){
        console.log(error);
      }
    );

    $http.get("/api/orderreturn?query=" + "'{'status':'pending'}'").then(
      function(response){
        $scope.weeklyreturns = response.data.result.length;
      }, function(error){
        console.log(error);
      }
    );

    $http.get("/api/customer?query=" + "{'date_created':{'$gt':'" + $filter('date')(lastWeek, "MM-dd-yyyy", 'UTC') + "'}}").then(
      function(response){
        $scope.weeklysignups = response.data.result.length;
      }, function(error){
        console.log(error);
      }
    );

    $http.get("/api/setupprogress/getsteps").then(
      function(response){
        $scope.storesteps = response.data.result;
        $http.get("/api/setupprogress/getreadysteps").then(
          function(responseReady){
            responseReady.data.result;
            for(var i = 0; i < responseReady.data.result.length; i++)
            {
              $scope.storesteps[responseReady.data.result[i]].completed = true;
            }
            var size = 0;
            for (var key in $scope.storesteps)
            {
              if ($scope.storesteps.hasOwnProperty(key))
                size++;
            }
            $scope.main.stores[$scope.main.currentsite].percentwiz = (responseReady.data.result.length / size) * 100;
          }, function(error){
            console.log(error);
          }
        );
      }, function(error){
        console.log(error);
      }
    );

  };

  $scope.getDashboardData();

  $scope.goToWizard = function(index){
    console.log('/wizard/' + index);

  // IMPLEMENT THE LOCATION RELOAD
  };

  $scope.displaySiteLinks = function(){
      $("#view_site_").slideDown("fast");
  }

  $scope.hideSiteLinks = function(){
      $("#view_site_").slideUp("fast");
  }

  $scope.getUserData = function(callback){
      $http.get('/api/clientaccount/me').then(
          function(response){
              angular.extend($scope.main, response.data.result);
              $http.get('/api/site').success(function(sites){
                  var length = 0;
                  for(s in sites.result){
                      $scope.main.stores[sites.result[s].name] = sites.result[s];
                      if (sites.result[s].name == response.data.result.currentsite){ $scope.getConfig(); }
                      length++;
                  }
                  $rootScope.storePath = md5($scope.main.stores[$scope.main.currentsite].name);
                  $scope.main.stores_count = length;

                  if (callback)
                    callback();
              });
          },
          function(error){
              $rootScope.errorHandling()
          }
      );
  };

  $scope.getConfig = function(){
    $http.get('/api/config').then(
      function(response){
        var tmp = response.data.result;

        $scope.main.stores[$scope.main.currentsite].config = tmp
        $scope.main.stores[$scope.main.currentsite].config.params.seo.keywords = tmp.params.seo.keywords.split(',').filter(Boolean);

      },function(error){

      }
    );
  };

  $scope.setConfig = function(){
    var tmp = angular.copy($scope.config);
    if (tmp.params.seo.keywords)
      tmp.params.seo.keywords = $scope.config.params.seo.keywords.join();
    $scope.loading = true;
    $http.put('/api/config', tmp).then(
      function(response){
        console.log(response);
        $scope.loading = false;
      },function(error,code){

      }
    );
  };

  $scope.isSpecificPage = function() {
    var path;
    return path = $location.path(), _.contains(["/404", "/500", "/login", "/signin", "/signin1", "/signin2",
    "/signup", "/signup1", "/signup2", "/forgot-password", "/lock-screen"
    ], path)
  };

  tasks = $scope.tasks = taskStorage.get();
  $scope.taskRemainingCount = filterFilter(tasks, {completed: !1}).length;
  $scope.storesCount = 0;

  $scope.selectStore = function(newCurStore){
    $scope.main.currentsite = newCurStore;

    $http.put('/api/clientaccount/'+$scope.main.id, {currentsite: newCurStore}).then(function(success){
        $scope.getConfig();
    }, function(error){
        console.log("Not switched");
    })

    $rootScope.storePath = md5(newCurStore);
    $location.path('/');
  };

  $scope.openProfileEdit = function() {
    var modalInstance = $modal.open({
      templateUrl: "modalEditProfile.html",
      controller: "ModalEditProfileCtrl",
      resolve: {
        profileInfo: function(){
          return($scope.main)
        }
      }
    });
    modalInstance.result.then(
      function(newProfileInfo) {
        $http.put('/api/clientaccount/' + $scope.main.id, {
            lastname:newProfileInfo.lastname,
            firstname: newProfileInfo.firstname,
            email: newProfileInfo.email,
            phone: newProfileInfo.phone
        }).then(
          function(response) {
              angular.extend($scope.main, newProfileInfo);
          },
          function(error){
            console.log(error);
          }
        );
      },
      function() {
        console.log("Cancelled Editing Info");
      }
    );
  };

  $scope.tryLogin = function(testLogin, testPassword){
    $http.post('http://acenda.acendev/oauth/token', {username: testLogin, password: testPassword, grant_type: "password"}).then(
      function(success){
        if (success)
        {
          $rootScope.oauth = success.data.access_token;
          $rootScope.refresh_oauth = success.data.refresh_token;
          $cookieStore.put('myaccess_token', success.data.access_token);
          $cookieStore.put('myrefresh_token', success.data.refresh_token);
          $rootScope.storePath = success.data.site; // Already encrypted
          $cookieStore.put('store_path', success.data.site);
          $scope.getUserData(function(){
              $location.path('/dashboard');
              $window.location.reload();
          });
        }
        else
        {
          $scope.loginError = true;
          $scope.$broadcast('loginerror');
        }
      },
      function(fail){
        console.log(fail);
      }
    );
  };

  $scope.tryLogout = function(){
    $cookieStore.remove('myaccess_token');
    $cookieStore.remove('myrefresh_token');
    $cookieStore.remove('store_path');
    $rootScope.oauth = '';
    $rootScope.refresh_oauth = '';
    $rootScope.storePath = '';
    $scope.loginError = false;
    $location.path('/signin');
  };

  $scope.$on("taskRemaining:changed", function(event, count) {return $scope.taskRemainingCount = count });
  $scope.$on("order:changed", function(event, count) {return $scope.ordersCount = count });

}
])

.controller("ModalEditProfileCtrl", ["$scope", "$modalInstance", "profileInfo",
function($scope, $modalInstance, profileInfo) {
  $scope.infoToAdd = angular.copy(profileInfo);
  $scope.saveInfo = function() {
    $modalInstance.close($scope.infoToAdd);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss("cancel")
  };
}
])

.controller("NavCtrl", ["$scope", "taskStorage", "filterFilter",
function($scope, taskStorage, filterFilter) {
  var tasks;
  return tasks = $scope.tasks = taskStorage.get(),
  $scope.taskRemainingCount = filterFilter(tasks, {completed: !1}).length,
  $scope.$on("taskRemaining:changed", function(event, count) {return $scope.taskRemainingCount = count }),
  $scope.$on("order:changed", function(event, count) {return $scope.ordersCount = count })
}
])

.controller("SiteSettingsCtrl", ["$scope", "$http",
function($scope, $http) {
  //GENERAL
  $scope.config = {params:{
                      site:{
                        title:""
                      },
                      seo:{
                        description: "",
                        keywords: [],
                        img: ""
                      },
                      "contact-us":{
                        to: ""
                      },
                      password: "",
                      social_settings:{
                        facebook:{
                          facebook_page: "",
                          like_type: "like",
                          active_like: false,
                          active_share: false,
                          active_follow_page_button: false,
                          active_metatags: false,
                          show_count: false
                        },
                        twitter:{
                          twitter_page: "",
                          twitter_account: "",
                          active_tweet: false,
                          add_acct_to_tweet: false,
                          active_metatags: false,
                          active_follow_page_button: false
                        },
                        pinterest:{
                          pinterest_page: "",
                          full_page_name: "",
                          active_pin_it: false,
                          show_count: false,
                          active_follow_page_button: false
                        },
                        google:{
                          google_page: "",
                          full_page_name: "",
                          active_plus_one: false,
                          active_follow_page_button: false
                        }
                      },
                      notifications: {
                        from: "",
                        order: {
                          placed: {
                            subject: ""
                          },
                          shipped: {
                            subject: ""
                          },
                          "shipping-update": {
                            subject: ""
                          },
                          cancelled: {
                            subject: ""
                          },
                          return: {
                            subject: ""
                          },
                          returnupdate: {
                            subject: ""
                          },
                          "customer-reset-password": {
                            subject: ""
                          },
                          "administrator-invitation": {
                            subject: ""
                          },
                          "administrator-forgot-password": {
                            subject: ""
                          }
                        }
                      },
                      email: {
                        useses: false
                      },
                      live_chat: {
                        chat_license: "",
                        active_chat: false
                      },
                      return_address:{
                        street_line1: "",
                        street_line2: "",
                        city: "",
                        zip: "",
                        state: "",
                        country: ""
                      },
                      information: {
                        phone_number: ""
                      }
                  },
                  components:{
                    amazon:{
                      merchantid: "",
                      accesskey: "",
                      secretkey: ""
                    },
                    nvp:{
                      user: "",
                      pwd: "",
                      signature: ""
                    },
                    payflowpro:{
                      user: "",
                      vendor: "",
                      pwd: "",
                      sandbox: false
                    },
                    ses:{
                      access_key: "",
                      secret_key: "",
                      host: ""
                    }
                  }
  };

}])
