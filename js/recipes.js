/**
 * Kopitiam Kopi Kia - Recipe Database, Campaign Levels & Shop Upgrades
 */

const DRINK_RECIPES = [
  // --- HOT BREWS ---
  { id: 'kopi', name: 'Kopi', type: 'brew', price: 1.50, base: ['kopi'], milk: 'condensed', water: true, sugar: 'normal', iced: false },
  { id: 'kopi_o', name: 'Kopi-O', type: 'brew', price: 1.40, base: ['kopi'], milk: 'none', water: true, sugar: 'normal', iced: false },
  { id: 'kopi_c', name: 'Kopi-C', type: 'brew', price: 1.60, base: ['kopi'], milk: 'evaporated', water: true, sugar: 'normal', iced: false },
  { id: 'kopi_c_siew_dai', name: 'Kopi-C Siew Dai', type: 'brew', price: 1.70, base: ['kopi'], milk: 'evaporated', water: true, sugar: 'siew_dai', iced: false },
  { id: 'kopi_kosong', name: 'Kopi Kosong', type: 'brew', price: 1.30, base: ['kopi'], milk: 'none', water: true, sugar: 'kosong', iced: false },
  { id: 'teh', name: 'Teh', type: 'brew', price: 1.50, base: ['teh'], milk: 'condensed', water: true, sugar: 'normal', iced: false },
  { id: 'teh_o', name: 'Teh-O', type: 'brew', price: 1.40, base: ['teh'], milk: 'none', water: true, sugar: 'normal', iced: false },
  { id: 'teh_c', name: 'Teh-C', type: 'brew', price: 1.60, base: ['teh'], milk: 'evaporated', water: true, sugar: 'normal', iced: false },
  { id: 'teh_c_siew_dai', name: 'Teh-C Siew Dai', type: 'brew', price: 1.70, base: ['teh'], milk: 'evaporated', water: true, sugar: 'siew_dai', iced: false },
  { id: 'yuan_yang', name: 'Yuan Yang', type: 'brew', price: 1.90, base: ['kopi', 'teh'], milk: 'condensed', water: true, sugar: 'normal', iced: false },

  // --- ICED DRINKS (PENG) ---
  { id: 'kopi_peng', name: 'Kopi Peng (Iced)', type: 'brew', price: 1.80, base: ['kopi'], milk: 'condensed', water: true, sugar: 'normal', iced: true },
  { id: 'teh_peng', name: 'Teh Peng (Iced)', type: 'brew', price: 1.80, base: ['teh'], milk: 'condensed', water: true, sugar: 'normal', iced: true },
  { id: 'kopi_c_peng', name: 'Kopi-C Peng (Iced)', type: 'brew', price: 1.90, base: ['kopi'], milk: 'evaporated', water: true, sugar: 'normal', iced: true },
  { id: 'teh_c_peng', name: 'Teh-C Peng (Iced)', type: 'brew', price: 1.90, base: ['teh'], milk: 'evaporated', water: true, sugar: 'normal', iced: true },

  // --- CANNED DRINKS ---
  { id: 'coke_iced', name: 'Iced Coke (Can)', type: 'can', canBrand: 'coke', price: 2.00, iced: true },
  { id: 'sprite_iced', name: 'Iced Sprite (Can)', type: 'can', canBrand: 'sprite', price: 2.00, iced: true },
  { id: 'hundred_plus_iced', name: 'Iced 100 Plus (Can)', type: 'can', canBrand: 'hundred_plus', price: 2.00, iced: true },

  // --- DISPENSER DRINKS ---
  { id: 'bandung_iced', name: 'Iced Bandung', type: 'dispenser', dispenserFlavor: 'bandung', price: 2.20, iced: true },
  { id: 'lime_juice_iced', name: 'Iced Lime Juice', type: 'dispenser', dispenserFlavor: 'lime_juice', price: 2.00, iced: true }
];

