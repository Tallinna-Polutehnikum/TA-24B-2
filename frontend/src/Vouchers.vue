<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import './Vouchers.css';
import { createVoucherOffer, deleteVoucherOffer, getAssetUrl, getVoucherOffers, updateVoucherOffer, uploadVoucherImage } from './services/api.js';
import banner from './assets/v-banners/vbanner1.png';

const router = useRouter();
const emit = defineEmits(['checkout']);
const canEditVouchers = import.meta.env.DEV;
const seasonalOffers = ref([]);
const loadingOffers = ref(true);
const offersError = ref('');
const editingOffer = ref(false);
const creatingOffer = ref(false);
const savingOffer = ref(false);
const deletingOffer = ref(false);
const uploadingImage = ref(false);
const offerForm = ref(null);
const selectedOffer = ref(null);
const imageFileInput = ref(null);
const offerError = ref('');
const previousBodyOverflow = ref('');

const offers = [
  {
    label: '5 vouchers for family',
    title: 'Family Voucher (5 times)',
    description: 'You can watch movies 5 times every time with your family.',
    price: 54.30,
    image: '',
    imageAlt: 'Offer 1',
  },
  {
    label: '3 vouchers',
    title: 'A lone wanderer Voucher (3 times)',
    description: 'You can watch movies 3 times as a lone wanderer.',
    price: 22.00,
    image: '',
    imageAlt: 'Offer 2',
  },
  {
    label: '3 vouchers for 3 friends',
    title: 'Friends Voucher (3 times)',
    description: 'You can watch movies 3 times with your friends.',
    price: 15.00,
    image: '',
    imageAlt: 'Offer 3',
  },
  {
    label: '5 vouchers for 32 students',
    title: 'School Voucher (up for 32 students)',
    description: 'For teachers, it is a great way to reward your students for their hard work and dedication.',
    price: 60.00,
    image: '',
    imageAlt: 'Offer 4',
  },
  {
    label: 'Gift Cards',
    title: '10€ Gift Card',
    description: 'For people, who wants to have fun together with their loved ones, this is a great way to enjoy a movie night.',
    price: 10.00,
    image: '',
    imageAlt: 'Offer 5',
  },
  {
    label: 'Gift Cards',
    title: '20€ Gift Card',
    description: 'For people, who wants to have fun together with their loved ones, this is a great way to enjoy a movie night.',
    price: 20.00,
    image: '',
    imageAlt: 'Offer 5',
  },
  {
    label: 'Gift Cards',
    title: '50€ Gift Card',
    description: 'For people, who wants to have fun together with their loved ones, this is a great way to enjoy a movie night.',
    price: 50.00,
    image: '',
    imageAlt: 'Offer 5',
  },
];

function goToOffers() {
  document.getElementById('vouchers-offers')?.scrollIntoView({ behavior: 'smooth' });
}

function proceedToCheckout(offer) {
  emit('checkout', {
    type: 'voucher',
    voucher: offer,
  });
}

