(function () {
  const stateApi = window.agritwin;
  const { farmState, getHealthStatus, getSoilStatus, getWaterStatus, getWeatherStatus } = stateApi;

  function renderStatusPanels() {
    const statuses = [['crop', getHealthStatus(farmState.crop.health)], ['soil', getSoilStatus(farmState.soil.moisture)], ['water', getWaterStatus(farmState.water.available)], ['weather', getWeatherStatus(farmState.weather.temperature)]];
    statuses.forEach(([name, status]) => {
      const label = document.getElementById(`${name}-status-label`);
      const card = document.querySelector(`[data-status="${name}"]`);
      if (label) label.textContent = status.label;
      if (card) { card.classList.remove('healthy', 'warning', 'danger', 'water', 'sunny', 'good'); card.classList.add(status.tone); }
    });
  }

  function setupNavigation() {
    const items = [...document.querySelectorAll('[data-screen]')];
    const show = (name) => { document.querySelectorAll('.screen').forEach((screen) => screen.classList.toggle('active', screen.id === `screen-${name}`)); items.forEach((item) => item.classList.toggle('active', item.dataset.screen === name)); };
    items.forEach((item) => item.addEventListener('click', () => show(item.dataset.screen)));
    document.querySelectorAll('[data-target-screen]').forEach((button) => button.addEventListener('click', () => show(button.dataset.targetScreen)));
  }

  function setupLanguageToggle() { window.agritwin.setupLocalization?.(); }

  function bindFarmForm(handler) {
    const form = document.getElementById('farm-form');
    const list = document.getElementById('crop-allocation-list');
    const totalInput = document.getElementById('farm-area');
    let rows = [{ id: 1, type: 'Tomato', acres: 2 }];
    const update = () => {
      const total = Number(totalInput?.value || 0);
      const allocated = rows.reduce((sum, row) => sum + (Number(row.acres) || 0), 0);
      const remaining = document.getElementById('remaining-area');
      if (remaining) remaining.textContent = (total - allocated).toFixed(1).replace('.0', '');
      const preview = document.getElementById('crop-zone-preview');
      if (preview) preview.innerHTML = rows.map((row) => `<div class="crop-zone" style="--zone-size:${total ? Math.max(8, row.acres / total * 100) : 8}%"><span>${row.type}</span><strong>${row.acres || 0} acres</strong></div>`).join('');
    };
    const render = () => {
      if (!list) return;
      list.innerHTML = rows.map((row) => `<div class="crop-allocation-row"><select class="crop-type-input" aria-label="Crop type"><option value="Tomato" ${row.type === 'Tomato' ? 'selected' : ''}>Tomato</option><option value="Chilli" ${row.type === 'Chilli' ? 'selected' : ''}>Chilli</option><option value="Rice" ${row.type === 'Rice' ? 'selected' : ''}>Rice</option><option value="Groundnut" ${row.type === 'Groundnut' ? 'selected' : ''}>Groundnut</option><option value="Other" ${row.type === 'Other' ? 'selected' : ''}>Other</option></select><div class="unit-input"><input class="crop-area-input" type="number" min="0.1" step="0.1" value="${row.acres}" aria-label="Crop acres"><span>acres</span></div><button type="button" class="remove-crop-btn" aria-label="Remove crop">×</button></div>`).join('');
      list.querySelectorAll('.crop-type-input').forEach((input, index) => input.addEventListener('change', () => { rows[index].type = input.value; update(); }));
      list.querySelectorAll('.crop-area-input').forEach((input, index) => input.addEventListener('input', () => { rows[index].acres = Number(input.value); update(); }));
      list.querySelectorAll('.remove-crop-btn').forEach((button, index) => button.addEventListener('click', () => { rows.splice(index, 1); render(); update(); }));
    };
    document.getElementById('add-crop-btn')?.addEventListener('click', () => { rows.push({ id: Date.now(), type: 'Chilli', acres: 1 }); render(); update(); });
    totalInput?.addEventListener('input', update);
    render(); update();
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries()); values.crops = rows;
      const errorKey = stateApi.validateFarmForm(values); const error = document.getElementById('farm-form-error');
      if (errorKey) { if (error) error.textContent = stateApi.translate(errorKey); return; }
      if (error) error.textContent = ''; handler(values); renderStatusPanels();
      const success = document.getElementById('farm-form-success'); if (success) success.textContent = stateApi.translate('farmSaved');
      document.querySelector('.nav-item[data-screen="digital-twin"]')?.click();
    });
  }

  function bindSimulationControls() {
    const sliders = [['irrigation-slider', 'irrigation-value', ' L'], ['rainfall-slider', 'rainfall-value', ' mm'], ['temperature-slider', 'temp-value', '°C']];
    const update = () => sliders.forEach(([input, output, unit]) => { const source = document.getElementById(input); const target = document.getElementById(output); if (source && target) target.textContent = `${source.value}${unit}`; });
    sliders.forEach(([input]) => document.getElementById(input)?.addEventListener('input', update));
    document.querySelectorAll('.duration-btn').forEach((button) => button.addEventListener('click', () => document.querySelectorAll('.duration-btn').forEach((item) => item.classList.toggle('active', item === button))));
    document.getElementById('why-this-btn')?.addEventListener('click', () => document.getElementById('why-this-panel')?.classList.toggle('hidden'));
    update();
  }

  function updateRecommendationText(value) { const element = document.getElementById('recommendation-text'); if (element) element.textContent = `${value} L irrigation is recommended for the next simulation cycle.`; }
  function updateHomeState() {
    const weather = getWeatherStatus(farmState.weather.temperature); const water = getWaterStatus(farmState.water.available); const crop = getHealthStatus(farmState.crop.health); const soil = getSoilStatus(farmState.soil.moisture);
    const values = { goodMorning: 'Good Morning', farmName: farmState.farmName, weather: `🌤️ ${farmState.weather.temperature}°C`, waterStatus: `💧 Water: ${water.label}`, cropStatus: `🌱 Crop: ${crop.label}`, soilStatus: `🌾 Soil: ${soil.label}`, healthyCrop: crop.label === 'Healthy' ? 'Crop is healthy' : 'Crop needs attention' };
    document.querySelectorAll('[data-i18n]').forEach((element) => { if (values[element.dataset.i18n]) element.textContent = values[element.dataset.i18n]; });
  }

  Object.assign(window.agritwin, { renderStatusPanels, setupNavigation, setupLanguageToggle, bindFarmForm, bindSimulationControls, updateRecommendationText, updateHomeState });
})();
