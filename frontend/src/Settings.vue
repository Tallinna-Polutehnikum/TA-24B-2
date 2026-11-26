<script setup>
import './Settings.css';

defineProps({
  invertColors: {
    type: Boolean,
    default: false,
  },
  arrowNavigation: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['change-invert-colors', 'change-arrow-navigation']);
</script>

<template>
  <div class="settings-page">
    <header class="settings-heading">
      <p class="settings-eyebrow">PERSONALIZE YOUR EXPERIENCE</p>
      <h1>Accessibility settings</h1>
      <p>Choose the options that will able to make your experience better in Bradar Cinema. Accessibility features can help people to use the site everywhere for everyone.</p>
    </header>

    <section class="settings-section" aria-labelledby="display-settings-heading">
      <h2 id="display-settings-heading">Color Display</h2>
      <label class="settings-option">
        <span class="settings-option-copy">
          <strong>Invert colors / Negative Format</strong>
          <span>Invert the page colors for an alternative high-contrast view.</span>
        </span>
        <input
          type="checkbox"
          :checked="invertColors"
          aria-label="Invert colors"
          @change="emit('change-invert-colors', $event.target.checked)"
        />
      </label>
    </section>

    <section class="settings-section" aria-labelledby="keyboard-settings-heading">
      <h2 id="keyboard-settings-heading">Keyboard Mode</h2>
      <label class="settings-option">
        <span class="settings-option-copy">
          <strong>Arrow-key navigation (<kbd>Alt</kbd> + Arrow keys / <kbd>Tab</kbd> and Arrow Keys)</strong>
          <span>Use <kbd>Left</kbd> or <kbd>Up</kbd> to focus the previous control and Right or Down for the next. Tab and Shift+Tab always work too. Only works with arrows. The Tab button and Shift+Tab button works automatically.</span>
        </span>
        <input
          type="checkbox"
          :checked="arrowNavigation"
          aria-label="Arrow-key navigation"
          @change="emit('change-arrow-navigation', $event.target.checked)"
        />
      </label>
      <div class="settings-help">
        <h3>Keyboard shortcuts</h3>
        <ul>
          <li><kbd>Tab</kbd> moves to the next link or control.</li>
          <li><kbd>Shift</kbd> + <kbd>Tab</kbd> moves to the previous link or control.</li>
          <li>When arrow-key navigation is on, use the arrow keys to move between controls.</li>
          <li><kbd>Enter</kbd> or <kbd>Space</kbd> activates the focused control.</li>
        </ul>
      </div>
    </section>

    <section class="settings-section settings-zoom" aria-labelledby="zoom-settings-heading">
      <h2 id="zoom-settings-heading">Page zoom</h2>
      <p>Use your browser’s zoom controls to enlarge the page to 250%–400%. The layout adapts to the narrower view, and you can still scroll normally.</p>
      <p class="settings-zoom-shortcut">On Windows or Linux, press <kbd>Ctrl</kbd> and <kbd>+</kbd> to zoom in, or <kbd>Ctrl</kbd> and <kbd>-</kbd> to zoom out. On macOS, use <kbd>Command</kbd> and <kbd>+</kbd> or <kbd>Command</kbd> and <kbd>-</kbd> instead.</p>
    </section>
  </div>
</template>
