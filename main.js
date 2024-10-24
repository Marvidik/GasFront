// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Add this line to enable auto-reloading on file changes
require('electron-reload')(path.join(__dirname, 'src'), {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// Function to create the main window
async function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Use preload for IPC security
            contextIsolation: true, // Required for preload.js
            enableRemoteModule: false,
            nodeIntegration: false, // Security: Keep it off, use preload instead
            sandbox: true
        }
    });

    // Load the main HTML file
    win.loadFile(path.join(__dirname, 'src/html/backend/auth-sign-in.html'));
}

// Function to handle user info storage
async function handleUserInfo() {
    const Store = (await import('electron-store')).default; // Use dynamic import
    const store = new Store();

    
}

app.whenReady().then(async () => {
    await handleUserInfo(); // Initialize user info handling
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
