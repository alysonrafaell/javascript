const { contextBridge, ipcRenderer } = require("electron");

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld("weatherAPI", {
  // Funções de clima
  getWeather: (city) => ipcRenderer.invoke("get-weather", city),
  
  // Funções de janelas
  openConfig: () => ipcRenderer.send("open-config"),
  openAbout: () => ipcRenderer.send("open-about"),
  
  // Funções de configurações
  saveSettings: (settings) => ipcRenderer.send("save-settings", settings),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  onSettingsUpdated: (cb) => {
    ipcRenderer.removeAllListeners('settings-update');
    ipcRenderer.on('settings-update', (event, settings) => cb(settings));
  },
  
  // Funções de utilidade
  onFocusSearch: (cb) => {
    ipcRenderer.removeAllListeners('focus-search');
    ipcRenderer.on('focus-search', () => cb());
  },
  togglePowerSave: (enable) => ipcRenderer.invoke('toggle-power-save', enable),
  
  // Notificações
  showNotification: (title, body, duration = 5000) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, { 
          body, 
          icon: '../assets/icons/icon.png'
        });
        
        if (duration > 0) {
          setTimeout(() => {
            notification.close();
          }, duration);
        }
        
        return notification;
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            const notification = new Notification(title, { 
              body, 
              icon: '../assets/icons/icon.png'
            });
            
            if (duration > 0) {
              setTimeout(() => {
                notification.close();
              }, duration);
            }
          }
        });
      }
    }
  },
  
  // Ouvir notificações do main process
  onNotification: (cb) => {
    ipcRenderer.removeAllListeners('show-notification');
    ipcRenderer.on('show-notification', (event, message) => {
      cb(message);
    });
  }
});

// Menu de contexto simplificado
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.matches('input[type="text"], textarea')) {
      e.preventDefault();
    }
  });
});