var myMedia = document.createElement('audio');
$('.controls').append(myMedia);
myMedia.id = "audio-player";
// myMedia.setAttribute('controls', 'true');

function playAudio(fileName, myVolume) {
	myMedia.src = fileName;
	// myMedia.setAttribute('loop', 'loop');
	
	setVolume(myVolume);
	myMedia.play();
}

function setVolume(myVolume) {
	var myMedia = document.getElementById('audio-player');
	myMedia.volume = myVolume;
}


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
});