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
    .when("/products/add/:id", {templateUrl: "views/products/list/add.html"})
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

  if ($location.host() == 'admin.local') {
      //
      apiurl = 'http://api.garment.local';
      cdnurl = 'http://cdn.local/design_thumbnails';
  }
  else {
      apiurl = 'http://api.shirtnexus.com';
      cdnurl = 'http://cdn.shirtnexus.com/design_thumbnails';
  }

  $scope.main = {
      brand: "ShirtNexus",
      email: "",
      phone: "",
      stores: {},
      stores_count: 0,
      currentsite: "",
      firstname: "",
      lastname: "",
      api_url: apiurl,
      cdn_url: cdnurl
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


/*
  Product Controller  API_URL/admin/produts
*/
.controller('ProductController',  ["$http", "$routeParams", "$scope", function($http,$routeParams,$scope) {
  var self = this;
  self.product = {};
  /* Edit - Get on a Api - Change TLC */
  if (typeof $routeParams.id !== 'undefined') {
      $http.get($scope.main.api_url+'/admin/products/'+$routeParams.id).success(function(data, status, headers, config) {
        self.product.name = data.name;
        self.product.title = data.page_title;
        self.product.subtitle = data.page_subtitle;
        self.product.description = data.description;
        self.product.categories = data.categories;
        self.product.keywords = data.keywords;
        self.product.meta_description = data.meta_description;
        self.product.design_thumbnail = data.design.thumbnail;
        self.product.design_images = angular.fromJson(data.design.colors);
        self.product.slug_url = data.slug_url;
        self.product.status = data.status;

        $http.get($scope.main.api_url+'/admin/designs').success(function(data2, status, headers, config) {
          self.product.design_options = data2;
          self.product.design_id = data.design_id;
        }).
        error(function(data, status, headers, config) {
          console.log(data);
        });
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });
  }
  /* Add */
  else {
    self.product.status = 2;
    $http.get($scope.main.api_url+'/admin/designs').success(function(data, status, headers, config) {
      self.product.design_options = data;
      console.log(data);
    }).
    error(function(data, status, headers, config) {
      console.log(data);
    });
  }



  this.addProduct = function() {
    console.log(this.product);
    /* Edit - PUT on api */
    if (typeof $routeParams.id !== 'undefined') {
      $http.put($scope.main.api_url+'/admin/products/'+$routeParams.id, this.product ).success(function(data, status, headers, config) {
        location.reload();
      }).error(function(data, status, headers, config) {
        console.log(data);
      });
    }
    /* Add - POST on api */
    else {
      $http.post($scope.main.api_url+'/admin/products', this.product ).success(function(data, status, headers, config) {
        console.log(data);
        alert('Saved!');
        document.location.href = 'http://'+document.location.hostname+'/'+'products/add/'+data.id;
      }).error(function(data, status, headers, config) {
        console.log(data);
      });
    }
  };

  this.generateVariants = function() {
    var price = prompt("Please enter a price", "20.00");
    if (price != null) {
        if (typeof $routeParams.id !== 'undefined') {
          $http.post($scope.main.api_url+'/admin/products/create_variants', { 'id' : $routeParams.id, 'price' : price } ).success(function(data, status, headers, config) {
            console.log(data);
            alert('Saved!');
          }).error(function(data, status, headers, config) {
            console.log(data);
          });
        }
        else {
          alert('First Save Your Product!');
        }
    }

  }

}])

.controller('DesignerController', ["$http", "$routeParams", "$scope", function($http,$routeParams,$scope) {


    this.available_vneck_colors = [
      { 
        'name'          : 'red',
        'id'            : 'ba0c2f',
        'value'         : '#ba0c2f',
        'hsl'           : rgbToHsl('ba0c2f')
      },
      {
        'name'          : 'canvas red',
        'id'            : '9d2235',
        'value'         : '#9d2235',
        'hsl'           : rgbToHsl('9d2235')
      },
      {
        'name'          : 'deep teal',
        'id'           : '004f71',
        'value'         : '#004f71',
        'hsl'           : rgbToHsl('004f71')
      },
      { 
        'name'          : 'dark grey',
        'id'           : '25282a',
        'value'         : '#25282a',
        'hsl'           : rgbToHsl('25282a')
      },
      { 
        'name'          : 'vintage black',
        'id'           : '212322',
        'value'         : '#212322',
        'hsl'           : rgbToHsl('212322')
      },
      { 
        'name'          : 'brown',
        'id'           : '382e2c',
        'value'         : '#382e2c',
        'hsl'           : rgbToHsl('382e2c')
      },
      { 
        'name'          : 'orange',
        'id'           : 'ff6a39',
        'value'         : '#ff6a39',
        'hsl'           : rgbToHsl('ff6a39')
      },
      { 
        'name'          : 'black',
        'id'           : '2d2926',
        'value'         : '#2d2926',
        'hsl'           : rgbToHsl('2d2926')
      },
      { 
        'name'          : 'neon yellow',
        'id'           : 'ecf166',
        'value'         : '#ecf166',
        'hsl'           : rgbToHsl('ecf166')
      },
      { 
        'name'          : 'white',
        'id'           : 'FFFFFF',
        'value'         : '#FFFFFF',
        'hsl'           : rgbToHsl('FFFFFF')
      },
      { 
        'name'          : 'neon green',
        'id'           : '44d62c',
        'value'         : '#44d62c',
        'hsl'           : rgbToHsl('44d62c')
      },
      { 
        'name'          : 'kelly',
        'id'           : '007a53',
        'value'         : '#007a53',
        'hsl'           : rgbToHsl('007a53')
      },
      { 
        'name'          : 'neon blue',
        'id'           : '00bce3',
        'value'         : '#00bce3',
        'hsl'           : rgbToHsl('00bce3')
      },
      { 
        'name'          : 'steel blue',
        'id'           : '5b7f95',
        'value'         : '#5b7f95',
        'hsl'           : rgbToHsl('5b7f95')
      },
      { 
        'name'          : 'silver',
        'id'           : 'c7c9c7',
        'value'         : '#c7c9c7',
        'hsl'           : rgbToHsl('c7c9c7')
      },
      { 
        'name'          : 'asphalt',
        'id'           : '54585a',
        'value'         : '#54585a',
        'hsl'           : rgbToHsl('54585a')
      },
      { 
        'name'          : 'true royal',
        'id'           : '385e9d',
        'value'         : '#385e9d',
        'hsl'           : rgbToHsl('385e9d')
      },
      { 
        'name'          : 'navy',
        'id'           : '1f2a44',
        'value'         : '#1f2a44',
        'hsl'           : rgbToHsl('1f2a44')
      },
      { 
        'name'          : 'team purple',
        'id'           : '2e1a47',
        'value'         : '#2e1a47',
        'hsl'           : rgbToHsl('2e1a47')
      },
      { 
        'name'          : 'neon pink',
        'id'           : 'ff85bd',
        'value'         : '#ff85bd',
        'hsl'           : rgbToHsl('ff85bd')
      }
    ];

    this.selectedProduct = "american-apparel-50-50-t-shirt";
    this.status = {isopen: true};
		this.productsSameCategory = [];
		this.selectedDescription = "";
		this.colors = [];
    this.HexToName = [];
		this.images = [];
		this.sizes = [];
		this.selectedColor = 0;
		this.possibleSizes = [];
    this.possibleColors = {};
    this.productCompleteList = [];
		var myThis = this;

    $scope.myInterval = 5000;
    var slides = $scope.slides = [];
    $scope.addSlide = function(url, text) {
      var newWidth = 600 + slides.length + 1;
      slides.push({
        image: url,
        text: text
      });
    };

    if (typeof $routeParams.id !== 'undefined') {
      $http.get($scope.main.api_url+'/admin/designs/'+$routeParams.id).
      success(function(data, status, headers, config) {
        console.log(data);
        myThis.selectedProduct = data.garment;
        myThis.getColorOptions();
        myThis.setColor(data.color);
        myThis.setObjectType();
        myThis.setJson(data.json);
        myThis.design_name = data.name;
        var obj_colors = angular.fromJson(data.colors);
        for (obj in obj_colors) {
          $scope.addSlide($scope.main.cdn_url+'/'+obj_colors[obj].path, '#'+obj_colors[obj].hex);
        }

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
        });
      }).
      error(function(data, status, headers, config) {
        console.log(data);
    });

    this.getColorOptions = function () {
      $http.get($scope.main.api_url+'/products/'+this.selectedProduct).
        success(function(data, status, headers, config) {
          console.log(data);
          
          angular.forEach(myThis.available_vneck_colors, function(color, key) {
            //console.log(color);
            myThis.HexToName[color.id] = color.name;
          });
          console.log(myThis.HexToName);
          angular.forEach(data.colors, function(color, key) {
            angular.forEach(color.images, function(image, key) {
              myThis.images[color.hex] = [];
              myThis.images[color.hex][angular.lowercase(image.label)] = image.url;
            });
          });
          
         /*angular.forEach(data.colors, function(color, key) {
            
            myThis.colors.push( { name : color.name, id : color.hex, value: '#'+color.hex, hsl : rgbToHsl(color.hex) } );

            //myThis.HexToName[color.hex] = color.name;
            myThis.images[color.hex] = [];
            //myThis.sizes[color.hex] = color.sizes;
            myThis.sizes.push( { hex : color.hex, size : color.sizes, name : color.name } );
            angular.forEach(color.images, function(image, key) {
              myThis.images[color.hex][angular.lowercase(image.label)] = image.url;
            });
            if (!myThis.selectedColor)
              myThis.setColor(color.hex);
            myThis.setObjectType();
            //if (!myThis.possibleSizes.length)
            //  myThis.possibleSizes = color.sizes;

         });*/

        myThis.selectedDescription = data.description;
        //console.log(myThis.sizes);
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });  
    }

		

		this.designerImgUrl = "";

		this.setColor = function(hex) {
      $scope.canvas_setBackgroundColor(hex);
      //$scope.canvas_setBackgroundPattern('images/vneck_colors/brown.jpg');
			this.selectedColor = hex;
			this.setSizes(hex, 'front');
		};

    this.setObjectType = function(){
      console.log(myThis.selectedProduct);
      if (myThis.selectedProduct.indexOf("v-neck") < 0)
        $scope.canvas_setBackgroundImage('images/crew_front.png');
      else {
        $scope.canvas_setBackgroundImage('images/testvneck.png');

      }
    };

    this.setShirtBorder = function(datop, daleft, dawidth, daheight){
      $scope.canvas_setBorder(datop, daleft, dawidth, daheight);
    };

    this.setJson = function(json) {
      $scope.canvas_setJSON(json);
      $scope.canvas_setBorder(100, 150, 200, 400);
    }

		this.showFront = function() {
			$(".behind-product").css("background-image", "url('img/" + this.curSelected.img_path[0] + "')");
		};

    this.toggleBorder = function()
    {
      $scope.doToggleBorder();
    };

    this.togglePossibleColor = function(id){
      this.possibleColors[id] = !this.possibleColors[id];
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
      $http.get($scope.main.api_url+'/products/'+this.selectedProduct).
      success(function(data, status, headers, config) {
        angular.forEach(data.colors, function(color, key) {
          if (color.hex != '') {
            myThis.colors.push( { name : color.name, id : color.hex, value: '#'+color.hex, hsl : rgbToHsl(color.hex) } );
            if (!myThis.selectedColor)
              myThis.setColor(color.hex);
            myThis.setObjectType();
          }
        });
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });
		};

    this.addDesign = function() {
      console.log('addDesign'+this.design_name+this.selectedColor+this.selectedProduct);
      angular.element(document.querySelector("#canvas"));
      $scope.doToggleBorder();
      var thumbnail_1 = $scope.canvas__getThumbnail();

        /* Loop thru selected colors */
        var thumbnail_colors = [];
        for (var k in this.possibleColors){
          if (this.possibleColors[k] == true)
            thumbnail_colors.push( { hex : k, name : this.HexToName[k], thumbnail : $scope.canvas__color_getThumbnail(k) } );
        }
        var json = $scope.getJSON();
        $scope.doToggleBorder();

      $http.post($scope.main.api_url+'/admin/designs', {'name' : this.design_name, 'color' : this.selectedColor, 'garment' : this.selectedProduct,
       'json' : json, 'thumbnail': thumbnail_1, 'colors' : thumbnail_colors, 'sizes' : this.sizes, 'artwork_image' : $scope.canvas__getDesign() } ).
        success(function(data, status, headers, config) {
          alert('Saved!');
          document.location.href = 'http://'+document.location.hostname+'/'+'artworks/designs/edit/'+data.id;
        }).
        error(function(data, status, headers, config) {
          alert('An error occurred! Check your console log!');
          console.log(data);
        });
      };

      this.saveDesign = function() {
        console.log('saveDesign'+this.design_name+this.selectedColor+this.selectedProduct);
        console.log(this.possibleColors);
        $scope.doToggleBorder();
        var thumbnail_1 = $scope.canvas__getThumbnail();
        /* Loop thru selected colors */
        var thumbnail_colors = [];
        for (var k in this.possibleColors){
          if (this.possibleColors[k] == true)
            thumbnail_colors.push( { hex : k, name : this.HexToName[k], thumbnail : $scope.canvas__color_getThumbnail(k) } );
        }
        

        var json = $scope.getJSON();
        $scope.doToggleBorder();

        

        $http.put($scope.main.api_url+'/admin/designs/'+$routeParams.id, {'name' : this.design_name, 'color' : this.selectedColor, 'garment' : this.selectedProduct,
       'json' : json, 'thumbnail': thumbnail_1, 'colors' : thumbnail_colors, 'sizes' : this.sizes, 'artwork_image' : $scope.canvas__getDesign() } ).
        success(function(data, status, headers, config) {
          console.log(data);
          alert('Saved!');
          location.reload();
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
