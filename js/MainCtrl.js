app.controller("MainCtrl", function($scope, $timeout, $filter) {
	var fs = require("fs");
	var _path = require("path");
	var mm = require("music-metadata");
	var secToMin = require("sec-to-min");
	var ytdl = require("youtube-dl");
	var downloader = require('../node_modules/youtube-dl/lib/downloader');

	var home_path = process.env.HOME;
	process.env.MUSIC = JSON.stringify([]);

	var music_path = JSON.parse(process.env.MUSIC);

	var list_random = [];
	$scope.musics = [];
	$scope.showCover = false;
	$scope.current;
	$scope.count = 0;
	$scope.isPlay = false;
	$scope.isPause = true;
	$scope.loops = ["none", "all", "one"];
	$scope.total_songs = 0;
	$scope.total_time = "00:00";
	var totalTime = 0;
	$scope.sort = "common.title";


	if (!localStorage.getItem("loop") || $scope.loops.indexOf(localStorage.getItem("loop")) === -1){
		localStorage.setItem("loop", "none");
	}
	$scope.loop = localStorage.getItem("loop");
	if ($scope.loop === "one") {
		myMedia.setAttribute("loop", "loop");
	}

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

	fs.readdir(music_path[0], function(err, files) {
	    if (err) return;

	    files.forEach(function(f) {
	    	var filePath = music_path[0] + "/" + f;
	    	var extension = _path.extname(filePath);

	    	if (extension === ".mp3" || extension === ".ogg" || extension === ".wav") {
	    		var audioStream = fs.createReadStream(filePath)

				mm.parseStream(audioStream, {native: true}, function (err, metadata) {
					audioStream.close();
					if (err) throw err;

					if (!metadata.common.title) {
						metadata.common.title = f.replace(extension, "");
					}

					if (!metadata.common.artists[0]) {
						metadata.common.artists[0] = "Unknown";
					}

					if (!metadata.common.album) {
						metadata.common.album = "Unknown";
					}

					metadata.common.path = music_path[0] + "/" + encodeURIComponent(f);

					totalTime += parseFloat(metadata.format.duration);

					if (secToMin(totalTime).indexOf(":") === 1){
						$scope.total_time = "0" + secToMin(totalTime);
					}else {
						$scope.total_time = secToMin(totalTime);
					}

					if (parseInt($scope.total_time.substring(0, $scope.total_time.indexOf(":"))) <= 1){
						$scope.minutes = false;
					}else {
						$scope.minutes = true;
					}
					
					metadata.format.duration = secToMin(metadata.format.duration);

					if (metadata.format.duration.indexOf(":") === 1){
						metadata.format.duration = "0" + metadata.format.duration;
					}

					$timeout(function() {
						$scope.musics.push(metadata);
						$scope.$apply();
						$scope.musics = $filter("orderBy")($scope.musics, $scope.sort);
						$scope.total_songs = $scope.musics.length;
					}, 0);
				});
	    	}
	    });

	    fs.closeSync(2);
	});

	$scope.playSong = function(index, path, title, artist, img, time){
		$(".track").removeClass("selected");

		$(".cover").each(function(){
			$(this).addClass("spinning");
		});

		var checkFile = false;

		var files = fs.readdirSync(music_path[0]);

		files.forEach(function(item) {
			if (path === music_path[0] + "/" + encodeURIComponent(item)){
				console.log("ok")
				checkFile = true;
			}
		})

		if (checkFile) {
			if ($scope.shuffle === "true" && list_random.length === 0) {
				list_random.push(index);
			}
			
			$scope.track_title = title;
			$scope.track_artist = artist;

			if (img && img.APIC) {
				$scope.cover = bufferToBase64(img.APIC[0].data);
				$scope.showCover = true;
			}else {
				$scope.showCover = false;
			}

			playAudio(path.toString(), ($('#volume-duration').slider("option").value / 100));

			$scope.current = index;
			$scope.count += 1;

			$scope.isPlay = true;
			$scope.isPause = false;

			$($(".track")[index]).addClass("selected");
			$(".cover").css("animation-play-state", "running");

			$scope.durationTo = time;

			if ($scope.durationTo.indexOf(":") === 1){
				$scope.durationTo = "0" + $scope.durationTo;
			}
		}else {
			$scope.pause();
			$(".cover").removeClass("spinning");
			$("#audio-player")[0].currentTime = 0;
			$scope.count = 1;
		}
	}

	$scope.nextSong =function(isLoop, isShuffle) {
		var index;

		if (isShuffle === "true") {
			index = $scope.random();
		}else {
			if ($scope.current >= $scope.musics.length - 1) {
				index = 0;
			}else {
				index = $scope.current + 1;
			}
		}

		var path = $scope.musics[index].common.path;
		var title = $scope.musics[index].common.title;
		var artist = $scope.musics[index].common.artist;
		var img = $scope.musics[index]['id3v2.3'];
		var time = $scope.musics[index].format.duration;

		$scope.playSong(index, path, title, artist, img, time);

		if (isLoop === "none" && $scope.count > $scope.musics.length) {
			$timeout(function() {
				$scope.pause();
				$(".cover").removeClass("spinning");
				$("#audio-player")[0].currentTime = 0;
				$scope.count = 1;
			}, 10);
		}
	}

	$scope.previousSong =function(isLoop, isShuffle) {
		var index;

		if (isShuffle === "true") {
			index = $scope.random();
		}else {
			if ($scope.current <= 0) {
				index = $scope.musics.length - 1;
			}else {
				index = $scope.current - 1;
			}
		}

		var path = $scope.musics[index].common.path;
		var title = $scope.musics[index].common.title;
		var artist = $scope.musics[index].common.artist;
		var img = $scope.musics[index]['id3v2.3'];
		var time = $scope.musics[index].format.duration;

		$scope.playSong(index, path, title, artist, img, time);

		console.log($scope.count)

		if (isLoop === "none" &&  $scope.count > $scope.musics.length) {
			$timeout(function() {
				$scope.pause();
				$(".cover").removeClass("spinning");
				$scope.count = 1;
				$("#audio-player")[0].currentTime = 0;
			}, 10);
		}
	}

	$scope.play = function(){
		if ($scope.current !== undefined) {
			myMedia.play();
			$scope.isPlay = true;
			$scope.isPause = false;

			$(".cover").each(function(){
				$(this).addClass("spinning");
			});

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

		if (index === 1){
			myMedia.setAttribute("loop", "loop");
		}else {
			myMedia.removeAttribute("loop");
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
			$scope.nextSong($scope.loop, $scope.shuffle);
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
	
	$scope.random = function(){
		do {

			if (list_random.length === $scope.musics.length){
				list_random = [];
			}

			$scope.index = Math.floor(Math.random() * ($scope.musics.length));
		} while(list_random.indexOf($scope.index) !== -1)

		list_random.push($scope.index);

		console.log(list_random)
		console.log(list_random[list_random.length-1])

		return list_random[list_random.length-1];
	}

	$scope.changeSort = function(mode) {
		$(".sort-button").removeClass("selected");
		if (mode === "time"){
			$timeout(function() {
				$($(".sort-button")[1]).addClass("selected");
			}, 0);
			$scope.sort = "format.duration";
		}else if (mode === "artist") {
			$timeout(function() {
				$($(".sort-button")[2]).addClass("selected");
			}, 0);
			$scope.sort = "common.artists[0]";
		}else if (mode === "album") {
			$timeout(function() {
				$($(".sort-button")[3]).addClass("selected");
			}, 0);
			$scope.sort = "common.album";
		}else {
			$timeout(function() {
				$($(".sort-button")[0]).addClass("selected");
			}, 0);
			$scope.sort = "common.title";
		}

		$scope.musics = $filter("orderBy")($scope.musics, $scope.sort);
	}

	function bufferToBase64(buf) {
	    var binstr = Array.prototype.map.call(buf, function (ch) {
	        return String.fromCharCode(ch);
	    }).join('');
	    return "data:image/png;base64," + btoa(binstr);
	}

	$scope.yt = function(){
		var url = 'https://www.youtube.com/watch?v=H7HmzwI67ec';
		ytdl.exec(url, ['-x', '--audio-format', 'mp3'], {}, function(err, output) {
		  if (err) throw err;
		  console.log(output.join('\n'));
		});

		downloader(__dirname + '/Owl City & Carly Rae Jepsen - Good Time-H7HmzwI67ec.mp3', function error(err, done) {
		  'use strict';
		  if (err) { return console.log(err.stack); }
		  console.log(done);
		});
	}
});