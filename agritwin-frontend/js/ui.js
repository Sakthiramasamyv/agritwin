(function () {
  const stateApi = window.agritwin;
  const { farmState, getHealthStatus, getSoilStatus, getWaterStatus, getWeatherStatus } = stateApi;

  function renderStatusPanels() {
    const cropStatus = getHealthStatus(farmState.crop.health);
    const soilStatus = getSoilStatus(farmState.soil.moisture);
    const waterStatus = getWaterStatus(farmState.water.available);
    const weatherStatus = getWeatherStatus(farmState.weather.temperature);

    const cropEl = document.getElementById('crop-status-label');
    const soilEl = document.getElementById('soil-status-label');
    const waterEl = document.getElementById('water-status-label');
    const weatherEl = document.getElementById('weather-status-label');

    if (cropEl) cropEl.textContent = cropStatus.label;
    if (soilEl) soilEl.textContent = soilStatus.label;
    if (waterEl) waterEl.textContent = waterStatus.label;
    if (weatherEl) weatherEl.textContent = weatherStatus.label;

    const cropCard = document.querySelector('[data-status="crop"]');
    const soilCard = document.querySelector('[data-status="soil"]');
    const waterCard = document.querySelector('[data-status="water"]');
    const weatherCard = document.querySelector('[data-status="weather"]');

    const setTone = (card, tone) => {
      if (!card) return;
      card.classList.remove('healthy', 'warning', 'danger', 'water', 'sunny', 'good');
      if (tone) card.classList.add(tone);
    };

    if (cropCard) setTone(cropCard, cropStatus.tone);
    if (soilCard) setTone(soilCard, soilStatus.tone);
    if (waterCard) setTone(waterCard, waterStatus.tone);
    if (weatherCard) setTone(weatherCard, weatherStatus.tone);
  }

  function setupNavigation() {
    const navItems = [...document.querySelectorAll('[data-screen]')];
    const screens = [...document.querySelectorAll('.screen')];

    const showScreen = (screenName) => {
      screens.forEach((screen) => {
        screen.classList.toggle('active', screen.id === `screen-${screenName}`);
      });

      navItems.forEach((item) => {
        const isMatch = item.dataset.screen === screenName;
        item.classList.toggle('active', isMatch);
      });
    };

    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const screenName = item.dataset.screen;
        showScreen(screenName);
      });
    });

    document.querySelectorAll('[data-target-screen]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.dataset.targetScreen;
        if (target) showScreen(target);
      });
    });
  }

  function setupLanguageToggle() {
    const langButtons = [...document.querySelectorAll('.lang-btn')];
    langButtons.forEach((button) => {
      button.addEventListener('click', () => {
        langButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      });
    });
  }

  function bindFarmForm(handler) {
    const form = document.getElementById('farm-form');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = Object.fromEntries(new FormData(form).entries());
      handler(formData);
      renderStatusPanels();
      const targetScreen = document.querySelector('.nav-item[data-screen="digital-twin"]');
      targetScreen?.click();
    });
  }

  function bindSimulationControls() {
    const irrigationSlider = document.getElementById('irrigation-slider');
    const rainfallSlider = document.getElementById('rainfall-slider');
    const temperatureSlider = document.getElementById('temperature-slider');

    const updateSliderLabels = () => {
      const irrigationValue = document.getElementById('irrigation-value');
      const rainfallValue = document.getElementById('rainfall-value');
      const tempValue = document.getElementById('temp-value');

      if (irrigationValue) irrigationValue.textContent = `${irrigationSlider.value} L`;
      if (rainfallValue) rainfallValue.textContent = `${rainfallSlider.value} mm`;
      if (tempValue) tempValue.textContent = `${temperatureSlider.value}°C`;
    };

    [irrigationSlider, rainfallSlider, temperatureSlider].forEach((slider) => {
      if (slider) slider.addEventListener('input', updateSliderLabels);
    });

    document.querySelectorAll('.duration-btn').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.duration-btn').forEach((btn) => {
          btn.classList.toggle('active', btn === button);
        });
      });
    });

    const whyBtn = document.getElementById('why-this-btn');
    const whyPanel = document.getElementById('why-this-panel');
    whyBtn?.addEventListener('click', () => {
      whyPanel?.classList.toggle('hidden');
    });

    updateSliderLabels();
  }

  function updateRecommendationText(value) {
    const recommendation = document.getElementById('recommendation-text');
    if (recommendation) {
      recommendation.textContent = `${value} L irrigation is recommended for the next simulation cycle.`;
    }
  }

  function updateHomeState() {
    const weather = getWeatherStatus(farmState.weather.temperature);
    const water = getWaterStatus(farmState.water.available);
    const crop = getHealthStatus(farmState.crop.health);
    const soil = getSoilStatus(farmState.soil.moisture);

    const labels = document.querySelectorAll('[data-i18n]');
    labels.forEach((element) => {
      const key = element.dataset.i18n;
      const textMap = {
        goodMorning: 'Good Morning',
        farmName: farmState.farmName,
        weather: `🌤️ ${farmState.weather.temperature}°C`,
        waterStatus: `💧 Water: ${water.label}`,
        cropStatus: `🌱 Crop: ${crop.label}`,
        soilStatus: `🌾 Soil: ${soil.label}`,
        healthyCrop: crop.label === 'Healthy' ? 'Crop is healthy' : 'Crop needs attention',
      };
      if (textMap[key]) element.textContent = textMap[key];
    });
  }

  window.agritwin = window.agritwin || {};
  window.agritwin.renderStatusPanels = renderStatusPanels;
  window.agritwin.setupNavigation = setupNavigation;
  window.agritwin.setupLanguageToggle = setupLanguageToggle;
  window.agritwin.bindFarmForm = bindFarmForm;
  window.agritwin.bindSimulationControls = bindSimulationControls;
  window.agritwin.updateRecommendationText = updateRecommendationText;
  window.agritwin.updateHomeState = updateHomeState;
})();
