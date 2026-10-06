<script setup>
import { ref, computed } from 'vue'

const movie = ref('Interstellar')
const cinema = ref('Apollo Kino')
const date = ref('6th October')
const time = ref('19:30')
const rows = 7
const seatsPerRow = 10
const pricePerSeat = 8.5
const selectedSeats = ref([])
const occupiedSeats = ref([
  '1-3',
  '1-4',
  '2-7',
  '3-2',
  '3-8',
  '4-5',
  '4-6',
  '5-1',
  '6-9',
  '7-4'
])

function seatId(row, seat) {
  return `${row}-${seat}`
}

function isOccupied(row, seat) {
  return occupiedSeats.value.includes(seatId(row, seat))
}

function isSelected(row, seat) {
  return selectedSeats.value.some(
    selected => selected.row === row && selected.seat === seat
  )
}

function toggleSeat(row, seat) {
  if (isOccupied(row, seat)) return

  if (isSelected(row, seat)) {
    selectedSeats.value = selectedSeats.value.filter(
      selected => !(selected.row === row && selected.seat === seat)
    )
  } else {
    selectedSeats.value.push({ row, seat })
  }
}

function seatClass(row, seat) {
  return {
    occupied: isOccupied(row, seat),
    selected: isSelected(row, seat)
  }
}

const totalPrice = computed(() => selectedSeats.value.length * pricePerSeat)

function continueBooking() {
  console.log('Selected seats:', selectedSeats.value)
  console.log('Total price:', totalPrice.value)
}
</script>
<template>
  <section class="booking-section">
    <div class="booking-header">
      <span class="section-label">TICKETS</span>
      <h1>Choose your seats</h1>
      <p>Choose your suitable seats in the hall</p>
    </div>

    <div class="session-info">
      <div><span>Movie</span><strong>{{ movie }}</strong></div>
      <div><span>Cinema</span><strong>{{ cinema }}</strong></div>
      <div><span>Date</span><strong>{{ date }}</strong></div>
      <div><span>Time</span><strong>{{ time }}</strong></div>
    </div>

    <div class="hall">
      <div class="screen"><span>SCREEN</span></div>

      <div class="seats">
        <div v-for="row in rows" :key="row" class="seat-row">
          <span class="row-number">{{ row }}</span>
          <button
            v-for="seat in seatsPerRow"
            :key="`${row}-${seat}`"
            class="seat"
            :class="seatClass(row, seat)"
            :disabled="isOccupied(row, seat)"
            :aria-label="`Row ${row}, Seat ${seat}`"
            type="button"
            @click="toggleSeat(row, seat)"
          >{{ seat }}</button>
          <span class="row-number">{{ row }}</span>
        </div>
      </div>

      <div class="legend">
        <div><span class="legend-seat free"></span>Free</div>
        <div><span class="legend-seat selected"></span>Selected</div>
        <div><span class="legend-seat occupied"></span>Occupied</div>
      </div>
    </div>

    <div class="booking-summary">
      <div class="selected-info">
        <span>Selected seats</span>
        <strong v-if="selectedSeats.length">
          {{ selectedSeats.map(seat => `${seat.row}-${seat.seat}`).join(', ') }}
        </strong>
        <strong v-else>—</strong>
      </div>

      <div class="price">
        <span>Total</span>
        <strong>€{{ totalPrice.toFixed(2) }}</strong>
      </div>

      <button
        class="continue-button"
        :disabled="selectedSeats.length === 0"
        type="button"
        @click="continueBooking"
      >Continue to Checkout →</button>
    </div>
  </section>
</template>

<style scoped>
.booking-section {
  min-height: calc(100vh - 104px);
  max-width: 1400px;
  margin: 0 auto;
  padding: 55px 6vw 80px;
  color: #f5f5f5;
  font-family: "DM Sans", sans-serif;
}

.booking-header {
  margin-bottom: 36px;
}

.section-label {
  color: #3d77f3;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
}

