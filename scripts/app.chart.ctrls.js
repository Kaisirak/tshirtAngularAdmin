angular.module("app.chart.ctrls", [])
.controller("orderRevenueCtrl", ["$scope", "$filter", "$http", function($scope, $filter, $http) {
  $scope.datainput = [ {data: [[1,16], [1, 3]], label:"Revenue"},
{data: [[1.6,14], [2, 43]], label:"Orders"}]
  $scope.date = {startDate: "2014-01-01", endDate: $filter('date')(Date.now(), 'yyyy-MM-dd', 'UTC')};

  $scope.getDataInput = function(){
    $http.get("/api/report/orderbyrevenue?start_date=" + $filter('date')($scope.date.startDate, 'yyyy-MM-dd', 'UTC') + "&end_date=" + $filter('date')($scope.date.endDate, 'yyyy-MM-dd', 'UTC')).then(
      function(response){
        console.log(response);
        $scope.datainput = [];
        $scope.savedreport = response.data.result;
        var tmpOrders = [];
        var tmpRevenue = [];
        for (var i = 0; i < $scope.savedreport.length; i++)
        {
          tmpOrders.push([$filter('date')($scope.savedreport[i].date_created, 'MM.dd', 'UTC'), $scope.savedreport[i].orders]);
          tmpRevenue.push([$filter('date')($scope.savedreport[i].date_created, 'MM.dd', 'UTC'), $scope.savedreport[i].total_price]);
        }
        $scope.datainput.push({data: tmpOrders, label: "Orders"});
        $scope.datainput.push({data: tmpRevenue, label: "Revenue"});
        console.log($scope.datainput);
      },
      function(error){
        console.log("error");
      }
    );
  };
}])

.controller("itemSoldCtrl", ["$scope", "$http", "$filter", function($scope, $http, $filter) {
  $scope.datainput = [];
  $scope.date = {startDate: "2014-01-01", endDate: $filter('date')(Date.now(), 'yyyy-MM-dd', 'UTC')};

  $scope.chartoptions = {
    series:{pie: {show: true, innerRadius: .5}},
    legend: {show: true},
    grid: {hoverable: !0, clickable: !0},
    colors: ["#60CD9B", "#66B5D7", "#EEC95A", "#E87352"],
    tooltip: !0,
    tooltipOpts: {content: "%p.0%, %s", defaultTheme: !1}
  };

  $scope.getDataInput = function(){
    $http.get("/api/report/orderbyitemssold?start_date=" + $filter('date')($scope.date.startDate, 'yyyy-MM-dd', 'UTC') + "&end_date=" + $filter('date')($scope.date.endDate, 'yyyy-MM-dd', 'UTC')).then(
      function(response){
        console.log(response);
        $scope.datainput = [];
        $scope.savedreport = response.data.result;
        for (var i = 0; i < $scope.savedreport.length; i++)
        {
          $scope.datainput.push({label: $scope.savedreport[i].name, data: parseInt($scope.savedreport[i].id)});
        }
      },
      function(error){
        console.log("error");
      }
    );
  };

}])


// NOT USED
.controller("customerRevenueCtrl", ["$scope", function($scope) {
  $scope.data = [ {label: "Item 1", data: 12},
                  {label: "Item 2", data: 30},
                  {label: "Item 3", data: 27},
                  {label: "Item 4", data: 45}
                ];

  $scope.options = {
    series:{pie: {show: !0, innerRadius: .5}},
    legend: {show: !0},
    grid: {hoverable: !0, clickable: !0},
    colors: ["#60CD9B", "#66B5D7", "#EEC95A", "#E87352"],
    tooltip: !0,
    tooltipOpts: {content: "%p.0%, %s", defaultTheme: !1}
  };
}])
;
