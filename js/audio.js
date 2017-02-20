var myMedia = document.createElement('audio');
$('.controls').append(myMedia);
myMedia.id = "audio-player";
// myMedia.setAttribute('controls', 'true');

if (!localStorage.getItem("volume") || isNaN(localStorage.getItem("volume"))){
	localStorage.setItem("volume", 30);
}

$("#volume-duration").slider({
	min: 0,
	max: 100,
	value: localStorage.getItem("volume"),
	slide: function(event, ui) {
		setVolume(ui.value / 100);
	}
})

function playAudio(fileName, myVolume) {
	myMedia.src = fileName;
	// myMedia.setAttribute('loop', 'loop');
	
	setVolume(myVolume);
	myMedia.play();
}

function setVolume(myVolume) {
	var myMedia = document.getElementById('audio-player');
	myMedia.volume = myVolume;
	localStorage.setItem("volume", (myVolume * 100))
}