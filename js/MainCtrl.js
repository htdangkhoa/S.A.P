app.controller("MainCtrl", function($scope, $timeout, $filter, $translate) {
	const {remote} = require('electron');
	const {BrowserWindow, globalShortcut, dialog} = remote;
	let win = BrowserWindow.getFocusedWindow();
	const {Menu, MenuItem} = remote;
	let menu;
	let tray;

	var fs = require("fs");
	var _path = require("path");
	var uuid = require("node-uuid");
	var mm = require("music-metadata");
	var moment = require("moment");
	require("moment-duration-format");

	var list_random = [];
	$scope.dirs = [];
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
	$scope.sort = "title";
	$scope.notMusicFile = 0;
	$scope.locales = [{
		name: "English",
		value: "en"
	}, {
		name: "Tiếng Việt",
		value: "vi"
	}];

	$scope.themes = [{
		name: "DARK",
		value: "dark"
	}, {
		name: "LIGHT",
		value: "light"
	}]

	if (!localStorage.getItem("theme")){
		localStorage.setItem("theme", "light");

		// $scope.initTheme();
	}

	if (!localStorage.getItem("dirs")){
		localStorage.setItem("dirs", JSON.stringify([]));
	}
	$scope.dirs = JSON.parse(localStorage.getItem("dirs"));


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

	angular.element(document).ready(function(){
		$timeout(function() {
			$($("#list-folder div")[0]).css("margin-top", "0px");
		}, 0);

		$('#settingsModal').on('hidden.bs.modal', function () {
			$timeout(function() {
				var checkDirs = JSON.parse(sessionStorage.getItem("backupDirs"));
				var diffRootThanTemp = $scope.dirs.diff(checkDirs);
				var diffTempThanRoot = checkDirs.diff($scope.dirs);

				if (diffRootThanTemp.length !== 0 || diffTempThanRoot.length !== 0) {
					$scope.musics = [];
					totalTime = 0;

					$scope.total_songs = 0;
					$scope.total_time = "00:00";


					$scope.dirs.forEach(function(item) {
						$timeout(function() {
							readDir(item);
						}, 500);
					})
				}
			}, 0);
		});

		$('#settingsModal').on('shown.bs.modal', function () {
			sessionStorage.setItem("backupDirs", JSON.stringify($scope.dirs));
		});
	})

	initMusicPath();

	function readDir(path_of_dir) {
		fs.readdir(path_of_dir, function(err, files) {
		    if (err) return;

		    files.forEach(function(f) {
		    	var filePath = path_of_dir + "/" + f;
		    	var extension = _path.extname(filePath);

		    	if (!fs.statSync(filePath).isDirectory()){
	    			var audioStream = fs.createReadStream(filePath);

					mm.parseStream(audioStream, {native: true}, function (err, metadata) {
						// console.log(metadata)
						var file_type = metadata.format.dataformat;
						if (file_type === undefined) {
							console.log(f)
						}

						if (file_type !== undefined && (file_type === "mp3" || file_type === "ogg" || file_type === "wav")) {
							audioStream.close();
							if (err) {
								console.log(err, f);
								return;
							}

							var object = {};
							object.id = uuid.v4();

							if (!metadata.common.title) {
								metadata.common.title = f.replace(extension, "");
							}
							object.title = metadata.common.title;

							if (!metadata.common.artists[0]) {
								metadata.common.artists[0] = "Unknown";
							}
							object.artist = metadata.common.artists[0];

							if (!metadata.common.album) {
								metadata.common.album = "Unknown";
							}
							object.album = metadata.common.album;

							object["id3v2.3"] = metadata["id3v2.3"];

							metadata.common.path = path_of_dir + "/" + encodeURIComponent(f);
							object.path = metadata.common.path;

							totalTime = parseFloat(totalTime) + parseFloat(metadata.format.duration);
							$scope.total_time = moment.duration(totalTime, "seconds").format("hh:mm:ss");

							object.second = metadata.format.duration;

							metadata.format.duration = moment.duration(metadata.format.duration, "seconds").format("mm:ss");

							object.duration = metadata.format.duration;

							$timeout(function() {
								$scope.musics.push(object);
								$scope.$apply();

								$scope.musics = $filter("orderBy")($scope.musics, $scope.sort);
								$scope.total_songs = $scope.musics.length;
							}, 0);

							$timeout(function() {
								// $(".done").css("display", "block");
								if ($scope.musics.length === $scope.total_songs) {
									$(".loading").css("display", "none");
									$(".done").css("display", "block");

									$scope.listSearch = $scope.musics;

									// $scope.listSearch.forEach(function(item){
									// 	item.search_by_title = item.title.toLowerCase()
									// })
								}
							}, 0);
						}else {
							$scope.notMusicFile += 1;
						}
					});
		    	}else{
		    		$scope.notMusicFile += 1;
		    	}
		    });

		    // fs.closeSync(2);
		});
	}

	function init_menu_bar() {
		Menu.setApplicationMenu(null);

		$timeout(function() {
			$translate(["CHECK FOR UPDATES", "QUIT", "SORT", "BY TITLE", "BY TIME", "BY ARTIST", "BY ALBUM", "PREFERENCES", "PLAY/PAUSE", "NEXT", "PREVIOUS", "FILE", "EDIT", "CONTROL"]).then(function(data){
				var template_menu = [{
					label: data["FILE"],
					submenu: [{
						label: data["CHECK FOR UPDATES"],
						click: function(){

						}
					}, {
						type: "separator"
					}, {
						label: data["QUIT"],
						accelerator: "CmdOrCtrl+Q",
						click: function(){
							win.close();
						}
					}]
				}, {
					label: data["EDIT"],
					submenu: [{
						label: data["SORT"],
						submenu: [{
							label: data["BY TITLE"],
							click: function(){
								$timeout(function() {
									$("#btn-sort-title").trigger("click");
								}, 0);
							}
						}, {
							label: data["BY TIME"],
							click: function(){
								$timeout(function() {
									$("#btn-sort-time").trigger("click");
								}, 0);
							}
						}, {
							label: data["BY ARTIST"],
							click: function(){
								$timeout(function() {
									$("#btn-sort-artist").trigger("click");
								}, 0);
							}
						}, {
							label: data["BY ALBUM"],
							click: function(){
								$timeout(function() {
									$("#btn-sort-album").trigger("click");
								}, 0);
							}
						}]
					}, {
						label: data["PREFERENCES"],
						accelerator: "CmdOrCtrl+,",
						click: function(){
							$timeout(function() {
								$('#settingsModal').modal("show");
							}, 0);
						}
					}]
				}, {
					label: data["CONTROL"],
					submenu: [{
						label: data["PLAY/PAUSE"],
						accelerator: "CmdOrCtrl+P",
						click: function(){
							if (myMedia.paused) {
								$scope.play();
							}else {
								$scope.pause();
							}
						}
					}, {
						label: data["NEXT"],
						accelerator: "CmdOrCtrl+Right",
						click: function(){
							$timeout(function() {
								$("#btn-next").trigger("click");
							}, 0);
						}
					}, {
						label: data["PREVIOUS"],
						accelerator: "CmdOrCtrl+Left",
						click: function(){
							$timeout(function() {
								$("#btn-back").trigger("click");
							}, 0);
						}
					}]
				}, {
					label: "Develop",
					submenu: [{
						label: "Open devtools",
						accelerator: "CmdOrCtrl+Shift+I",
						click: function(){
							win.webContents.toggleDevTools();
						}
					}, {
						label: "Reload",
						accelerator: "CmdOrCtrl+R",
						click: function(){
							win.webContents.reload();
						}
					}]
				}];

				menu = Menu.buildFromTemplate(template_menu);
				Menu.setApplicationMenu(menu)
			})
		}, 150);
	}

	function initMusicPath() {
		init_menu_bar();

		if ($scope.dirs.length === 0) {
			$timeout(function() {
				$(".loading").css("display", "none");
				$(".done").css("display", "block");
			}, 0);
		}else {
			$scope.dirs.forEach(function(item) {
				$timeout(function() {
					readDir(item);
				}, 500);
			})
		}
	}

	$scope.directoryPicker = function(){
		var dirs = dialog.showOpenDialog({
			properties: ['openDirectory', 'multiSelections']
		});

		if (dirs !== undefined) {
			dirs.forEach(function(dir, index) {
				if ($scope.dirs.indexOf(dir) === -1) {
					$scope.dirs.push(dir);
				}

				if (index === (dirs.length -1)){
					localStorage.setItem("dirs", JSON.stringify($scope.dirs))
				}
			})
		}
	}

	$scope.deleteFolder = function(dir){
		var index = $scope.dirs.indexOf(dir);

		$scope.dirs.splice(index, 1);

		localStorage.setItem("dirs", JSON.stringify($scope.dirs));
	}

	$scope.playSong = function(index, path, title, artist, img, time){
		console.log(index, path, title, artist, img, time)


		$(".track").removeClass("selected");

		$(".cover").each(function(){
			$(this).addClass("spinning");
		});

		var checkFile = false;

		$scope.dirs.forEach(function(dir){
			var files = fs.readdirSync(dir);

			files.forEach(function(item) {
				if (path === dir + "/" + encodeURIComponent(item)){
					console.log("ok")
					checkFile = true;
				}
			})
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

				if (win.isMinimized()) {
					new Notification("S.A.P - Simple Audio Player", {
						body: title + "\nby " + artist,
						icon: bufferToBase64(img.APIC[0].data)
					})
				}
			}else {
				$scope.showCover = false;

				if (win.isMinimized()) {
					new Notification("S.A.P - Simple Audio Player", {
						body: title + "\nby " + artist
					})
				}
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

		console.log($scope.current)

		if ($scope.current !== undefined){
			if (isShuffle === "true") {
				index = $scope.random();
			}else {
				if ($scope.current >= $scope.musics.length - 1) {
					index = 0;
				}else {
					index = $scope.current + 1;
				}
			}

			var path = $scope.musics[index].path;
			var title = $scope.musics[index].title;
			var artist = $scope.musics[index].artist;
			var img = $scope.musics[index]['id3v2.3'];
			var time = $scope.musics[index].duration;

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
	}

	$scope.previousSong =function(isLoop, isShuffle) {
		var index;

		if ($scope.current !== undefined){
			if (isShuffle === "true") {
				index = $scope.random();
			}else {
				if ($scope.current <= 0) {
					index = $scope.musics.length - 1;
				}else {
					index = $scope.current - 1;
				}
			}

			var path = $scope.musics[index].path;
			var title = $scope.musics[index].title;
			var artist = $scope.musics[index].artist;
			var img = $scope.musics[index]['id3v2.3'];
			var time = $scope.musics[index].duration;

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
			$scope.durationFrom = moment.duration($("#audio-player")[0].currentTime, "seconds").format("mm:ss", { trim: "right" });
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
		$(".sort-button").removeClass("sorted");

		if (mode === "time"){
			$timeout(function() {
				$($(".sort-button")[1]).addClass("sorted");
			}, 0);

			$timeout(function() {
				$scope.sort = "duration";
			}, 100);
		}else if (mode === "artist") {
			$timeout(function() {
				$($(".sort-button")[2]).addClass("sorted");
			}, 0);

			$timeout(function() {
				$scope.sort = "artist";
			}, 100);
		}else if (mode === "album") {
			$timeout(function() {
				$($(".sort-button")[3]).addClass("sorted");
			}, 0);

			$timeout(function() {
				$scope.sort = "album";
			}, 100);
		}else {
			$timeout(function() {
				$($(".sort-button")[0]).addClass("sorted");
			}, 0);

			$timeout(function() {
				$scope.sort = "title";
			}, 100);
		}

		$scope.musics = $filter("orderBy")($scope.musics, $scope.sort);
	}

	$scope.search = function(){
		$scope.listSearch = $scope.musics;
		$scope.listSearch.forEach(function(item){
			item.search_by_title = item.title.toLowerCase()
		})

		if ($scope.searchContent !== undefined){
			$scope.listSearch = $filter("filter")($scope.listSearch, {search_by_title: $scope.searchContent.toLowerCase()});
		}
	}

	$scope.initLocale= function(){
		$scope.locale = localStorage.getItem("lang");
	}

	$scope.changeLang = function(key){
		localStorage.setItem("lang", key);
		$translate.use(key);

		init_menu_bar();
	}

	$scope.initTheme= function(){
		$scope.theme = localStorage.getItem("theme");

		$scope.changeTheme($scope.theme);
	}

	$scope.changeTheme = function(key){
		console.log(key);

		localStorage.setItem("theme", key);

		switch (key) {
			case "light": {
				$timeout(function() {
					$(".themeDark").addClass("themeLight");
					$(".themeDark").removeClass("themeDark");

					$(".themeDark-pear").addClass("themeLight-pear");
					$(".themeDark-foot").addClass("themeLight-foot");

					$(".themeDark-pear").removeClass("themeDark-pear");
					$(".themeDark-foot").removeClass("themeDark-foot");
				}, 0);

				break;
			}
			case "dark": {
				$timeout(function() {
					$(".themeLight").addClass("themeDark");
					$(".themeLight").removeClass("themeLight");

					$(".themeLight-pear").addClass("themeDark-pear");
					$(".themeLight-foot").addClass("themeDark-foot");

					$(".themeLight-pear").removeClass("themeLight-pear");
					$(".themeLight-foot").removeClass("themeLight-foot");
				}, 0);

				break;
			}
		}
	}

	function bufferToBase64(buf) {
	    var binstr = Array.prototype.map.call(buf, function (ch) {
	        return String.fromCharCode(ch);
	    }).join('');
	    return "data:image/png;base64," + btoa(binstr);
	}
});
