<script setup>
import './ClubApplication.css';
import { ref } from 'vue';

const notice = ref('');

function submitApplication() {
  notice.value = 'The application form is ready, but submissions are not connected yet.';
}
</script>

<template>
  <section class="application-page">
    <header class="application-header">
      <RouterLink to="/club" class="application-back">← Back to Bradar Club</RouterLink>
      <h1>Bradar Club Card Application Form</h1>
      <p>Fill in the form to apply for your free club card.</p>
    </header>

    <form class="application-form" @submit.prevent="submitApplication">
      <label>
        Full name
        <input name="fullName" type="text" autocomplete="name" required>
      </label>
      <label>
        Email
        <input name="email" type="email" autocomplete="email" required>
      </label>
      <label>
        Phone number
        <input name="phone" type="tel" autocomplete="tel" required>
      </label>
      <label>
        Date of birth
        <input name="birthDate" type="date" autocomplete="bday">
      </label>
      <button class="continue-button" type="submit">Submit application</button>
      <p v-if="notice" class="application-notice" role="status">{{ notice }}</p>
    </form>
  </section>
</template>
