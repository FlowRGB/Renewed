let selectedPetType = null;
let petName = '';
let stats = { hunger: 80, fun: 80, sleep: 80, clean: 80, love: 80 };
let currentEmotion = 'happy';
let currentAction = null;
let actionTimeout = null;
let decayInterval = null;

const emotionMap = {
  happy: { emoji: '😊', text: 'Happy' },
  sad: { emoji: '😢', text: 'Sad' },
  eating: { emoji: '😋', text: 'Eating' },
  sleeping: { emoji: '😴', text: 'Sleeping' },
  playing: { emoji: '🤩', text: 'Playing' },
  loved: { emoji: '🥰', text: 'Loved' }
};

const actionMessages = {
  eat: ['Yum yum!', 'So tasty!', 'Nom nom!', 'Delicious!'],
  play: ['Wheee!', 'So fun!', 'Yippee!', 'Again!!'],
  sleep: ['Zzz...', 'So comfy...', 'Sweet dreams...', 'Night night...'],
  bath: ['Sparkle!', 'So fresh!', 'Squeaky clean!', 'Bubbly!'],
  pet: ['Purr~', 'So warm!', 'Love you!', '♥♥♥']
};

const petEmojis = {
  dog: { happy: '🐕', sad: '🐕', eating: '🐕', sleeping: '🐕', playing: '🐕', loved: '🐕' },
  cat: { happy: '🐱', sad: '🐱', eating: '🐱', sleeping: '🐱', playing: '🐱', loved: '🐱' },
  bunny: { happy: '🐰', sad: '🐰', eating: '🐰', sleeping: '🐰', playing: '🐰', loved: '🐰' },
  slime: { happy: '🟣', sad: '🟣', eating: '🟣', sleeping: '🟣', playing: '🟣', loved: '🟣' }
};

function selectPet(type) {
  selectedPetType = type;
  document.querySelectorAll('.pet-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.pet === type);
  });
  checkReady();
}

function checkReady() {
  const name = document.getElementById('petNameInput').value.trim();
  const btn = document.getElementById('startBtn');
  if (selectedPetType && name.length > 0) {
    btn.disabled = false;
    btn.style.opacity = '1';
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }
}

document.getElementById('petNameInput').addEventListener('input', checkReady);

function startGame() {
  petName = document.getElementById('petNameInput').value.trim();
  if (!selectedPetType || !petName) return;

  stats = { hunger: 80, fun: 80, sleep: 80, clean: 80, love: 80 };
  currentEmotion = 'happy';
  currentAction = null;

  document.getElementById('selectScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');
  document.getElementById('petName').textContent = petName;

  renderPet();
  renderBg('default');
  updateBars();
  updateEmotion();

  if (decayInterval) clearInterval(decayInterval);
  decayInterval = setInterval(() => {
    stats.hunger = Math.max(0, stats.hunger - 2);
    stats.fun = Math.max(0, stats.fun - 1.5);
    stats.sleep = Math.max(0, stats.sleep - 1);
    stats.clean = Math.max(0, stats.clean - 1);
    stats.love = Math.max(0, stats.love - 0.8);
    updateBars();
    if (!currentAction) {
      calculateEmotion();
      renderPet();
      renderBg('default');
    }
  }, 3000);
}

function goBack() {
  if (decayInterval) clearInterval(decayInterval);
  if (actionTimeout) clearTimeout(actionTimeout);
  document.getElementById('selectScreen').classList.remove('hidden');
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('petNameInput').value = '';
  selectedPetType = null;
  document.querySelectorAll('.pet-btn').forEach(b => b.classList.remove('active'));
  checkReady();
}

