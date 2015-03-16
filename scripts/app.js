function rgbToHsl(rgb){
  var r = parseInt(rgb.slice(0,2), 16);
  var g = parseInt(rgb.slice(2,4), 16);
  var b = parseInt(rgb.slice(4,6), 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;

    }

    return { 'h' : h , 's' : s, 'l' : l};
}

angular.module("app", ["ngRoute", "ngAnimate", "ngCookies", "ui.bootstrap", "easypiechart", "mgo-angular-wizard", "textAngular", "ui.tree", "ngMap", "ngTagsInput",
"app.ui.ctrls", "app.ui.services", "app.controllers", "app.directives", "app.form.validation", "app.ui.form.ctrls",
  "app.map", "app.tables", "app.task", "app.chart.ctrls", "app.page.ctrls", "app.filters"])
.config(["$routeProvider", "$httpProvider", "$locationProvider", function($routeProvider, $httpProvider, $locationProvider) {
  /* ROUTING IS DONE HERE */

  $routeProvider.when("/", {redirectTo: "/dashboard"})
    .when("/dashboard", {templateUrl: "views/dashboard.html"})
    .when("/orders", {templateUrl: "views/orders/index.html"})
    .when("/artworks", {templateUrl: "views/artworks.html"})
    .when("/sitesettings", {templateUrl: "views/sitesettings.html"})
    .when("/users/customers", {templateUrl: "views/users/customers/index.html"})
    .when("/users/subscribers", {templateUrl: "views/users/subscribers/index.html"})
    .when("/reviews", {templateUrl: "views/reviews.html"})
    .when("/files", {templateUrl: "views/files.html"})
    .when("/products/list", {templateUrl: "views/products/list/index.html"})
    .when("/products/add", {templateUrl: "views/products/list/add.html"})
    .when("/products/categories", {templateUrl: "views/products/categories.html"})
    .when("/reviews", {templateUrl: "views/reviews/index.html"})
    .when("/category/:param", {templateUrl: "views/category.html"})
    .when("/reports", {templateUrl: "views/reports.html"})
    .when("/profile", {templateUrl: "views/profile.html"})
    .when("/signin", {templateUrl: "views/signin.html"})
    .when("/product", {templateUrl: "views/product.html"})
    .when("/artworks/image-library", {templateUrl: "views/artworks/image-library/index.html"})
    .when("/artworks/designs", {templateUrl: "views/artworks/designs/index.html"})
    .when("/artworks/designs/add", {templateUrl: "views/artworks/designs/add.html"})
    .when("/artworks/designs/edit/:id", {templateUrl: "views/artworks/designs/edit.html"})
    .when("/forgot-password", {templateUrl: "views/forgot-password.html"})
    .when("/404", {templateUrl: "views/404.html"})
    .otherwise({redirectTo: "/404"});

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push(function($q, $rootScope, $location, $injector) {
      return {
        'request': function(config) {
          if (!$rootScope.oauth)
              $location.path('/signin');
          if ((config.method === 'GET' || config.method === 'POST' || config.method === 'PUT' || config.method === 'DELETE') && (config.url.indexOf("api.") > -1 || config.url.indexOf("tshirt.") > -1 ) && config.url.indexOf("access_token=") == -1)
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

  if ($location.host() == 'admin.local')
      apiurl = 'http://api.garment.local';
  else
      apiurl = 'http://api.shirtnexus.com';

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

.controller('DesignerController', ["$http", "$routeParams", "$scope", function($http,$routeParams,$scope) {

    this.selectedProduct = "american-apparel-50-50-t-shirt";
    this.status = {isopen: true};
		this.productsSameCategory = [];
		this.selectedDescription = "";
		this.colors = [];
		this.images = [];
		this.sizes = [];
		this.selectedColor = 0;
		this.possibleSizes = [];
    this.possibleColors = {};
    this.productCompleteList = [];
		//var mainProductList = [ 'Hoodies','Short Sleeve Shirts','Long Sleeve Shirts','Mugs','Phone cases','Sweatshirts' ];
		//console.log('Params: '+$routeParams.product);
		var myThis = this;

    if (typeof $routeParams.id !== 'undefined') {
      $http.get($scope.main.api_url+'/admin/designs/'+$routeParams.id).
      success(function(data, status, headers, config) {
        console.log(data);
        myThis.selectedProduct = data.garment;
        myThis.setColor(data.color);
        myThis.setJson(data.json);
        myThis.design_name = data.name;
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });
    }


    $http.get($scope.main.api_url+'/products').
      success(function(data, status, headers, config) {
          var products = angular.fromJson(data);
          angular.forEach(products, function(product, key) {
            angular.forEach(product, function(value, key2) {
              if (typeof value['image'] !== 'undefined' && typeof value['image'].url !== 'undefined')
                console.log('Url undefined');
              myThis.productCompleteList.push( { category: key, name: value['name'], path : value['productId'] } );
            });
            //console.log(myThis.productCompleteList);
        });
      }).
      error(function(data, status, headers, config) {
        console.log(data);
    });


		$http.get($scope.main.api_url+'/products/'+this.selectedProduct).
			success(function(data, status, headers, config) {
				//console.log(data);
				angular.forEach(data.colors, function(color, key) {
					myThis.colors.push( { name : color.name, id : color.hex, value: '#'+color.hex, hsl : rgbToHsl(color.hex) } );
					myThis.images[color.hex] = [];
					myThis.sizes[color.hex] = color.sizes;
					angular.forEach(color.images, function(image, key) {
						myThis.images[color.hex][angular.lowercase(image.label)] = image.url;
					});
					if (!myThis.selectedColor)
						myThis.setColor(color.hex);
					if (!myThis.possibleSizes.length)
						myThis.possibleSizes = color.sizes;
				});
				myThis.selectedDescription = data.description;
				//console.log(myThis.sizes);
				//console.log(myThis.possibleSizes);
			}).
			error(function(data, status, headers, config) {
			 	console.log(data);
	  	});

		this.designerImgUrl = "";

		this.setColor = function(hex) {
      $scope.canvas_setBackgroundImage('images/crew_front.png');
      $scope.canvas_setBackgroundColor(hex);
			this.selectedColor = hex;
			//this.setImage(hex, 'front');
			this.setSizes(hex, 'front');
		};

    this.setShirtBorder = function(datop, daleft, dawidth, daheight){
      $scope.canvas_setBorder(datop, daleft, dawidth, daheight);
    };

    this.setJson = function(json) {
      $scope.canvas_setJSON(json);
    }

		this.showFront = function() {
			$(".behind-product").css("background-image", "url('img/" + this.curSelected.img_path[0] + "')");
		};

    this.leloul = function()
    {
      $scope.lelou();
      console.log("outtter");
    };

    this.togglePossibleColor = function(id){
      this.possibleColors[id] = !this.possibleColors[id];
      console.log("toggled");
      console.log(this.possibleColors[id]);
    };

		this.showBack = function() {
			$(".behind-product").css("background-image", "url('img/" + this.curSelected.img_path[1] + "')");
		};

		this.completeName = function() {
			return (this.curSelectedSize + " " + this.colors[this.selectedColor].name + " " + this.curSelected.name);
		};

		this.setImage = function(hex, position) {
			this.designerImgUrl = this.images[hex][position];
			$(".behind-product").css("background-image", "url('" + this.designerImgUrl + "')");
		};

		this.setSizes = function(hex) {

		}

		this.update = function() {
      this.colors = [];
			//console.log(this.selectedProduct);
      $http.get($scope.main.api_url+'/products/'+this.selectedProduct).
      success(function(data, status, headers, config) {
        angular.forEach(data.colors, function(color, key) {
          myThis.colors.push( { name : color.name, id : color.hex, value: '#'+color.hex, hsl : rgbToHsl(color.hex) } );
          if (!myThis.selectedColor)
            myThis.setColor(color.hex);
        });
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });
			/*
			this.curSelected = queryProd(this.types, this.curSelectedId);
			if ($("#versoBtn").hasClass('active') == false) {
				$("#preloadFront").one('load', function() {
					$(".behind-product").css("background-image", "url('" + $(this).attr('src') + "')");
					$("#preloadBack").attr('src', $(this).attr('src').replace('_front', '_back'));
		       	})
		    	.attr('src', "img/" + this.curSelected.img_path[0]) //Set the source so it caches
		        .each(function() {
		        	if(this.complete)
		        		$(this).trigger('load');
				});
			}
			else {
				$("#preloadFront").one('load', function() {
					$(".behind-product").css("background-image", "url('" + $(this).attr('src') + "')");
					$("#preloadFront").attr('src', $(this).attr('src').replace('_back', '_front'));
		        })
		        .attr('src', "img/" + this.curSelected.img_path[1]) //Set the source so it caches
		        .each(function() {
		        if(this.complete)
		        	$(this).trigger('load');
				});
			}
			//$(".behind-product").css("background-image", "url('img/" + this.curSelected.img_path[($("#versoBtn").hasClass('active') == true?1:0)] + "')");
			this.curSelectedSize = this.curSelected.sizes[0];*/
		};

    this.addDesign = function() {
      console.log('addDesign'+this.design_name+this.selectedColor+this.selectedProduct);
      angular.element(document.querySelector("#canvas"));
      //console.log($scope.getJSON());
      //console.log($scope.canvas__getThumbnail());
      $http.post($scope.main.api_url+'/admin/designs', {'name' : this.design_name, 'color' : this.selectedColor, 'garment' : this.selectedProduct,
       'json' : $scope.getJSON(), 'thumbnail': $scope.canvas__getThumbnail() } ).
        success(function(data, status, headers, config) {
          console.log(data);
        }).
        error(function(data, status, headers, config) {
          console.log(data);
        });
      };

      this.saveDesign = function() {
        console.log('saveDesign'+this.design_name+this.selectedColor+this.selectedProduct);
        $http.put($scope.main.api_url+'/admin/designs/'+$routeParams.id, {'name' : this.design_name, 'color' : this.selectedColor, 'garment' : this.selectedProduct,
       'json' : $scope.getJSON(), 'thumbnail': $scope.canvas__getThumbnail() } ).
        success(function(data, status, headers, config) {
          console.log(data);
        }).
        error(function(data, status, headers, config) {
          console.log(data);
        });
      };

	}])

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
