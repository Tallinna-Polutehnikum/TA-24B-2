<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import './Vouchers.css';
import { createVoucherOffer, deleteVoucherOffer, getAssetUrl, getBanners, getVoucherOffers, updateVoucherOffer, uploadVoucherImage } from './services/api.js';
import banner from './assets/v-banners/vbanner1.png';

const router = useRouter();
const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['checkout']);
const canEditVouchers = import.meta.env.DEV;
const canEditBanners = import.meta.env.DEV;
const seasonalOffers = ref([]);
const loadingOffers = ref(true);
const offersError = ref('');
const currentOfferImages = ref({});
const currentOfferImageError = ref('');
const editingCurrentOffer = ref(null);
const currentOfferImage = ref('');
const savingCurrentOfferImage = ref(false);
const currentOfferImageInput = ref(null);
const voucherBanners = ref([]);
const activeBannerIndex = ref(0);
const bannerLoadError = ref('');
const editingBanner = ref(false);
const savingBanner = ref(false);
const bannerForm = ref(null);
const bannerError = ref('');
const voucherBannerText = ref({
  firstTitle: 'More movies!',
  secondTitle: 'More memories!',
  thirdTitle: 'More happiness!',
  subtitle: 'All vouchers for families, your birthday parties, for special holidays only in Bradar Cinema!',
});
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
const bannerSlideGradients = [
  'linear-gradient(90deg, rgba(0, 0, 0, .9), rgba(38, 91, 174, .38))',
  'linear-gradient(90deg, rgba(0, 0, 0, .9), rgba(164, 52, 48, .4))',
  'linear-gradient(90deg, rgba(0, 0, 0, .9), rgba(36, 126, 91, .4))',
  'linear-gradient(90deg, rgba(0, 0, 0, .9), rgba(133, 72, 163, .4))',
];
let bannerSlideTimer;

function getBannerGradient(index) {
  return bannerSlideGradients[index % bannerSlideGradients.length];
}

function nextBanner(step = 1) {
  if (!voucherBanners.value.length) return;
  activeBannerIndex.value = (activeBannerIndex.value + step + voucherBanners.value.length) % voucherBanners.value.length;
}

function stepBanner(step) {
  nextBanner(step);
  restartBannerTimer();
}

function goToBanner(index) {
  activeBannerIndex.value = index;
  restartBannerTimer();
}

function restartBannerTimer() {
  window.clearInterval(bannerSlideTimer);
  if (voucherBanners.value.length > 1) {
    bannerSlideTimer = window.setInterval(() => nextBanner(), 5500);
  }
}