const CUSTOMERS = [
  { name: 'Mdm Tan', avatar: '👵', preferred: ['kopi_c_siew_dai', 'kopi_c', 'teh_c_peng'] },
  { name: 'Uncle Lim', avatar: '👴', preferred: ['teh_peng', 'kopi_o', 'kopi'] },
  { name: 'Aunty Lee', avatar: '👩', preferred: ['yuan_yang', 'bandung_iced', 'kopi_kosong'] },
  { name: 'Brother Ah Seng', avatar: '👨', preferred: ['coke_iced', 'kopi_peng', 'hundred_plus_iced'] },
  { name: 'Miss Chen', avatar: '👩‍💼', preferred: ['lime_juice_iced', 'teh_c_siew_dai', 'sprite_iced'] },
  { name: 'Mr Raj', avatar: '👨‍💼', preferred: ['hundred_plus_iced', 'kopi_o', 'teh_peng'] },
  { name: 'Uncle Teck', avatar: '👴', preferred: ['kopi_kosong', 'yuan_yang', 'bandung_iced'] }
];

// 10 Progressive Campaign Levels
const CAMPAIGN_LEVELS = [
  { level: 1, name: 'Tiong Bahru Corner', targetScore: 6.00, shiftSeconds: 45, starThresholds: [6.00, 9.00, 12.00] },
  { level: 2, name: 'Amoy Street Centre', targetScore: 10.00, shiftSeconds: 45, starThresholds: [10.00, 14.00, 18.00] },
  { level: 3, name: 'Maxwell Hawker', targetScore: 14.00, shiftSeconds: 50, starThresholds: [14.00, 18.00, 24.00] },
  { level: 4, name: 'Lau Pa Sat Plaza', targetScore: 18.00, shiftSeconds: 50, starThresholds: [18.00, 24.00, 30.00] },
  { level: 5, name: 'Old Airport Road', targetScore: 22.00, shiftSeconds: 55, starThresholds: [22.00, 28.00, 35.00] },
  { level: 6, name: 'Chinatown Complex', targetScore: 26.00, shiftSeconds: 55, starThresholds: [26.00, 32.00, 40.00] },
  { level: 7, name: 'Tekka Market Hub', targetScore: 30.00, shiftSeconds: 60, starThresholds: [30.00, 38.00, 48.00] },
  { level: 8, name: 'CBD Financial Kopi', targetScore: 35.00, shiftSeconds: 60, starThresholds: [35.00, 45.00, 55.00] },
  { level: 9, name: 'Marina Bay Sands Outlet', targetScore: 40.00, shiftSeconds: 65, starThresholds: [40.00, 50.00, 65.00] },
  { level: 10, name: 'Changi Airport Jewel', targetScore: 50.00, shiftSeconds: 70, starThresholds: [50.00, 65.00, 80.00] }
];

// Kopitiam Equipment Upgrade Shop Items
const SHOP_UPGRADES = [
  {
    id: 'express_strainer',
    name: 'Express Strainer',
    icon: '☕',
    desc: 'Faster liquid pour fill speed',
    price: 15.00,
    perk: 'fast_pour'
  },
  {
    id: 'gourmet_beans',
    name: 'Gourmet Beans',
    icon: '🧈',
    desc: '+25% extra price bonus on all coffee drinks',
    price: 25.00,
    perk: 'coffee_boost'
  },
  {
    id: 'aunty_patience',
    name: 'Aunty Patience',
    icon: '⏳',
    desc: '+5 seconds customer order timer bonus',
    price: 20.00,
    perk: 'timer_boost'
  },
  {
    id: 'turbo_ice_crusher',
    name: 'Turbo Ice Crusher',
    icon: '🧊',
    desc: '+$0.40 extra payout on all Iced (Peng) drinks',
    price: 30.00,
    perk: 'ice_boost'
  },
  {
    id: 'golden_mug',
    name: 'Golden Mug Skin',
    icon: '🏆',
    desc: 'Golden rim mug skin & +50% tip bonus',
    price: 50.00,
    perk: 'gold_skin'
  }
];

