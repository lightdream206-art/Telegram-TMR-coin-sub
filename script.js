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
