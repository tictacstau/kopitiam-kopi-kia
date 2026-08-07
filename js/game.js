/**
 * Kopitiam Kopi Kia - Main Gameplay & Campaign Saga Engine
 * Supports Main Menu, Campaign Levels, Upgrade Shop, and LocalStorage Persistence
 */

class GameEngine {
  constructor() {
    this.saveData = this.loadSaveData();

    this.shiftScore = 0.00;
    this.shiftServedCount = 0;
    this.currentLevelIndex = 0;
    this.shiftTimeRemaining = 45;
    this.shiftTimerInterval = null;

    this.activeTab = 'brew';
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

    this.sandboxMode = false; // Set to false for standard production gameplay timers

    this.queue = [];
    this.orderTimerInterval = null;
    this.orderTimeRemaining = 22;

    this.initElements();
    this.bindEvents();
    this.updateMainMenuDisplay();
  }

  /* ==========================================================================
     LOCAL STORAGE PERSISTENCE
     ========================================================================== */
  loadSaveData() {
    const defaultData = {
      playerName: 'Master Kopi Kia',
      careerMoney: 0.00,
      unlockedLevel: 1,
      levelStars: { 1: 0 },
      streak: 0,
      upgrades: [],
      bestShiftScore: 0.00,
      highScores: [
        { name: 'Kopi King Seng', score: 88.50 },
        { name: 'Aunty Lee (Kopi Queen)', score: 65.00 },
        { name: 'Uncle Lim', score: 45.00 }
      ]
    };

    try {
      const saved = localStorage.getItem('kopitiam_kopi_kia_save');
      return saved ? Object.assign(defaultData, JSON.parse(saved)) : defaultData;
    } catch (e) {
      return defaultData;
    }
  }

