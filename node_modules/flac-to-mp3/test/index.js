// TODO: Make this a proper test suite

var f2m = require("../")

f2m.convert(
	__dirname + "/BIS1447-002-flac_16.flac",
	function(data) {
		console.log(data.err.toString())
	}
)
