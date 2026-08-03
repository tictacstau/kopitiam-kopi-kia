/**
 * Kopitiam Kopi Kia - Recipe & Customer Data Models
 * Contains recipes for Kopi, Teh, Sodas, Dispensers, and Order Generator
 */

const DRINK_RECIPES = [
  // BREW STALL RECIPES
  { id: 'kopi', name: 'Kopi', type: 'brew', kopi: 1, teh: 0, milk: 'condensed', water: true, sugar: 'kosong', price: 1.50, hot: true },
  { id: 'kopi_o', name: 'Kopi-O', type: 'brew', kopi: 1, teh: 0, milk: 'none', water: true, sugar: 'normal', price: 1.30, hot: true },
  { id: 'kopi_c', name: 'Kopi-C', type: 'brew', kopi: 1, teh: 0, milk: 'evaporated', water: true, sugar: 'normal', price: 1.60, hot: true },
  { id: 'kopi_c_siew_dai', name: 'Kopi-C Siew Dai', type: 'brew', kopi: 1, teh: 0, milk: 'evaporated', water: true, sugar: 'siew_dai', price: 1.60, hot: true },
  { id: 'kopi_kosong', name: 'Kopi Kosong', type: 'brew', kopi: 1, teh: 0, milk: 'none', water: true, sugar: 'kosong', price: 1.20, hot: true },
  { id: 'kopi_peng', name: 'Kopi Peng', type: 'brew', kopi: 1, teh: 0, milk: 'condensed', water: true, sugar: 'kosong', price: 1.80, hot: false, iced: true },
  
  { id: 'teh', name: 'Teh', type: 'brew', kopi: 0, teh: 1, milk: 'condensed', water: true, sugar: 'kosong', price: 1.50, hot: true },
  { id: 'teh_o', name: 'Teh-O', type: 'brew', kopi: 0, teh: 1, milk: 'none', water: true, sugar: 'normal', price: 1.30, hot: true },
  { id: 'teh_c', name: 'Teh-C', type: 'brew', kopi: 0, teh: 1, milk: 'evaporated', water: true, sugar: 'normal', price: 1.60, hot: true },
  { id: 'teh_peng', name: 'Teh Peng', type: 'brew', kopi: 0, teh: 1, milk: 'condensed', water: true, sugar: 'kosong', price: 1.80, hot: false, iced: true },
  
  { id: 'yuan_yang', name: 'Yuan Yang', type: 'brew', kopi: 1, teh: 1, milk: 'condensed', water: true, sugar: 'kosong', price: 2.00, hot: true },

  // CANNED FRIDGE RECIPES
  { id: 'coke_iced', name: 'Iced Crimson Ribbon (Can)', type: 'can', canBrand: 'coke', price: 2.00, iced: true },
  { id: 'sprite_iced', name: 'Iced Sprite (Can)', type: 'can', canBrand: 'sprite', price: 2.00, iced: true },
  { id: 'hundred_plus_iced', name: 'Iced 100 Plus (Can)', type: 'can', canBrand: 'hundred_plus', price: 2.00, iced: true },

  // DISPENSER RECIPES
  { id: 'bandung_iced', name: 'Iced Bandung', type: 'dispenser', dispenserFlavor: 'bandung', price: 2.20, iced: true },
  { id: 'lime_juice_iced', name: 'Iced Lime Juice', type: 'dispenser', dispenserFlavor: 'lime_juice', price: 2.20, iced: true }
];

const CUSTOMERS = [
  { name: 'Mdm Tan', avatar: '👵', preferred: ['kopi_c_siew_dai', 'teh_c', 'kopi_kosong'] },
  { name: 'Uncle Lim', avatar: '👴', preferred: ['kopi', 'teh', 'kopi_o'] },
  { name: 'Aunty Lee', avatar: '👩', preferred: ['yuan_yang', 'teh_peng', 'bandung_iced'] },
  { name: 'Brother Ah Seng', avatar: '👨', preferred: ['coke_iced', 'kopi_peng', 'hundred_plus_iced'] },
  { name: 'Student Kenneth', avatar: '👦', preferred: ['sprite_iced', 'lime_juice_iced', 'kopi_peng'] }
];

