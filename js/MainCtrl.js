app.controller("MainCtrl", function($scope, $timeout) {
	var fs = require("fs");
	var nodeID3 = require("node-id3");
	var mp3Duration = require('mp3-duration');
	var secToMin = require('sec-to-min');

	var home_path = process.env.HOME;
	process.env.MUSIC = JSON.stringify([]);

	var music_path = JSON.parse(process.env.MUSIC);

	$scope.musics = [];
	$scope.showCover = false;
	$scope.current;
	$scope.isPlay = false;
	$scope.isPause = true;

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
	fs.readdir(music_path[0], function(err, files) {
	    if (err) return;

	    files.forEach(function(f) {
	    	var read = nodeID3.read(music_path[0] + "/" + f);

	    	if (!read.title) {
	    		read.title = f.toString().substring(0, f.toString().indexOf("."))
	    	}
	    	if (!read.artist) {
	    		read.artist = "Unknown"
	    	}
	    	if (!read.album) {
	    		read.album = "Unknown"
	    	}
	    	

	    	read.path = music_path[0] + "/" + encodeURIComponent(f);

	    	mp3Duration(music_path[0] + "/" + f, function (err, duration) {
				if (err) return console.log(err.message);

				read.time = secToMin(duration);

				$timeout(function() {
					$scope.musics.push(read);
					$scope.$apply();
				}, 0);
			});

			console.log(read)
	    });

	    fs.closeSync(2);
	});

	$scope.playSong = function(index, path, title, artist, img){
		$(".selected").removeClass("selected")
		
		$scope.track_title = title;
		$scope.track_artist = artist;

		if (img.type.id !== 0){
			$scope.cover = bufferToBase64(img.imageBuffer)
			$scope.showCover = true;
		}else {
			$scope.showCover = false;
		}

		playAudio(path.toString(), 0.5);

		$scope.current = index;

		$scope.isPlay = true;
		$scope.isPause = false;

		$($(".track")[index]).addClass("selected");
	}

	$scope.nextSong =function(isLoop, isShuffle) {
		var index;

		// $($(".track")[$scope.current]).removeClass("selected");

		if ($scope.current >= $scope.musics.length - 1) {
			index = 0;
		}else {
			index = $scope.current + 1;
		}

		var path = $scope.musics[index].path;
		var title = $scope.musics[index].title;
		var artist = $scope.musics[index].artist;
		var img = $scope.musics[index].image;

		$scope.playSong(index, path, title, artist, img);
	}

	$scope.previousSong =function(isLoop, isShuffle) {
		var index;

		// $($(".track")[$scope.current]).removeClass("selected");

		if ($scope.current <= 0) {
			index = $scope.musics.length - 1;
		}else {
			index = $scope.current - 1;
		}

		var path = $scope.musics[index].path;
		var title = $scope.musics[index].title;
		var artist = $scope.musics[index].artist;
		var img = $scope.musics[index].image;

		$scope.playSong(index, path, title, artist, img);
	}

	$scope.play = function(){
		if ($scope.current) {
			myMedia.play();
			$scope.isPlay = true;
			$scope.isPause = false;
		}
	}

	$scope.pause = function(){
		myMedia.pause();
		$scope.isPlay = false;
		$scope.isPause = true;
	}

	myMedia.addEventListener("ended", function(){
		$timeout(function() {
			$scope.nextSong();
		}, 0);
	})



	function bufferToBase64(buf) {
	    var binstr = Array.prototype.map.call(buf, function (ch) {
	        return String.fromCharCode(ch);
	    }).join('');
	    return "data:image/png;base64," + btoa(binstr);
	}
});