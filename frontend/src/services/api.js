const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export async function getMovies() {
  const response = await fetch(`${API_URL}/movies`);
  if (!response.ok) throw new Error('Could not load movies');
  return response.json();
}
