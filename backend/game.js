function startGame(broadcast) {
  let currentMultiplier = 1.0;
  const interval = setInterval(() => {
    currentMultiplier += 0.1;
    const crashPoint = Math.random() * 10 + 1;
    if (currentMultiplier >= crashPoint) {
      broadcast('crash');
      currentMultiplier = 1.0;
    } else {
      broadcast(currentMultiplier);
    }
  }, 100);
}

module.exports = { startGame };
