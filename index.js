const { app, BrowserWindow } = require('electron')

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
        }
    })

    win.loadFile('index.html');
    win.maximize();
    win.removeMenu();
    win.show();

    // win.webContents.openDevTools()

    //HKQ558
    //51914792
}
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})