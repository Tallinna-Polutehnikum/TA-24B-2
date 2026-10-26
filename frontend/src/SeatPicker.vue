<script setup>
import './SeatPicker.css';
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { getAssetUrl, getScreeningSeats, updateScreeningSeats } from './services/api'
import banner from './assets/posters/banner1.jpg'
import poster1 from './assets/posters/poster1.jpg'
import poster2 from './assets/posters/poster2.jpg'
import poster3 from './assets/posters/poster3.jpg'
import poster4 from './assets/posters/poster4.jpg'
import poster5 from './assets/posters/poster5.jpg'
import poster6 from './assets/posters/poster6.jpg'

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
const currentTime = ref(new Date())

let latestRequest = 0
let clockInterval = null

const screenings = computed(() => selectedMovie.value?.screenings ?? [])
const cinemas = computed(() => [...new Map(
  screenings.value.map(screening => [screening.building, {
    name: screening.building,
    city: screening.city,
    address: screening.address
  }])
).values()])
const cinemaScreenings = computed(() => screenings.value
  .filter(screening => screening.building === selectedCinema.value && new Date(screening.startsAt).getTime() > Date.now())
  .sort((first, second) => new Date(first.startsAt) - new Date(second.startsAt)))
const formattedCurrentDate = computed(() => {
  const date = currentTime.value
  return new Intl.DateTimeFormat('ee-EE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long'
  }).format(date)
})
const formattedCurrentTime = computed(() => new Intl.DateTimeFormat('ee-EE', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(currentTime.value))

onMounted(() => {
  clockInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (clockInterval !== null) {
    clearInterval(clockInterval)
  }
})

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
  if (new Date(selectedScreening.value.startsAt).getTime() <=Date.now()) {
    alert('This screening is already started')
    return
  }

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
        <div class="screening-header">
          <div class="step-heading screening-heading">
            <span>01</span>
            <div>
              <h2>Choose a screening</h2>
              <p>Select a cinema, date and available showtime.</p>
            </div>
          </div>
          <time class="screening-clock" :datetime="currentTime.toISOString()">
            <span>{{ formattedCurrentDate }}</span>
            <strong>{{ formattedCurrentTime }}</strong>
          </time>
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