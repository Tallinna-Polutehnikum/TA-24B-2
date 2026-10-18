<script setup>
import { computed, ref, watch } from 'vue'
import { getAssetUrl, getScreeningSeats, updateScreeningSeats } from './services/api'
import banner from './assets/banner1.jpg'
import poster1 from './assets/poster1.jpg'
import poster2 from './assets/poster2.jpg'
import poster3 from './assets/poster3.jpg'
import poster4 from './assets/poster4.jpg'
import poster5 from './assets/poster5.jpg'
import poster6 from './assets/poster6.jpg'

const props = defineProps({
  movie: { type: Object, default: null },
  movies: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'checkout'])
const rows = 7
const seatsPerRow = 10
const posters = [poster1, poster2, poster3, poster4, poster5, poster6]
const selectedMovie = ref(props.movie)
const selectedCinema = ref('')
const selectedDate = ref('')
const selectedScreeningId = ref('')
const selectedSeats = ref([])
const canEditSeats = import.meta.env.DEV
const editorOpen = ref(false)
const loadingSeats = ref(false)
const savingSeats = ref(false)
const seatError = ref('')
const serverOccupied = ref(null)

let latestRequest = 0

const screenings = computed(() => selectedMovie.value?.screenings ?? [])
const cinemas = computed(() => [...new Map(
  screenings.value.map(screening => [screening.building, {
    name: screening.building,
    city: screening.city,
    address: screening.address
  }])
).values()])
const cinemaScreenings = computed(() => screenings.value
  .filter(screening => screening.building === selectedCinema.value)
  .sort((first, second) => new Date(first.startsAt) - new Date(second.startsAt)))

function getDateKey(value) {
  const date = new Date(value)
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

const dates = computed(() => [...new Set(cinemaScreenings.value.map(screening => getDateKey(screening.startsAt)))])
const dateScreenings = computed(() => cinemaScreenings.value.filter(
  screening => getDateKey(screening.startsAt) === selectedDate.value
))
const selectedScreening = computed(() => dateScreenings.value.find(
  screening => String(screening.id) === String(selectedScreeningId.value)
))
const generatedOccupiedSeats = computed(() => {
  if (!selectedScreening.value) return new Set()

  let seed = Math.imul(Number(selectedScreening.value.id) || 1, 2654435761) >>> 0
  const count = 9 + (seed % 15)
  const seats = new Set()
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 0x100000000
  }
  const rowOrder = Array.from({ length: rows }, (_, index) => index + 1)

  for (let index = rowOrder.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(random() * (index + 1))
    const row = rowOrder[index]
    rowOrder[index] = rowOrder[otherIndex]
    rowOrder[otherIndex] = row
  }

  const singleSeats = new Set()
  const placeBlock = (length, isolated = false) => {
    const candidates = []

    for (const row of rowOrder) {
      for (let firstSeat = 1; firstSeat <= seatsPerRow - length + 1; firstSeat += 1) {
        const blockSeats = Array.from({ length }, (_, index) => `${row}-${firstSeat + index}`)
        if (blockSeats.some(seat => seats.has(seat))) continue

        const touchesSingle = blockSeats.some(seat => {
          const [blockRow, blockSeat] = seat.split('-').map(Number)
          return singleSeats.has(`${blockRow}-${blockSeat - 1}`)
            || singleSeats.has(`${blockRow}-${blockSeat + 1}`)
        })
        if (touchesSingle) continue

        if (isolated) {
          const leftSeat = firstSeat - 1
          const rightSeat = firstSeat + length
          if (seats.has(`${row}-${leftSeat}`) || seats.has(`${row}-${rightSeat}`)) continue
        }

        candidates.push({ row, firstSeat })
      }
    }

    if (candidates.length === 0) return false

    const { row, firstSeat } = candidates[Math.floor(random() * candidates.length)]
    for (let seat = firstSeat; seat < firstSeat + length; seat += 1) {
      const key = `${row}-${seat}`
      seats.add(key)
      if (isolated) singleSeats.add(key)
    }

    return true
  }

  const singleCount = Math.max(2, Math.floor(count / 5))
  for (let index = 0; index < singleCount; index += 1) {
    placeBlock(1, true)
  }

  const hasPair = count > 12 && random() < 0.2 && placeBlock(2)
  let remaining = count - singleCount - (hasPair ? 2 : 0)

  while (remaining > 0) {
    let blockLength = Math.min(remaining, 3 + Math.floor(random() * 2))
    while (blockLength > 0 && !placeBlock(blockLength)) {
      blockLength -= 1
    }
    remaining -= blockLength
  }

  return seats
})

