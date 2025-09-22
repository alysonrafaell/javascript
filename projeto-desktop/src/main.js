const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, powerSaveBlocker, globalShortcut, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios").default;

// ===== CONFIGURAÇÕES =====
app.setAppUserModelId('com.example.weatherapp');

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');
const DEFAULT_SETTINGS = {
  city: "São Paulo",
  unit: "celsius",
};

// ===== VARIÁVEIS GLOBAIS =====
let mainWindow;
let tray = null;
let powerSaveBlockerId = null;
let userSettings = { ...DEFAULT_SETTINGS };

// ===== GERENCIAMENTO DE CONFIGURAÇÕES =====
const SettingsManager = {
  load() {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const data = fs.readFileSync(SETTINGS_FILE);
        userSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  },

  save() {
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(userSettings, null, 2));
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  }
};

// ===== GERENCIAMENTO DE JANELAS =====
const WindowManager = {
  createMainWindow() {
    mainWindow = new BrowserWindow({
      width: 700,
      height: 700,
      resizable: false,
      show: false,
      autoHideMenuBar: true,
      icon: path.join(__dirname, '../assets/icons/icon.png'),
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

    mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });

    return mainWindow;
  },

  createModalWindow(parent, file, options = {}) {
    const modal = new BrowserWindow({
      width: 500,
      height: 600,
      parent: parent,
      modal: true,
      resizable: true,
      autoHideMenuBar: true,
      ...options,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    modal.loadFile(path.join(__dirname, "windows", file));
    return modal;
  }
};

// ===== GERENCIAMENTO DO TRAY =====
const TrayManager = {
  setup() {
    try {
      const iconPath = path.join(__dirname, "..", "assets", "icons", "icon.png");
      const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
      
      tray = new Tray(trayIcon);
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Abrir',
          click: () => mainWindow?.show()
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
      
      tray.on('double-click', () => mainWindow?.show());
    } catch (error) {
      console.log('Ícone do tray não carregado');
    }
  }
};

// ===== ATALHOS DE TECLADO =====
const ShortcutManager = {
  register() {
    globalShortcut.register('CommandOrControl+Q', () => {
      app.isQuitting = true;
      app.quit();
    });

    globalShortcut.register('CommandOrControl+Left', () => this.moveWindow('left'));
    globalShortcut.register('CommandOrControl+Right', () => this.moveWindow('right'));
  },

  moveWindow(direction) {
    if (!mainWindow) return;

    const display = screen.getPrimaryDisplay();
    const winSize = mainWindow.getSize();
    
    const position = direction === 'left' 
      ? 0 
      : display.workAreaSize.width - winSize[0];
    
    mainWindow.setPosition(position, 0);
  },

  unregisterAll() {
    globalShortcut.unregisterAll();
  }
};

// ===== MENU DA APLICAÇÃO =====
const MenuManager = {
  create() {
    const template = [
      {
        label: 'Arquivo',
        submenu: [
          {
            label: 'Nova Busca',
            accelerator: 'Ctrl+N',
            click: () => mainWindow?.webContents.send('focus-search')
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
            click: () => ShortcutManager.moveWindow('left')
          },
          {
            label: 'Mover para Direita',
            accelerator: 'Ctrl+Right',
            click: () => ShortcutManager.moveWindow('right')
          }
        ]
      }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
};

// ===== HANDLERS IPC =====
const IpcHandlers = {
  setup() {
    // Clima
    ipcMain.handle("get-weather", async (_, city) => {
      try {
        const apiKey = "0e8747fec79732151736ed2715424640";
        const unit = userSettings.unit === "fahrenheit" ? "imperial" : "metric";
        const finalCity = city?.trim() || userSettings.city;

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${finalCity}&units=${unit}&lang=pt&appid=${apiKey}`;
        const response = await axios.get(url);
        
        return {
          ...response.data,
          main: { ...response.data.main, temp_unit: unit }
        };
      } catch (error) {
        return { 
          error: error.response?.status === 404 
            ? "Cidade não encontrada" 
            : "Erro de conexão" 
        };
      }
    });

    // Configurações
    ipcMain.handle("get-settings", () => userSettings);
    
    ipcMain.on("save-settings", (_, settings) => {
      userSettings = settings;
      SettingsManager.save();
      mainWindow?.webContents.send('settings-update', userSettings);
    });

    // Janelas
    ipcMain.on("open-config", () => 
      WindowManager.createModalWindow(mainWindow, "config.html")
    );
    
    ipcMain.on("open-about", () => 
      WindowManager.createModalWindow(mainWindow, "about.html")
    );

    // Energia
    ipcMain.handle('toggle-power-save', (_, enable) => {
      if (enable && powerSaveBlockerId === null) {
        powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
      } else if (!enable && powerSaveBlockerId !== null) {
        powerSaveBlocker.stop(powerSaveBlockerId);
        powerSaveBlockerId = null;
      }
      return powerSaveBlockerId !== null;
    });
  }
};

// ===== INICIALIZAÇÃO =====
app.whenReady().then(() => {
  SettingsManager.load();
  WindowManager.createMainWindow();
  TrayManager.setup();
  MenuManager.create();
  ShortcutManager.register();
  IpcHandlers.setup();
});

// ===== EVENTOS DA APLICAÇÃO =====
app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && mainWindow) {
    mainWindow.hide();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    WindowManager.createMainWindow();
  }
});

app.on('will-quit', () => {
  ShortcutManager.unregisterAll();
});

app.isQuitting = false;