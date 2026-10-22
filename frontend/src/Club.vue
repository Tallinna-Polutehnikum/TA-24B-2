<template>
  <div class="club-page">
    <h1 class="club-name">Join Bradar Club today!</h1>
      <p class="commentclub">Welcome stranger! Do you want to be our greatest bradar? Are you really tired of those stupid comments about the prices in the market? So this is your great chance to join our great bradar club and claim cool benefits!</p>
    <div class="offers-slider">
      <section class="club-slide">
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
      </section>
      <section class="club-slide">
        <div class="offers-content">
          <h2 class="offers">Benefits from the Bradar Club сard:</h2>
          <div class="offers-details">
            <ul class="offers-list">
              <li>Huge movie discounts up to 70%!</li>
              <li>Premium access to NeonLights AI</li>
              <li>Purchases more than 500₴ gives you any free drink in all cinemas!</li>
              <li>If you have a family, you can have a 60% discounts on every ticket for each person!</li>
              <li>Early bookings to the next new movies!</li>
            </ul>
            <RouterLink to="/club/register" class="continue-button club-cta">Join the club and Register!</RouterLink>
          </div>
        </div>
      </section>
      <section class="club-slide">
        <div class="tutorial-section">
          <h2 class="tutorial">How the Bradar Club Card works:</h2>
          <div class="tutorial-content">
            <div class="tutorial-copy">
              <p>The card registration is free. There are 5 Bradar levels, each with a bigger discount and better perks.</p>
              <p>Move up the levels to unlock early bookings, free drinks, family discounts, and NeonLights AI Premium.</p>
              <p>To earn those levels, come visit our cinemas with a purchased movies as possible as you can, often is better!</p>
            </div>
            <section class="levels-panel" aria-labelledby="levels-title">
              <h2 id="levels-title">Bradar Club levels</h2>
              <ol class="levels-list">
                <li class="level-item level-one">
                  <div class="level-heading"><span>Level 1</span><strong>20% off discounts</strong></div>
                  <div class="level-track"><span style="width: 20%"></span></div>
                  <p>Discount on movie tickets and small drinks</p>
                </li>
                <li class="level-item level-two">
                  <div class="level-heading"><span>Level 2</span><strong>40% off discounts</strong></div>
                  <div class="level-track"><span style="width: 40%"></span></div>
                  <p>Early bookings for new movies, better discounts</p>
                </li>
                <li class="level-item level-three">
                  <div class="level-heading"><span>Level 3</span><strong>50% off discounts</strong></div>
                  <div class="level-track"><span style="width: 50%"></span></div>
                  <p>Free drink with purchases over 700₴, 60% off tickets for family members</p>
                </li>
                <li class="level-item level-four">
                  <div class="level-heading"><span>Level 4</span><strong>60% off discounts</strong></div>
                  <div class="level-track"><span style="width: 60%"></span></div>
                  <p>Almost all features combined with much better discount</p>
                </li>
                <li class="level-item level-five">
                  <div class="level-heading"><span>Level 5</span><strong>70% off discounts</strong></div>
                  <div class="level-track"><span style="width: 70%"></span></div>
                  <p>Premium access to NeonLights AI, all features are available!</p>
                </li>
              </ol>
              <p class="levels-note">Each level keeps the perks from the previous levels.</p>
            </section>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
  .offers-slider {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: center;
    gap: 0;
    margin: 40px auto;
    width: min(1100px, calc(100% - 40px));
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
    animation: card-spinning 8s ease-in-out infinite;
  }
  .card-face {
    position: absolute;
    inset: 0px;
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
    background-image: url("./assets/other/bradarclubcard-front.jpg");
    transform: translateZ(calc(var(--card-thickness) / 2));
  }
  .card-back {
    background-image: url("./assets/other/bradarclubcard-back.jpg");
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
  .tutorial {
    text-align: center;
    padding-top: 25px;
    margin: 0 0 24px;
  }
  .tutorial-content {
    display: grid;
    grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.4fr);
    align-items: start;
    gap: 40px;
    max-width: 1100px;
    margin: 0 auto 40px;
  }
  .tutorial-copy {
    max-width: 380px;
    padding: 16px 0 0 24px;
    color: var(--cinema-text);
    opacity: 0.88;
    line-height: 1.8;
  }
  .tutorial-copy p {
    margin: 0 0 16px;
    text-align: left;
  }
  .levels-panel {
    padding: 24px;
    border: 1px solid var(--cinema-border);
    border-radius: 8px;
    background: var(--cinema-surface);
  }
  .levels-panel h2 {
    margin: 0 0 20px;
    color: var(--cinema-text);
    font-size: 20px;
  }
  .levels-list {
    display: grid;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .level-item {
    --level-color: #5b8def;
  }
  .level-two {
    --level-color: #44a890;
  }
  .level-three {
    --level-color: #d2a843;
  }
  .level-four {
    --level-color: #df8249;
  }
  .level-five {
    --level-color: #ad72d6;
  }
  .level-heading {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 7px;
    color: var(--cinema-text);
    font-size: 14px;
  }
  .level-heading strong {
    color: var(--level-color);
  }
  .level-track {
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--cinema-border);
  }
  .level-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--level-color);
  }
  .level-item p,
  .levels-note {
    margin: 6px 0 0;
    color: var(--cinema-text);
    font-size: 13px;
    line-height: 1.5;
    opacity: 0.8;
  }
  .levels-note {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--cinema-border);
    font-size: 12px;
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
    margin: 0;
    padding-left: 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .club-cta {
    margin-top: 24px;
    text-decoration: none;
  }
  .offers-list li {
    color: var(--cinema-text);
    line-height: 1.5;
    text-align: left;
    opacity: 0.88;
  }
  @media (max-width: 700px) {
    .tutorial-content {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .tutorial-copy {
      max-width: none;
      padding: 0 12px;
    }
    .levels-panel {
      padding: 20px 16px;
    }
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
  .club-slide {
    flex: 0 0 50%;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px 35px;
    min-height: 500px;
  }
  .club-slide:nth-child(3) {
    flex: 0 0 100%;
    min-height: auto;
    border-left: 0;
    border-top: 1px solid var(--cinema-border);
  }
  .club-slide:nth-child(2) {
    border-left: 1px solid var(--cinema-border);
  }
  .club-slide .card-container {
  width: 100%;
  flex: none;
  }
  .club-slide .offers-content {
  width: 100%;
  max-width: 620px;
  flex: none;
  padding: 0;
  border: none;
  }
  .club-slide:nth-child(2) .offers-content {
    align-self: stretch;
    position: relative;
  }
  .club-slide:nth-child(2) .offers-details {
    position: absolute;
    inset: 54px 0 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .club-slide .tutorial-section {
    width: 100%;
    min-width: 0;
    align-self: stretch;
  }
  .club-slide .offers,
  .club-slide .tutorial {
    color: var(--cinema-text);
    text-align: center;
    margin: 0 0 24px;
    padding: 0;
    font-size: 25px;
    font-weight: 700;
    line-height: 1.2;
  }
  .club-slide .tutorial-content {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.35fr);
    align-items: center;
    gap: 28px;
    margin: 0;
    max-width: none;
  }
  .club-slide .tutorial-copy {
    max-width: none;
    padding: 0;
  }
  .club-slide .levels-panel {
    min-width: 0;
    padding: 20px;
  }
  @media (max-width: 700px) {
    .club-slide {
      min-height: 400px;
      padding: 20px 16px;
    }
    .club-slide:nth-child(2) {
      border-left: 0;
      border-top: 1px solid var(--cinema-border);
    }
    .club-slide:nth-child(3) {
      border-top: 1px solid var(--cinema-border);
    }
    .club-slide .tutorial-content {
      grid-template-columns: 1fr;
      gap: 18px;
    }
    .club-slide .tutorial-copy {
      padding: 0;
    }
    .club-slide .tutorial {
      font-size: 21px;
    }
    .club-slide .levels-panel {
      padding: 16px;
    }
  }
</style>