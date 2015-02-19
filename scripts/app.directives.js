angular.module("app.directives", [])
.directive("imgHolder", [function() {
  return {
    restrict: "A",
    link: function(scope, ele) {
      return Holder.run({
        images: ele[0]
      })
    }
  }
}
])
.directive("customBackground", function() {
  return {
    restrict: "A",
    controller: ["$scope", "$element", "$location",
    function($scope, $element, $location) {
      var addBg, path;
      return path = function() {
        return $location.path()
      },
      addBg = function(path) {
        switch ($element.removeClass("body-home body-special body-tasks body-lock"), path) {
          case "/": return $element.addClass("body-home");
          case "/404":
            case "/500":
              case "/signin":
                case "/signup":
                  case "/forgot-password": return $element.addClass("body-special");
                  case "/lock-screen": return $element.addClass("body-special body-lock");
                  case "/tasks": return $element.addClass("body-tasks")
                }
              },
              addBg($location.path()), $scope.$watch(path, function(newVal, oldVal) {
                return newVal !== oldVal ? addBg($location.path()) : void 0
              })
            }
            ]
          }
        })

        .directive('ngReallyClick', [function() {
          return {
            restrict: 'A',
            link: function(scope, element, attrs) {
              element.bind('click', function() {
                var message = attrs.ngReallyMessage;
                if (message && confirm(message)) {
                  scope.$apply(attrs.ngReallyClick);
                }
              });
            }
          }
        }])

        .directive('ngAutocomplete', function() {
          return {
            require: 'ngModel',
            scope: {
              ngModel: '=',
              options: '=?',
              details: '=?'
            },

            link: function(scope, element, attrs, controller) {

              //options for autocomplete
              var opts
              var watchEnter = false
              //convert options provided to opts
              var initOpts = function() {

                opts = {}
                if (scope.options) {

                  if (scope.options.watchEnter !== true) {
                    watchEnter = false
                  } else {
                    watchEnter = true
                  }

                  if (scope.options.types) {
                    opts.types = []
                    opts.types.push(scope.options.types)
                    scope.gPlace.setTypes(opts.types)
                  } else {
                    scope.gPlace.setTypes([])
                  }

                  if (scope.options.bounds) {
                    opts.bounds = scope.options.bounds
                    scope.gPlace.setBounds(opts.bounds)
                  } else {
                    scope.gPlace.setBounds(null)
                  }

                  if (scope.options.country) {
                    opts.componentRestrictions = {
                      country: scope.options.country
                    }
                    scope.gPlace.setComponentRestrictions(opts.componentRestrictions)
                  } else {
                    scope.gPlace.setComponentRestrictions(null)
                  }
                }
              }

              if (scope.gPlace == undefined) {
                scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
              }
              google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                var result = scope.gPlace.getPlace();
                if (result !== undefined) {
                  if (result.address_components !== undefined) {

                    scope.$apply(function() {

                      scope.details = result;

                      controller.$setViewValue(element.val());
                    });
                  }
                  else {
                    if (watchEnter) {
                      getPlace(result)
                    }
                  }
                }
              })

              //function to get retrieve the autocompletes first result using the AutocompleteService
              var getPlace = function(result) {
                var autocompleteService = new google.maps.places.AutocompleteService();
                if (result.name.length > 0){
                  autocompleteService.getPlacePredictions(
                    {
                      input: result.name,
                      offset: result.name.length
                    },
                    function listentoresult(list, status) {
                      if(list == null || list.length == 0) {

                        scope.$apply(function() {
                          scope.details = null;
                        });

                      } else {
                        var placesService = new google.maps.places.PlacesService(element[0]);
                        placesService.getDetails(
                          {'reference': list[0].reference},
                          function detailsresult(detailsResult, placesServiceStatus) {

                            if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                              scope.$apply(function() {

                                controller.$setViewValue(detailsResult.formatted_address);
                                element.val(detailsResult.formatted_address);

                                scope.details = detailsResult;

                                //on focusout the value reverts, need to set it again.
                                var watchFocusOut = element.on('focusout', function(event) {
                                  element.val(detailsResult.formatted_address);
                                  element.unbind('focusout')
                                })

                              });
                            }
                          }
                        );
                      }
                    });
                }
              }

              controller.$render = function () {
                var location = controller.$viewValue;
                element.val(location);
              };

              //watch options provided to directive
              scope.watchOptions = function () {
                return scope.options
              };
              scope.$watch(scope.watchOptions, function () {
                initOpts()
              }, true);

            }
          };
        })
        .directive("uiColorSwitch", [
        function() {
          return {
            restrict: "A",
            link: function(scope, ele) {
              return ele.find(".color-option")
              .on("click", function(event) {
                var $this, hrefUrl, style;
                if ($this = $(this), hrefUrl = void 0, style = $this.data("style"), "loulou" === style) hrefUrl = "styles/main.css", $(
                  'link[href^="styles/main"]')
                  .attr("href", hrefUrl);
                  else {
                    if (!style) return !1;
                    style = "-" + style, hrefUrl = "styles/main" + style + ".css", $('link[href^="styles/main"]')
                    .attr("href", hrefUrl)
                  }
                  return event.preventDefault()
                })
              }
            }
          }
          ])
          .directive("toggleMinNav", ["$rootScope",function($rootScope) {
            return {
              restrict: "A",
              link: function(scope, ele) {
                var $content, $nav, $window, Timer, app, updateClass;
                return app = $("#app"), $window = $(window), $nav = $("#nav-container"), $content = $("#content"), ele.on("click", function(e) {
                  return app.hasClass("nav-min") ? app.removeClass("nav-min") : (app.addClass("nav-min"), $rootScope.$broadcast("minNav:enabled")), e
                  .preventDefault()
                }), Timer = void 0, updateClass = function() {
                  var width;
                  return width = $window.width(), 768 > width ? app.removeClass("nav-min") : void 0
                },
                $window.resize(function() {
                  var t;
                  return clearTimeout(t), t = setTimeout(updateClass, 300)
                })
              }
            }
          }
          ])
          .directive("collapseNav", [function() {
            return {
              restrict: "A",
              link: function(scope, ele) {
                var $a, $aRest, $lists, $listsRest, app;
                return $lists = ele.find("ul")
                .parent("li"), $lists.append('<i class="fa fa-caret-right icon-has-ul"></i>'), $a = $lists.children("a"), $listsRest = ele.children("li")
                .not($lists), $aRest = $listsRest.children("a"), app = $("#app"), $a.on("click", function(event) {
                  var $parent, $this;
                  return app.hasClass("nav-min") ? !1 : ($this = $(this), $parent = $this.parent("li"), $lists.not($parent)
                  .removeClass("open")
                  .find("ul")
                  .slideUp(), $parent.toggleClass("open")
                  .find("ul")
                  .slideToggle(), event.preventDefault())
                }), $aRest.on("click", function() {
                  return $lists.removeClass("open")
                  .find("ul")
                  .slideUp()
                }), scope.$on("minNav:enabled", function() {
                  return $lists.removeClass("open")
                  .find("ul")
                  .slideUp()
                })
              }
            }
          }
          ])
          .directive("highlightActive", [function() {
            return {
              restrict: "A",
              controller: ["$scope", "$element", "$attrs", "$location",
              function($scope, $element, $attrs, $location) {
                var highlightActive, links, path;
                return links = $element.find("a"), path = function() {
                  return $location.path()
                },
                highlightActive = function(links, path) {
                  return path = "#" + path, angular.forEach(links, function(link) {
                    var $li, $link, href;
                    return $link = angular.element(link), $li = $link.parent("li"), href = $link.attr("href"), $li.hasClass("active") &&
                    $li.removeClass("active"), 0 === path.indexOf(href) ? $li.addClass("active") : void 0
                  })
                },
                highlightActive(links, $location.path()), $scope.$watch(path, function(newVal, oldVal) {
                  return newVal !== oldVal ? highlightActive(links, $location.path()) : void 0
                })
              }
              ]
            }
          }
          ])
          .directive("toggleOffCanvas", [function() {
            return {
              restrict: "A",
              link: function(scope, ele) {
                return ele.on("click", function() {
                  return $("#app")
                  .toggleClass("on-canvas")
                })
              }
            }
          }
          ])
          .directive("slimScroll", [function() {
            return {
              restrict: "A",
              link: function(scope, ele, attrs) {
                return ele.slimScroll({
                  height: attrs.scrollHeight || "100%"
                })
              }
            }
          }
          ])
          .directive('dynamicTable', function() {
            return {
              restrict:'E',
              templateUrl: 'templates/template_dynamic-table.html'
            };
          })

          // UI FORMS DIRECTIVES

          .directive("uiRangeSlider", [
          function() {
            return {
              restrict: "A",
              link: function(scope, ele) {
                return ele.slider()
              }
            }
          }
          ])
          .directive("uiFileUpload", [function() {
            return {
              restrict: "A",
              link: function(scope, ele) {
                return ele.bootstrapFileInput()
              }
            }
          }
          ])
          .directive("uiSpinner", [function() {
            return {
              restrict: "A",
              compile: function(ele) {
                return ele.addClass("ui-spinner"), {
                  post: function() {
                    return ele.spinner()
                  }
                }
              }
            }
          }
          ])
          .directive("uiWizardForm", [function() {
            return {
              link: function(scope, ele) {
                return ele.steps()
              }
            }
          }
          ])

          // UI DIRECTIVES

          .directive("uiTime", [function() {
            return {
              restrict: "A",
              link: function(scope, ele) {
                var checkTime, startTime;
                return startTime = function() {
                  var h, m, s, t, time, today;
                  return today = new Date, h = today.getHours(), m = today.getMinutes(), s = today.getSeconds(),
                  m = checkTime(m), s = checkTime(s), time = h + ":" + m + ":" + s, ele.html(time), t = setTimeout(startTime, 500)
                },
                checkTime = function(i) {
                  return 10 > i && (i = "0" + i), i
                },
                startTime()
              }
            }
          }
          ])
          .directive("uiWeather", [function() {
            return {
              restrict: "A",
              link: function(scope, ele, attrs) {
                var color, icon, skycons;
                return color = attrs.color, icon = Skycons[attrs.icon], skycons = new Skycons({
                  color: color,
                  resizeClear: !0
                }), skycons.add(ele[0], icon), skycons.play()
              }
            }
          }
          ])

          .directive('ngPrint', function () {
            var printSection = document.getElementById('printSection');
            // if there is no printing section, create one
            if (!printSection) {
              printSection = document.createElement('div');
              printSection.id = 'printSection';
              document.body.appendChild(printSection);
            }
            function link(scope, element, attrs) {
              element.on('click', function () {
                var elemToPrint = document.getElementById(attrs.printElementId);
                if (elemToPrint) {
                  printElement(elemToPrint);
                }
              });
              window.onafterprint = function () {
                // clean the print section before adding new content
                printSection.innerHTML = '';
              }
            }
            function printElement(elem) {
              // clones the element you want to print
              var domClone = elem.cloneNode(true);
              printSection.appendChild(domClone);
              window.print();
            }
            return {
              link: link,
              restrict: 'A'
            };

          })

          // CHART DIRECTIVES

          .directive("gaugeChart", [function() {
            return {
              restrict: "A",
              scope: {
                data: "=",
                options: "="
              },
              link: function(scope, ele) {
                var data, gauge, options;
                return data = scope.data, options = scope.options, gauge = new Gauge(ele[0])
                .setOptions(options), gauge.maxValue = data.maxValue, gauge.animationSpeed = data.animationSpeed,
                gauge.set(data.val)
              }
            }
          }
          ])
          .directive("flotChart", [function() {
            return {
              restrict: "A",
              link: function(scope, elem, attrs){

                var chart = null;
                var chartoptions = {series: {
                  lines: {show:!0,fill:!0, fillColor: {colors: [{opacity:0},{opacity:.3}]}},
                  points: {show:!0,lineWidth:2,fill:!0,fillColor:"#ffffff",symbol:"circle",radius:5}
                },
                colors: ["#31C0BE","#8170CA","#E87352"],
                tooltip: !0,
                tooltipOpts: {defaultTheme:!1},
                grid: {hoverable:!0,clickable:!0,tickColor:"#f9f9f9",borderWidth:1,borderColor:"#eeeeee"},
                xaxis: {ticks: [[1,"Jan."],[2,"Feb."],[3,"Mar."],[4,"Apr."],[5,"May"],[6,"June"],[7,"July"],[8,"Aug."],[9,"Sept."],[10,"Oct."],[11,"Nov."],[12,"Dec."]]}
              };

              scope.$watch('datainput', function(newValue, oldValue){
                if(!chart)
                {
                  chart = $.plot(elem, newValue , chartoptions);
                  elem.show();
                }
                chart.setData(newValue);
                chart.setupGrid();
                chart.draw();
              }, true);

            }
          }
        }
        ])

        .directive('customChart', function(){
          return{
            restrict: 'A',
            link: function(scope, elem, attrs){

              var chart = null;
              var chartoptions = {
                series:{pie: {show: true, innerRadius: .3}},
                legend: {show: true},
                grid: {hoverable: !0, clickable: !0},
                colors: ["#60CD9B", "#66B5D7", "#EEC95A", "#E87352"],
                tooltip: !0,
                tooltipOpts: {content: "%p.0%, %s", defaultTheme: !1}
              };

              scope.$watch('datainput', function(newValue, oldValue){
                if(!chart)
                {
                  chart = $.plot(elem, newValue , chartoptions);
                  elem.show();
                }
                chart.setData(newValue);
                chart.setupGrid();
                chart.draw();
              }, true);

            }
          };
        })

        .directive("flotChartRealtime", [function() {
          return {
            restrict: "A",
            link: function(scope, ele) {
              var data, getRandomData, plot, totalPoints, update, updateInterval;
              return data = [], totalPoints = 300, getRandomData = function() {
                var i, prev, res, y;
                for (data.length > 0 && (data = data.slice(1)); data.length < totalPoints;) prev = data.length > 0 ? data[data.length - 1] : 50, y =
                  prev + 10 * Math.random() - 5, 0 > y ? y = 0 : y > 100 && (y = 100), data.push(y);
                  for (res = [], i = 0; i < data.length;) res.push([i, data[i]]), ++i;
                  return res
                },
                update = function() {
                  plot.setData([getRandomData()]), plot.draw(), setTimeout(update, updateInterval)
                },
                data = [], totalPoints = 300, updateInterval = 200, plot = $.plot(ele[0], [getRandomData()], {
                  series: {
                    lines: {
                      show: !0,
                      fill: !0
                    },
                    shadowSize: 0
                  },
                  yaxis: {
                    min: 0,
                    max: 100
                  },
                  xaxis: {
                    show: !1
                  },
                  grid: {
                    hoverable: !0,
                    borderWidth: 1,
                    borderColor: "#eeeeee"
                  },
                  colors: ["#5BDDDC"]
                }), update()
              }
            }
          }
          ])
          .directive("sparkline", [function() {
            return {
              restrict: "A",
              scope: {
                data: "=",
                options: "="
              },
              link: function(scope, ele) {
                var data, options, sparkResize, sparklineDraw;
                return data = scope.data, options = scope.options, sparkResize = void 0, sparklineDraw = function() {
                  return ele.sparkline(data, options)
                },
                $(window)
                .resize(function() {
                  return clearTimeout(sparkResize), sparkResize = setTimeout(sparklineDraw, 200)
                }), sparklineDraw()
              }
            }
          }
          ])
          .directive("morrisChart", [function() {
            return {
              restrict: "A",
              scope: {
                data: "="
              },
              link: function(scope, ele, attrs) {
                var colors, data, func, options;
                switch (data = scope.data, attrs.type) {
                  case "line":
                    return colors = void 0 === attrs.lineColors || "" === attrs.lineColors ? null : JSON.parse(attrs.lineColors), options = {
                      element: ele[0],
                      data: data,
                      xkey: attrs.xkey,
                      ykeys: JSON.parse(attrs.ykeys),
                      labels: JSON.parse(attrs.labels),
                      lineWidth: attrs.lineWidth || 2,
                      lineColors: colors || ["#0b62a4", "#7a92a3", "#4da74d", "#afd8f8", "#edc240", "#cb4b4b", "#9440ed"],
                      resize: !0
                    },
                    new Morris.Line(options);
                    case "area":
                      return colors = void 0 === attrs.lineColors || "" === attrs.lineColors ? null : JSON.parse(attrs.lineColors), options = {
                        element: ele[0],
                        data: data,
                        xkey: attrs.xkey,
                        ykeys: JSON.parse(attrs.ykeys),
                        labels: JSON.parse(attrs.labels),
                        lineWidth: attrs.lineWidth || 2,
                        lineColors: colors || ["#0b62a4", "#7a92a3", "#4da74d", "#afd8f8", "#edc240", "#cb4b4b", "#9440ed"],
                        behaveLikeLine: attrs.behaveLikeLine || !1,
                        fillOpacity: attrs.fillOpacity || "auto",
                        pointSize: attrs.pointSize || 4,
                        resize: !0
                      },
                      new Morris.Area(options);
                      case "bar":
                        return colors = void 0 === attrs.barColors || "" === attrs.barColors ? null : JSON.parse(attrs.barColors),
                        options = {
                          element: ele[0],
                          data: data,
                          xkey: attrs.xkey,
                          ykeys: JSON.parse(attrs.ykeys),
                          labels: JSON.parse(attrs.labels),
                          barColors: colors || ["#0b62a4", "#7a92a3", "#4da74d", "#afd8f8", "#edc240", "#cb4b4b", "#9440ed"],
                          stacked: attrs.stacked || null,
                          resize: !0
                        },
                        new Morris.Bar(options);
                        case "donut":
                          return colors = void 0 === attrs.colors || "" === attrs.colors ? null : JSON.parse(attrs.colors),
                          options = {
                            element: ele[0],
                            data: data,
                            colors: colors || ["#0B62A4", "#3980B5", "#679DC6", "#95BBD7", "#B0CCE1", "#095791", "#095085", "#083E67", "#052C48", "#042135"],
                            resize: !0
                          },
                          attrs.formatter && (func = new Function("y", "data", attrs.formatter), options.formatter = func), new Morris.Donut(options)
                        }
                      }
                    }
                  }
                  ])

          .directive("goBack", [function() {
            return {
              restrict: "A",
              controller: ["$scope", "$element", "$window",
              function($scope, $element, $window) {
                return $element.on("click", function() {
                  return $window.history.back()
                })
              }
              ]
            }
          }
          ]);
