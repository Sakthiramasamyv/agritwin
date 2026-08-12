(function () {
  const farmState = {
    farmName: 'My Tomato Farm',
    cropType: 'Tomato',
    farmSize: '2 acres',
    soilType: 'Loamy',
    cropStage: 'Flowering',
    waterAvailable: 1000,
    soil: {
      type: 'loamy',
      moisture: 32,
    },
    crop: {
      type: 'tomato',
      stage: 'flowering',
      health: 85,
    },
    weather: {
      temperature: 34,
      humidity: 48,
      rainfall: 0,
    },
    water: {
      available: 1000,
    },
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function syncDerivedState() {
    farmState.soil.type = farmState.soilType.toLowerCase();
    farmState.crop.type = farmState.cropType.toLowerCase();
    farmState.crop.stage = farmState.cropStage.toLowerCase();
    farmState.water.available = farmState.waterAvailable;

    const moistureValue = Number(farmState.waterAvailable) / 30;
    farmState.soil.moisture = clamp(Number(moistureValue) + 10, 0, 100);

    const healthBase = clamp(90 - Math.abs(Number(farmState.weather.temperature) - 34) * 1.5, 35, 100);
    farmState.crop.health = clamp(Math.round(healthBase), 0, 100);
  }

  function applyFarmForm(formData) {
    farmState.farmName = formData.farmName || farmState.farmName;
    farmState.cropType = formData.cropType || farmState.cropType;
    farmState.farmSize = formData.farmSize || farmState.farmSize;
    farmState.soilType = formData.soilType || farmState.soilType;
    farmState.cropStage = formData.cropStage || farmState.cropStage;
    farmState.waterAvailable = Number(formData.waterAvailable) || farmState.waterAvailable;

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
    return {
      farmName: farmState.farmName,
      cropType: farmState.cropType,
      farmSize: farmState.farmSize,
      soilType: farmState.soilType,
      cropStage: farmState.cropStage,
      waterAvailable: farmState.waterAvailable,
      soil: { ...farmState.soil },
      crop: { ...farmState.crop },
      weather: { ...farmState.weather },
      water: { ...farmState.water },
    };
  }

  window.agritwin = window.agritwin || {};
  window.agritwin.farmState = farmState;
  window.agritwin.syncDerivedState = syncDerivedState;
  window.agritwin.applyFarmForm = applyFarmForm;
  window.agritwin.getHealthStatus = getHealthStatus;
  window.agritwin.getWaterStatus = getWaterStatus;
  window.agritwin.getSoilStatus = getSoilStatus;
  window.agritwin.getWeatherStatus = getWeatherStatus;
  window.agritwin.clamp = clamp;
  window.agritwin.getStateSnapshot = getStateSnapshot;
})();
