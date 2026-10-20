const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export function getAssetUrl(path) {
  return path?.startsWith('/uploads/') ? `${API_URL}${path}` : path;
}

export async function getMovies() {
  const response = await fetch(`${API_URL}/movies`);
  if (!response.ok) throw new Error('Could not load movies');
  return response.json();
}

export async function updateMovie(id, changes) {
  const response = await fetch(`${API_URL}/movies/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not save movie changes');
  }
  return response.json();
}

export async function createMovie(movie) {
  const response = await fetch(`${API_URL}/movies/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not create movie');
  }
  return response.json();
}

export async function deleteMovie(id) {
  const response = await fetch(`${API_URL}/movies/${id}`, {method: 'DELETE'});
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not delete movie');
  }
  return response.json();
}

export async function uploadMoviePoster(file) {
  const formData = new FormData();
  formData.append('poster', file);
  const response = await fetch(`${API_URL}/movies/poster`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not upload poster');
  }
  return response.json();
}

export async function getScreeningSeats(screeningId) {
  const response = await fetch(`${API_URL}/movies/screenings/${screeningId}/seats`, {cache: 'no-store'});
  if (!response.ok) {
    throw new Error('Could not load screning seats')
  }
  return response.json();
}

export async function updateScreeningSeats(screeningId, blockedSeats) {
  const response = await fetch(`${API_URL}/movies/screenings/${screeningId}/seats`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockedSeats }),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not update screening seats');
  }
  return response.json();
}

export async function getBanners() {
const response = await fetch(`${API_URL}/banners`);
  if (!response.ok) {
    throw new Error('Could not load banners');
  }
  return response.json();
}

export async function updateBanner(id, changes) {
  const response = await fetch(`${API_URL}/banners/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not save banner changes');
  }
  return response.json();
}

export async function createBanner(banner) {
  const response = await fetch(`${API_URL}/banners/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(banner),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not create banner');
  }
  return response.json();
}

export async function deleteBanner(id) {
  const response = await fetch(`${API_URL}/banners/${id}`, {method: 'DELETE'});
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not delete banner');
  }
  return response.json();
}

export async function uploadBannerImage(file) {
  const formData = new FormData();
  formData.append('banner', file);
  const response = await fetch(`${API_URL}/banners/upload`, {method: 'POST', body: formData});
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not upload banner image');
  }
  return response.json();
}