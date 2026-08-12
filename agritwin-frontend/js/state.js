(function () {
  const farmState = {
    farmName: 'My Tomato Farm',
    farmArea: 5,
    farmSize: '5 acres',
    crops: [{ id: 1, type: 'Tomato', acres: 2 }],
    nextCropId: 2,
    cropType: 'Tomato',
    soilType: 'Loamy',
    cropStage: 'Flowering',
    waterAvailable: 1000,
    soil: { type: 'loamy', moisture: 32 },
    crop: { type: 'tomato', stage: 'flowering', health: 85 },
    weather: { temperature: 34, humidity: 48, rainfall: 0 },
    water: { available: 1000 },
  };

  function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

  function syncDerivedState() {
    farmState.soil.type = farmState.soilType.toLowerCase();
    farmState.crop.type = farmState.cropType.toLowerCase();
    farmState.crop.stage = farmState.cropStage.toLowerCase();
    farmState.water.available = farmState.waterAvailable;
    farmState.soil.moisture = clamp(Number(farmState.waterAvailable) / 30 + 10, 0, 100);
    const healthBase = clamp(90 - Math.abs(Number(farmState.weather.temperature) - 34) * 1.5, 35, 100);
    farmState.crop.health = clamp(Math.round(healthBase), 0, 100);
  }

  function validateFarmForm(formData) {
    const total = Number(formData.farmArea);
    const crops = Array.isArray(formData.crops) ? formData.crops : [];
    const allocated = crops.reduce((sum, crop) => sum + Number(crop.acres || 0), 0);
    if (!String(formData.farmName || '').trim()) return 'requiredFarmName';
    if (!Number.isFinite(total) || total <= 0) return 'requiredFarmArea';
    if (!crops.length) return 'requiredCrop';
    if (crops.some((crop) => !crop.type || !Number.isFinite(Number(crop.acres)) || Number(crop.acres) <= 0)) return 'requiredCropArea';
    if (allocated > total) return 'allocationTooHigh';
    return null;
  }

  function applyFarmForm(formData) {
    farmState.farmName = String(formData.farmName).trim();
    farmState.farmArea = Number(formData.farmArea);
    farmState.farmSize = `${farmState.farmArea} acres`;
    farmState.crops = formData.crops.map((crop) => ({ id: crop.id, type: crop.type, acres: Number(crop.acres) }));
    farmState.nextCropId = Math.max(...farmState.crops.map((crop) => crop.id), 0) + 1;
    farmState.cropType = farmState.crops[0].type;
    syncDerivedState();
  }

  function getHealthStatus(health) {
    if (health >= 80) return { label: 'Healthy', tone: 'healthy' };
    if (health >= 50) return { label: 'Watch', tone: 'warning' };
    if (health >= 25) return { label: 'Stressed', tone: 'warning' };
    return { label: 'Critical', tone: 'danger' };
  }
  function getWaterStatus(available) {
    if (available > 700) return { label: 'High', tone: 'water' };
    if (available > 350) return { label: 'Medium', tone: 'water' };
    if (available > 120) return { label: 'Low', tone: 'warning' };
    return { label: 'Critical', tone: 'danger' };
  }
  function getSoilStatus(moisture) {
    if (moisture > 45) return { label: 'Good', tone: 'healthy' };
    if (moisture > 25) return { label: 'Fair', tone: 'warning' };
    return { label: 'Dry', tone: 'danger' };
  }
  function getWeatherStatus(temp) {
    if (temp > 35) return { label: 'Hot', tone: 'sunny' };
    if (temp > 28) return { label: 'Warm', tone: 'sunny' };
    if (temp > 18) return { label: 'Mild', tone: 'water' };
    return { label: 'Cool', tone: 'good' };
  }
  function getStateSnapshot() {
    return { farmName: farmState.farmName, farmArea: farmState.farmArea, crops: farmState.crops.map((crop) => ({ ...crop })), cropType: farmState.cropType, farmSize: farmState.farmSize, soilType: farmState.soilType, cropStage: farmState.cropStage, waterAvailable: farmState.waterAvailable, soil: { ...farmState.soil }, crop: { ...farmState.crop }, weather: { ...farmState.weather }, water: { ...farmState.water } };
  }

  window.agritwin = window.agritwin || {};
  Object.assign(window.agritwin, { farmState, syncDerivedState, applyFarmForm, validateFarmForm, getHealthStatus, getWaterStatus, getSoilStatus, getWeatherStatus, clamp, getStateSnapshot });
})();
