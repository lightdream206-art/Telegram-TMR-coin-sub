// --- Asosiy O'zgaruvchilar ---
let balance = 0;
let energy = 1000;
const MAX_ENERGY = 1000;
const TAP_POWER = 1; // Har bosishda beriladigan ball

// --- DOM elementlari ---
const tapArea = document.getElementById('tapArea');
const balanceDisplay = document.getElementById('balance');
const energyDisplay = document.getElementById('energy');
const energyBar = document.getElementById('energy-bar');

// --- Telegram WebApp SDK ni ishga tushirish ---
Telegram.WebApp.ready();
Telegram.WebApp.expand(); // Ilovani to'liq ekranga yoyish

// --- Balansni saqlash (Hozircha brauzer xotirasida, keyinchalik Backendga ulanadi) ---
function updateDisplay() {
    balanceDisplay.textContent = balance.toLocaleString();
    energyDisplay.textContent = energy;
    
    // Energiya panelini yangilash
    const energyPercent = (energy / MAX_ENERGY) * 100;
    energyBar.style.setProperty('--width', `${energyPercent}%`);
    energyBar.style.width = `${energyPercent}%`;
}

// --- Energiya Tiklanish Mantiqi ---
const ENERGY_REGEN_RATE = 5; // Sekundiga 5 energiya tiklanadi
setInterval(() => {
    if (energy < MAX_ENERGY) {
        energy = Math.min(MAX_ENERGY, energy + ENERGY_REGEN_RATE);
        updateDisplay();
    }
}, 1000); // Har 1 sekundda tekshirish

// --- Tangani Bosish Funksiyasi ---
tapArea.addEventListener('click', () => {
    if (energy >= TAP_POWER) {
        // 1. Hisoblash
        balance += TAP_POWER;
        energy -= TAP_POWER;
        updateDisplay();
        
        // 2. Animatsiya (Pop-up effekt)
        showTapValue(TAP_POWER);

        // 3. (KEYINCHALIK) Balansni Backendga yuborish kerak
        // sendTapToServer({ telegram_id: Telegram.WebApp.initDataUnsafe.user.id, taps: TAP_POWER });
        
    } else {
        // Energiya yo'q bo'lsa, foydalanuvchiga xabar berish
        Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
    }
});

// --- Bosish Qadrini Ko'rsatish (Pop-up) ---
function showTapValue(value) {
    const popUp = document.createElement('div');
    popUp.textContent = `+${value}`;
    popUp.className = 'tap-popup';
    
    // CSS-da bu sinf uchun animatsiya yozishingiz kerak
    popUp.style.left = `${Math.random() * 80 + 10}%`; // Tasodifiy gorizontal joylashuv
    
    tapArea.appendChild(popUp);
    
    // Animatsiya tugagach olib tashlash
    setTimeout(() => {
        popUp.remove();
    }, 1000); 
}

// Qadam 1: Boshlang'ich qiymatlarni ko'rsatish
updateDisplay();

// Qo'shimcha CSS:
/* tap-popup uchun CSS-ni style.css ga qo'shing: */
/*
.tap-popup {
    position: absolute;
    top: 50%; 
    left: 50%;
    transform: translate(-50%, 0);
    color: yellow;
    font-size: 2em;
    font-weight: bold;
    opacity: 0;
    animation: tap-fade-out 1s ease-out forwards;
    pointer-events: none; 
}

@keyframes tap-fade-out {
    0% { transform: translate(-50%, 0); opacity: 1; }
    100% { transform: translate(-50%, -100px); opacity: 0; }
}
*/
// script.js ga o'zgartirishlar

// --- 1. Yangi Boosts O'zgaruvchilari ---
let currentTapPower = 1; 
let multitapLevel = 1;
let multitapBaseCost = 100;

let maxEnergy = 1000;
let energyLevel = 1;
let energyBaseCost = 500;
const ENERGY_BONUS_PER_LEVEL = 500;