const CAMPAIGN_LEVELS = [
  { level: 1, name: 'Tiong Bahru Corner', targetScore: 6.00, shiftSeconds: 45, starThresholds: [6.00, 10.00, 15.00] },
  { level: 2, name: 'Maxwell Food Center', targetScore: 10.00, shiftSeconds: 45, starThresholds: [10.00, 15.00, 22.00] },
  { level: 3, name: 'Old Airport Road', targetScore: 15.00, shiftSeconds: 50, starThresholds: [15.00, 22.00, 30.00] },
  { level: 4, name: 'Amoy Street Food Center', targetScore: 20.00, shiftSeconds: 50, starThresholds: [20.00, 28.00, 38.00] },
  { level: 5, name: 'Chinatown Complex', targetScore: 25.00, shiftSeconds: 55, starThresholds: [25.00, 35.00, 45.00] },
  { level: 6, name: 'Lau Pa Sat Financial Hub', targetScore: 30.00, shiftSeconds: 55, starThresholds: [30.00, 42.00, 55.00] },
  { level: 7, name: 'Tekka Market Little India', targetScore: 35.00, shiftSeconds: 60, starThresholds: [35.00, 48.00, 62.00] },
  { level: 8, name: 'Geylang Serai Market', targetScore: 40.00, shiftSeconds: 60, starThresholds: [40.00, 55.00, 70.00] },
  { level: 9, name: 'Adam Road Food Centre', targetScore: 45.00, shiftSeconds: 65, starThresholds: [45.00, 62.00, 80.00] },
  { level: 10, name: 'Changi Village Kopitiam', targetScore: 50.00, shiftSeconds: 65, starThresholds: [50.00, 70.00, 90.00] }
];

const SHOP_UPGRADES = [
  { id: 'strainer', name: 'Express Coffee Strainer', desc: 'Brew drinks 50% faster', price: 15.00, icon: '⚡', perk: 'fast_pour' },
  { id: 'gourmet_beans', name: 'Nanyang Gourmet Roast', desc: '+25% cash on all coffee orders', price: 25.00, icon: '☕', perk: 'coffee_boost' },
  { id: 'aunty_patience', name: 'Aunty\'s Sweet Smile', desc: '+5 seconds timer for every customer', price: 30.00, icon: '😊', perk: 'timer_boost' },
  { id: 'ice_crusher', name: 'Turbo Ice Crusher', desc: '+ $0.40 payout on iced drinks', price: 40.00, icon: '🧊', perk: 'ice_boost' },
  { id: 'golden_mug', name: 'Golden Kopitiam Mug Skin', desc: 'Pure prestige! +50% total tip bonus', price: 80.00, icon: '🏆', perk: 'gold_skin' }
];

class OrderManager {
  static getRandomOrder(unlockedLevel = 1) {
    let availableRecipes = DRINK_RECIPES.filter(r => r.type === 'brew');

    if (unlockedLevel >= 2) {
      availableRecipes = DRINK_RECIPES;
    }

    const recipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

    return {
      customerName: customer.name,
      customerAvatar: customer.avatar,
      recipe: recipe
    };
  }

  static validateDrink(userMug, targetRecipe) {
    const errors = [];

    if (!userMug.isEquipped) {
      return { isValid: false, errors: ['No mug on counter!'] };
    }

    if (userMug.type !== targetRecipe.type) {
      return { isValid: false, errors: [`Wrong station! Needs ${targetRecipe.type.toUpperCase()}`] };
    }

    if (targetRecipe.type === 'can') {
      if (userMug.canBrand !== targetRecipe.canBrand) {
        errors.push(`Wrong soda! Target: ${targetRecipe.canBrand}`);
      }
      if (!userMug.hasIce) {
        errors.push('Needs ice in cup!');
      }
      return { isValid: errors.length === 0, errors };
    }

    if (targetRecipe.type === 'dispenser') {
      if (userMug.dispenserFlavor !== targetRecipe.dispenserFlavor) {
        errors.push(`Wrong dispenser! Target: ${targetRecipe.dispenserFlavor}`);
      }
      if (!userMug.hasIce) {
        errors.push('Needs ice in cup!');
      }
      return { isValid: errors.length === 0, errors };
    }

    // Brew Stall Validation
    if (userMug.kopiCount !== targetRecipe.kopi) {
      errors.push(targetRecipe.kopi > 0 ? 'Missing Kopi!' : 'Should NOT have Kopi!');
    }

    if (userMug.tehCount !== targetRecipe.teh) {
      errors.push(targetRecipe.teh > 0 ? 'Missing Teh!' : 'Should NOT have Teh!');
    }

    if (userMug.milk !== targetRecipe.milk) {
      errors.push(`Milk mismatch! Requested ${targetRecipe.milk.toUpperCase()}`);
    }

    if (userMug.hasWater !== targetRecipe.water) {
      errors.push('Missing Hot Water!');
    }

    if (userMug.sugar !== targetRecipe.sugar) {
      errors.push(`Sugar mismatch! Requested ${targetRecipe.sugar.replace('_', ' ').toUpperCase()}`);
    }

    if (targetRecipe.iced && !userMug.hasIce) {
      errors.push('Customer requested ICED drink!');
    } else if (!targetRecipe.iced && userMug.hasIce) {
      errors.push('Customer requested HOT drink (no ice)!');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
