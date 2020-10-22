const { app, BrowserWindow } = require('electron')

function createWindow() {
    const win = new BrowserWindow({
        width: 1367,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
        }
    })

    win.loadFile('index.html')
    win.webContents.openDevTools()

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