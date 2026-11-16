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
  if (booking.value?.type === 'voucher') {
    if (!booking.value.voucher?.title || !Number.isFinite(booking.value.voucher?.price) || booking.value.voucher.price <= 0) {
      sessionStorage.removeItem('pendingBooking')
      router.replace('/vouchers')
    }
    return
  }

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
  const returnPath = booking.value?.type === 'voucher' ? '/vouchers' : '/'
  sessionStorage.removeItem('pendingBooking')
  router.push(returnPath)
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
  <div v-if="booking?.type === 'voucher' || (booking?.movie && booking?.screening)" class="checkout-page">
    <header class="checkout-header">
      <button type="button" class="checkout-back" @click="returnToCinema">← Back to cinema</button>
      <span class="section-label">{{ booking.type === 'voucher' ? 'VOUCHERS' : 'TICKETS' }}</span>
      <h1>Checkout</h1>
      <p>{{ booking.type === 'voucher' ? 'Review your voucher selection.' : 'Review your movie and seat selection.' }}</p>
    </header>

    <section class="checkout-layout">
      <div class="checkout-details">
        <div class="checkout-title-row">
          <span>YOUR SELECTION</span>
          <span v-if="booking.type === 'voucher'">1 voucher</span>
          <span v-else>{{ booking.seats.length }} {{ booking.seats.length === 1 ? 'ticket' : 'tickets' }}</span>
        </div>
        <template v-if="booking.type === 'voucher'">
          <h2>{{ booking.voucher.title }}</h2>
          <p class="checkout-genre">Gift voucher</p>
          <p class="checkout-voucher-description">{{ booking.voucher.description }}</p>
        </template>
        <template v-else>
          <h2>{{ booking.movie.title }}</h2>
          <p class="checkout-genre">{{ booking.movie.genre }} · {{ booking.movie.duration }} min</p>
        </template>
        <dl v-if="booking.type !== 'voucher'" class="checkout-facts">
          <div><dt>Cinema</dt><dd>{{ booking.screening.building }}</dd></div>
          <div><dt>Address</dt><dd>{{ booking.screening.address }}, {{ booking.screening.city }}</dd></div>
          <div><dt>Date</dt><dd>{{ formatDate(booking.screening.startsAt) }}</dd></div>
          <div><dt>Time</dt><dd>{{ formatTime(booking.screening.startsAt) }} · Hall {{ booking.screening.hallNumber }}</dd></div>
          <div><dt>Seats</dt><dd>{{ booking.seats.map(seat => `${seat.row}-${seat.seat}`).join(', ') }}</dd></div>
        </dl>
      </div>

      <aside class="checkout-total">
        <span class="checkout-total-label">TOTAL</span>
        <strong>€{{ Number(booking.type === 'voucher' ? booking.voucher.price : booking.totalPrice).toFixed(2) }}</strong>
        <p v-if="booking.type === 'voucher'">Voucher total</p>
        <p v-else>€{{ Number(booking.screening.ticketPrice).toFixed(2) }} per seat</p>
        <button type="button" class="continue-button" @click="returnToCinema">
          {{ booking.type === 'voucher' ? 'Back to vouchers' : 'Back to movies' }}
        </button>
      </aside>
    </section>
  </div>
</template>
