const {app, BrowserWindow} = require("electron");
const path = require("path");
const url = require("url");

let win;

app.on("ready", function() {
	win = new BrowserWindow({
		width: 1200,
		height: 720,
		minWidth: 1200,
		minHeight: 720
	});

	win.loadURL(url.format({
		pathname: path.join(__dirname, "views/index.html"),
		protocol: 'file:',
		slashes: true
	}));

	// win.webContents.openDevTools();

	win.on("closed", function() {
		win = null
	});
})


app.on("window-all-closed", function() {
	app.quit();
})