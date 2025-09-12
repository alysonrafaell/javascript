const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


async function saveAsDialog(content) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Salvar como…',
    defaultPath: 'novo-arquivo.txt',
    filters: [{ name: 'Texto', extensions: ['txt'] }]
  });

  if (canceled || !filePath) return { canceled: true };

  await fs.promises.writeFile(filePath, content ?? '', 'utf-8');
  return { canceled: false, path: filePath };
}



ipcMain.handle('file:open', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Texto', extensions: ['txt'] }]
  });

  if (canceled || !filePaths.length) return { canceled: true };

  const content = await fs.promises.readFile(filePaths[0], 'utf-8');
  return { canceled: false, path: filePaths[0], content };
});

ipcMain.handle('file:save', async (_evt, { filePath, content }) => {
  if (!filePath) return await saveAsDialog(content);
  await fs.promises.writeFile(filePath, content, 'utf-8');
  return { canceled: false, path: filePath };
});

ipcMain.handle('file:saveAs', async (_evt, { content }) => {
  return await saveAsDialog(content);
});
