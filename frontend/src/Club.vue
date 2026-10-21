<template>
  <div class="club-page">
    <h1 class="club-name">Join our club Bradar!</h1>
      <p>Welcome stranger! Do you want to be our bradar? Are you really tired of those stupid comments about the prices in the market? 
      So this is your chance bradar to be the part of our family! Bradar delete this prices bradar!</p>
    <div class="offers-layout">
      <div class="card-container">
        <img src="./assets/cards/bradarclubcard.png" alt="Bradar Club" class="card-image">
      </div>
      <div class="offers-content">
        <h3 class="offers">What you will get from our Bradar Club Card:</h3>
        <ul class="offers-list">
          <li>Huge movie discounts down to 70%!</li>
          <li>Premium access to NeonLights AI</li>
          <li>Purchases more than 500₴ gives you any free drink in all cinemas!</li>
          <li></li>
          <li></li>
          <li></li>
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
    gap: 15px;
    margin: 30px auto;
    max-width: 1100px;
  }

  .card-container {
    flex: 0 1 40%;
    text-align: center;
  }

  .card-image {
    max-width: 100%;
    height: auto;
    padding-left: 100px;
  }

  .offers-content {
    flex: 1;
  }

  .club-name {
    text-align: center;
    padding-top: 25px;
    margin: 0 0 24px;
  }

  p {
    max-width: 760px;
    margin: 0 auto;
    line-height: 1.8;
    text-align: center;
    color: var(--cinema-muted);
  }

  .offers {
    text-align: right;
    padding-right: 15%;
  }

  .offers-list {
    text-align: right;
    padding-right: 15%;
    list-style-type: none;
    margin-bottom: 45px;
    gap: 8px;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 700px) {
    .offers-layout {
      flex-direction: column;
      gap: 20px;
    }

    .card-container,
    .offers-content {
      width: 100%;
    }

    .offers,
    .offers-list {
      text-align: center;
      padding-right: 0;
    }
  }

</style>