<script setup>
import './Checkout.css';
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const booking = ref(null)

try {
  const savedBooking = sessionStorage.getItem('pendingBooking')
  booking.value = savedBooking ? JSON.parse(savedBooking) : null
} catch {
  booking.value = null
}

onMounted(() => {
  if (!booking.value?.movie || !booking.value?.screening || !booking.value?.seats?.length) {
    router.replace('/')
    return
  }
  if (new Date(booking.value.screening.startsAt).getTime() <= Date.now()) {
    sessionStorage.removeItem('pendingBooking')
    router.replace('/')
  }
})

function returnToCinema() {
  sessionStorage.removeItem('pendingBooking')
  router.push('/')
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value))
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}
</script>

<template>
  <div v-if="booking?.movie && booking?.screening" class="checkout-page">
    <header class="checkout-header">
      <button type="button" class="checkout-back" @click="returnToCinema">← Back to cinema</button>
      <span class="section-label">TICKETS</span>
      <h1>Checkout</h1>
      <p>Review your movie and seat selection.</p>
    </header>

    <section class="checkout-layout">
      <div class="checkout-details">
        <div class="checkout-title-row">
          <span>YOUR SELECTION</span>
          <span>{{ booking.seats.length }} {{ booking.seats.length === 1 ? 'ticket' : 'tickets' }}</span>
        </div>
        <h2>{{ booking.movie.title }}</h2>
        <p class="checkout-genre">{{ booking.movie.genre }} · {{ booking.movie.duration }} min</p>
        <dl class="checkout-facts">
          <div><dt>Cinema</dt><dd>{{ booking.screening.building }}</dd></div>
          <div><dt>Address</dt><dd>{{ booking.screening.address }}, {{ booking.screening.city }}</dd></div>
          <div><dt>Date</dt><dd>{{ formatDate(booking.screening.startsAt) }}</dd></div>
          <div><dt>Time</dt><dd>{{ formatTime(booking.screening.startsAt) }} · Hall {{ booking.screening.hallNumber }}</dd></div>
          <div><dt>Seats</dt><dd>{{ booking.seats.map(seat => `${seat.row}-${seat.seat}`).join(', ') }}</dd></div>
        </dl>
      </div>

      <aside class="checkout-total">
        <span class="checkout-total-label">TOTAL</span>
        <strong>€{{ Number(booking.totalPrice).toFixed(2) }}</strong>
        <p>€{{ Number(booking.screening.ticketPrice).toFixed(2) }} per seat</p>
        <button type="button" class="continue-button" @click="returnToCinema">Back to movies</button>
      </aside>
    </section>
  </div>
</template>