function startBannerEdit() {
  if (!canEditBanners || !voucherBanners.value.length) return;
  window.clearInterval(bannerSlideTimer);
  bannerForm.value = { ...voucherBannerText.value };
  bannerError.value = '';
  editingBanner.value = true;
  previousBodyOverflow.value = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

function closeBannerEditor() {
  editingBanner.value = false;
  bannerForm.value = null;
  bannerError.value = '';
  document.body.style.overflow = previousBodyOverflow.value;
  restartBannerTimer();
}

async function saveBanner() {
  if (!bannerForm.value || savingBanner.value) return;
  savingBanner.value = true;
  bannerError.value = '';
  try {
    const updatedText = {
      firstTitle: bannerForm.value.firstTitle.trim(),
      secondTitle: bannerForm.value.secondTitle.trim(),
      thirdTitle: bannerForm.value.thirdTitle.trim(),
      subtitle: bannerForm.value.subtitle.trim(),
    };
    localStorage.setItem('bradar-vouchers-banner-text', JSON.stringify(updatedText));
    voucherBannerText.value = updatedText;
    closeBannerEditor();
  } catch (error) {
    bannerError.value = error instanceof Error ? error.message : 'Could not save banner.';
  } finally {
    savingBanner.value = false;
  }
}

const offers = [
  {
    imageKey: 'family-voucher',
    label: '5 vouchers for family',
    title: 'Family Voucher (5 times)',
    description: 'You can watch movies 5 times every time with your family.',
    price: 54.30,
    image: '',
    imageAlt: 'Offer 1',
  },
  {
    imageKey: 'solo-voucher',
    label: '3 vouchers',
    title: 'A lone wanderer Voucher (3 times)',
    description: 'You can watch movies 3 times as a lone wanderer.',
    price: 22.00,
    image: '',
    imageAlt: 'Offer 2',
  },
  {
    imageKey: 'friends-voucher',
    label: '3 vouchers for 3 friends',
    title: 'Friends Voucher (3 times)',
    description: 'You can watch movies 3 times with your friends.',
    price: 15.00,
    image: '',
    imageAlt: 'Offer 3',
  },
  {
    imageKey: 'school-voucher',
    label: '5 vouchers for 32 students',
    title: 'School Voucher (up for 32 students)',
    description: 'For teachers, it is a great way to reward your students for their hard work and dedication.',
    price: 60.00,
    image: '',
    imageAlt: 'Offer 4',
  },
  {
    imageKey: 'gift-card-10',
    label: 'Gift Cards',
    title: '10€ Gift Card',
    description: 'For people, who wants to have fun together with their loved ones, this is a great way to enjoy a movie night.',
    price: 10.00,
    image: '',
    imageAlt: 'Offer 5',
  },
  {
    imageKey: 'gift-card-20',
    label: 'Gift Cards',
    title: '20€ Gift Card',
    description: 'For people, who wants to have fun together with their loved ones, this is a great way to enjoy a movie night.',
    price: 20.00,
    image: '',
    imageAlt: 'Offer 5',
  },
  {
    imageKey: 'gift-card-50',
    label: 'Gift Cards',
    title: '50€ Gift Card',
    description: 'For people, who wants to have fun together with their loved ones, this is a great way to enjoy a movie night.',
    price: 50.00,
    image: '',
    imageAlt: 'Offer 5',
  },
];

function matchesSearch(offer) {
  const query = props.searchQuery.trim().toLocaleLowerCase();
  return !query || [offer.label, offer.title, offer.description, offer.price]
    .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
}

const filteredOffers = computed(() => offers
  .map(offer => ({ ...offer, image: currentOfferImages.value[offer.imageKey] ?? offer.image }))
  .filter(matchesSearch));
const filteredSeasonalOffers = computed(() => seasonalOffers.value.filter(matchesSearch));

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

function startCurrentOfferImageEdit(offer) {
  editingCurrentOffer.value = offer;
  currentOfferImage.value = offer.image ?? '';
  currentOfferImageError.value = '';
  previousBodyOverflow.value = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

function closeCurrentOfferImageEdit() {
  editingCurrentOffer.value = null;
  currentOfferImage.value = '';
  currentOfferImageError.value = '';
  document.body.style.overflow = previousBodyOverflow.value;
}

async function uploadCurrentOfferImage(event) {
  const input = event.target;
  const file = input.files?.[0];
  input.value = '';
  if (!file || !editingCurrentOffer.value || uploadingImage.value || savingCurrentOfferImage.value) return;
  uploadingImage.value = true;
  currentOfferImageError.value = '';
  try {
    const uploaded = await uploadVoucherImage(file);
    currentOfferImage.value = uploaded.image;
  } catch (error) {
    currentOfferImageError.value = error instanceof Error ? error.message : 'Could not upload voucher image.';
  } finally {
    uploadingImage.value = false;
  }
}

function saveCurrentOfferImage() {
  if (!editingCurrentOffer.value || savingCurrentOfferImage.value || uploadingImage.value) return;
  savingCurrentOfferImage.value = true;
  currentOfferImageError.value = '';
  try {
    const updatedImages = {
      ...currentOfferImages.value,
      [editingCurrentOffer.value.imageKey]: currentOfferImage.value.trim(),
    };
    localStorage.setItem('bradar-current-voucher-images', JSON.stringify(updatedImages));
    currentOfferImages.value = updatedImages;
    closeCurrentOfferImageEdit();
  } catch (error) {
    currentOfferImageError.value = error instanceof Error ? error.message : 'Could not save voucher image.';
  } finally {
    savingCurrentOfferImage.value = false;
  }
}

function loadCurrentOfferImages() {
  try {
    const savedImages = localStorage.getItem('bradar-current-voucher-images');
    if (!savedImages) return;
    const parsedImages = JSON.parse(savedImages);
    if (!parsedImages || typeof parsedImages !== 'object' || Array.isArray(parsedImages)
      || Object.values(parsedImages).some(image => typeof image !== 'string')) {
      throw new Error('Saved voucher images are invalid.');
    }
    currentOfferImages.value = parsedImages;
  } catch (error) {
    currentOfferImageError.value = error instanceof Error ? error.message : 'Could not load voucher images.';
  }
}

onMounted(async () => {
  loadCurrentOfferImages();
  try {
    const savedText = localStorage.getItem('bradar-vouchers-banner-text');
    if (savedText) {
      const parsedText = JSON.parse(savedText);
      if (['firstTitle', 'secondTitle', 'thirdTitle', 'subtitle'].every(field => typeof parsedText[field] === 'string')) {
        voucherBannerText.value = parsedText;
      } else {
        throw new Error('Saved voucher banner text is invalid.');
      }
    }
  } catch (error) {
    bannerLoadError.value = error instanceof Error ? error.message : 'Could not load voucher banner text.';
  }

  await Promise.all([
    getVoucherOffers()
      .then(loadedOffers => { seasonalOffers.value = loadedOffers; })
      .catch(error => { offersError.value = error instanceof Error ? error.message : 'Could not load seasonal voucher offers.'; })
      .finally(() => { loadingOffers.value = false; }),
    getBanners()
      .then(loadedBanners => {
        voucherBanners.value = loadedBanners;
        restartBannerTimer();
      })
      .catch(error => { bannerLoadError.value = error instanceof Error ? error.message : 'Could not load banners.'; }),
  ]);
});

onUnmounted(() => {
  window.clearInterval(bannerSlideTimer);
  if (editingOffer.value || editingBanner.value || editingCurrentOffer.value) {
    document.body.style.overflow = previousBodyOverflow.value;
  }
});
</script>

<template>
  <section class="hero vouchers-hero" aria-label="Vouchers banner">
    <Transition name="slide-fade">
      <div
        :key="activeBannerIndex"
        class="hero-background"
        :style="{ backgroundImage: `${getBannerGradient(activeBannerIndex)}, url('${banner}')` }"
      ></div>
    </Transition>
    <div class="hero-copy">
      <Tag value="Great Gifts!" severity="secondary" />
      <h2 class="voucher-title">{{ voucherBannerText.firstTitle }}</h2>
      <h2 class="voucher-title">{{ voucherBannerText.secondTitle }}</h2>
      <h2 class="voucher-title">{{ voucherBannerText.thirdTitle }}</h2>
      <p>{{ voucherBannerText.subtitle }}</p>
      <Button type="button" class="vouchers-button" label="SEE OFFERS" icon="pi pi-arrow-down" @click="goToOffers" />
    </div>
    <div v-if="bannerLoadError" class="vouchers-banner-error" role="alert">{{ bannerLoadError }}</div>
    <div v-if="voucherBanners.length" class="banner-controls" aria-label="Banner controls">
      <button type="button" aria-label="Previous banner" @click="stepBanner(-1)"><i class="pi pi-chevron-left" aria-hidden="true"></i></button>
      <button
        v-for="(_, index) in voucherBanners"
        :key="index"
        type="button"
        class="banner-dot"
        :class="{ active: activeBannerIndex === index }"
        :aria-label="`Show banner ${index + 1}`"
        :aria-current="activeBannerIndex === index ? 'true' : undefined"
        @click="goToBanner(index)"
      ></button>
      <button type="button" aria-label="Next banner" @click="stepBanner(1)"><i class="pi pi-chevron-right" aria-hidden="true"></i></button>
      <button v-if="canEditBanners" class="banner-edit-button" type="button" @click="startBannerEdit">Edit banner</button>
    </div>
  </section>
  <section id="vouchers-offers" class="vouchers-offers" aria-labelledby="vouchers-offers-title">
    <h2 id="vouchers-offers-title" class="main-overlay-title">Special Vouchers and Gift Cards!</h2>
    <p v-if="currentOfferImageError && !editingCurrentOffer" class="vouchers-offers-error" role="alert">
      {{ currentOfferImageError }}
    </p>
    <div v-if="filteredOffers.length" class="vouchers-offers-grid">
      <article v-for="(offer, index) in filteredOffers" :key="`${offer.title}-${index}`" class="vouchers-offer-card">
        <div class="vouchers-offer-image">
          <img v-if="offer.image" :src="getAssetUrl(offer.image)" :alt="offer.imageAlt" />
          <div v-else class="vouchers-offer-image-placeholder" aria-hidden="true">
            <i class="pi pi-image"></i>
            <span>Add image</span>
          </div>
          <span class="vouchers-offer-label">{{ offer.label }}</span>
          <button
            v-if="canEditVouchers"
            type="button"
            class="vouchers-offer-image-edit"
            :aria-label="`Edit image for ${offer.title}`"
            @click="startCurrentOfferImageEdit(offer)"
          >
            Edit image
          </button>
        </div>
        <div class="vouchers-offer-copy">
          <h3>{{ offer.title }}</h3>
          <p>{{ offer.description }}</p>
          <h3 style="padding-top: 20px;", class="vouchers-offer-price">{{ offer.price ? `€${offer.price.toFixed(2)}` : 'Contact us for price' }}</h3>
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
  <div v-if="canEditVouchers && editingCurrentOffer" class="voucher-editor-backdrop" @click.self="closeCurrentOfferImageEdit">
    <form
      class="voucher-editor voucher-image-editor"
      role="dialog"
      aria-modal="true"
      :aria-label="`Edit image for ${editingCurrentOffer.title}`"
      @submit.prevent="saveCurrentOfferImage"
    >
      <button class="voucher-editor-close" type="button" aria-label="Close image editor" @click="closeCurrentOfferImageEdit">×</button>
      <h2>Edit voucher image</h2>
      <p class="voucher-image-editor-title">{{ editingCurrentOffer.title }}</p>
      <div class="voucher-image-editor-preview">
        <img v-if="currentOfferImage" :src="getAssetUrl(currentOfferImage)" :alt="editingCurrentOffer.title" />
        <span v-else>Choose an image to preview it here.</span>
      </div>
      <input
        ref="currentOfferImageInput"
        class="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        @change="uploadCurrentOfferImage"
      />
      <p class="voucher-editor-hint">JPEG, PNG, or WebP. Maximum 5 MB.</p>
      <p v-if="currentOfferImageError" class="edit-error" role="alert">{{ currentOfferImageError }}</p>
      <div class="edit-actions">
        <button
          class="details-button"
          type="button"
          :disabled="uploadingImage || savingCurrentOfferImage"
          @click="currentOfferImageInput?.click()"
        >
          {{ uploadingImage ? 'Uploading…' : 'Choose image' }}
        </button>
        <button class="details-button" type="button" :disabled="uploadingImage || savingCurrentOfferImage" @click="closeCurrentOfferImageEdit">
          Cancel
        </button>
        <button class="showtime" type="submit" :disabled="!currentOfferImage || uploadingImage || savingCurrentOfferImage">
          {{ savingCurrentOfferImage ? 'Saving…' : 'Save image' }}
        </button>
      </div>
    </form>
  </div>
  <section class="vouchers-offers seasonal-vouchers" aria-labelledby="seasonal-vouchers-title">
    <div class="seasonal-vouchers-heading">
      <h2 id="seasonal-vouchers-title">Seasonal &amp; Holiday Vouchers</h2>
      <button v-if="canEditVouchers" type="button" class="edit-movie-button add-voucher-button" @click="startOfferCreate">
        + Add voucher
      </button>
    </div>
    <p v-if="offersError" class="vouchers-offers-error" role="alert">{{ offersError }}</p>
    <p v-else-if="loadingOffers" class="vouchers-offers-status" role="status">Loading seasonal vouchers…</p>
    <p v-else-if="!seasonalOffers.length && !searchQuery.trim()" class="vouchers-offers-status">No seasonal vouchers yet.</p>
    <p v-else-if="searchQuery.trim() && !filteredSeasonalOffers.length && filteredOffers.length" class="vouchers-offers-status">No seasonal vouchers match your search.</p>
    <div v-else-if="filteredSeasonalOffers.length" class="vouchers-offers-grid">
      <article v-for="offer in filteredSeasonalOffers" :key="offer.id" class="vouchers-offer-card">
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
  <p
    v-if="searchQuery.trim() && !filteredOffers.length && !filteredSeasonalOffers.length && !loadingOffers && !offersError"
    class="vouchers-offers-status"
    role="status"
  >
    No vouchers match your search.
  </p>
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
  <div v-if="canEditBanners && editingBanner" class="voucher-editor-backdrop" @click.self="closeBannerEditor">
    <form class="voucher-editor" role="dialog" aria-modal="true" aria-label="Edit banner" @submit.prevent="saveBanner">
      <button class="voucher-editor-close" type="button" aria-label="Close editor" @click="closeBannerEditor">×</button>
      <h2>Edit banner</h2>
      <div class="voucher-editor-fields">
        <label class="voucher-editor-full-width">First title<input v-model="bannerForm.firstTitle" required maxlength="160" /></label>
        <label class="voucher-editor-full-width">Second title<input v-model="bannerForm.secondTitle" required maxlength="160" /></label>
        <label class="voucher-editor-full-width">Third title<input v-model="bannerForm.thirdTitle" required maxlength="160" /></label>
        <label class="voucher-editor-full-width">Subtitle<textarea v-model="bannerForm.subtitle" maxlength="300" rows="3"></textarea></label>
      </div>
      <p v-if="bannerError" class="edit-error" role="alert">{{ bannerError }}</p>
      <div class="edit-actions">
        <button class="details-button" type="button" :disabled="savingBanner" @click="closeBannerEditor">Cancel</button>
        <button class="showtime" type="submit" :disabled="savingBanner">
          {{ savingBanner ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
