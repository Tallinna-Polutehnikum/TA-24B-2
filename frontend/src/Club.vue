<template>
  <div class="club-page">
    <h1 class="club-name">Join our club Bradar!</h1>
      <p class="commentclub">Welcome stranger! Do you want to be our bradar? Are you really tired of those stupid comments about the prices in the market?
      So this is your chance bradar to be the part of our family! Bradar delete this prices bradar!</p>
    <div class="offers-layout">
      <div class="card-container">
        <div class="card-3d">
          <div class="card-fill card-fill-top"></div>
          <div class="card-fill card-fill-bottom"></div>
          <div class="card-fill card-fill-left"></div>
          <div class="card-fill card-fill-right"></div>
          <div class="card-face card-front"></div>
          <div class="card-face card-back"></div>
          <div class="card-edge card-edge-top"></div>
          <div class="card-edge card-edge-bottom"></div>
          <div class="card-edge card-edge-left"></div>
          <div class="card-edge card-edge-right"></div>
        </div>
      </div>
      <div class="offers-content">
        <h3 class="offers">What you will get from our Bradar Club Card:</h3>
        <ul class="offers-list">
          <li>Huge movie discounts down to 70%!</li>
          <li>Premium access to NeonLights AI</li>
          <li>Purchases more than 500₴ gives you any free drink in all cinemas!</li>
          <li>If you have a family, you can have a 60% discounts on every ticket for each person!</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
  .offers-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
    margin: 40px auto;
    max-width: 1100px;
  }
  .card-container {
    flex: 0 1 42%;
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 1200px;
  }
  .card-3d {
    --card-thickness: 8px;
    --card-color: #4573e5;
    position: relative;
    width: 300px;
    height: 187.5px;
    aspect-ratio: 1.6 / 1;
    transform-style: preserve-3d;
    animation: card-spinning 8s linear infinite;
  }
  .card-face {
    position: absolute;
    inset: 0px;
    background-image: url("./assets/other/bradarclubcard.jpg");
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    backface-visibility: hidden;
    border: none;
    box-shadow: none;
    filter: none;
    outline: none;
  }
  .card-front {
    transform: translateZ(calc(var(--card-thickness) / 2));
  }
  .card-back {
    transform: rotateY(180deg) translateZ(calc(var(--card-thickness) / 2));
  }
  .card-edge {
    position: absolute;
    background: var(--card-color);
    box-sizing: border-box;
    border-radius: 0;
    box-shadow: none;
    filter: none;
    backface-visibility: visible;
  }
  .card-edge-top {
    width: calc(100%);
    height: calc(var(--card-thickness));
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateX(90deg) translateZ(93.75px);
  }
  .card-edge-bottom {
    width: calc(100%);
    height: calc(var(--card-thickness));
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateX(90deg) translateZ(-93.75px);
  }
  .card-edge-left {
    width: calc(var(--card-thickness));
    height: calc(100%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateY(90deg) translateZ(-150px);
  }
  .card-edge-right {
    width: calc(var(--card-thickness));
    height: calc(100% );
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateY(90deg) translateZ(150px);
  }
  @keyframes card-spinning {
    from {
      transform: rotateX(-10deg) rotateY(0deg);
    }
    to {
      transform: rotateX(-10deg) rotateY(360deg);
    }
  }
  .offers-content {
    flex: 1;
    padding-left: 32px;
    border-left: 1px solid var(--cinema-border);
  }
  .club-name {
    text-align: center;
    padding-top: 25px;
    margin: 0 0 24px;
  }
  .commentclub {
    max-width: 760px;
    margin: 0 auto;
    line-height: 1.8;
    text-align: center;
    color: var(--cinema-muted);
  }
  .offers {
    margin: 0 0 20px;
    color: var(--cinema-text);
  }
  .offers-list {
    list-style: disc;
    margin: 0 0 45px;
    padding-left: 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .offers-list li {
    color: var(--cinema-text);
    line-height: 1.5;
    text-align: left;
  }
  @media (max-width: 700px) {
    .offers-layout {
      flex-direction: column;
      gap: 24px;
    }
    .card-container,
    .offers-content {
      width: 100%;
    }
    .offers-content {
      padding: 24px 0 0;
      border-top: 1px solid var(--cinema-border);
      border-left: 0;
    }
  }
  .card-fill {
    position: absolute;
    background: var(--card-color);
    backface-visibility: visible;
    pointer-events: none;
  }
  .card-fill-top,
  .card-fill-bottom {
    width: 100%;
    height: var(--card-thickness);
    top: 50%;
    left: 50%;
  }
  .card-fill-top {
    transform: translate(-50%, -50%) rotateX(90deg) translateZ(92.75px);
  }
  .card-fill-bottom {
    transform: translate(-50%, -50%) rotateX(90deg) translateZ(-92.75px);
  }
  .card-fill-left,
  .card-fill-right {
    width: var(--card-thickness);
    height: 100%;
    top: 50%;
    left: 50%;
  }
  .card-fill-left {
    transform: translate(-50%, -50%) rotateY(90deg) translateZ(-149px);
  }
  .card-fill-right {
    transform: translate(-50%, -50%) rotateY(90deg) translateZ(149px);
  }
</style>