// --- 2. Yangi DOM elementlari ---
const navigation = document.getElementById('navigation');
const multitapCostDisplay = document.getElementById('multitap-cost');
const multitapLevelDisplay = document.getElementById('multitap-level');
const energyCostDisplay = document.getElementById('energy-cost');
const energyLevelDisplay = document.getElementById('energy-level');
const maxEnergyDisplay = document.getElementById('max-energy');
const buyBtns = document.querySelectorAll('.buy-btn');

// --- 3. Qo'shimcha Display Yangilash Funksiyalari ---
function updateBoostsDisplay() {
    // Multitap
    multitapCostDisplay.textContent = (multitapBaseCost * multitapLevel).toLocaleString();
    multitapLevelDisplay.textContent = multitapLevel;
    
    // Energy Limit
    energyCostDisplay.textContent = (energyBaseCost * energyLevel).toLocaleString();
    energyLevelDisplay.textContent = energyLevel;
    maxEnergyDisplay.textContent = maxEnergy.toLocaleString();
    
    // Tugmalarni tekshirish (Balans yetarli bo'lmasa, o'chirish)
    buyBtns.forEach(btn => {
        const type = btn.dataset.boostType;
        let cost;
        if (type === 'multitap') cost = multitapBaseCost * multitapLevel;
        else if (type === 'energy') cost = energyBaseCost * energyLevel;
        
        btn.disabled = balance < cost;
    });
}

// updateDisplay funksiyasini to'ldiramiz (eski koddan)
function updateDisplay() {
    // ... eski balans, energiya display kodlari ...
    balanceDisplay.textContent = balance.toLocaleString();
    energyDisplay.textContent = energy;
    
    const energyPercent = (energy / maxEnergy) * 100; // maxEnergy ishlatildi
    energyBar.style.width = `${energyPercent}%`;
    
    // Qo'shimcha: Boosts panelini ham yangilash
    updateBoostsDisplay();
}

// --- 4. Boosts Sotib Olish Mantiqi ---
function buyBoost(type) {
    let cost;
    if (type === 'multitap') {
        cost = multitapBaseCost * multitapLevel;
        if (balance >= cost) {
            balance -= cost;
            multitapLevel++;
            currentTapPower++; // TAP_POWER o'rniga currentTapPower ishlatiladi
            updateDisplay();
            Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    } else if (type === 'energy') {
        cost = energyBaseCost * energyLevel;
        if (balance >= cost) {
            balance -= cost;
            energyLevel++;
            maxEnergy += ENERGY_BONUS_PER_LEVEL;
            energy = maxEnergy; // Energiya to'liq to'ldiriladi
            updateDisplay();
            Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    }
}

// Buy tugmachalarini tinglash
buyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.boostType;
        buyBoost(type);
    });
});


// --- 5. Ekranlar Orasida Navigatsiya Mantiqi ---
navigation.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-btn')) {
        const targetScreenId = e.target.dataset.target;
        
        // Barcha tugmachalardan 'active' sinfini olib tashlash
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active'); // Bosilgan tugmachaga 'active' sinfini berish
        
        // Barcha ekranlarni yashirish
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        
        // Kerakli ekranni ko'rsatish
        const targetScreen = document.getElementById(targetScreenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }
});

// --- ENERGIYA TIKLANISH MANTIQI (eski koddan) ---
// TAP_POWER ni currentTapPower ga o'zgartiramiz
// ...
// tapArea.addEventListener('click', () => {
//     if (energy >= currentTapPower) { // Endi bu yerda Multitap kuchi ishlatiladi
//         balance += currentTapPower;
//         energy -= currentTapPower;
//         updateDisplay();
//         showTapValue(currentTapPower); // showTapValue ham currentTapPower ishlatadi
//     } else {
//         Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
//     }
// });
// ...

// Qadam 1: Boshlang'ich qiymatlarni ko'rsatish
updateDisplay();
