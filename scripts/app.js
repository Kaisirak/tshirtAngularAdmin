angular.module("app", ["ngRoute", "ngAnimate", "ngCookies", "ui.bootstrap", "easypiechart", "mgo-angular-wizard", "textAngular", "ui.tree", "ngMap", "ngTagsInput",
"app.ui.ctrls", "app.ui.services", "app.controllers", "app.directives", "app.form.validation", "app.ui.form.ctrls",
  "app.map", "app.tables", "app.task", "app.chart.ctrls", "app.page.ctrls", "app.filters"])
.config(["$routeProvider", "$httpProvider", "$locationProvider", function($routeProvider, $httpProvider, $locationProvider) {
  /* ROUTING IS DONE HERE */

  $routeProvider.when("/", {redirectTo: "/dashboard"})
    .when("/dashboard", {templateUrl: "views/dashboard.html"})
    .when("/orders", {templateUrl: "views/orders.html"})
    .when("/artworks", {templateUrl: "views/artworks.html"})
    .when("/sitesettings", {templateUrl: "views/sitesettings.html"})
    .when("/customers", {templateUrl: "views/customers.html"})
    .when("/reviews", {templateUrl: "views/reviews.html"})
    .when("/files", {templateUrl: "views/files.html"})
    .when("/products", {templateUrl: "views/products.html"})
    .when("/reports", {templateUrl: "views/reports.html"})
    .when("/profile", {templateUrl: "views/profile.html"})
    .when("/signin", {templateUrl: "views/signin.html"})
    .when("/forgot-password", {templateUrl: "views/forgot-password.html"})
    .when("/404", {templateUrl: "views/404.html"})
    .otherwise({redirectTo: "/404"});

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push(function($q, $rootScope, $location, $injector) {
      return {
        'request': function(config) {
          if (!$rootScope.oauth)
              $location.path('/signin');
          if ((config.method === 'GET' || config.method === 'POST' || config.method === 'PUT' || config.method === 'DELETE') && config.url.indexOf("api.") > -1 && config.url.indexOf("access_token=") == -1)
          {
            //config.url = "http://api.shirtfull.com" + config.url;
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

angular.module("app.controllers", [])
.controller("AppCtrl", ["$rootScope", "$scope", "$location", "$http", "$rootScope", "$route", "$cookieStore","$modal", "$filter", "$window", "taskStorage", "filterFilter",
function($rootScope, $scope, $location, $http, $rootScope, $route, $cookieStore, $modal, $filter, $window, taskStorage, filterFilter) {
  var tasks;
  var apiurl = '';

  if ($location.host() == 'tshirtadmin.local')
      apiurl = 'tshirt.local';
  else
      apiurl = 'api.shirtnexus.com';

  $scope.main = {
      brand: "ShirtNexus",
      email: "",
      phone: "",
      stores: {},
      stores_count: 0,
      currentsite: "",
      firstname: "",
      lastname: "",
      api_url: apiurl
  };

  /*
  $scope.goToWizard = function(index){
    console.log('/wizard/' + index);

  // IMPLEMENT THE LOCATION RELOAD
  };
  */
  /*
  $scope.displaySiteLinks = function(){
      $("#view_site_").slideDown("fast");
  }
  */
  /*
  $scope.hideSiteLinks = function(){
      $("#view_site_").slideUp("fast");
  }
  */
  $scope.getUserData = function(callback){
      angular.extend($scope.main, {lastname: "User", firstname: "Mein"});
  };

/*
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
*/
/*
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
*/
  $scope.isSpecificPage = function() {
    var path;
    return path = $location.path(), _.contains(["/404", "/500", "/login", "/signin", "/signin1", "/signin2",
    "/signup", "/signup1", "/signup2", "/forgot-password", "/lock-screen"
    ], path)
  };
/*
  tasks = $scope.tasks = taskStorage.get();
  $scope.taskRemainingCount = filterFilter(tasks, {completed: !1}).length;
  $scope.storesCount = 0;
*/
/*
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
*/
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
        /*
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
        );*/
      },
      function() {
        console.log("Cancelled Editing Info");
      }
    );
  };

  $scope.tryLogin = function(testLogin, testPassword){
    $http.post($scope.main.api_url+'/login', {username: testLogin, password: testPassword}).then(
      function(success){
        if (success)
        {
          console.log(success);
          $rootScope.oauth = success.data._token;
          $rootScope.client_id = success.data._client_id;
          $rootScope.roles = success.data._roles;
          //$rootScope.refresh_oauth = success.data.refresh_token;
          $cookieStore.put('myaccess_token', success.data._token);
          //$cookieStore.put('myrefresh_token', success.data.refresh_token);
          //$rootScope.storePath = success.data.site; // Already encrypted
          //$cookieStore.put('store_path', success.data.site);
          $location.path('/dashboard');
          /*
          $scope.getUserData(function(){
              $location.path('/dashboard');
              $window.location.reload();
          });
          */
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
/*
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
*/
