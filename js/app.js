var app = angular.module("myApp", ["pascalprecht.translate"]);
app.config(function($translateProvider){
	// $translateProvider.useSanitizeValueStrategy('sanitizeParameters');

	$translateProvider.useStaticFilesLoader({
	    prefix: '../locales/locale-',
	    suffix: '.json'
	  });
	  // $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
	  if (localStorage.getItem("lang") === "vi") {
	    $translateProvider.preferredLanguage("vi");
	  }else {
	    $translateProvider.preferredLanguage("en");
	    localStorage.setItem("lang", "en");
	  }
	  
	  $translateProvider.forceAsyncReload(true);
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