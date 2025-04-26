document.addEventListener('DOMContentLoaded', () => {
  // Dynamically adjust overlay-title font size
  function adjustOverlayTitleFont() { 
    const overlayTitle = document.getElementById('overlay-title');
    const maxFontSize = 100; // Max 48px
    const testFontSize = 100; // Test size
    const maxWidth = window.innerWidth * 0.96; // 98vw (left: 1vw, right: 1vw)

    // Create a hidden span to measure text width
    const span = document.createElement('span');
    span.style.fontFamily = "'Luckiest Guy', Verdana, sans-serif";
    span.style.fontSize = `${testFontSize}px`;
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'nowrap';
    span.textContent = overlayTitle.textContent;
    document.body.appendChild(span);

    // Calculate scaling factor to fit within maxWidth
    const textWidth = span.getBoundingClientRect().width;
    const scale = Math.min(maxWidth / textWidth, 1); // Fit within 98vw or keep test size
    const fontSize = Math.min(testFontSize * scale, maxFontSize); // Cap at 48px

    // Apply font size
    overlayTitle.style.fontSize = `${fontSize}px`;

    // Clean up
    span.remove();
  }

  // Set custom property for viewport height
  function setViewportHeight() {
    const vh = window.innerHeight * 0.01; // 1vh in pixels
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // Run on load and resize
  adjustOverlayTitleFont();
  setViewportHeight();
  window.addEventListener('resize', () => window.location.reload());


    // Create ground blocks for two grids
    const groundGrid1 = document.getElementById('ground-grid-1');
    const groundGrid2 = document.getElementById('ground-grid-2');
    const blockSize = window.innerHeight * 0.1; // 10% screen height
    const blockCount = Math.ceil(window.innerWidth / blockSize); // Fill screen width
  
    for (let i = 0; i < blockCount; i++) {
      const block1 = document.createElement('div');
      block1.className = 'ground';
      groundGrid1.appendChild(block1);
  
      const block2 = document.createElement('div');
      block2.className = 'ground';
      groundGrid2.appendChild(block2);
    }
  
    // Set #ground-grid-2 to start at end of #ground-grid-1 and animation width
    const gridWidth = blockCount * blockSize; // Pixel width of one grid
    const gridWidthPercent = (gridWidth / window.innerWidth) * 100; // Convert to %
    groundGrid2.style.left = `${gridWidthPercent}%`; // Start at end of grid1
    const questionGridWidth = ((blockCount - 1) * (gridWidth / window.innerWidth) * 100);
    document.body.style.setProperty('--grid-width-raw', `${questionGridWidth}%`); // Set for question blocks
    document.body.style.setProperty('--grid-width', `${gridWidthPercent}%`); // Set for ground blocks
    document.body.style.setProperty('--speed', '5s'); // Set animation speed
  
    // Create 5 drifting clouds
    const cloudContainer = document.getElementById('cloud-container');
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      cloud.style.top = `${Math.random() * 70}%`; // Random height in top 70%
      const speed = 20 + Math.random() * 20; // Random speed 20-40s
      cloud.style.animationDuration = `${speed}s`;
      cloud.style.animationDelay = `${Math.random() * 20}s`; // Random delay 0-20s
      cloud.style.left = '100%'; // Start off-screen right
      cloudContainer.appendChild(cloud);
    }
  
    // Question block spawning
    const questionBlockContainer = document.getElementById('question-block-container');
    function spawnQuestionBlock() {
      if (document.querySelectorAll('.question-block').length > 3) return; // Limit to 3 blocks
      const block = document.createElement('div');
      block.className = 'question-block';
      block.style.left = '100%'; // Start off-screen right
      questionBlockContainer.appendChild(block);
      block.addEventListener('animationend', () => block.remove()); // Remove block when animation ends (off-screen left)
      const nextSpawn = 3000 + Math.random() * 2000; // 2-5s
      setTimeout(spawnQuestionBlock, nextSpawn);
    }
    // Start spawning after initial 1s delay (matches ground)
    setTimeout(spawnQuestionBlock, 1000);
  
    // Coin counter and Mario jump
    const mario = document.getElementById('mario');
    const coinCounter = document.getElementById('coin-counter');
    let coins = 0;
    let isJumping = false;
  
    mario.addEventListener('click', () => {
      // Ignore clicks if Mario is jumping or mid-animation
      if (isJumping || mario.classList.contains('jumping')) {
        return;
      }
  
      isJumping = true;
      mario.classList.add('jumping', 'no-delay');
  
      // Check collision at 0.25s (max jump height)
      setTimeout(() => {
        const blocks = document.querySelectorAll('.question-block');
        const marioCenterPx = (25 / 100 * window.innerWidth) + (5 / 100 * window.innerHeight); // 25vw + 5vh
        const blockWidthPx = window.innerHeight * 0.1; // 10vw
        let collision = false;
        let collidingBlock = null;
  
        // Calculate block position at click time (per your current logic)
        blocks.forEach(block => {
          const blockRect = block.getBoundingClientRect();
          const blockLeftPx = blockRect.left;
          const blockCenterPx = blockLeftPx + blockRect.width / 2;
          if (Math.abs(marioCenterPx - blockCenterPx) <= blockWidthPx) {
            collision = true;
            collidingBlock = block;
          }
        });
  
        // Handle collision: pause, increment coins, show coin animation
        if (collision) {
          coins++;
          coinCounter.textContent = `${(coins % 100).toString().padStart(2, '0')}`;

          // Create coin above colliding block
          const coin = document.createElement('div');
          coin.className = 'coin';
          const blockRect = collidingBlock.getBoundingClientRect();
          coin.style.left = `${blockRect.left + blockRect.width / 2 - blockSize / 2}px`; // Center above block
          coin.style.bottom = `${window.innerHeight - blockRect.top}px`; // Align with block top
          questionBlockContainer.appendChild(coin);
  
          // Pause all animations
          groundGrid1.classList.add('paused');
          groundGrid2.classList.add('paused');
          mario.classList.add('paused');
          const currentBlocks = document.querySelectorAll('.question-block');
          currentBlocks.forEach(block => block.classList.add('paused'));
  
          // Remove coin and unpause after 0.5s (end of coin animation)
          setTimeout(() => {
            coin.remove();
            groundGrid1.classList.remove('paused');
            groundGrid2.classList.remove('paused');
            mario.classList.remove('paused');
            const resumeBlocks = document.querySelectorAll('.question-block');
            resumeBlocks.forEach(block => block.classList.remove('paused'));
          }, 500); // Resume after 0.5s
        }
  
        // Resume jump and allow new clicks
        setTimeout(() => {
          mario.classList.remove('jumping');
          isJumping = false;
        }, collision ? 750 : 500); // 0.75s if paused, 0.5s otherwise
      }, 250); // Check at 0.25s
    });
  });