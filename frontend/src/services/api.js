const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
