import http from 'k6/http';
import { check } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://host.docker.internal:3000';
const movieId = __ENV.MOVIE_ID;

if (!movieId) {
  throw new Error('Set MOVIE_ID to an existing movie ID');
}

export const options = {
  vus: Number(__ENV.VUS || 20),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const response = http.get(`${baseUrl}/movies/${movieId}/screenings`);

  check(response, {
    'GET screenings returns 200': (result) => result.status === 200,
  });
}