const occupiedSeats = computed(() => {
  if (serverOccupied.value === null) {
    return generatedOccupiedSeats.value
  }

  return new Set(serverOccupied.value)
})

async function fetchScreeningSeats() {
  const id = selectedScreening.value?.id
  const request = ++latestRequest

  serverOccupied.value = null
  seatError.value = ''

  if (!id) {
    loadingSeats.value = false
    return
  }

  loadingSeats.value = true
  try {
    const data = await getScreeningSeats(id)

    if (request === latestRequest) {
      serverOccupied.value = data.blockedSeats
    }
  } catch (error) {
    if (request === latestRequest) {
      seatError.value = 'Could not load seats.'
    }
  } finally {
    if (request === latestRequest) {
      loadingSeats.value = false
    }
  }
}

async function saveBlockedSeats(next) {
  if (!canEditSeats || !editorOpen.value || !selectedScreening.value || savingSeats.value) return
  savingSeats.value = true
  seatError.value = ''
  const id = selectedScreening.value.id

  try {
    const result = await updateScreeningSeats(id, [...next])

    if (selectedScreening.value?.id === id) {
      serverOccupied.value = result.blockedSeats
      selectedSeats.value = selectedSeats.value.filter(seat => !next.has(`${seat.row}-${seat.seat}`))
    }
  } catch (error) {
    seatError.value = 'Could not save seats.'
  } finally {
    savingSeats.value = false
  }
}

function editSeat(row, seat) {
  const next = new Set(occupiedSeats.value)
  const key = `${row}-${seat}`

  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }

  saveBlockedSeats(next)
}

function clearAllSeats() {
  saveBlockedSeats(new Set())
}

function occupyAllSeats() {
  const seats = new Set()

  for (let row = 1; row <= rows; row++) {
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      seats.add(`${row}-${seat}`)
    }
  }

  saveBlockedSeats(seats)
}

const totalPrice = computed(() => selectedSeats.value.length * Number(selectedScreening.value?.ticketPrice ?? 0))
const movieIndex = computed(() => props.movies.findIndex(movie => movie.id === selectedMovie.value?.id))

function getImage(movie, index = 0) {
  const value = movie?.bannerUrl || movie?.posterUrl
  if (value?.startsWith('https://') || value?.startsWith('http://') || value?.startsWith('/uploads/')) {
    return getAssetUrl(value)
  }

  if (value?.endsWith('banner1.jpg')) return banner

  const match = value?.match(/poster([1-6])\.jpg$/)
  return match ? posters[Number(match[1]) - 1] : posters[Math.max(index, 0) % posters.length]
}

function selectMovie(movie) {
  selectedMovie.value = movie
  selectedCinema.value = ''
  selectedDate.value = ''
  selectedScreeningId.value = ''
  selectedSeats.value = []
}

function selectScreening(screening) {
  selectedScreeningId.value = String(screening.id)
  selectedSeats.value = []
}

function isOccupied(row, seat) {
  return occupiedSeats.value.has(`${row}-${seat}`)
}

function isSelected(row, seat) {
  return selectedSeats.value.some(selected => selected.row === row && selected.seat === seat)
}

function toggleSeat(row, seat) {
  if (isOccupied(row, seat)) return
  selectedSeats.value = isSelected(row, seat)
    ? selectedSeats.value.filter(selected => selected.row !== row || selected.seat !== seat)
    : [...selectedSeats.value, { row, seat }]
}

function continueToCheckout() {
  if (!selectedMovie.value || !selectedScreening.value || selectedSeats.value.length === 0 || loadingSeats.value || seatError.value) return
  emit('checkout', {
    movie: selectedMovie.value,
    screening: selectedScreening.value,
    seats: selectedSeats.value,
    totalPrice: totalPrice.value
  })
}