function doAction(action) {
  if (currentAction) return;
  currentAction = action;

  const emotionForAction = {
    eat: 'eating',
    play: 'playing',
    sleep: 'sleeping',
    bath: 'happy',
    pet: 'loved'
  };

  currentEmotion = emotionForAction[action];
  renderPet();
  renderBg(action === 'sleep' ? 'night' : action === 'bath' ? 'bath' : 'default');
  updateEmotion();

  const msgs = actionMessages[action];
  showToast(msgs[Math.floor(Math.random() * msgs.length)]);

  if (action === 'pet') addHearts();
  if (action === 'eat') addFood();
  if (action === 'sleep') addZzz();
  if (action === 'bath') addBubbles();
  if (action === 'play') addSparkles();

  const statChanges = {
    eat: { hunger: 25, fun: 5 },
    play: { fun: 25, hunger: -5 },
    sleep: { sleep: 30, fun: -5 },
    bath: { clean: 30 },
    pet: { love: 25, fun: 10 }
  };

  const changes = statChanges[action];
  for (const [key, val] of Object.entries(changes)) {
    stats[key] = Math.min(100, Math.max(0, stats[key] + val));
  }
  updateBars();

  document.getElementById('petArea').style.animation = 'action-flash 0.4s ease';
  setTimeout(() => { document.getElementById('petArea').style.animation = ''; }, 400);

  actionTimeout = setTimeout(() => {
    currentAction = null;
    calculateEmotion();
    renderPet();
    renderBg('default');
    updateEmotion();
  }, action === 'sleep' ? 3500 : 2500);
}

function calculateEmotion() {
  const avg = (stats.hunger + stats.fun + stats.sleep + stats.clean + stats.love) / 5;
  if (stats.hunger < 20) currentEmotion = 'sad';
  else if (stats.sleep < 15) currentEmotion = 'sleeping';
  else if (stats.love > 85) currentEmotion = 'loved';
  else if (avg > 70) currentEmotion = 'happy';
  else currentEmotion = 'happy';
}

function renderPet() {
  const emoji = petEmojis[selectedPetType]?.[currentEmotion] || '🐕';
  const sprite = document.getElementById('petSprite');
  let animStyle = '';
  
  if (currentEmotion === 'eating') animStyle = 'animation: munch 0.5s ease-in-out infinite;';
  else if (currentEmotion === 'sleeping') animStyle = 'animation: sleep-bob 4s ease-in-out infinite;';
  else if (currentEmotion === 'playing') animStyle = 'animation: bounce 0.6s ease-in-out infinite;';
  else if (currentEmotion === 'loved') animStyle = 'animation: float 1.5s ease-in-out infinite;';
  else animStyle = 'animation: float 2s ease-in-out infinite;';

  sprite.innerHTML = `<div style="font-size: 72px; display: flex; align-items: center; justify-content: center; ${animStyle}">${emoji}</div>`;
}

function renderBg(type) {
  const bgLayer = document.getElementById('bgLayer');
  
  if (type === 'night') {
    bgLayer.style.background = 'linear-gradient(to bottom, #2e1065, #4c1d95)';
    let stars = '';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 60;
      const delay = Math.random() * 3;
      stars += `<div style="position: absolute; left: ${x}%; top: ${y}%; width: 2px; height: 2px; background: #fef08a; border-radius: 1px; animation: star-bg 2s ease-in-out infinite; animation-delay: ${delay}s;"></div>`;
    }
    bgLayer.innerHTML = stars + `<div style="position: absolute; top: 10px; right: 15px; width: 18px; height: 18px; background: #fef9c3; border-radius: 50%; box-shadow: 0 0 6px #fef9c3;"></div>`;
  } else if (type === 'bath') {
    bgLayer.style.background = 'linear-gradient(to bottom, #ede9fe, #ddd6fe)';
    let bubbles = '';
    for (let i = 0; i < 6; i++) {
      const x = 20 + Math.random() * 60;
      const y = 20 + Math.random() * 40;
      const s = 6 + Math.random() * 10;
      const delay = Math.random() * 2;
      bubbles += `<div style="position: absolute; left: ${x}%; top: ${y}%; width: ${s}px; height: ${s}px; border: 2px solid #c4b5fd; border-radius: 50%; animation: bubble-float 3s ease-in-out infinite; animation-delay: ${delay}s;"></div>`;
    }
    bgLayer.innerHTML = bubbles;
  } else {
    bgLayer.style.background = 'linear-gradient(to bottom, #ede9fe, #e9d5ff)';
    let grass = '';
    for (let i = 0; i < 25; i++) {
      const x = i * 4;
      grass += `<div style="position: absolute; left: ${x}px; bottom: 30%; width: 2px; height: 8px; background: #a78bfa;"></div>`;
    }
    bgLayer.innerHTML = grass + `
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 30%; background: #c4b5fd;"></div>
      <div style="position: absolute; top: 10px; right: 15px; width: 20px; height: 20px; background: #fde68a; border-radius: 50%; box-shadow: 0 0 8px #fde68a;"></div>
    `;
  }
}

