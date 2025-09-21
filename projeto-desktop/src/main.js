const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, powerSaveBlocker, globalShortcut, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios").default;

app.setAppUserModelId('com.example.weatherapp')

let mainWindow;
let tray = null;
let powerSaveBlockerId = null;
const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

// Configurações do usuário
let userSettings = {
  city: "São Paulo",
  unit: "celsius",
};

// Salvar configurações
function saveSettings() {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(userSettings, null, 2));
    console.log("Configurações salvas em:", settingsFilePath);
  } catch (error) {
    console.error("Erro ao salvar as configurações:", error);
  }
}

// Carregar configurações
function loadSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const settingsData = fs.readFileSync(settingsFilePath);
      userSettings = JSON.parse(settingsData);
      console.log("Configurações carregadas:", userSettings);
    }
  } catch (error) {
    console.error("Erro ao carregar as configurações:", error);
  }
}

// Criar Janela Principal
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 600,
    autoHideMenuBar: true,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });
  
  mainWindow.webContents.once('did-finish-load', () => {
    registerGlobalShortcuts();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
  
  return mainWindow;
}

// Criar Janela de Configurações
function createConfigWindow() {
  const configWindow = new BrowserWindow({
    width: 500,
    height: 500,
    parent: mainWindow,
    modal: true,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  configWindow.loadFile(path.join(__dirname, "windows", "config.html"));
}

// Criar Janela Sobre
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    width: 600,
    height: 500,
    parent: mainWindow,
    modal: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  aboutWindow.loadFile(path.join(__dirname, "windows", "about.html"));
}

// Configurar Tray Icon
function setupTray() {
  let trayIcon;
  try {
    const iconPath = path.join(__dirname, "..", "assets", "icons", "icon.png");
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch (error) {
    console.log('Ícone do tray não encontrado, usando ícone padrão');
    trayIcon = nativeImage.createEmpty();
  }
  
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Weather App');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Função para mover janela para a esquerda
function moveWindowToLeft() {
  if (mainWindow) {
    mainWindow.setPosition(0, 0);
    if (mainWindow.webContents && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('show-notification', 'Janela movida para a esquerda');
    }
  }
}

// Função para mover janela para a direita
function moveWindowToRight() {
  if (mainWindow) {
    const display = screen.getPrimaryDisplay();
    const winSize = mainWindow.getSize();
    mainWindow.setPosition(display.workAreaSize.width - winSize[0], 0);
    if (mainWindow.webContents && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('show-notification', 'Janela movida para a direita');
    }
  }
}

// Registrar Atalhos Globais
function registerGlobalShortcuts() {
  // Ctrl+Q para sair
  globalShortcut.register('CommandOrControl+Q', () => {
    app.isQuitting = true;
    app.quit();
  });
  
  // Ctrl+← para mover para esquerda
  globalShortcut.register('CommandOrControl+Left', () => {
    moveWindowToLeft();
  });
  
  // Ctrl+→ para mover para direita
  globalShortcut.register('CommandOrControl+Right', () => {
    moveWindowToRight();
  });
  
  console.log('Atalhos registrados: Ctrl+Q (Sair), Ctrl+← (Esquerda), Ctrl+→ (Direita)');
}

// Criar Menu da Aplicação
function createApplicationMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Nova Busca',
          accelerator: 'Ctrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('focus-search');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Janela',
      submenu: [
        {
          label: 'Mover para Esquerda',
          accelerator: 'Ctrl+Left',
          click: () => {
            moveWindowToLeft();
          }
        },
        {
          label: 'Mover para Direita',
          accelerator: 'Ctrl+Right',
          click: () => {
            moveWindowToRight();
          }
        }
      ]
    },
    {
      label: 'Configurações',
      submenu: [
        {
          label: 'Preferências',
          accelerator: 'Ctrl+,',
          click: () => createConfigWindow()
        }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => createAboutWindow()
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC: Buscar Clima
ipcMain.handle("get-weather", async (event, city) => {
  try {
    const apiKey = "0e8747fec79732151736ed2715424640";
    const unit = userSettings.unit === "fahrenheit" ? "imperial" : "metric";
    const lang = "pt";
    const finalCity = city && city.trim() !== "" ? city : userSettings.city;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${finalCity}&units=${unit}&lang=${lang}&appid=${apiKey}`;
    const response = await axios.get(url);
    
    const dataWithUnit = {
      ...response.data,
      main: {
        ...response.data.main,
        temp_unit: unit
      }
    };
    
    return dataWithUnit;
  } catch (error) {
    console.error("Erro ao buscar clima:", error.message);
    if (error.response && error.response.status === 404) {
      return { error: "Cidade não encontrada. Verifique o nome e tente novamente." };
    } else {
      return { error: "Erro de conexão. Verifique sua internet e tente novamente." };
    }
  }
});

// IPC: Configurações
ipcMain.on("save-settings", (event, settings) => {
  console.log('recebendo dados de condiguraçao para salvar:', settings);
  userSettings = settings;
  saveSettings();
  console.log("configuraçoes salvas:", userSettings);
  
  // Enviar atualização para a janela principal
  if(mainWindow && !mainWindow.isDestroyed()){
    mainWindow.webContents.send('settings-update', userSettings);
  }
});

ipcMain.handle("get-settings", () => {
  console.log('dados atuais:', userSettings);
  return userSettings;
});

// IPC: Power Save Blocker
ipcMain.handle('toggle-power-save', (event, enable) => {
  if (enable) {
    if (powerSaveBlockerId === null) {
      powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
      console.log('PowerSaveBlocker ativado. ID:', powerSaveBlockerId);
    }
  } else {
    if (powerSaveBlockerId !== null) {
      powerSaveBlocker.stop(powerSaveBlockerId);
      console.log('PowerSaveBlocker desativado. ID:', powerSaveBlockerId);
      powerSaveBlockerId = null;
    }
  }
  return powerSaveBlockerId !== null;
});

// IPC: Abrir Janelas Extras
ipcMain.on("open-config", () => createConfigWindow());
ipcMain.on("open-about", () => createAboutWindow());

// IPC: Notificações
ipcMain.on('show-notification', (event, message) => {
  if (mainWindow) {
    mainWindow.webContents.send('show-notification', message);
  }
});

// Inicializar App
app.whenReady().then(() => {
  loadSettings();
  createMainWindow();
  setupTray();
  createApplicationMenu();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (mainWindow) {
      mainWindow.hide();
    }
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.isQuitting = false;