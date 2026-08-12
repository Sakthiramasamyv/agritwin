(function () {
  const ui = window.agritwin;
  const { syncDerivedState, applyFarmForm, farmState } = ui;

  function initialize() {
    syncDerivedState();
    ui.setupNavigation();
    ui.setupLanguageToggle();
    ui.bindFarmForm((formData) => {
      applyFarmForm(formData);
      ui.updateHomeState();
    });

    ui.bindSimulationControls();

    const simulateButton = document.querySelector('.simulate-btn');
    simulateButton?.addEventListener('click', () => {
      ui.simulateFuture();
      ui.renderStatusPanels();
      ui.updateHomeState();
      ui.updateRecommendationText('15');
    });

    ui.renderStatusPanels();
    ui.updateHomeState();
    ui.setupDigitalTwin('digital-twin-canvas');
    ui.updateFarmVisualState();
  }

  initialize();
})();
