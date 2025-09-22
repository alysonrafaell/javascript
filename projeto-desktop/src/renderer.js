// Elementos da interface
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#busca");
const cityElement = document.querySelector("#city");
const tempElement = document.querySelector("#temp span");
const descElement = document.querySelector("#descr-filho");
const weatherIcon = document.querySelector("#img-cidade");
const countryImg = document.querySelector("#country");
const humidityElement = document.querySelector("#umidade span");
const windElement = document.querySelector("#vento span");
const configBtn = document.getElementById("config-btn");
const aboutBtn = document.getElementById("about-btn");

let isSearching = false;
let isPowerSaveActive = false;

// Buscar dados do clima
async function getWeather(city) {
  if (isSearching) return;

  isSearching = true;
  searchBtn.disabled = true;
  searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  try {
    const data = await window.weatherAPI.getWeather(city);

    if (data && data.error) {
      showError(data.error);
      return;
    }

    // Atualizar dados na interface
    cityElement.textContent = data.name;
    const unitSymbol = (data.main.temp_unit === "imperial") ? "°F" : "°C";
    tempElement.textContent = `${Math.round(data.main.temp)}${unitSymbol}`;
    
    const desc = data.weather[0].description;
    descElement.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);

    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    weatherIcon.alt = data.weather[0].description;

    // Bandeira
    const countryCode = data.sys.country;
    countryImg.src = `https://flagsapi.com/${countryCode}/shiny/64.png`;
    countryImg.alt = `Bandeira do ${countryCode}`;
    countryImg.style.display = "inline-block";

    humidityElement.textContent = `${data.main.humidity}%`;
    windElement.textContent = `${data.wind.speed} km/h`;

    // Notificação
    if (window.weatherAPI && window.weatherAPI.showNotification) {
      window.weatherAPI.showNotification(
        `Clima em ${data.name}`,
        `${Math.round(data.main.temp)}${unitSymbol}, ${desc}`
      );
    }

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    showError("Erro ao buscar dados do clima");
  } finally {
    isSearching = false;
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
  }
}

// Mostrar mensagem de erro/informação
function showError(message) {
  // Remover mensagem anterior se existir
  const existingError = document.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.position = "fixed";
  errorDiv.style.top = "20px";
  errorDiv.style.right = "20px";
  errorDiv.style.background = "#4CAF50";
  errorDiv.style.color = "white";
  errorDiv.style.padding = "12px 16px";
  errorDiv.style.borderRadius = "6px";
  errorDiv.style.zIndex = "1000";
  errorDiv.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  errorDiv.style.fontSize = "14px";
  errorDiv.style.fontWeight = "500";
  errorDiv.textContent = message;

  document.body.appendChild(errorDiv);

  // Remover após 3 segundos (ajustável)
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 3000);
}

// Criar botão de manter tela ativa (NO CANTO INFERIOR ESQUERDO)
function createPowerSaveButton() {
  if (document.getElementById('power-save-btn')) return;
  
  const powerSaveBtn = document.createElement('button');
  powerSaveBtn.id = 'power-save-btn';
  powerSaveBtn.innerHTML = '💤 Manter tela ativa';
  
  // POSICIONADO NO CANTO INFERIOR ESQUERDO
  powerSaveBtn.style.position = 'fixed';
  powerSaveBtn.style.bottom = '15px';
  powerSaveBtn.style.left = '15px'; // ← MUDADO PARA ESQUERDA
  powerSaveBtn.style.padding = '8px 12px';
  powerSaveBtn.style.background = '#f0f0f0';
  powerSaveBtn.style.border = '1px solid #ccc';
  powerSaveBtn.style.borderRadius = '5px';
  powerSaveBtn.style.cursor = 'pointer';
  powerSaveBtn.style.fontSize = '12px';
  powerSaveBtn.style.zIndex = '1000';
  
  powerSaveBtn.addEventListener('click', async () => {
    isPowerSaveActive = !isPowerSaveActive;
    const isActive = await window.weatherAPI.togglePowerSave(isPowerSaveActive);
    powerSaveBtn.innerHTML = isActive ? '☀️ Desativar' : '💤 Manter tela ativa';
    powerSaveBtn.style.background = isActive ? '#e6f7ff' : '#f0f0f0';
    
    showError(isActive ? 
      'Modo "Manter tela ativa" ativado' : 
      'Modo "Manter tela ativa" desativado'
    );
  });
  
  document.body.appendChild(powerSaveBtn);
}

// Mostrar mensagem de atalhos
function showShortcutsMessage() {
  showError("Utilize os atalhos: Ctrl+Q (sair), Ctrl+←|→ (mover janela), Ctrl+N (busca), ESC (fechar janelas)");
}

// Event listeners
function setupEventListeners() {
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const city = cityInput.value.trim();
      if (city) {
        getWeather(city);
      } else {
        showError("Por favor, digite o nome de uma cidade.");
      }
    });
  }

  if (cityInput) {
    cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) {
          getWeather(city);
        } else {
          showError("Por favor, digite o nome de uma cidade.");
        }
      }
    });

    cityInput.addEventListener("input", () => {
      if (searchBtn) {
        searchBtn.disabled = false;
      }
    });
  }

  if (configBtn) {
    configBtn.addEventListener("click", () => {
      window.weatherAPI.openConfig();
    });
  }

  if (aboutBtn) {
    aboutBtn.addEventListener("click", () => {
      window.weatherAPI.openAbout();
    });
  }

  if (countryImg) {
    countryImg.addEventListener("error", function () {
      console.error("Erro ao carregar bandeira");
      this.style.display = "none";
    });
  }
}

// Inicialização melhorada
window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM completamente carregado e analisado");
  
  // Pequeno delay para garantir que tudo esteja renderizado
  setTimeout(async () => {
    // Configurar event listeners
    setupEventListeners();
    
    // Ouvir atualizações de configurações
    if (window.weatherAPI && window.weatherAPI.onSettingsUpdated) {
      window.weatherAPI.onSettingsUpdated((settings) => {
        console.log("Configurações atualizadas:", settings);
        if (settings && settings.city) {
          getWeather(settings.city);
        }
      });
    }
    
    // Ouvir foco na busca
    if (window.weatherAPI && window.weatherAPI.onFocusSearch) {
      window.weatherAPI.onFocusSearch(() => {
        if (cityInput) {
          cityInput.focus();
          cityInput.select();
        }
      });
    }
    
    // Carregar configs iniciais
    try {
      const settings = await window.weatherAPI.getSettings();
      console.log("Configurações carregadas:", settings);
      if (settings && settings.city) {
        getWeather(settings.city);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
    
    // Criar botão de manter tela ativa
    createPowerSaveButton();
    
    // MOSTRAR MENSAGEM DE ATALHOS - AGORA COM EMOJI E MENSAGEM COMPLETA
    setTimeout(() => {
      showShortcutsMessage();
    }, 1500);
    
    document.body.classList.add('loaded')
  }, 100);
});