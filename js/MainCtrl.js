app.controller("MainCtrl", function($scope, $timeout) {
	var fs = require("fs");
	var path = require("path");
	var mm = require('music-metadata');
	var secToMin = require('sec-to-min');

	var home_path = process.env.HOME;
	process.env.MUSIC = JSON.stringify([]);

	var music_path = JSON.parse(process.env.MUSIC);

	$scope.musics = [];
	$scope.showCover = false;
	$scope.current;
	$scope.isPlay = false;
	$scope.isPause = true;
	$scope.loops = ["none", "all", "one"];


	if (!localStorage.getItem("loop") || $scope.loops.indexOf(localStorage.getItem("loop")) === -1){
		localStorage.setItem("loop", "none");
	}
	$scope.loop = localStorage.getItem("loop");

	if (!localStorage.getItem("shuffle")){
		localStorage.setItem("shuffle", false);
	}
	$scope.shuffle = localStorage.getItem("shuffle");

	initMusicPath();

	function initMusicPath() {
		$scope.platform = navigator.platform;
		if ($scope.platform.indexOf("Win") !== -1){

		}else if ($scope.platform.indexOf("Mac") !== -1){

		}else {
			// console.log(music_path[0]);
			 music_path.push(home_path + "/Music");
		}
	}

	// fs.realpath(music_path[0], function(err, path) {
	//     if (err) {
	//         console.log(err);
	//      return;
	//     }
	//     console.log('Path is : ' + path);
	// });

	// var files = fs.readdirSync(music_path[0]);

	fs.readdir(music_path[0], { duration: true }, function(err, files) {
	    if (err) return;

	    files.forEach(function(f) {
	    	var filePath = music_path[0] + "/" + f;
	    	var extension = path.extname(filePath);

			var audioStream = fs.createReadStream(filePath)

			mm.parseStream(audioStream, {native: true}, function (err, metadata) {
				audioStream.close();
				if (err) throw err;

				if (!metadata.common.title) {
					metadata.common.title = f.replace(extension, "");
				}

				metadata.common.path = music_path[0] + "/" + encodeURIComponent(f);

				metadata.format.duration = secToMin(metadata.format.duration);

				if (metadata.format.duration.indexOf(":") === 1){
					metadata.format.duration = "0" + metadata.format.duration;
				}

				$timeout(function() {
					$scope.musics.push(metadata);
					$scope.$apply();
				}, 0);
			});
	    });

	    fs.closeSync(2);
	});

	$scope.playSong = function(index, path, title, artist, img, time){
		$(".selected").removeClass("selected")
		
		$scope.track_title = title;
		$scope.track_artist = artist;

		if (img) {
			$scope.cover = bufferToBase64(img[0].data);
			$scope.showCover = true;
		}else {
			$scope.showCover = false;
		}

		playAudio(path.toString(), ($('#volume-duration').slider("option").value / 100));

		$scope.current = index;

		$scope.isPlay = true;
		$scope.isPause = false;

		$($(".track")[index]).addClass("selected");
		$(".cover").css("animation-play-state", "running");

		$scope.durationTo = time;

		if ($scope.durationTo.indexOf(":") === 1){
			$scope.durationTo = "0" + $scope.durationTo;
		}
	}

	$scope.nextSong =function(isLoop, isShuffle) {
		console.log(isLoop, isShuffle);

		var index;

		if ($scope.current >= $scope.musics.length - 1) {
			index = 0;
		}else {
			index = $scope.current + 1;
		}

		var path = $scope.musics[index].path;
		var title = $scope.musics[index].title;
		var artist = $scope.musics[index].artist;
		var img = $scope.musics[index].image;
		var time = $scope.musics[index].time;

		$scope.playSong(index, path, title, artist, img, time);
	}

	$scope.previousSong =function(isLoop, isShuffle) {
		var index;

		if ($scope.current <= 0) {
			index = $scope.musics.length - 1;
		}else {
			index = $scope.current - 1;
		}

		var path = $scope.musics[index].path;
		var title = $scope.musics[index].title;
		var artist = $scope.musics[index].artist;
		var img = $scope.musics[index].image;
		var time = $scope.musics[index].time;

		$scope.playSong(index, path, title, artist, img, time);
	}

	$scope.play = function(){
		if ($scope.current) {
			myMedia.play();
			$scope.isPlay = true;
			$scope.isPause = false;
			$(".cover").css("animation-play-state", "running");
		}
	}

	$scope.pause = function(){
		myMedia.pause();
		$scope.isPlay = false;
		$scope.isPause = true;
		$(".cover").css("animation-play-state", "paused");
	}

	$scope.loopFunction = function(){
		var index = $scope.loops.indexOf($scope.loop);

		if (index === 2){
			index = -1;
		}
		
		$scope.loop = $scope.loops[index+1];


		localStorage.setItem("loop", $scope.loop);
	}

	$scope.shuffleFunction = function(){
		if (JSON.parse($scope.shuffle)){
			localStorage.setItem("shuffle", false);
		}else{
			localStorage.setItem("shuffle", true);
		}

		$scope.shuffle = localStorage.getItem("shuffle");
	}

	myMedia.addEventListener("ended", function(){
		$timeout(function() {
			$scope.nextSong();
		}, 0);
	})

	myMedia.addEventListener('timeupdate', function(){
		// console.log($("#audio-player")[0].currentTime);
		$("#seek-duration").slider({
			min: 0,
			max: $("#audio-player")[0].duration,
			value: $("#audio-player")[0].currentTime,
			range: "min",
			slide: function(event, ui) {
				// console.log(ui.value/100);
				$("#audio-player")[0].currentTime = ui.value;
			}
		})

		$timeout(function() {
			$scope.durationFrom = secToMin($("#audio-player")[0].currentTime);
			if ($scope.durationFrom.indexOf(":") === 1){
				$scope.durationFrom = "0" + $scope.durationFrom;
			}
		}, 0);
	});

	function bufferToBase64(buf) {
	    var binstr = Array.prototype.map.call(buf, function (ch) {
	        return String.fromCharCode(ch);
	    }).join('');
	    return "data:image/png;base64," + btoa(binstr);
	}
});