class OrderManager {
  static getRandomOrder(allowedLevel = 10) {
    const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const recipeId = customer.preferred[Math.floor(Math.random() * customer.preferred.length)] 
                     || DRINK_RECIPES[Math.floor(Math.random() * DRINK_RECIPES.length)].id;
    const recipe = DRINK_RECIPES.find(r => r.id === recipeId);

    return {
      id: 'ord_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      customerName: customer.name,
      customerAvatar: customer.avatar,
      recipe: recipe,
      maxTimeSeconds: 22,
      currentTimeSeconds: 22
    };
  }

  static validateDrink(prepared, targetRecipe) {
    const errors = [];

    if (prepared.type !== targetRecipe.type) {
      if (targetRecipe.type === 'can') errors.push('Customer wanted a Canned Drink!');
      else if (targetRecipe.type === 'dispenser') errors.push('Customer wanted a Dispenser Drink!');
      else errors.push('Customer wanted a Hot/Iced Coffee or Tea!');
      return { isValid: false, errors };
    }

    if (targetRecipe.type === 'can') {
      if (prepared.canBrand !== targetRecipe.canBrand) {
        errors.push(`Wrong canned drink! Needed ${targetRecipe.name}`);
      }
      if (targetRecipe.iced && !prepared.hasIce) {
        errors.push('Needs Ice!');
      }
      return { isValid: errors.length === 0, errors };
    }

    if (targetRecipe.type === 'dispenser') {
      if (prepared.dispenserFlavor !== targetRecipe.dispenserFlavor) {
        errors.push(`Wrong dispenser drink! Needed ${targetRecipe.name}`);
      }
      if (targetRecipe.iced && !prepared.hasIce) {
        errors.push('Needs Ice!');
      }
      return { isValid: errors.length === 0, errors };
    }

    const reqKopi = targetRecipe.base.includes('kopi');
    const reqTeh = targetRecipe.base.includes('teh');

    const hasKopi = prepared.kopiCount > 0;
    const hasTeh = prepared.tehCount > 0;

    if (reqKopi && !hasKopi) errors.push('Missing Kopi brew!');
    if (!reqKopi && hasKopi) errors.push('Should not contain Kopi!');

    if (reqTeh && !hasTeh) errors.push('Missing Teh brew!');
    if (!reqTeh && hasTeh) errors.push('Should not contain Teh!');

    if (targetRecipe.milk === 'condensed' && prepared.milk !== 'condensed') {
      errors.push('Needs Condensed Milk!');
    } else if (targetRecipe.milk === 'evaporated' && prepared.milk !== 'evaporated') {
      errors.push('Needs Evaporated Milk!');
    } else if (targetRecipe.milk === 'none' && prepared.milk !== 'none') {
      errors.push('Should be No Milk!');
    }

    if (targetRecipe.water && !prepared.hasWater) {
      errors.push('Needs Hot Water!');
    }

    if (targetRecipe.iced && !prepared.hasIce) {
      errors.push('Needs Ice (Ice Bin)!');
    } else if (!targetRecipe.iced && prepared.hasIce) {
      errors.push('Should be HOT (No Ice)!');
    }

    if (prepared.sugar !== targetRecipe.sugar) {
      const sugarText = targetRecipe.sugar === 'siew_dai' ? 'Siew Dai (Less Sugar)' :
                        targetRecipe.sugar === 'kosong' ? 'Kosong (No Sugar)' :
                        targetRecipe.sugar === 'ga_dai' ? 'Ga Dai (Extra Sugar)' : 'Normal Sugar';
      errors.push(`Sugar should be ${sugarText}!`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

window.OrderManager = OrderManager;
window.DRINK_RECIPES = DRINK_RECIPES;
window.CAMPAIGN_LEVELS = CAMPAIGN_LEVELS;
window.SHOP_UPGRADES = SHOP_UPGRADES;
