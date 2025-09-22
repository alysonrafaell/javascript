const { contextBridge, ipcRenderer } = require("electron");

// API segura para o renderer process
contextBridge.exposeInMainWorld("weatherAPI", {
  // Clima
  getWeather: (city) => ipcRenderer.invoke("get-weather", city),
  
  // Configurações
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => ipcRenderer.send("save-settings", settings),
  
  // Janelas
  openConfig: () => ipcRenderer.send("open-config"),
  openAbout: () => ipcRenderer.send("open-about"),
  
  // Energia
  togglePowerSave: (enable) => ipcRenderer.invoke('toggle-power-save', enable),
  
  // Eventos
  onSettingsUpdated: (callback) => {
    ipcRenderer.on('settings-update', (_, settings) => callback(settings));
  },
  
  onFocusSearch: (callback) => {
    ipcRenderer.on('focus-search', () => callback());
  },
  
  // Notificações do sistema
  showNotification: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
});

// Remove menu de contexto padrão em campos de texto
document.addEventListener('contextmenu', (e) => {
  if (e.target.matches('input, textarea')) {
    e.preventDefault();
  }
});