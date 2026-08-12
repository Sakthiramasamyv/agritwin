(function () {
  const stateApi = window.agritwin || {};
  const { farmState, clamp } = stateApi;

  const scenarios = {
    noIrrigation: {
      irrigation: 0,
      rainfall: 2,
      temperature: 36,
      duration: 48,
      label: 'No Irrigation',
    },
    moderate: {
      irrigation: 15,
      rainfall: 12,
      temperature: 34,
      duration: 24,
      label: 'Moderate Irrigation',
    },
    high: {
      irrigation: 30,
      rainfall: 18,
      temperature: 31,
      duration: 48,
      label: 'High Irrigation',
    },
  };

  function calculateSimulationOutcome({ irrigation, rainfall, temperature, duration }) {
    const irrigationImpact = irrigation * 1.4;
    const rainfallImpact = rainfall * 0.5;
    const temperatureStress = Math.max(0, temperature - 30) * 3.4;
    const timeFactor = duration / 24;

    const healthDelta = irrigationImpact + rainfallImpact - temperatureStress - timeFactor * 8;
    const predictedHealth = clamp(Math.round(farmState.crop.health + healthDelta), 0, 100);
    const predictedMoisture = clamp(Math.round(farmState.soil.moisture + irrigation * 0.8 + rainfall * 0.4 - temperature * 0.5), 0, 100);

    const result = {
      predictedHealth,
      predictedMoisture,
      irrigation,
      rainfall,
      temperature,
      duration,
      recommendation: 15,
    };

    return result;
  }

  function simulateFuture() {
    const irrigationSlider = document.getElementById('irrigation-slider');
    const rainfallSlider = document.getElementById('rainfall-slider');
    const temperatureSlider = document.getElementById('temperature-slider');
    const selectedDuration = document.querySelector('.duration-btn.active')?.dataset.duration || '24';

    const result = calculateSimulationOutcome({
      irrigation: Number(irrigationSlider.value),
      rainfall: Number(rainfallSlider.value),
      temperature: Number(temperatureSlider.value),
      duration: Number(selectedDuration),
    });

    farmState.crop.health = result.predictedHealth;
    farmState.soil.moisture = result.predictedMoisture;
    farmState.weather.temperature = result.temperature;
    farmState.weather.rainfall = result.rainfall;

    const recommendationText = document.getElementById('recommendation-text');
    if (recommendationText) {
      recommendationText.textContent = `${result.recommendation} L irrigation is recommended for the next ${selectedDuration} hours.`;
    }

    return result;
  }

  window.agritwin = window.agritwin || {};
  window.agritwin.scenarios = scenarios;
  window.agritwin.calculateSimulationOutcome = calculateSimulationOutcome;
  window.agritwin.simulateFuture = simulateFuture;
})();