function startOfferCreate() {
  selectedOffer.value = null;
  offerForm.value = { label: 'Seasonal offer', title: '', description: '', price: '', image: '' };
  offerError.value = '';
  creatingOffer.value = true;
  editingOffer.value = true;
  previousBodyOverflow.value = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

function startOfferEdit(offer) {
  selectedOffer.value = offer;
  offerForm.value = {
    label: offer.label,
    title: offer.title,
    description: offer.description,
    price: offer.price,
    image: offer.image ?? '',
  };
  offerError.value = '';
  creatingOffer.value = false;
  editingOffer.value = true;
  previousBodyOverflow.value = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

function closeOfferEditor() {
  editingOffer.value = false;
  creatingOffer.value = false;
  offerForm.value = null;
  selectedOffer.value = null;
  offerError.value = '';
  document.body.style.overflow = previousBodyOverflow.value;
}

async function saveOffer() {
  if (!offerForm.value || savingOffer.value || uploadingImage.value) return;
  savingOffer.value = true;
  offerError.value = '';
  try {
    const changes = {
      label: offerForm.value.label.trim(),
      title: offerForm.value.title.trim(),
      description: offerForm.value.description.trim(),
      price: Number(offerForm.value.price),
      image: offerForm.value.image.trim(),
    };
    if (creatingOffer.value) {
      seasonalOffers.value = [...seasonalOffers.value, await createVoucherOffer(changes)];
    } else {
      const updatedOffer = await updateVoucherOffer(selectedOffer.value.id, changes);
      seasonalOffers.value = seasonalOffers.value.map(offer => offer.id === updatedOffer.id ? updatedOffer : offer);
    }
    closeOfferEditor();
  } catch (error) {
    offerError.value = error instanceof Error ? error.message : 'Could not save voucher offer.';
  } finally {
    savingOffer.value = false;
  }
}

async function removeOffer(offer) {
  if (savingOffer.value || deletingOffer.value || uploadingImage.value) return;
  if (!window.confirm(`Delete "${offer.title}"?`)) return;
  deletingOffer.value = true;
  offerError.value = '';
  try {
    await deleteVoucherOffer(offer.id);
    seasonalOffers.value = seasonalOffers.value.filter(entry => entry.id !== offer.id);
    if (selectedOffer.value?.id === offer.id) closeOfferEditor();
  } catch (error) {
    offerError.value = error instanceof Error ? error.message : 'Could not delete voucher offer.';
  } finally {
    deletingOffer.value = false;
  }
}

async function uploadImage(event) {
  const input = event.target;
  const file = input.files?.[0];
  input.value = '';
  if (!file || !offerForm.value || uploadingImage.value) return;
  uploadingImage.value = true;
  offerError.value = '';
  try {
    const uploaded = await uploadVoucherImage(file);
    if (offerForm.value) offerForm.value.image = uploaded.image;
  } catch (error) {
    offerError.value = error instanceof Error ? error.message : 'Could not upload voucher image.';
  } finally {
    uploadingImage.value = false;
  }
}

onMounted(async () => {
  try {
    seasonalOffers.value = await getVoucherOffers();
  } catch (error) {
    offersError.value = error instanceof Error ? error.message : 'Could not load seasonal voucher offers.';
  } finally {
    loadingOffers.value = false;
  }
});

onUnmounted(() => {
  if (editingOffer.value) document.body.style.overflow = previousBodyOverflow.value;
});
</script>

<template>
  <section class="hero vouchers-hero" aria-label="Vouchers banner">
    <div
      class="hero-background"
      :style="{ backgroundImage: `url('${banner}')` }"
    ></div>
    <div class="hero-copy">
      <Tag value="Great Gifts!" severity="secondary" />
      <h2 class="voucher-title">More movies!</h2>
      <h2 class="voucher-title">More memories!</h2>
      <h2 class="voucher-title">More happiness!</h2>
      <p>All vouchers for families, your birthday parties, for special holidays only in Bradar Cinema!</p>
      <Button type="button" class="vouchers-button" label="SEE OFFERS" icon="pi pi-arrow-down" @click="goToOffers" />
    </div>
  </section>
  <section id="vouchers-offers" class="vouchers-offers" aria-labelledby="vouchers-offers-title">
    <h2 id="vouchers-offers-title" class="main-overlay-title">Special Vouchers and Gift Cards!</h2>
    <div class="vouchers-offers-grid">
      <article v-for="(offer, index) in offers" :key="`${offer.title}-${index}`" class="vouchers-offer-card">
        <div class="vouchers-offer-image">
          <img v-if="offer.image" :src="offer.image" :alt="offer.imageAlt" />
          <div v-else class="vouchers-offer-image-placeholder" aria-hidden="true">
            <i class="pi pi-image"></i>
            <span>Add image</span>
          </div>
          <span class="vouchers-offer-label">{{ offer.label }}</span>
        </div>
        <div class="vouchers-offer-copy">
          <h3>{{ offer.title }}</h3>
          <p>{{ offer.description }}</p>
          <h3 class="vouchers-offer-price">{{ offer.price ? `€${offer.price.toFixed(2)}` : 'Contact us for price' }}</h3>
          <button
            type="button"
            class="showtime vouchers-offer-checkout"
            @click="proceedToCheckout(offer)"
          >
            Proceed to Checkout
          </button>
        </div>
      </article>
    </div>
  </section>
  <section class="vouchers-offers seasonal-vouchers" aria-labelledby="seasonal-vouchers-title">
    <div class="seasonal-vouchers-heading">
      <h2 id="seasonal-vouchers-title">Seasonal &amp; Holiday Vouchers</h2>
      <button v-if="canEditVouchers" type="button" class="edit-movie-button add-voucher-button" @click="startOfferCreate">
        + Add voucher
      </button>
    </div>
    <p v-if="offersError" class="vouchers-offers-error" role="alert">{{ offersError }}</p>
    <p v-else-if="loadingOffers" class="vouchers-offers-status" role="status">Loading seasonal vouchers…</p>
    <p v-else-if="!seasonalOffers.length" class="vouchers-offers-status">No seasonal vouchers yet.</p>
    <div v-else class="vouchers-offers-grid">
      <article v-for="offer in seasonalOffers" :key="offer.id" class="vouchers-offer-card">
        <div class="vouchers-offer-image">
          <img v-if="offer.image" :src="getAssetUrl(offer.image)" :alt="offer.title" />
          <div v-else class="vouchers-offer-image-placeholder" aria-hidden="true">
            <i class="pi pi-image"></i>
            <span>Add image</span>
          </div>
          <span class="vouchers-offer-label">{{ offer.label }}</span>
        </div>
        <div class="vouchers-offer-copy">
          <h3>{{ offer.title }}</h3>
          <p>{{ offer.description }}</p>
          <h3 class="vouchers-offer-price">{{ `€${Number(offer.price).toFixed(2)}` }}</h3>
          <button type="button" class="showtime vouchers-offer-checkout" @click="proceedToCheckout(offer)">
            Proceed to Checkout
          </button>
          <div v-if="canEditVouchers" class="seasonal-voucher-actions">
            <button type="button" class="edit-movie-button" @click="startOfferEdit(offer)">Edit</button>
          </div>
        </div>
      </article>
    </div>
  </section>
  <div v-if="canEditVouchers && editingOffer" class="voucher-editor-backdrop" @click.self="closeOfferEditor">
    <form class="voucher-editor" role="dialog" aria-modal="true" :aria-label="creatingOffer ? 'Add seasonal voucher' : 'Edit seasonal voucher'" @submit.prevent="saveOffer">
      <button class="voucher-editor-close" type="button" aria-label="Close editor" @click="closeOfferEditor">×</button>
      <h2>{{ creatingOffer ? 'Add seasonal voucher' : 'Edit seasonal voucher' }}</h2>
      <div class="voucher-editor-fields">
        <label>Category / label<input v-model="offerForm.label" required maxlength="160" placeholder="e.g. Christmas offer" /></label>
        <label>Title<input v-model="offerForm.title" required maxlength="160" /></label>
        <label class="voucher-editor-full-width">Description<textarea v-model="offerForm.description" required maxlength="5000" rows="4"></textarea></label>
        <label>Price (€)<input v-model.number="offerForm.price" type="number" min="0.01" step="0.01" required /></label>
        <label class="voucher-editor-full-width">Image URL<input v-model="offerForm.image" maxlength="500" placeholder="Optional image URL" /></label>
        <div class="voucher-image-upload voucher-editor-full-width">
          <span>Voucher image</span>
          <div class="voucher-image-upload-controls">
            <img v-if="offerForm.image" :src="getAssetUrl(offerForm.image)" alt="Voucher preview" />
            <div v-else class="voucher-image-upload-placeholder">Image preview</div>
            <input ref="imageFileInput" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" @change="uploadImage" />
            <button class="details-button" type="button" :disabled="uploadingImage || savingOffer" @click="imageFileInput?.click()">
              {{ uploadingImage ? 'Uploading…' : 'Browse file' }}
            </button>
            <span class="voucher-editor-hint">JPEG, PNG, or WebP. Maximum 5 MB.</span>
          </div>
        </div>
      </div>
      <p v-if="offerError" class="edit-error" role="alert">{{ offerError }}</p>
      <div class="edit-actions">
        <button v-if="!creatingOffer" class="delete-movie-button" type="button" :disabled="savingOffer || deletingOffer || uploadingImage" @click="removeOffer(selectedOffer)">
          {{ deletingOffer ? 'Deleting…' : 'Delete voucher' }}
        </button>
        <button class="details-button" type="button" :disabled="savingOffer || deletingOffer || uploadingImage" @click="closeOfferEditor">Cancel</button>
        <button class="showtime" type="submit" :disabled="savingOffer || deletingOffer || uploadingImage">
          {{ uploadingImage ? 'Uploading…' : savingOffer ? 'Saving…' : creatingOffer ? 'Add voucher' : 'Save changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
