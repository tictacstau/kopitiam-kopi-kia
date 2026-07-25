/**
 * Kopitiam Kopi Kia - Main Gameplay Engine (Expanded Edition)
 * Supports Hot Brews, Iced Drinks, Canned Drinks, and Dispensers
 */

class GameEngine {
  constructor() {
    this.score = 0.00;
    this.servedCount = 0;
    this.activeTab = 'brew';

    this.activeMug = {
      isEquipped: false,
      type: 'brew', // 'brew' | 'can' | 'dispenser'
      kopiCount: 0,
      tehCount: 0,
      milk: 'none', // 'none' | 'condensed' | 'evaporated'
      hasWater: false,
      hasIce: false,
      sugar: 'kosong', // 'kosong' | 'siew_dai' | 'normal' | 'ga_dai'
      canBrand: null, // 'coke' | 'sprite' | 'hundred_plus'
      dispenserFlavor: null // 'bandung' | 'lime_juice'
    };

    this.queue = [];
    this.timerInterval = null;
    this.timeRemaining = 22;
    this.maxTime = 22;

    this.initElements();
    this.bindEvents();
    this.startNewGame();
  }

  initElements() {
    this.elScoreText = document.getElementById('score-text');
    this.elSpotlightTimer = document.getElementById('spotlight-timer');
    this.elSpotlightProgressBar = document.getElementById('spotlight-progress-bar');
    this.elSpotlightAvatar = document.getElementById('spotlight-avatar');
    this.elSpotlightCustomerName = document.getElementById('spotlight-customer-name');
    this.elSpotlightOrderName = document.getElementById('spotlight-order-name');
    this.elSpotlightCard = document.getElementById('active-order-spotlight');

    this.elMugOverlay = document.getElementById('glass-mug-overlay');
    this.elGlassBody = document.getElementById('mug-glass-body');
    this.elGlassHandle = document.getElementById('mug-handle');
    this.elLiquidCondensed = document.getElementById('liquid-condensed-milk');
    this.elLiquidEvaporated = document.getElementById('liquid-evaporated-milk');
    this.elLiquidBrew = document.getElementById('liquid-brew');
    this.elLiquidWater = document.getElementById('liquid-water');
    this.elSugarIndicator = document.getElementById('sugar-indicator');
    this.elIceCubes = document.getElementById('liquid-ice-cubes');
    this.elSteamContainer = document.getElementById('mug-steam-container');
    this.elMugStatusText = document.getElementById('mug-status-text');

    // Tabs & Panels
    this.stationTabs = document.querySelectorAll('.station-tab');
    this.stationPanels = {
      brew: document.getElementById('panel-brew'),
      cans: document.getElementById('panel-cans'),
      dispenser: document.getElementById('panel-dispenser')
    };

    // Toolbar Buttons
    this.elBtnGrabMug = document.getElementById('btn-grab-mug');
    this.elBtnGrabCupCan = document.getElementById('btn-grab-cup-can');
    this.elBtnGrabCupDisp = document.getElementById('btn-grab-cup-disp');
    
    this.elBtnKopi = document.getElementById('btn-kopi');
    this.elBtnTeh = document.getElementById('btn-teh');
    this.elBtnWater = document.getElementById('btn-water');
    this.elBtnCondensed = document.getElementById('btn-condensed');
    this.elBtnEvap = document.getElementById('btn-evap');
    this.elBtnSugar = document.getElementById('btn-sugar');
    this.elBtnIce = document.getElementById('btn-ice');

    // Cans & Dispensers
    this.elBtnCoke = document.getElementById('btn-coke');
    this.elBtnSprite = document.getElementById('btn-sprite');
    this.elBtnHundred = document.getElementById('btn-hundred');
    this.elBtnBandung = document.getElementById('btn-bandung');
    this.elBtnLime = document.getElementById('btn-lime');

    this.elBtnServe = document.getElementById('btn-serve');

    this.elLabelSugar = document.getElementById('label-sugar');
    this.elLabelIce = document.getElementById('label-ice');

    this.elToastContainer = document.getElementById('toast-container');
    this.elRecipeModal = document.getElementById('recipe-modal');
    this.elBtnRecipeModal = document.getElementById('btn-recipe-modal');
    this.elBtnCloseModal = document.getElementById('btn-close-modal');
    this.elBtnSoundToggle = document.getElementById('btn-sound-toggle');
    this.elFloatingScoreContainer = document.getElementById('floating-score-container');
  }