watch(() => props.movie, movie => {
  if (movie) selectMovie(movie)
}, { immediate: true })

watch(selectedCinema, () => {
  selectedDate.value = dates.value[0] ?? ''
  selectedScreeningId.value = ''
  selectedSeats.value = []
})

watch(selectedDate, () => {
  selectedScreeningId.value = ''
  selectedSeats.value = []
})

watch(selectedScreening, () => {
  editorOpen.value = false
  selectedSeats.value = []
  fetchScreeningSeats()
}, { immediate: true })

</script>
<template>
  <section class="booking-section">
    <button class="booking-back" type="button" @click="emit('close')">← Back to movies</button>

    <div v-if="!selectedMovie" class="movie-selection">
      <div class="booking-header">
        <span class="section-label">TICKETS</span>
        <h1>Choose a movie</h1>
        <p>Select a movie to see cinemas and available screenings.</p>
      </div>
      <div v-if="movies.length" class="movie-selection-grid">
        <button v-for="(movie, index) in movies" :key="movie.id" class="movie-choice" type="button" @click="selectMovie(movie)">
          <img :src="getImage(movie, index)" :alt="movie.title" />
          <span>{{ movie.title }}</span>
          <small>{{ movie.genre }} · {{ movie.duration }} min</small>
        </button>
      </div>
      <p v-else class="booking-empty">No movies are available right now.</p>
    </div>

    <template v-else>
      <header class="movie-banner" :style="{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.32) 55%, rgba(0,0,0,.15) 100%), url('${getImage(selectedMovie, movieIndex)}')` }">
        <div>
          <span class="section-label">{{ selectedMovie.genre }} · {{ selectedMovie.duration }} MIN</span>
          <h1>{{ selectedMovie.title }}</h1>
          <button class="change-movie" type="button" @click="selectMovie(null)">Choose another movie</button>
        </div>
      </header>

      <section class="booking-step">
        <div class="step-heading">
          <span>01</span>
          <div><h2>Choose a screening</h2><p>Select a cinema, date and available showtime.</p></div>
        </div>
        <div class="booking-filters">
          <label class="filter-field">
            <span>Cinema</span>
            <select v-model="selectedCinema">
              <option disabled value="">Choose cinema</option>
              <option v-for="cinema in cinemas" :key="cinema.name" :value="cinema.name">{{ cinema.name }} · {{ cinema.city }}</option>
            </select>
          </label>
          <label class="filter-field">
            <span>Date</span>
            <select v-model="selectedDate" :disabled="!selectedCinema">
              <option disabled value="">Choose date</option>
              <option v-for="date in dates" :key="date" :value="date">{{ new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' }) }}</option>
            </select>
          </label>
        </div>
        <div v-if="selectedCinema && dateScreenings.length" class="showtime-list">
          <button v-for="screening in dateScreenings" :key="screening.id" type="button" class="showtime-button" :class="{ active: String(screening.id) === String(selectedScreeningId) }" @click="selectScreening(screening)">
            <strong>{{ new Date(screening.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</strong>
            <span>Hall {{ screening.hallNumber }} · {{ screening.language }}</span>
            <b>€{{ Number(screening.ticketPrice).toFixed(2) }}</b>
          </button>
        </div>
        <p v-else-if="selectedCinema" class="booking-empty">No screenings are available for this date.</p>
        <p v-else-if="selectedMovie.screenings?.length === 0" class="booking-empty">No screenings are available for this movie.</p>
      </section>

      <section v-if="selectedScreening" class="booking-step seat-step">
        <div class="step-heading">
          <span>02</span>
          <div><h2>Choose your seats</h2><p>{{ selectedScreening.building }} · Hall {{ selectedScreening.hallNumber }} · {{ new Date(selectedScreening.startsAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) }}</p></div>
        </div>
        <div v-if="canEditSeats" class="seats-admin-bar">
          <button class="edit-movie-button" type="button" @click="editorOpen = !editorOpen">{{ editorOpen ? 'Exit seat editor' : 'Edit occupied seats' }}</button>
          <template v-if="editorOpen">
            <span>Click a seat to change occupancy.</span>
            <button class="edit-movie-button" type="button" :disabled="savingSeats || loadingSeats" @click="clearAllSeats">Clear all</button>
            <button class="edit-movie-button" type="button" :disabled="savingSeats || loadingSeats" @click="occupyAllSeats">Occupy all</button>
          </template>
        </div>
        <p v-if="seatError" class="seat-api-error">{{ seatError }}<button type="button" @click="fetchScreeningSeats">Retry</button></p>
        <p v-if="loadingSeats">Loading occupied seats...</p>
        <div class="hall">
          <div class="screen"><span>SCREEN</span></div>
          <div class="seats">
            <div v-for="row in rows" :key="row" class="seat-row">
              <span class="row-number">{{ row }}</span>
              <button v-for="seat in seatsPerRow" :key="`${row}-${seat}`" class="seat" :class="{ selected: !editorOpen && isSelected(row, seat), occupied: isOccupied(row, seat), editing: editorOpen}" :disabled="loadingSeats || savingSeats || !!seatError || (!editorOpen && isOccupied(row, seat))" :aria-label="`Row ${row}, seat ${seat}`" type="button" @click="editorOpen ? editSeat(row, seat) : toggleSeat(row, seat)">{{ seat }}</button>
              <span class="row-number">{{ row }}</span>
            </div>
          </div>
          <div class="legend">
            <div><span class="legend-seat free"></span>Available</div>
            <div><span class="legend-seat selected"></span>Selected</div>
            <div><span class="legend-seat occupied"></span>Occupied</div>
          </div>
        </div>
      </section>

      <footer v-if="selectedScreening && !editorOpen" class="booking-summary">
        <div class="selected-info"><span>Selected seats</span><strong>{{ selectedSeats.length ? selectedSeats.map(seat => `${seat.row}-${seat.seat}`).join(', ') : 'Choose at least one seat' }}</strong></div>
        <div class="price"><span>Total</span><strong>€{{ totalPrice.toFixed(2) }}</strong></div>
        <button class="continue-button" :disabled="selectedSeats.length === 0 || loadingSeats || !!seatError" type="button" @click="continueToCheckout">Continue to checkout <span aria-hidden="true">→</span></button>
      </footer>
    </template>
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
.booking-filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 8px;
}
.filter-field span {
  color: #888;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.filter-field select {
  appearance: none;
  width: 100%;
  height: 48px;
  padding: 0 38px 0 14px;
  border: 1px solid #292929;
  border-radius: 8px;
  background: #141414;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='m1 1 5 5 5-5' fill='none' stroke='%23eee' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  color: #eee;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}
.filter-field select:hover {
  border-color: #555;
}
.filter-field select:focus {
  border-color: #3d77f3;
}
.filter-field select:disabled {
  color: #666;
  background: #101010;
  cursor: not-allowed;
}
.booking-header {
  margin-bottom: 36px;
}
.section-label {
  color: var(--cinema-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
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
  border-radius: 8px;
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
.booking-section .movie-banner .section-label,
.movie-banner h1 {
  color: #fff;
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
:global(:root[data-theme="light"] .seat:not(.selected)) {
  border-color: #aaa;
  background: #fff;
  color: #333;
}
:global(:root[data-theme="light"] .seat.occupied) {
  border-color: #b8b8b8;
  background: #b8b8b8;
  color: #666;
}
:global(:root[data-theme="light"] .legend-seat.free) {
  border-color: #aaa;
  background: #fff;
}
:global(:root[data-theme="light"] .legend-seat.occupied) {
  background: #b8b8b8;
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
  font-size: 14px;
}
.price strong {
  font-size: 24px;
}
.continue-button {
  min-height: 46px;
  padding: 12px 20px;
  border: 1px solid #3d77f3;
  border-radius: 8px;
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
  .booking-filters {
  grid-template-columns: 1fr;
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
.booking-back,
.change-movie {
  padding: 5px 10px;
  border: 2px solid #aaa;
  background: none;
  color: #aaa;
  font: inherit;
  cursor: pointer;
  border-radius: 8px;
  margin: 14px;
  margin-left: auto;
}
.booking-back:hover,
.change-movie:hover {
  color: #fff;
  border-color: #fff;
}
.movie-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 18px;
}
.movie-choice {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 0 12px;
  overflow: hidden;
  border: 1px solid #292929;
  border-radius: 8px;
  background: #141414;
  color: #eee;
  text-align: left;
  cursor: pointer;
}
.movie-choice:hover {
  border-color: #3d77f3;
}
.movie-choice img {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 8px;
}
.movie-choice span,
.movie-choice small {
  margin: 0 12px;
}
.movie-choice span {
  font-weight: 700;
}
.movie-choice small {
  color: #999;
}
.booking-empty {
  color: #aaa;
}
.movie-banner {
  display: flex;
  align-items: end;
  min-height: 330px;
  margin: 22px 0 9px;
  padding: 55px;
  border-radius: 6px;
  background-color: #151515;
  background-position: center 35%;
  background-size: cover;
  background-repeat: no-repeat;
}
.booking-step {
  margin: 32px 0;
}
.step-heading {
  display: flex;
  gap: 16px;
  align-items: start;
  margin-bottom: 22px;
}
.step-heading > span {
  color: #3d77f3;
  font-size: 13px;
  font-weight: 700;
}
.step-heading h2 {
  margin: 0 0 6px;
  font-size: 23px;
}
.step-heading p {
  margin: 0;
  color: #999;
}
.showtime-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.showtime-button {
  display: grid;
  gap: 5px;
  min-width: 150px;
  padding: 12px 14px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #141414;
  color: #eee;
  text-align: left;
  cursor: pointer;
}
.showtime-button span {
  color: #999;
  font-size: 12px;
}
.showtime-button b {
  color: #aaa;
  font-size: 13px;
}
.showtime-button:hover,
.showtime-button.active {
  border-color: #3d77f3;
}
.showtime-button.active {
  background: #17233b;
}
@media (max-width: 750px) {
  .movie-banner {
    min-height: 240px;
    margin: 18px 0 32px;
    padding: 20px;
  }
  .movie-banner h1 {
    font-size: 36px;
  }
  .movie-selection-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
  .booking-section {
    color: var(--cinema-text);
    font-family: var(--cinema-font-body);
  }
  .booking-section .section-label {
    color: #3d77f3;
  }
  .booking-section .booking-header h1,
  .booking-section .movie-banner h1 {
    font-family: var(--cinema-font-heading);
  }
  .booking-section .filter-field select,
  .booking-section .movie-choice,
  .booking-section .showtime-button {
    border-color: var(--cinema-border);
    background-color: var(--cinema-surface);
    color: var(--cinema-text);
  }
  .booking-section .showtime-button span,
  .booking-section .booking-header p,
  .booking-section .step-heading p {
    color: var(--cinema-muted);
  }
  .booking-section .showtime-button:hover,
  .booking-section .showtime-button.active,
  .booking-section .movie-choice:hover {
    border-color: var(--cinema-accent);
  }
  .booking-section .showtime-button.active {
    background: var(--cinema-surface-raised);
  }
  .booking-section .continue-button {
    border-color: var(--cinema-accent);
    background: var(--cinema-accent);
  }
  .booking-section .continue-button:hover:not(:disabled) {
    border-color: var(--cinema-accent-hover);
    background: var(--cinema-accent-hover);
  }
  .booking-section .movie-choice,
  .booking-section .showtime-button,
  .booking-section .continue-button {
    border-radius: 8px;
  }
.seats-admin-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  color: #aaa;
  font-size: 13px;
}
.seats-admin-bar button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 9px 14px;
  border: 1px solid #555;
  border-radius: 8px;
  background: #1b1b1b;
  color: #fff;
  font: inherit;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.seats-admin-bar button:hover:not(:disabled) {
  background: #292929;
}
.seats-admin-bar button:disabled {
  opacity: 0.4;
  cursor: wait;
}
.seats-admin-bar span {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
}

:global(:root[data-theme="light"] .seats-admin-bar button) {
  border-color: var(--cinema-border);
  background: var(--cinema-surface-raised);
  color: var(--cinema-text);
}

:global(:root[data-theme="light"] .seats-admin-bar button:hover:not(:disabled)) {
  background: #e9edf5;
}
.seat-api-error {
  margin: 8px 0;
  color: #ef8888;
}
.seat.editing {
  cursor: pointer;
}
.seat.editing:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: #3d77f3;
  color: #fff;
}
</style>
