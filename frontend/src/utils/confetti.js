import confetti from 'canvas-confetti';

/**
 * Конфетти для достижений
 */
export const celebrateAchievement = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Конфетти слева
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    
    // Конфетти справа
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};

/**
 * Взрыв конфетти из центра
 */
export const confettiExplosion = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.5 },
    zIndex: 9999
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  
  fire(0.2, {
    spread: 60,
  });
  
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

/**
 * Фейерверк конфетти
 */
export const confettiFireworks = () => {
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.5) },
      colors: ['#A3F7BF', '#FFE66D', '#FFB4D1', '#C4A3FF', '#80E8FF']
    });
  }, 250);
};

/**
 * Радужное конфетти (для пасхалки)
 */
export const rainbowConfetti = () => {
  const end = Date.now() + (3 * 1000);
  const colors = ['#A3F7BF', '#FFE66D', '#FFB4D1', '#C4A3FF', '#80E8FF', '#FF6B6B'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      zIndex: 9999
    });
    
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      zIndex: 9999
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

/**
 * Простое конфетти для быстрых достижений
 */
export const quickConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#A3F7BF', '#FFE66D', '#FFB4D1', '#C4A3FF', '#80E8FF'],
    zIndex: 9999
  });
};
