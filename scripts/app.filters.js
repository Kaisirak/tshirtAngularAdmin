angular.module("app.filters", [])

.filter('wizardstep', function() {
  return function(input) {
    var tmpArray = input.split('-');
    for (var i = 0; i < tmpArray.length; i++)
    {
      if (tmpArray[i].length > 2)
        tmpArray[i] = tmpArray[i].substring(0,1).toUpperCase() + tmpArray[i].substring(1);
    }
    return tmpArray.join(" ");
  };
})

.filter('formatpropertytitle', function() {
  return function(input, param) {
    if (input != "")
    {
      input = input.substring(0,1).toUpperCase() + input.substring(1);
      input = input.match(/([A-Z]|[a-z])[a-z]+/g).join(' ');
    }
    return input;
  }
})

.filter('ConfirmedEmail', function(element) {
  return element.status == 1 ? true : false;
})

.filter('PendingEmail', function(element) {
  return element.status == 0 ? true : false;
})
