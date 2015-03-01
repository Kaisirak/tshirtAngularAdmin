fabric.Canvas.prototype.getItemByName = function(name) {
  var object = null,
      objects = this.getObjects();

  for (var i = 0, len = this.size(); i < len; i++) {
    if (objects[i].name && objects[i].name === name) {
      object = objects[i];
      break;
    }
  }
  return object;
};

var Detector = function() {
    var baseFonts = ['monospace', 'sans-serif', 'serif'];
    var testString = "mmmmmmmmmmlli";
    var testSize = '72px';
    var h = document.getElementsByTagName("body")[0];
    var s = document.createElement("span");

    s.style.fontSize = testSize;
    s.innerHTML = testString;
    var defaultWidth = {};
    var defaultHeight = {};
    for (var index in baseFonts)
	{
        s.style.fontFamily = baseFonts[index];
        h.appendChild(s);
        defaultWidth[baseFonts[index]] = s.offsetWidth;
        defaultHeight[baseFonts[index]] = s.offsetHeight;
        h.removeChild(s);
    }

    function detect(font) {
        var detected = false;
        for (var index in baseFonts) {
            s.style.fontFamily = font + ',' + baseFonts[index];
            h.appendChild(s);
            var matched = (s.offsetWidth != defaultWidth[baseFonts[index]] || s.offsetHeight != defaultHeight[baseFonts[index]]);
            h.removeChild(s);
            detected = detected || matched;
        }
        return detected;
    }
    this.detect = detect;
};

function doBgSearch()
{
	var tomatch = new RegExp($('#searchBg').val() + ".*", "i");
	var allBgs = $(".designer-tmpl > .designer-bg-img");
	allBgs.each(function() {
		if($(this).attr('data-name').match(tomatch))
			$(this).fadeIn(300);
		else
			$(this).fadeOut(300);
	});
	setTimeout(function() {
		$('#bg-container').css('top', '0px');
		$('#bg-container').css('position', 'relative');
	}, 500);

}
