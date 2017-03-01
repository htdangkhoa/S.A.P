var fs = require("fs")
var childProcess = require("child_process")

var endsWith = function(str, end, caseInsensitive) { // TODO: Not currently used but ready for use by convertDir()
	if (caseInsensitive) {
		str = str.toLowerCase()
		end = end.toLowerCase()
	}
	return str.split("").slice(-5).join("") === end // TODO: Remove the magic -5
}

exports.convert = function(file, onData, onDone) {

	var args = [
		"-i", file,
		"-ab", "320k",
		"-map_metadata", "0",
		"-id3v2_version", "3",
		"-y",
		file.replace(/.flac$/i, ".mp3")
	]

	var ffmpeg = childProcess.spawn("ffmpeg", args)

	// NOTE: ffmpeg outputs to standard error - Always has, always will no doubt

	ffmpeg.stdout.on("data", function(data) {
		onData({out: data})
	})
	ffmpeg.stderr.on("data", function(data) {
		onData({err: data})
	})

};

// TODO: Expose a way to convert all files in a dir - Or should this be on the user?
// exports.convertDir = function(dir, onData, onDone) {

// }
