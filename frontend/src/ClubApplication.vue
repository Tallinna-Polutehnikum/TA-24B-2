<script setup>
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

<style>
.application-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  color: var(--cinema-text);
  font-family: var(--cinema-font-body);
}

.application-header {
  margin-bottom: 32px;
}

.application-back {
  display: inline-flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 5px 10px;
  border: 2px solid var(--cinema-muted);
  border-radius: 8px;
  background: transparent;
  color: var(--cinema-text);
  font: inherit;
  text-decoration: none;
  transition: border-color .2s, color .2s;
}

.application-back:hover {
  border-color: var(--cinema-text);
  color: var(--cinema-text);
}

.application-header h1 {
  margin: 0 0 8px;
  font-family: var(--cinema-font-heading);
}

.application-header p {
  margin: 0;
  color: var(--cinema-muted);
}

.application-form {
  display: grid;
  gap: 20px;
  padding: 28px;
  border: 1px solid var(--cinema-border);
  border-radius: 8px;
  background: var(--cinema-surface);
  width: 890px;
  height: 520px;
  position: center;
}

.application-form label {
  display: grid;
  gap: 8px;
  color: var(--cinema-text);
  font-size: 14px;
}

.application-form input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid var(--cinema-border);
  border-radius: 4px;
  background: var(--cinema-page);
  color: var(--cinema-text);
  font: inherit;
}

.application-form input:focus {
  outline: 2px solid var(--cinema-accent);
  outline-offset: 1px;
}

.application-form .continue-button {
  justify-self: start;
}

.application-notice {
  margin: 0;
  color: var(--cinema-muted);
  font-size: 14px;
}

@media (max-width: 500px) {
  .application-page {
    padding: 32px 16px 48px;
  }

  .application-form {
    padding: 20px 16px;
  }
}
</style>
