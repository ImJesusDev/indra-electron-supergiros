const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const { session } = require("electron");

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15";
console.log("user agent: ", userAgent);
const filter = {
  urls: ["https://*.runt.com.co/*"],
};
let win;
const isMac = process.platform === "darwin";
const template = [
  // { role: 'fileMenu' }
  {
    label: "Archivo",
    submenu: [
      isMac
        ? { role: "close", label: "Salir" }
        : { role: "quit", label: "Salir" },
    ],
  },
  // { role: 'editMenu' }
  {
    label: "Opciones",
    submenu: [
      {
        label: "Reiniciar",
        click: async () => {
          app.relaunch();
          app.quit();
        },
      },
      {
        label: "Consola principal",
        click: async () => {
          win.openDevTools();
          win.webContents.send("asynchronous-message", { SAVED: "File Saved" });
        },
      },
      {
        label: "Consola RUNT",
        click: async () => {
          win.webContents.send("openConsole", { platform: "RUNT" });
        },
      },
      {
        label: "Consola SICOV",
        click: async () => {
          win.webContents.send("openConsole", { platform: "SICOV" });
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
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
  // win.removeMenu();
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