function updateBars() {
  document.getElementById('hungerBar').style.width = stats.hunger + '%';
  document.getElementById('funBar').style.width = stats.fun + '%';
  document.getElementById('sleepBar').style.width = stats.sleep + '%';
  document.getElementById('cleanBar').style.width = stats.clean + '%';
  document.getElementById('loveBar').style.width = stats.love + '%';

  const getBarColor = (val) => val > 60 ? undefined : val > 30 ? '#fbbf24' : '#ef4444';
  
  const colors = {
    hunger: getBarColor(stats.hunger) || '#f472b6',
    fun: getBarColor(stats.fun) || '#a78bfa',
    sleep: getBarColor(stats.sleep) || '#60a5fa',
    clean: getBarColor(stats.clean) || '#34d399',
    love: getBarColor(stats.love) || '#e879f9'
  };

  document.getElementById('hungerBar').style.background = colors.hunger;
  document.getElementById('funBar').style.background = colors.fun;
  document.getElementById('sleepBar').style.background = colors.sleep;
  document.getElementById('cleanBar').style.background = colors.clean;
  document.getElementById('loveBar').style.background = colors.love;
}

function updateEmotion() {
  const info = emotionMap[currentEmotion] || emotionMap.happy;
  document.getElementById('emotionText').textContent = `${info.emoji} ${info.text}`;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function addHearts() {
  const sprite = document.getElementById('petSprite');
  for (let i = 0; i < 5; i++) {
    const heart = document.createElement('div');
    heart.textContent = '♥';
    heart.style.cssText = `position: absolute; font-size: 16px; color: #f472b6; left: ${30 + Math.random() * 40}%; top: ${20 + Math.random() * 30}%; animation: heart-pop 1.2s ease forwards; animation-delay: ${i * 0.15}s; pointer-events: none;`;
    sprite.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
  }
}

function addFood() {
  const sprite = document.getElementById('petSprite');
  const foods = ['🍖', '🍗', '🥕', '🍎'];
  for (let i = 0; i < 3; i++) {
    const food = document.createElement('div');
    food.textContent = foods[Math.floor(Math.random() * foods.length)];
    food.style.cssText = `position: absolute; font-size: 14px; left: ${25 + Math.random() * 50}%; top: ${15 + Math.random() * 20}%; animation: heart-pop 1s ease forwards; animation-delay: ${i * 0.2}s; pointer-events: none;`;
    sprite.appendChild(food);
    setTimeout(() => food.remove(), 1400);
  }
}

function addZzz() {
  const sprite = document.getElementById('petSprite');
  for (let i = 0; i < 4; i++) {
    const z = document.createElement('div');
    z.textContent = 'Z';
    z.style.cssText = `position: absolute; font-family: 'Silkscreen', cursive; font-size: ${12 + i * 3}px; color: #7c3aed; right: ${15 + i * 5}%; top: ${30 - i * 5}%; animation: zzz-float 2s ease forwards; animation-delay: ${i * 0.5}s; pointer-events: none;`;
    sprite.appendChild(z);
    setTimeout(() => z.remove(), 2500);
  }
}

function addBubbles() {
  const sprite = document.getElementById('petSprite');
  for (let i = 0; i < 6; i++) {
    const bubble = document.createElement('div');
    bubble.textContent = '●';
    bubble.style.cssText = `position: absolute; font-size: ${8 + Math.random() * 10}px; color: #c4b5fd; left: ${20 + Math.random() * 60}%; top: ${40 + Math.random() * 30}%; animation: bubble-float 2s ease forwards; animation-delay: ${i * 0.3}s; pointer-events: none;`;
    sprite.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2500);
  }
}

function addSparkles() {
  const sprite = document.getElementById('petSprite');
  for (let i = 0; i < 6; i++) {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✦';
    sparkle.style.cssText = `position: absolute; font-size: ${10 + Math.random() * 8}px; color: #fde68a; left: ${15 + Math.random() * 70}%; top: ${10 + Math.random() * 60}%; animation: sparkle 0.8s ease infinite; animation-delay: ${i * 0.15}s; pointer-events: none;`;
    sprite.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 2000);
  }
}