.booking-header h1 {
  margin: 10px 0 12px;
  font-family: "Outfit", sans-serif;
  font-size: clamp(36px, 5vw, 58px);
  line-height: 1;
}

.booking-header p {
  margin: 0;
  color: #999;
}

.session-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 56px;
}

.session-info div {
  min-width: 0;
  padding: 16px 18px;
  background: #141414;
  border: 1px solid #292929;
}

.session-info span {
  display: block;
  margin-bottom: 8px;
  color: #888;
  font-size: 11px;
  text-transform: uppercase;
}

.session-info strong {
  display: block;
  overflow-wrap: anywhere;
  color: #eee;
  font-size: 14px;
}

.hall {
  max-width: 900px;
  margin: auto;
}

.screen {
  position: relative;
  width: 75%;
  height: 4px;
  margin: 0 auto 65px;
  border-radius: 50%;
  background: #dce6ff;
  box-shadow: 0 8px 28px rgba(61, 119, 243, 0.25);
}

.screen span {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  color: #777;
  font-size: 11px;
  letter-spacing: 0.2em;
}

.seats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 8px;
}

.seat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: max-content;
  min-width: 100%;
}

.row-number {
  width: 25px;
  text-align: center;
  color: #777;
  font-size: 12px;
}

.seat {
  flex: 0 0 40px;
  height: 36px;
  border: 1px solid #454545;
  border-radius: 6px 6px 10px 10px;
  background: #181818;
  color: #aaa;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, border-color 0.2s, color 0.2s;
}

.seat:hover:not(.occupied) {
  transform: translateY(-3px);
  border-color: #3d77f3;
  color: white;
}

.seat.selected {
  transform: translateY(-3px);
  border-color: #3d77f3;
  background: #3d77f3;
  color: white;
}

.seat.occupied {
  border-color: #292929;
  background: #292929;
  color: #555;
  cursor: not-allowed;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px 30px;
  margin-top: 36px;
  color: #999;
  font-size: 13px;
}

.legend div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-seat {
  width: 18px;
  height: 15px;
  border-radius: 4px 4px 6px 6px;
}

.legend-seat.free {
  border: 1px solid #555;
  background: #181818;
}

.legend-seat.selected {
  background: #3d77f3;
}

.legend-seat.occupied {
  background: #292929;
}

.booking-summary {
  display: flex;
  align-items: center;
  gap: 32px;
  max-width: 1000px;
  margin: 52px auto 0;
  padding-top: 24px;
  border-top: 1px solid #292929;
}

.selected-info {
  flex: 1;
  min-width: 0;
}

.selected-info span,
.price span {
  display: block;
  margin-bottom: 7px;
  color: #888;
  font-size: 11px;
  text-transform: uppercase;
}

.selected-info strong {
  overflow-wrap: anywhere;
  color: #eee;
  font-size: 14px;
}

.price strong {
  color: #f5f5f5;
  font-size: 24px;
}

.continue-button {
  min-height: 46px;
  padding: 12px 20px;
  border: 1px solid #3d77f3;
  border-radius: 3px;
  background: #3d77f3;
  color: white;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.continue-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #2f65d5;
  background: #2f65d5;
}

.continue-button:disabled {
  border-color: #333;
  background: #202020;
  color: #777;
  cursor: not-allowed;
}

@media (max-width: 750px) {
  .booking-section {
    min-height: calc(100vh - 104px);
    padding: 40px 20px 56px;
  }

  .session-info {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 48px;
  }

  .session-info div {
    padding: 14px;
  }

  .seats {
    align-items: flex-start;
  }

  .seat {
    flex-basis: 34px;
    height: 32px;
    font-size: 11px;
  }

  .seat-row {
    gap: 7px;
  }

  .row-number {
    flex: 0 0 20px;
  }

  .booking-summary {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px 14px;
    margin-top: 40px;
  }

  .continue-button {
    grid-column: 1 / -1;
    width: 100%;
  }
}

@media (max-width: 420px) {
  .legend {
    gap: 14px;
    font-size: 12px;
  }
}
</style>
