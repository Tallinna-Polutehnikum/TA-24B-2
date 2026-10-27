<script setup>
  import './Club.css';
</script>

<template>
  <div class="club-page">
    <h1 class="club-name">Join Bradar Club today!</h1>
      <p class="commentclub">Welcome! Want to become a Bradar Club member? If you're tired of hearing complaints about prices, join us and enjoy great benefits!</p>
    <div class="offers-slider">
      <section class="club-slide">
        <div class="card-container">
          <div class="card-3d" role="img" aria-label="Bradar Club card">
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
          <h2 class="offers">Benefits of the Bradar Club card:</h2>
          <div class="offers-details">
            <ul class="offers-list">
              <li>Movie discounts of up to 70%!</li>
              <li>Premium access to NeonLights AI</li>
              <li>Spend over €10 and get a free drink at any of our cinemas!</li>
              <li>Family members get 60% off their tickets!</li>
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
              <p>To reach the next level, visit our cinemas and watch movies often!</p>
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
                  <p>Free drink with purchases over €14, plus 60% off tickets for family members</p>
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