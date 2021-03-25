const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const { session } = require("electron");
const randomUseragent = require("random-useragent");

const userAgent = randomUseragent.getRandom();
console.log("user agent: ", userAgent);
const filter = {
  urls: ["https://*.runt.com.co/*"],
};
let win;

function createWindow() {
  win = new BrowserWindow({
    show: false,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
    },
  });

  win.loadFile("index.html");
  win.maximize();
  win.removeMenu();
  win.show();

  //   win.webContents.openDevTools();

  //HKQ558
  //51914792
  //QrH#e*Is
}

app
  .whenReady()
  .then(createWindow)
  .then(() => {
    console.log("Checking for updates");
    autoUpdater.checkForUpdatesAndNotify();
    session.defaultSession.webRequest.onBeforeSendHeaders(
      filter,
      (details, callback) => {
        details.requestHeaders["User-Agent"] = userAgent;
        callback({ requestHeaders: details.requestHeaders });
      }
    );
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

autoUpdater.on("update-available", () => {
  console.log("update-available");
  win.webContents.send("update_available");
});
autoUpdater.on("update-downloaded", () => {
  console.log("update downloaded");
  win.webContents.send("update_downloaded");
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});
