<script setup>
import './ClubApplication.css';
import { ref } from 'vue';

const notice = ref('');

function submitApplication() {
  notice.value = 'Your details have not been saved. The application form is not connected yet.';
}
</script>

<template>
  <section class="application-page">
    <header class="application-header">
      <RouterLink to="/club" class="application-back">← Back to Bradar Club</RouterLink>
      <h1>Bradar Club Card Registration</h1>
      <p class="manual">Fill the form to apply for your free club card.</p>
    </header>

    <form class="application-form" @submit.prevent="submitApplication">
      <label>
        Full name:
        <input name="fullName" type="text" autocomplete="name" required>
      </label>
      <label>
        Email address:
        <input name="email" type="email" autocomplete="email" required>
      </label>
      <label>
        Phone number:
        <input name="phone" type="tel" autocomplete="tel" required>
      </label>
      <label>
        Date of birth:
        <input name="birthDate" type="date" autocomplete="bday">
      </label>
      <p v-if="notice" class="application-notice" role="status">{{ notice }}</p>
      <h2>Choose your card:</h2>
      <p class="attention">Having a physical card isn't necessary. If you like to use your phone instead of having card with you, you can use digital version.</p>
      <div class="radio-group">
        <label class="radio-label">
          <input type="radio" name="options" value="option1" checked>
          <span class="custom-radio"></span>
          Digital Version (waiting time is only 10 few minutes)
        </label>
        <label class="radio-label">
          <input type="radio" name="options" value="option2">
          <span class="custom-radio"></span>
          Physical Card (need to wait 2-3 days)
        </label>
        <button class="continue-button" type="submit">Submit Registation</button>
      </div>
    </form>
  </section>
</template>