  saveGameData() {
    try {
      localStorage.setItem('kopitiam_kopi_kia_save', JSON.stringify(this.saveData));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    this.updateMainMenuDisplay();
  }

  hasUpgrade(perkId) {
    return this.saveData.upgrades.includes(perkId);
  }

  /* ==========================================================================
     ELEMENT BINDINGS & UI INITIALIZATION
     ========================================================================== */
  initElements() {
    // Screens
    this.elMainMenuScreen = document.getElementById('main-menu-screen');
    this.elGameHeader = document.getElementById('game-header');
    this.elShiftHud = document.getElementById('shift-hud');
    this.elSpotlightCard = document.getElementById('active-order-spotlight');
    this.elCustomerQueueRow = document.getElementById('customer-queue-row');
    this.elGlassMugOverlay = document.getElementById('glass-mug-overlay');
    this.elBottomActionBar = document.getElementById('bottom-action-bar');

    // Main Menu Displays
    this.elMenuLevel = document.getElementById('menu-player-level');
    this.elMenuMoney = document.getElementById('menu-player-money');
    this.elMenuStreak = document.getElementById('menu-player-streak');
    this.elBtnStartCampaign = document.getElementById('btn-start-campaign');

    // Main Menu Action Grid Buttons
    this.elBtnMenuRecipes = document.getElementById('btn-menu-recipes');
    this.elBtnMenuBoard = document.getElementById('btn-menu-board');
    this.elBtnMenuShop = document.getElementById('btn-menu-shop');
    this.elBtnMenuHowTo = document.getElementById('btn-menu-howto');
    this.elBtnBackMenu = document.getElementById('btn-back-menu');

    // Shift HUD
    this.elShiftLevelName = document.getElementById('shift-level-name');
    this.elHudGoalText = document.getElementById('hud-goal-text');
    this.elShiftTimerText = document.getElementById('shift-timer-text');

    // Gameplay Header & Spotlight
    this.elScoreText = document.getElementById('score-text');
    this.elSpotlightTimer = document.getElementById('spotlight-timer');
    this.elSpotlightProgressBar = document.getElementById('spotlight-progress-bar');
    this.elSpotlightAvatar = document.getElementById('spotlight-avatar');
    this.elSpotlightCustomerName = document.getElementById('spotlight-customer-name');
    this.elSpotlightOrderName = document.getElementById('spotlight-order-name');

    // Mug Layers
    this.elGlassBody = document.getElementById('mug-glass-body');
    this.elLiquidCondensed = document.getElementById('liquid-condensed-milk');
    this.elLiquidEvaporated = document.getElementById('liquid-evaporated-milk');
    this.elLiquidBrew = document.getElementById('liquid-brew');
    this.elLiquidWater = document.getElementById('liquid-water');
    this.elSugarIndicator = document.getElementById('sugar-indicator');
    this.elIceCubes = document.getElementById('liquid-ice-cubes');
    this.elSteamContainer = document.getElementById('mug-steam-container');
    this.elMugStatusText = document.getElementById('mug-status-text');

    // Toolbar Buttons
    this.stationTabs = document.querySelectorAll('.station-tab');
    this.stationPanels = {
      brew: document.getElementById('panel-brew'),
      cans: document.getElementById('panel-cans'),
      dispenser: document.getElementById('panel-dispenser')
    };

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

    this.elBtnCoke = document.getElementById('btn-coke');
    this.elBtnSprite = document.getElementById('btn-sprite');
    this.elBtnHundred = document.getElementById('btn-hundred');
    this.elBtnBandung = document.getElementById('btn-bandung');
    this.elBtnLime = document.getElementById('btn-lime');
    this.elBtnServe = document.getElementById('btn-serve');

    this.elLabelSugar = document.getElementById('label-sugar');
    this.elLabelIce = document.getElementById('label-ice');

    // Modals
    this.elSagaMapModal = document.getElementById('saga-map-modal');
    this.elSagaNodesContainer = document.getElementById('saga-nodes-container');
    this.elShopModal = document.getElementById('shop-modal');
    this.elShopBalanceText = document.getElementById('shop-balance-text');
    this.elShopItemsContainer = document.getElementById('shop-items-container');
    this.elBoardModal = document.getElementById('board-modal');
    this.elHowToModal = document.getElementById('howto-modal');
    this.elRecipeModal = document.getElementById('recipe-modal');
    this.elLevelResultModal = document.getElementById('level-result-modal');

    // Result Screen Elements
    this.elResultTitle = document.getElementById('result-title');
    this.elResultLevelName = document.getElementById('result-level-name');
    this.elResultStarsRow = document.getElementById('result-stars-row');
    this.elResShiftScore = document.getElementById('res-shift-score');
    this.elResShiftGoal = document.getElementById('res-shift-goal');
    this.elResCustomersCount = document.getElementById('res-customers-count');
    this.elBtnRetryLevel = document.getElementById('btn-retry-level');
    this.elBtnNextLevel = document.getElementById('btn-next-level');

    // Global Containers
    this.elToastContainer = document.getElementById('toast-container');
    this.elBtnRecipeModal = document.getElementById('btn-recipe-modal');
    this.elBtnCloseModal = document.getElementById('btn-close-modal');
    this.elBtnSoundToggle = document.getElementById('btn-sound-toggle');
    this.elFloatingScoreContainer = document.getElementById('floating-score-container');
  }

  bindEvents() {
    // Main Menu Buttons
    this.elBtnStartCampaign.addEventListener('click', () => {
      window.soundEngine.playMenuClick();
      this.openSagaMap();
    });

    this.elBtnMenuRecipes.addEventListener('click', () => {
      window.soundEngine.playMenuClick();
      this.elRecipeModal.classList.remove('hidden');
    });

    this.elBtnMenuBoard.addEventListener('click', () => {
      window.soundEngine.playMenuClick();
      this.openBoardModal();
    });

    this.elBtnMenuShop.addEventListener('click', () => {
      window.soundEngine.playMenuClick();
      this.openShopModal();
    });

    this.elBtnMenuHowTo.addEventListener('click', () => {
      window.soundEngine.playMenuClick();
      this.elHowToModal.classList.remove('hidden');
    });

    this.elBtnBackMenu.addEventListener('click', () => {
      window.soundEngine.playMenuClick();
      this.exitToMainMenu();
    });

    // Close Modals
    document.querySelector('.btn-close-saga').addEventListener('click', () => this.elSagaMapModal.classList.add('hidden'));
    document.querySelector('.btn-close-shop').addEventListener('click', () => this.elShopModal.classList.add('hidden'));
    document.querySelector('.btn-close-board').addEventListener('click', () => this.elBoardModal.classList.add('hidden'));
    document.querySelector('.btn-close-howto').addEventListener('click', () => this.elHowToModal.classList.add('hidden'));
    this.elBtnCloseModal.addEventListener('click', () => this.elRecipeModal.classList.add('hidden'));

    // Result Buttons
    this.elBtnRetryLevel.addEventListener('click', () => {
      window.soundEngine.playMenuClick();
      this.elLevelResultModal.classList.add('hidden');
      this.startLevelShift(this.currentLevelIndex);
    });

    this.elBtnNextLevel.addEventListener('click', () => {
      window.soundEngine.playMenuClick();
      this.elLevelResultModal.classList.add('hidden');
      if (this.currentLevelIndex < CAMPAIGN_LEVELS.length - 1) {
        this.startLevelShift(this.currentLevelIndex + 1);
      } else {
        this.openSagaMap();
      }
    });

    // Station Tabs
    this.stationTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.getAttribute('data-tab'));
      });
    });

    // Container Grabs
    const grabHandler = () => this.handleGrabContainer();
    this.elBtnGrabMug.addEventListener('click', grabHandler);
    this.elBtnGrabCupCan.addEventListener('click', grabHandler);
    this.elBtnGrabCupDisp.addEventListener('click', grabHandler);

    // Ingredient Buttons
    this.elBtnKopi.addEventListener('click', () => this.handleAddKopi());
    this.elBtnTeh.addEventListener('click', () => this.handleAddTeh());
    this.elBtnWater.addEventListener('click', () => this.handleToggleWater());
    this.elBtnCondensed.addEventListener('click', () => this.handleCondensedMilk());
    this.elBtnEvap.addEventListener('click', () => this.handleEvapMilk());
    this.elBtnSugar.addEventListener('click', () => this.handleCycleSugar());
    this.elBtnIce.addEventListener('click', () => this.handleToggleIce());

    this.elBtnCoke.addEventListener('click', () => this.handleSelectCan('coke'));
    this.elBtnSprite.addEventListener('click', () => this.handleSelectCan('sprite'));
    this.elBtnHundred.addEventListener('click', () => this.handleSelectCan('hundred_plus'));

    this.elBtnBandung.addEventListener('click', () => this.handleSelectDispenser('bandung'));
    this.elBtnLime.addEventListener('click', () => this.handleSelectDispenser('lime_juice'));

    this.elBtnServe.addEventListener('click', () => this.handleServeTray());

    this.elBtnSoundToggle.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      this.elBtnSoundToggle.querySelector('.icon').textContent = isMuted ? '🔇' : '🔊';
    });

    const recipeBtn = document.getElementById('btn-recipe-modal');
    if (recipeBtn) {
      recipeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openRecipeModal();
      });
    }

    if (this.elBtnMenuRecipes) {
      this.elBtnMenuRecipes.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openRecipeModal();
      });
    }

    const closeBtnRecipe = document.getElementById('btn-close-modal');
    if (closeBtnRecipe) {
      closeBtnRecipe.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeRecipeModal();
      });
    }

    if (this.elRecipeModal) {
      this.elRecipeModal.addEventListener('click', (e) => {
        if (e.target === this.elRecipeModal) {
          this.closeRecipeModal();
        }
      });
    }

    const btnSaveName = document.getElementById('btn-save-player-name');
    if (btnSaveName) {
      btnSaveName.addEventListener('click', () => {
        const input = document.getElementById('board-player-name-input');
        if (input && input.value.trim() !== '') {
          const newName = input.value.trim();
          this.submitHighScore(newName, this.saveData.bestShiftScore);
          this.renderLeaderboardList();
          this.showToast(`✅ Hawker name saved as "${newName}"!`, true);
        }
      });
    }

    const btnSubmitScore = document.getElementById('btn-submit-score');
    if (btnSubmitScore) {
      btnSubmitScore.addEventListener('click', () => {
        const input = document.getElementById('res-player-name-input');
        if (input && input.value.trim() !== '') {
          const newName = input.value.trim();
          this.submitHighScore(newName, this.shiftScore);
          const resBox = document.getElementById('result-leaderboard-box');
          if (resBox) resBox.classList.add('hidden');
          this.showToast(`🏆 Score $${this.shiftScore.toFixed(2)} submitted to Hall of Fame!`, true);
        }
      });
    }
  }

  openRecipeModal() {
    try {
      if (window.soundEngine) {
        window.soundEngine.init();
        window.soundEngine.playSwooshSound();
      }
    } catch (e) {
      console.warn('Sound effect suppressed:', e);
    }
    if (this.elRecipeModal) {
      this.elRecipeModal.classList.remove('hidden');
      this.elRecipeModal.style.setProperty('display', 'flex', 'important');
    }
  }

  closeRecipeModal() {
    if (this.elRecipeModal) {
      this.elRecipeModal.classList.add('hidden');
      this.elRecipeModal.style.setProperty('display', 'none', 'important');
    }
  }

  updateMainMenuDisplay() {
    this.elMenuLevel.textContent = `Lv ${this.saveData.unlockedLevel}`;
    this.elMenuMoney.textContent = `$${this.saveData.careerMoney.toFixed(2)}`;
    this.elMenuStreak.textContent = `${this.saveData.streak}`;
  }

  exitToMainMenu() {
    clearInterval(this.shiftTimerInterval);
    clearInterval(this.orderTimerInterval);

    this.elGameHeader.classList.add('hidden');
    this.elShiftHud.classList.add('hidden');
    this.elSpotlightCard.classList.add('hidden');
    this.elCustomerQueueRow.classList.add('hidden');
    this.elGlassMugOverlay.classList.add('hidden');
    this.elBottomActionBar.classList.add('hidden');

    this.elMainMenuScreen.classList.remove('hidden');
    this.updateMainMenuDisplay();
  }

  /* ==========================================================================
     CAMPAIGN SAGA MAP & UPGRADE SHOP
     ========================================================================== */
  openSagaMap() {
    this.elSagaNodesContainer.innerHTML = '';

    CAMPAIGN_LEVELS.forEach((lvl, idx) => {
      const isUnlocked = lvl.level <= this.saveData.unlockedLevel;
      const starsEarned = this.saveData.levelStars[lvl.level] || 0;

      const nodeCard = document.createElement('div');
      nodeCard.className = `saga-node-card ${isUnlocked ? 'node-unlocked' : 'node-locked'}`;

      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        starsHtml += s <= starsEarned ? '⭐' : '☆';
      }

      nodeCard.innerHTML = `
        <div class="node-info">
          <h4>Level ${lvl.level}: ${lvl.name}</h4>
          <p>Target Goal: $${lvl.targetScore.toFixed(2)} (${lvl.shiftSeconds}s)</p>
        </div>
        <div class="star-row">${isUnlocked ? starsHtml : '🔒'}</div>
      `;

      if (isUnlocked) {
        nodeCard.addEventListener('click', () => {
          window.soundEngine.playMenuClick();
          this.elSagaMapModal.classList.add('hidden');
          this.startLevelShift(idx);
        });
      }

      this.elSagaNodesContainer.appendChild(nodeCard);
    });

    this.elSagaMapModal.classList.remove('hidden');
  }

  openShopModal() {
    this.elShopBalanceText.textContent = `$${this.saveData.careerMoney.toFixed(2)}`;
    this.elShopItemsContainer.innerHTML = '';

    SHOP_UPGRADES.forEach(upg => {
      const isBought = this.hasUpgrade(upg.perk);

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <div class="shop-item-left">
          <span class="shop-icon">${upg.icon}</span>
          <div class="shop-item-details">
            <h4>${upg.name}</h4>
            <p>${upg.desc}</p>
          </div>
        </div>
        <button class="buy-btn ${isBought ? 'bought' : ''}" data-id="${upg.id}">
          ${isBought ? 'OWNED' : `$${upg.price.toFixed(2)}`}
        </button>
      `;

      if (!isBought) {
        const btn = card.querySelector('.buy-btn');
        btn.addEventListener('click', () => {
          if (this.saveData.careerMoney >= upg.price) {
            this.saveData.careerMoney -= upg.price;
            this.saveData.upgrades.push(upg.perk);
            this.saveGameData();
            window.soundEngine.playShopBuy();
            this.showToast(`🎉 Purchased ${upg.name}!`, true);
            this.openShopModal();
          } else {
            window.soundEngine.playErrorSound();
            this.showToast('⚠️ Not enough career money!');
          }
        });
      }

      this.elShopItemsContainer.appendChild(card);
    });

    this.elShopModal.classList.remove('hidden');
  }

  openBoardModal() {
    const nameInput = document.getElementById('board-player-name-input');
    if (nameInput) {
      nameInput.value = this.saveData.playerName || 'Master Kopi Kia';
    }

    document.getElementById('board-high-level').textContent = `Lv ${this.saveData.unlockedLevel}`;
    document.getElementById('board-career-money').textContent = `$${this.saveData.careerMoney.toFixed(2)}`;
    document.getElementById('board-max-streak').textContent = `${this.saveData.streak}`;

    this.renderLeaderboardList();
    this.elBoardModal.classList.remove('hidden');
  }

  renderLeaderboardList() {
    const listEl = document.getElementById('board-scores-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const scores = [...(this.saveData.highScores || [])].sort((a, b) => b.score - a.score);

    scores.forEach((entry, idx) => {
      const li = document.createElement('li');
      const isPlayer = entry.name === this.saveData.playerName;
      li.className = isPlayer ? 'board-item active-player' : 'board-item';
      li.innerHTML = `<span>${idx + 1}. ${entry.name} ${isPlayer ? '⭐ (You)' : ''}</span> <strong>$${entry.score.toFixed(2)}</strong>`;
      listEl.appendChild(li);
    });
  }

  submitHighScore(name, score) {
    if (!name || name.trim() === '') name = 'Master Kopi Kia';
    name = name.trim().substring(0, 20);
    this.saveData.playerName = name;

    if (!Array.isArray(this.saveData.highScores)) {
      this.saveData.highScores = [];
    }

    const existingIdx = this.saveData.highScores.findIndex(e => e.name === name);
    if (existingIdx !== -1) {
      if (score > this.saveData.highScores[existingIdx].score) {
        this.saveData.highScores[existingIdx].score = score;
      }
    } else {
      this.saveData.highScores.push({ name, score });
    }

    this.saveData.highScores.sort((a, b) => b.score - a.score);
    this.saveData.highScores = this.saveData.highScores.slice(0, 10);
    this.saveGameData();
  }

  /* ==========================================================================
     GAMEPLAY SHIFT ENGINE
     ========================================================================== */
  startLevelShift(levelIdx) {
    // Purge any active timers to prevent memory leaks and interval stacking
    clearInterval(this.shiftTimerInterval);
    clearInterval(this.orderTimerInterval);

    this.currentLevelIndex = levelIdx;
    const currentLvlConfig = CAMPAIGN_LEVELS[levelIdx];

    this.shiftScore = 0.00;
    this.shiftServedCount = 0;
    this.shiftTimeRemaining = currentLvlConfig.shiftSeconds;

    if (this.hasUpgrade('gold_skin')) {
      this.elGlassBody.classList.add('gold-skin');
    } else {
      this.elGlassBody.classList.remove('gold-skin');
    }

    this.elMainMenuScreen.classList.add('hidden');
    this.elGameHeader.classList.remove('hidden');
    this.elShiftHud.classList.remove('hidden');
    this.elSpotlightCard.classList.remove('hidden');
    this.elCustomerQueueRow.classList.remove('hidden');
    this.elGlassMugOverlay.classList.remove('hidden');
    this.elBottomActionBar.classList.remove('hidden');

    this.elShiftLevelName.textContent = `Level ${currentLvlConfig.level}: ${currentLvlConfig.name}`;
    this.updateShiftHudDisplay();

    this.queue = [
      OrderManager.getRandomOrder(currentLvlConfig.level),
      OrderManager.getRandomOrder(currentLvlConfig.level),
      OrderManager.getRandomOrder(currentLvlConfig.level)
    ];

    this.resetMugState();
    this.renderQueue();
    this.startShiftTimer();
    this.startOrderTimer();
  }

  startShiftTimer() {
    clearInterval(this.shiftTimerInterval);

    if (this.sandboxMode) {
      this.elShiftTimerText.textContent = '∞ Unlimited';
      return;
    }

    this.shiftTimerInterval = setInterval(() => {
      this.shiftTimeRemaining--;
      this.elShiftTimerText.textContent = `${this.shiftTimeRemaining}s`;

      if (this.shiftTimeRemaining <= 0) {
        clearInterval(this.shiftTimerInterval);
        clearInterval(this.orderTimerInterval);
        this.endLevelShift();
      }
    }, 1000);
  }

  startOrderTimer() {
    clearInterval(this.orderTimerInterval);
    const baseTimer = 22;
    const timerBonus = this.hasUpgrade('timer_boost') ? 5 : 0;
    this.orderTimeRemaining = baseTimer + timerBonus;
    
    if (this.sandboxMode) {
      this.elSpotlightTimer.textContent = '∞';
      this.elSpotlightProgressBar.style.width = '100%';
      return;
    }

    this.updateOrderTimerDisplay();

    this.orderTimerInterval = setInterval(() => {
      this.orderTimeRemaining--;
      this.updateOrderTimerDisplay();

      if (this.orderTimeRemaining <= 0) {
        clearInterval(this.orderTimerInterval);
        this.handleOrderTimeout();
      }
    }, 1000);
  }

  updateOrderTimerDisplay() {
    const formatted = `0:${this.orderTimeRemaining < 10 ? '0' : ''}${this.orderTimeRemaining}`;
    this.elSpotlightTimer.textContent = formatted;

    const maxT = 22 + (this.hasUpgrade('timer_boost') ? 5 : 0);
    const pct = Math.max(0, (this.orderTimeRemaining / maxT) * 100);
    this.elSpotlightProgressBar.style.width = `${pct}%`;
  }

  handleOrderTimeout() {
    window.soundEngine.playErrorSound();
    const currentCustomer = this.queue[0];
    this.showToast(`⌛ Time out! ${currentCustomer.customerName} left without their drink!`);
    this.saveData.streak = 0;
    this.saveGameData();
    this.shakeSpotlightCard();
    this.advanceQueue();
  }

  updateShiftHudDisplay() {
    const currentLvlConfig = CAMPAIGN_LEVELS[this.currentLevelIndex];
    this.elScoreText.textContent = `$${this.shiftScore.toFixed(2)}`;
    this.elHudGoalText.textContent = `$${this.shiftScore.toFixed(2)} / $${currentLvlConfig.targetScore.toFixed(2)} Goal`;
  }

  endLevelShift() {
    const currentLvlConfig = CAMPAIGN_LEVELS[this.currentLevelIndex];
    const isVictory = this.shiftScore >= currentLvlConfig.targetScore;

    let starsEarned = 0;
    if (this.shiftScore >= currentLvlConfig.starThresholds[2]) starsEarned = 3;
    else if (this.shiftScore >= currentLvlConfig.starThresholds[1]) starsEarned = 2;
    else if (this.shiftScore >= currentLvlConfig.starThresholds[0]) starsEarned = 1;

    this.saveData.careerMoney += this.shiftScore;
    if (this.shiftScore > this.saveData.bestShiftScore) {
      this.saveData.bestShiftScore = this.shiftScore;
    }

    if (starsEarned >= 1) {
      this.saveData.levelStars[currentLvlConfig.level] = Math.max(this.saveData.levelStars[currentLvlConfig.level] || 0, starsEarned);
      if (currentLvlConfig.level === this.saveData.unlockedLevel && this.saveData.unlockedLevel < CAMPAIGN_LEVELS.length) {
        this.saveData.unlockedLevel++;
      }
      window.soundEngine.playVictoryFanfare();
    } else {
      window.soundEngine.playErrorSound();
    }

    this.saveGameData();

    this.elResultTitle.textContent = isVictory ? '🎉 Shift Victory!' : '💔 Shift Ended!';
    this.elResultLevelName.textContent = `Level ${currentLvlConfig.level}: ${currentLvlConfig.name}`;
    
    let starsHtml = '';
    for (let s = 1; s <= 3; s++) {
      starsHtml += s <= starsEarned ? '<span class="star-big">⭐</span>' : '<span class="star-big" style="opacity: 0.3;">☆</span>';
    }
    this.elResultStarsRow.innerHTML = starsHtml;

    this.elResShiftScore.textContent = `$${this.shiftScore.toFixed(2)}`;
    this.elResShiftGoal.textContent = `$${currentLvlConfig.targetScore.toFixed(2)}`;
    this.elResCustomersCount.textContent = `${this.shiftServedCount}`;

    if (this.shiftScore > 0) {
      this.submitHighScore(this.saveData.playerName || 'Master Kopi Kia', this.shiftScore);
      const resBox = document.getElementById('result-leaderboard-box');
      const resNameInput = document.getElementById('res-player-name-input');
      if (resBox && resNameInput) {
        resNameInput.value = this.saveData.playerName || 'Master Kopi Kia';
        resBox.classList.remove('hidden');
      }
    }

    this.elLevelResultModal.classList.remove('hidden');
  }

  renderQueue() {
    const activeOrder = this.queue[0];
    if (activeOrder.customerAvatar.includes('/')) {
      this.elSpotlightAvatar.innerHTML = `<img src="${activeOrder.customerAvatar}" class="customer-avatar-img" alt="${activeOrder.customerName}">`;
    } else {
      this.elSpotlightAvatar.textContent = activeOrder.customerAvatar;
    }
    this.elSpotlightCustomerName.textContent = `${activeOrder.customerName}:`;
    this.elSpotlightOrderName.textContent = `${activeOrder.recipe.name}!`;

    this.queue.forEach((ord, idx) => {
      const qCard = document.getElementById(`queue-card-${idx}`);
      if (qCard) {
        const qAvatarEl = qCard.querySelector('.queue-avatar');
        if (ord.customerAvatar.includes('/')) {
          qAvatarEl.innerHTML = `<img src="${ord.customerAvatar}" class="customer-avatar-img" alt="${ord.customerName}">`;
        } else {
          qAvatarEl.textContent = ord.customerAvatar;
        }
        qCard.querySelector('.q-name').textContent = `${ord.customerName}:`;
        qCard.querySelector('.q-drink').textContent = `${ord.recipe.name}!`;
      }
    });
  }

  advanceQueue() {
    this.queue.shift();
    this.queue.push(OrderManager.getRandomOrder(CAMPAIGN_LEVELS[this.currentLevelIndex].level));
    this.renderQueue();
    this.startOrderTimer();
    this.resetMugState();
  }

  switchTab(tabName) {
    window.soundEngine.init();
    this.activeTab = tabName;

    this.stationTabs.forEach(t => {
      if (t.getAttribute('data-tab') === tabName) t.classList.add('active-tab');
      else t.classList.remove('active-tab');
    });

    Object.keys(this.stationPanels).forEach(key => {
      if (key === tabName) this.stationPanels[key].classList.remove('hidden');
      else this.stationPanels[key].classList.add('hidden');
    });
  }

  /* ==========================================================================
     MUG & INGREDIENTS
     ========================================================================== */
  autoEquipContainer(type = 'brew') {
    if (!this.activeMug.isEquipped) {
      this.activeMug.isEquipped = true;
      let equipType = 'brew';
      if (type === 'cans' || type === 'can') equipType = 'can';
      else if (type === 'dispenser') equipType = 'dispenser';

      this.activeMug.type = equipType;
      this.elGlassMugOverlay.classList.add('mug-active');
      window.soundEngine.playMugGrab();
    }
  }

  handleGrabContainer() {
    window.soundEngine.init();
    const isCup = this.activeTab === 'cans' || this.activeTab === 'dispenser';

    if (!this.activeMug.isEquipped) {
      this.autoEquipContainer(this.activeTab);
      if (isCup) {
        this.showToast('🥤 Ice Cup Ready! Select soda or dispenser.', true);
      } else {
        this.showToast('🍺 Mug Ready! Select ingredients.', true);
      }
    } else {
      const wasCup = this.activeMug.type === 'can' || this.activeMug.type === 'dispenser';
      this.resetMugState();
      window.soundEngine.playMugGrab();
      if (wasCup) {
        this.showToast('🧹 Ice Cup cleared.', true);
      } else {
        this.showToast('🧹 Mug emptied & rinsed clean.', true);
      }
    }
  }

  handleAddKopi() {
    this.autoEquipContainer('brew');
    this.activeMug.type = 'brew';
    const fillDuration = this.hasUpgrade('fast_pour') ? 0.25 : 0.5;
    window.soundEngine.playPourSound(fillDuration);

    this.activeMug.kopiCount = this.activeMug.kopiCount === 0 ? 1 : 0;
    this.renderMugVisuals();
  }

  handleAddTeh() {
    this.autoEquipContainer('brew');
    this.activeMug.type = 'brew';
    const fillDuration = this.hasUpgrade('fast_pour') ? 0.25 : 0.5;
    window.soundEngine.playPourSound(fillDuration);

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
    if (this.activeMug.hasIce) {
      this.elIceCubes.classList.remove('hidden');
      this.elLabelIce.textContent = 'Ice (Added)';
    } else {
      this.elIceCubes.classList.add('hidden');
      this.elLabelIce.textContent = 'Ice Bin';
    }

    if (this.activeMug.type === 'brew') {
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

      if (this.activeMug.hasWater) {
        this.elLiquidWater.style.height = '28%';
        if (!this.activeMug.hasIce) this.elSteamContainer.classList.remove('hidden');
        else this.elSteamContainer.classList.add('hidden');
      } else {
        this.elLiquidWater.style.height = '0%';
        this.elSteamContainer.classList.add('hidden');
      }

      const sugarHeights = { kosong: '0px', siew_dai: '6px', normal: '12px', ga_dai: '18px' };
      this.elSugarIndicator.style.height = sugarHeights[this.activeMug.sugar];
      this.elLabelSugar.textContent = `Sugar (${this.activeMug.sugar.replace('_', ' ')})`;
    } else if (this.activeMug.type === 'can') {
      this.elLiquidCondensed.style.height = '0%';
      this.elLiquidEvaporated.style.height = '0%';
      this.elLiquidWater.style.height = '0%';
      this.elSugarIndicator.style.height = '0px';
      this.elSteamContainer.classList.add('hidden');

      this.elLiquidBrew.style.height = '65%';
      if (this.activeMug.canBrand === 'coke') this.elLiquidBrew.className = 'liquid-layer coke-color';
      else if (this.activeMug.canBrand === 'sprite') this.elLiquidBrew.className = 'liquid-layer sprite-color';
      else if (this.activeMug.canBrand === 'hundred_plus') this.elLiquidBrew.className = 'liquid-layer hundred-color';
    } else if (this.activeMug.type === 'dispenser') {
      this.elLiquidCondensed.style.height = '0%';
      this.elLiquidEvaporated.style.height = '0%';
      this.elLiquidWater.style.height = '0%';
      this.elSugarIndicator.style.height = '0px';
      this.elSteamContainer.classList.add('hidden');

      this.elLiquidBrew.style.height = '65%';
      if (this.activeMug.dispenserFlavor === 'bandung') this.elLiquidBrew.className = 'liquid-layer bandung-color';
      else if (this.activeMug.dispenserFlavor === 'lime_juice') this.elLiquidBrew.className = 'liquid-layer lime-color';
    }

    const ingredients = [];
    if (this.activeMug.type === 'can') {
      if (this.activeMug.canBrand === 'coke') ingredients.push('COKE');
      else if (this.activeMug.canBrand) ingredients.push(this.activeMug.canBrand.replace('_', ' ').toUpperCase());
    } else if (this.activeMug.type === 'dispenser') {
      if (this.activeMug.dispenserFlavor) ingredients.push(this.activeMug.dispenserFlavor.replace('_', ' ').toUpperCase());
    } else {
      if (this.activeMug.kopiCount > 0 && this.activeMug.tehCount > 0) ingredients.push('Kopi+Teh');
      else if (this.activeMug.kopiCount > 0) ingredients.push('Kopi');
      else if (this.activeMug.tehCount > 0) ingredients.push('Teh');

      if (this.activeMug.milk === 'condensed') ingredients.push('Condensed Milk');
      else if (this.activeMug.milk === 'evaporated') ingredients.push('Evaporated Milk');

      if (this.activeMug.hasWater) ingredients.push('Hot Water');
      if (this.activeMug.sugar !== 'kosong') ingredients.push(this.activeMug.sugar.replace('_', ' ').toUpperCase());
    }

    if (this.activeMug.hasIce) ingredients.push('ICE');

    const handleEl = document.getElementById('mug-handle');

    if (this.activeMug.type === 'can' || this.activeMug.type === 'dispenser') {
      this.elGlassBody.classList.add('plastic-cup-mode');
      if (handleEl) handleEl.style.display = 'none';
    } else {
      this.elGlassBody.classList.remove('plastic-cup-mode');
      if (handleEl) handleEl.style.display = 'block';
    }

    if (ingredients.length > 0) this.elMugStatusText.textContent = ingredients.join(' + ');
    else this.elMugStatusText.textContent = 'Mug Ready! Select ingredients';

    // Sync 3D WebGL Glass Mug Engine
    window.threeMugRenderer?.updateMugState(this.activeMug);
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

    this.elGlassMugOverlay.classList.remove('mug-active');
    this.elMugStatusText.textContent = 'Tap "Fresh Mug" to start';
    this.renderMugVisuals();
  }

  handleServeTray() {
    window.soundEngine.init();

    if (!this.activeMug.isEquipped) {
      window.soundEngine.playErrorSound();
      this.showToast('⚠️ Equip a mug and prepare drink first!');
      return;
    }

    const activeOrder = this.queue[0];
    const validation = OrderManager.validateDrink(this.activeMug, activeOrder.recipe);

    if (validation.isValid) {
      window.soundEngine.playKaChing();

      let earned = activeOrder.recipe.price;

      if (this.activeMug.kopiCount > 0 && this.hasUpgrade('coffee_boost')) {
        earned *= 1.25;
      }
      if (this.activeMug.hasIce && this.hasUpgrade('ice_boost')) {
        earned += 0.40;
      }
      if (this.hasUpgrade('gold_skin')) {
        earned *= 1.50;
      }

      this.shiftScore += earned;
      this.shiftServedCount++;
      this.saveData.streak++;
      this.saveGameData();

      this.updateShiftHudDisplay();
      this.showFloatingEarnings(`+$${earned.toFixed(2)}`);
      this.showToast(`✨ Ka-Ching! Served ${activeOrder.recipe.name} to ${activeOrder.customerName}! (+$${earned.toFixed(2)})`, true);
      this.advanceQueue();
    } else {
      window.soundEngine.playErrorSound();
      this.saveData.streak = 0;
      this.saveGameData();
      this.shakeSpotlightCard();
      const firstError = validation.errors[0] || 'Incorrect recipe!';
      this.showToast(`❌ Wrong Drink for ${activeOrder.customerName}! ${firstError}`);
    }
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
    // Prevent layout shift during rapid button spamming by capping toasts
    while (this.elToastContainer.children.length >= 2) {
      this.elToastContainer.removeChild(this.elToastContainer.firstChild);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${isSuccess ? 'toast-success' : ''}`;
    toast.textContent = message;
    this.elToastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 2200);
  }
}

if (typeof window !== 'undefined') {
  window.GameEngine = GameEngine;
}

document.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});
