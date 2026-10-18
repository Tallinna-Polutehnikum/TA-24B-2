<script setup>
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
  <main v-if="booking?.movie && booking?.screening" class="checkout-page">
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
  </main>
</template>

<style scoped>
.checkout-page {
  min-height: calc(100vh - 104px);
  max-width: 1100px;
  margin: 0 auto;
  padding: 54px 6vw 80px;
  color: #f5f5f5;
  font-family: "DM Sans", sans-serif;
}
.checkout-back {
  display: block;
  margin-bottom: 42px;
  padding: 0;
  border: 0;
  background: none;
  color: #aaa;
  font: inherit;
  cursor: pointer;
}
.checkout-back:hover {
  color: #fff;
}
.checkout-header p,
.checkout-genre,
.checkout-total p {
  color: #999;
}
.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 48px;
  margin-top: 42px;
  padding-top: 28px;
  border-top: 1px solid #292929;
}
.checkout-title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #999;
  font-size: 11px;
  text-transform: uppercase;
}
.checkout-details h2 {
  margin: 20px 0 6px;
  font-size: 28px;
}
.checkout-genre {
  margin: 0 0 28px;
}
.checkout-facts {
  margin: 0;
}
.checkout-facts div {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid #242424;
}
.checkout-facts dt {
  color: #999;
}
.checkout-facts dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.checkout-total {
  align-self: start;
  padding: 22px;
  border: 1px solid #292929;
  background: #141414;
}
.checkout-total-label {
  display: block;
  margin-bottom: 10px;
  color: #999;
  font-size: 11px;
}
.checkout-total strong {
  font-size: 32px;
}
.checkout-total .continue-button {
  width: 100%;
  margin-top: 22px;
}
@media (max-width: 700px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .checkout-header h1 {
    font-size: 40px;
  }
  .checkout-facts div {
    grid-template-columns: 95px minmax(0, 1fr);
  }
}
  .checkout-page {
    color: var(--cinema-text);
    font-family: var(--cinema-font-body);
  }
  .checkout-header h1 {
    font-family: var(--cinema-font-heading);
  }
  .checkout-back,
  .checkout-header p,
  .checkout-genre,
  .checkout-title-row,
  .checkout-facts dt,
  .checkout-total-label,
  .checkout-total p {
    color: var(--cinema-muted);
  }
  .checkout-layout,
  .checkout-facts div {
    border-color: var(--cinema-border);
  }
  .checkout-total {
    border-color: var(--cinema-border);
    border-radius: 4px;
    background: var(--cinema-surface);
  }
  .checkout-total .continue-button {
    border-radius: 3px;
  }
</style>