  bindEvents() {
    // Station Tab Switching
    this.stationTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Mug & Cup Grabs
    const grabHandler = () => this.handleGrabContainer();
    this.elBtnGrabMug.addEventListener('click', grabHandler);
    this.elBtnGrabCupCan.addEventListener('click', grabHandler);
    this.elBtnGrabCupDisp.addEventListener('click', grabHandler);

    // Brew Station Actions
    this.elBtnKopi.addEventListener('click', () => this.handleAddKopi());
    this.elBtnTeh.addEventListener('click', () => this.handleAddTeh());
    this.elBtnWater.addEventListener('click', () => this.handleToggleWater());
    this.elBtnCondensed.addEventListener('click', () => this.handleCondensedMilk());
    this.elBtnEvap.addEventListener('click', () => this.handleEvapMilk());
    this.elBtnSugar.addEventListener('click', () => this.handleCycleSugar());
    this.elBtnIce.addEventListener('click', () => this.handleToggleIce());

    // Cans Station Actions
    this.elBtnCoke.addEventListener('click', () => this.handleSelectCan('coke'));
    this.elBtnSprite.addEventListener('click', () => this.handleSelectCan('sprite'));
    this.elBtnHundred.addEventListener('click', () => this.handleSelectCan('hundred_plus'));

    // Dispenser Station Actions
    this.elBtnBandung.addEventListener('click', () => this.handleSelectDispenser('bandung'));
    this.elBtnLime.addEventListener('click', () => this.handleSelectDispenser('lime_juice'));

    // Serve Tray
    this.elBtnServe.addEventListener('click', () => this.handleServeTray());

    // Recipe Guide Modal & Sound
    this.elBtnRecipeModal.addEventListener('click', () => {
      window.soundEngine.init();
      this.elRecipeModal.classList.remove('hidden');
    });
    this.elBtnCloseModal.addEventListener('click', () => {
      this.elRecipeModal.classList.add('hidden');
    });

    this.elBtnSoundToggle.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      this.elBtnSoundToggle.querySelector('.icon').textContent = isMuted ? '🔇' : '🔊';
    });
  }

  switchTab(tabName) {
    window.soundEngine.init();
    this.activeTab = tabName;

    this.stationTabs.forEach(t => {
      if (t.getAttribute('data-tab') === tabName) {
        t.classList.add('active-tab');
      } else {
        t.classList.remove('active-tab');
      }
    });

    Object.keys(this.stationPanels).forEach(key => {
      if (key === tabName) {
        this.stationPanels[key].classList.remove('hidden');
      } else {
        this.stationPanels[key].classList.add('hidden');
      }
    });
  }

  startNewGame() {
    this.score = 0.00;
    this.servedCount = 0;
    this.updateScoreDisplay();

    this.queue = [
      OrderManager.getRandomOrder(),
      OrderManager.getRandomOrder(),
      OrderManager.getRandomOrder()
    ];

    this.resetMugState();
    this.renderQueue();
    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.timeRemaining = 22;
    this.maxTime = 22;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();

      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.handleOrderTimeout();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const formatted = `0:${this.timeRemaining < 10 ? '0' : ''}${this.timeRemaining}`;
    this.elSpotlightTimer.textContent = formatted;

    const pct = Math.max(0, (this.timeRemaining / this.maxTime) * 100);
    this.elSpotlightProgressBar.style.width = `${pct}%`;

    if (this.timeRemaining <= 5) {
      this.elSpotlightProgressBar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    } else {
      this.elSpotlightProgressBar.style.background = 'linear-gradient(90deg, #06b6d4, #22d3ee)';
    }
  }

  handleOrderTimeout() {
    window.soundEngine.playErrorSound();
    const currentCustomer = this.queue[0];
    this.showToast(`⌛ Time out! ${currentCustomer.customerName} left without their drink!`);
    this.shakeSpotlightCard();
    this.advanceQueue();
  }

  renderQueue() {
    const activeOrder = this.queue[0];

    this.elSpotlightAvatar.textContent = activeOrder.customerAvatar;
    this.elSpotlightCustomerName.textContent = `${activeOrder.customerName}:`;
    this.elSpotlightOrderName.textContent = `${activeOrder.recipe.name}!`;

    this.queue.forEach((ord, idx) => {
      const qCard = document.getElementById(`queue-card-${idx}`);
      if (qCard) {
        qCard.querySelector('.queue-avatar').textContent = ord.customerAvatar;
        qCard.querySelector('.q-name').textContent = `${ord.customerName}:`;
        qCard.querySelector('.q-drink').textContent = `${ord.recipe.name}!`;
      }
    });
  }

  advanceQueue() {
    this.queue.shift();
    this.queue.push(OrderManager.getRandomOrder());
    this.renderQueue();
    this.startTimer();
    this.resetMugState();
  }

  /* ==========================================================================
     CONTAINER & INGREDIENT ACTIONS
     ========================================================================== */
  autoEquipContainer(type = 'brew') {
    if (!this.activeMug.isEquipped) {
      this.activeMug.isEquipped = true;
      this.activeMug.type = type;
      this.elMugOverlay.classList.add('mug-active');
      window.soundEngine.playMugGrab();
    }
  }

  handleGrabContainer() {
    window.soundEngine.init();
    if (!this.activeMug.isEquipped) {
      this.autoEquipContainer(this.activeTab);
      this.showToast('🍺 Container Ready! Select ingredients.', true);
    } else {
      this.resetMugState();
      window.soundEngine.playMugGrab();
      this.showToast('🧹 Container emptied & rinsed clean.', true);
    }
  }

  handleAddKopi() {
    this.autoEquipContainer('brew');
    this.activeMug.type = 'brew';
    window.soundEngine.playPourSound(0.5);

    this.activeMug.kopiCount = this.activeMug.kopiCount === 0 ? 1 : 0;
    this.renderMugVisuals();
  }

  handleAddTeh() {
    this.autoEquipContainer('brew');
    this.activeMug.type = 'brew';
    window.soundEngine.playPourSound(0.5);

    this.activeMug.tehCount = this.activeMug.tehCount === 0 ? 1 : 0;
    this.renderMugVisuals();
  }

  handleCondensedMilk() {
    this.autoEquipContainer('brew');
    this.activeMug.type = 'brew';
    window.soundEngine.playPourSound(0.4);

    this.activeMug.milk = this.activeMug.milk === 'condensed' ? 'none' : 'condensed';
    this.renderMugVisuals();
  }

  handleEvapMilk() {
    this.autoEquipContainer('brew');
    this.activeMug.type = 'brew';
    window.soundEngine.playPourSound(0.4);

    this.activeMug.milk = this.activeMug.milk === 'evaporated' ? 'none' : 'evaporated';
    this.renderMugVisuals();
  }

  handleToggleWater() {
    this.autoEquipContainer('brew');
    this.activeMug.type = 'brew';
    window.soundEngine.playPourSound(0.6);

    this.activeMug.hasWater = !this.activeMug.hasWater;
    this.renderMugVisuals();
  }

  handleCycleSugar() {
    this.autoEquipContainer('brew');
    this.activeMug.type = 'brew';
    window.soundEngine.playSugarSound();

    const cycle = { kosong: 'siew_dai', siew_dai: 'normal', normal: 'ga_dai', ga_dai: 'kosong' };
    this.activeMug.sugar = cycle[this.activeMug.sugar];
    this.renderMugVisuals();
  }

  handleToggleIce() {
    this.autoEquipContainer(this.activeTab);
    window.soundEngine.playIceSound();

    this.activeMug.hasIce = !this.activeMug.hasIce;
    this.renderMugVisuals();
  }

  handleSelectCan(brand) {
    this.autoEquipContainer('can');
    this.activeMug.type = 'can';
    this.activeMug.canBrand = brand;
    window.soundEngine.playCanPopSound();

    this.renderMugVisuals();
  }

  handleSelectDispenser(flavor) {
    this.autoEquipContainer('dispenser');
    this.activeMug.type = 'dispenser';
    this.activeMug.dispenserFlavor = flavor;
    window.soundEngine.playDispenserSound();

    this.renderMugVisuals();
  }

  renderMugVisuals() {
    // Ice Cubes
    if (this.activeMug.hasIce) {
      this.elIceCubes.classList.remove('hidden');
      this.elLabelIce.textContent = 'Ice (Added)';
    } else {
      this.elIceCubes.classList.add('hidden');
      this.elLabelIce.textContent = 'Ice Bin';
    }

    // BREW RENDER
    if (this.activeMug.type === 'brew') {
      // Milk
      if (this.activeMug.milk === 'condensed') {
        this.elLiquidCondensed.style.height = '22%';
        this.elLiquidEvaporated.style.height = '0%';
      } else if (this.activeMug.milk === 'evaporated') {
        this.elLiquidCondensed.style.height = '0%';
        this.elLiquidEvaporated.style.height = '22%';
      } else {
        this.elLiquidCondensed.style.height = '0%';
        this.elLiquidEvaporated.style.height = '0%';
      }

      // Brew
      if (this.activeMug.kopiCount > 0 && this.activeMug.tehCount > 0) {
        this.elLiquidBrew.style.height = '42%';
        this.elLiquidBrew.className = 'liquid-layer yuanyang-color';
      } else if (this.activeMug.kopiCount > 0) {
        this.elLiquidBrew.style.height = '38%';
        this.elLiquidBrew.className = 'liquid-layer';
      } else if (this.activeMug.tehCount > 0) {
        this.elLiquidBrew.style.height = '38%';
        this.elLiquidBrew.className = 'liquid-layer teh-color';
      } else {
        this.elLiquidBrew.style.height = '0%';
      }

      // Water & Steam
      if (this.activeMug.hasWater) {
        this.elLiquidWater.style.height = '28%';
        if (!this.activeMug.hasIce) {
          this.elSteamContainer.classList.remove('hidden');
        } else {
          this.elSteamContainer.classList.add('hidden');
        }
      } else {
        this.elLiquidWater.style.height = '0%';
        this.elSteamContainer.classList.add('hidden');
      }

      // Sugar
      const sugarHeights = { kosong: '0px', siew_dai: '6px', normal: '12px', ga_dai: '18px' };
      this.elSugarIndicator.style.height = sugarHeights[this.activeMug.sugar];
      this.elLabelSugar.textContent = `Sugar (${this.activeMug.sugar.replace('_', ' ')})`;
    }

    // CANNED RENDER
    else if (this.activeMug.type === 'can') {
      this.elLiquidCondensed.style.height = '0%';
      this.elLiquidEvaporated.style.height = '0%';
      this.elLiquidWater.style.height = '0%';
      this.elSugarIndicator.style.height = '0px';
      this.elSteamContainer.classList.add('hidden');

      this.elLiquidBrew.style.height = '65%';
      if (this.activeMug.canBrand === 'coke') this.elLiquidBrew.className = 'liquid-layer coke-color';
      else if (this.activeMug.canBrand === 'sprite') this.elLiquidBrew.className = 'liquid-layer sprite-color';
      else if (this.activeMug.canBrand === 'hundred_plus') this.elLiquidBrew.className = 'liquid-layer hundred-color';
    }

    // DISPENSER RENDER
    else if (this.activeMug.type === 'dispenser') {
      this.elLiquidCondensed.style.height = '0%';
      this.elLiquidEvaporated.style.height = '0%';
      this.elLiquidWater.style.height = '0%';
      this.elSugarIndicator.style.height = '0px';
      this.elSteamContainer.classList.add('hidden');

      this.elLiquidBrew.style.height = '65%';
      if (this.activeMug.dispenserFlavor === 'bandung') this.elLiquidBrew.className = 'liquid-layer bandung-color';
      else if (this.activeMug.dispenserFlavor === 'lime_juice') this.elLiquidBrew.className = 'liquid-layer lime-color';
    }

    // Dynamic Mug Status Text
    const ingredients = [];
    if (this.activeMug.type === 'can') {
      if (this.activeMug.canBrand) ingredients.push(this.activeMug.canBrand.replace('_', ' ').toUpperCase());
    } else if (this.activeMug.type === 'dispenser') {
      if (this.activeMug.dispenserFlavor) ingredients.push(this.activeMug.dispenserFlavor.replace('_', ' ').toUpperCase());
    } else {
      if (this.activeMug.kopiCount > 0 && this.activeMug.tehCount > 0) ingredients.push('Kopi+Teh');
      else if (this.activeMug.kopiCount > 0) ingredients.push('Kopi');
      else if (this.activeMug.tehCount > 0) ingredients.push('Teh');

      if (this.activeMug.milk === 'condensed') ingredients.push('Condensed Milk');
      else if (this.activeMug.milk === 'evaporated') ingredients.push('Evap Milk');

      if (this.activeMug.hasWater) ingredients.push('Hot Water');
      if (this.activeMug.sugar !== 'kosong') ingredients.push(this.activeMug.sugar.replace('_', ' ').toUpperCase());
    }

    if (this.activeMug.hasIce) ingredients.push('ICE');

    if (ingredients.length > 0) {
      this.elMugStatusText.textContent = ingredients.join(' + ');
    } else {
      this.elMugStatusText.textContent = 'Container Ready! Select ingredients';
    }
  }

  resetMugState() {
    this.activeMug = {
      isEquipped: false,
      type: 'brew',
      kopiCount: 0,
      tehCount: 0,
      milk: 'none',
      hasWater: false,
      hasIce: false,
      sugar: 'kosong',
      canBrand: null,
      dispenserFlavor: null
    };

    this.elMugOverlay.classList.remove('mug-active');
    this.elMugStatusText.textContent = 'Tap "Fresh Mug" to start';
    this.renderMugVisuals();
  }

  /* ==========================================================================
     SERVE & VALIDATION LOGIC
     ========================================================================== */
  handleServeTray() {
    window.soundEngine.init();

    if (!this.activeMug.isEquipped) {
      window.soundEngine.playErrorSound();
      this.showToast('⚠️ Equip a container and prepare drink first!');
      return;
    }

    const activeOrder = this.queue[0];
    const validation = OrderManager.validateDrink(this.activeMug, activeOrder.recipe);

    if (validation.isValid) {
      window.soundEngine.playKaChing();

      const earned = activeOrder.recipe.price;
      this.score += earned;
      this.servedCount++;
      this.updateScoreDisplay();

      this.showFloatingEarnings(`+$${earned.toFixed(2)}`);
      this.showToast(`✨ Ka-Ching! Served ${activeOrder.recipe.name} to ${activeOrder.customerName}! (+$${earned.toFixed(2)})`, true);
      this.advanceQueue();
    } else {
      window.soundEngine.playErrorSound();
      this.shakeSpotlightCard();
      const firstError = validation.errors[0] || 'Incorrect recipe!';
      this.showToast(`❌ Wrong Drink for ${activeOrder.customerName}! ${firstError}`);
    }
  }

  updateScoreDisplay() {
    this.elScoreText.textContent = `$${this.score.toFixed(2)}`;
  }

  showFloatingEarnings(text) {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-score';
    floatEl.textContent = text;
    this.elFloatingScoreContainer.appendChild(floatEl);

    setTimeout(() => floatEl.remove(), 1200);
  }

  shakeSpotlightCard() {
    this.elSpotlightCard.classList.add('shake-card');
    setTimeout(() => this.elSpotlightCard.classList.remove('shake-card'), 450);
  }

  showToast(message, isSuccess = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isSuccess ? 'toast-success' : ''}`;
    toast.textContent = message;
    this.elToastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});
