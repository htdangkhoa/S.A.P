var app = angular.module("myApp", []);
app.config(function(){

})

$("#volume").slider({
	min: 0,
	max: 100,
	value: 50,
	range: "min",
	slide: function(event, ui) {
	// setVolume(ui.value / 100);
	}
});