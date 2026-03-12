/**
 * NOVA-Φ ULTRA v5.0 — Electron Main Process
 * Hardened with: contextIsolation, sandbox, no nodeIntegration
 */

const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const os   = require('os');

// ─── Single instance lock ───
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

let mainWindow = null;

// ─── Security: disable navigation to external URLs ───
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
    }
  });
  contents.setWindowOpenHandler(({ url }) => {
    // Open external links in system browser, not in app
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
});

// ─── Create main window ───
function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1280,
    height: 820,
    minWidth:  900,
    minHeight: 600,
    title: 'NOVA-Φ ULTRA v5.0',
    backgroundColor: '#03010a',
    show: false, // show after ready-to-show
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,    // ✅ Security: isolate renderer
      nodeIntegration:  false,   // ✅ Security: no Node in renderer
      sandbox:          true,    // ✅ Security: sandboxed renderer
      webSecurity:      true,    // ✅ Security: enforce same-origin
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    },
  });

  // Load app
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Show only when fully loaded (no white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open DevTools only in dev mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── Application menu ───
function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ label: app.name, submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]}] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Select file to encrypt/decrypt',
              properties: ['openFile', 'multiSelections'],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('open-files', result.filePaths);
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', label: 'Exit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About NOVA-Φ ULTRA',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About NOVA-Φ ULTRA',
              message: 'NOVA-Φ ULTRA v5.0',
              detail: [
                'Sovereign Encryption Engine',
                '',
                'Algorithms:',
                '  • AES-256-GCM (encryption)',
                '  • PBKDF2-SHA512 × 1,000,000 (key derivation)',
                '  • HMAC-SHA512 (integrity)',
                '  • HKDF (key expansion)',
                '',
                `Platform: ${os.type()} ${os.arch()}`,
                `Electron: ${process.versions.electron}`,
                `Node: ${process.versions.node}`,
                `Chrome: ${process.versions.chrome}`,
              ].join('\n'),
              buttons: ['OK'],
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => shell.openExternal('mailto:support@novasecurity.app')
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── IPC handlers ───
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-platform',    () => process.platform);
ipcMain.handle('show-save-dialog', async (_, opts) => {
  return dialog.showSaveDialog(mainWindow, opts);
});
ipcMain.handle('show-open-dialog', async (_, opts) => {
  return dialog.showOpenDialog(mainWindow, opts);
});

// ─── App lifecycle ───
app.whenReady().then(() => {
  createWindow();
  buildMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── Second instance: focus existing window ───
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
