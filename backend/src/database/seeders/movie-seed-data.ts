import { faker } from '@faker-js/faker';
import { EntityManager } from '@mikro-orm/mysql';
import { CinemaBuilding } from '../../movies/cinema-building.entity';
import { Creator } from '../../movies/creator.entity';
import { MovieCreator } from '../../movies/movie-creator.entity';
import { Movie } from '../../movies/movie.entity';
import { MovieRating } from '../../movies/movie-rating.entity';
import { Screening } from '../../movies/screening.entity';

const cinemaLocations = [
  { name: 'InterPlex Cinema', city: 'Tokmachka', address: 'Deckadensa 26' },
  { name: 'Shaffer Cinema', city: 'Tokmachka', address: 'Fletcher 14' },
  { name: 'In Cinematico', city: 'Tokmachka', address: 'Corvus 113' },
  { name: 'Apollyon Cinema', city: 'Tokmachka', address: 'Sabra-Barenza 11' },
  { name: 'CinemaCubed', city: 'Tokmachka', address: 'Great Cinderolla 57' },
  { name: 'HowToCinema', city: 'Tokmachka', address: 'Havarenko 88' },
];

export class MovieSeedData {
  static async seedRelatedData(em: EntityManager, movies: Movie[], refreshExisting = true) {
    const buildings = await this.ensureCinemaBuildings(em);
    const creatorRoles = ['Director', 'Screenwriter', 'Producer'];

    for (const movie of movies) {
      const existingRating = await em.findOne(MovieRating, { movie });
      const ratingData = {
        score: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }),
        voteCount: faker.number.int({ min: 50, max: 50000 }),
      };

      if (existingRating && refreshExisting) {
        em.assign(existingRating, ratingData);
      } else if (!existingRating) {
        em.persist(em.create(MovieRating, { movie, ...ratingData }));
      }

      for (let creatorIndex = 0; creatorIndex < creatorRoles.length; creatorIndex += 1) {
        const seedKey = `faker-creator-movie-${movie.id}-${creatorIndex + 1}`;
        const existingCreator = await em.findOne(Creator, { seedKey });
        const creator = existingCreator
          ? refreshExisting
            ? em.assign(existingCreator, { name: faker.person.fullName() })
            : existingCreator
          : em.create(Creator, { seedKey, name: faker.person.fullName() });

        if (!existingCreator) em.persist(creator);

        const existingCredit = await em.findOne(MovieCreator, { movie, creator });
        if (existingCredit && refreshExisting) {
          existingCredit.role = creatorRoles[creatorIndex];
        } else if (!existingCredit) {
          em.persist(em.create(MovieCreator, { movie, creator, role: creatorRoles[creatorIndex] }));
        }
      }

      await this.replaceScreeningsForMovie(em, movie, buildings, refreshExisting);
    }

    await em.flush();
  }

  private static async ensureCinemaBuildings(em: EntityManager) {
    const buildings: CinemaBuilding[] = [];

    for (const [index, location] of cinemaLocations.entries()) {
      const seedKey = `kinoproject-cinema-v1-${index + 1}`;
      let building = await em.findOne(CinemaBuilding, { seedKey });

      if (!building) {
        building = await em.findOne(CinemaBuilding, { seedKey: `faker-building-v1-${index + 1}` });
        if (building) {
          em.assign(building, { ...location, hallCount: 6, seedKey });
        } else {
          building = em.create(CinemaBuilding, { ...location, hallCount: 6, seedKey });
          em.persist(building);
        }
      } else {
        building.hallCount = 6;
      }

      buildings.push(building);
    }

    await em.flush();
    return buildings;
  }

  static async seedScreenings(em: EntityManager, movies: Movie[]) {
    const buildings = await this.ensureCinemaBuildings(em);
    for (const movie of movies) {
      await this.replaceScreeningsForMovie(em, movie, buildings, false);
    }
    await em.flush();
  }

  private static hashString(value: string) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
    }
    return hash;
  }

  private static createSeededRandom(seed: number) {
    let state = seed || 1;
    return () => {
      state = (state * 16807) % 2147483647;
      return state / 2147483647;
    };
  }

  private static seededInt(random: () => number, min: number, max: number) {
    return Math.floor(random() * (max - min + 1)) + min;
  }

  private static addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private static startOfDay(date: Date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private static getRentalDates(movie: Movie) {
    const random = this.createSeededRandom(this.hashString(`rental-v2-${movie.id}-${movie.seedKey ?? movie.title}`));
    const today = this.startOfDay(new Date());
    const startOffsetDays = this.seededInt(random, -3, 3);
    const rentalLengthDays = this.seededInt(random, 7, 21);
    const rentalStart = this.addDays(today, startOffsetDays);
    const rentalEnd = this.addDays(rentalStart, rentalLengthDays - 1);
    const dates: Date[] = [];

    for (let date = new Date(rentalStart); date <= rentalEnd; date = this.addDays(date, 1)) {
      dates.push(new Date(date));
    }

    return { rentalStart, rentalEnd, dates };
  }

  private static buildScreeningTimes(movie: Movie) {
    let currentMinutes = 10 * 60;
    const lastStartMinutes = 22 * 60 + 30;
    const breakMinutes = 20;
    const times: number[] = [];

    while (currentMinutes <= lastStartMinutes) {
      times.push(currentMinutes);
      currentMinutes += movie.duration + breakMinutes;
    }

    return times;
  }

  private static async replaceScreeningsForMovie(em: EntityManager, movie: Movie, buildings: CinemaBuilding[], refreshExisting: boolean) {
    if (buildings.length === 0) return;

    const existingScreenings = await em.find(Screening, { movie });
    const generatedV5 = existingScreenings.filter((screening) => screening.seedKey?.startsWith(`faker-screening-v5-${movie.id}-`));

    for (const screening of existingScreenings) {
      if (
        screening.seedKey?.startsWith('faker-screening-v1-') ||
        screening.seedKey?.startsWith(`faker-screening-v2-${movie.id}-`) ||
        screening.seedKey?.startsWith(`faker-screening-v3-${movie.id}-`) ||
        screening.seedKey?.startsWith(`faker-screening-v4-${movie.id}-`) ||
        (refreshExisting && screening.seedKey?.startsWith(`faker-screening-v5-${movie.id}-`))
      ) {
        em.remove(screening);
      }
    }
    await em.flush();

    if (!refreshExisting && generatedV5.length > 0) return;

    const random = this.createSeededRandom(this.hashString(`cinemas-v4-${movie.id}-${movie.seedKey ?? movie.title}`));
    const cinemaCount = this.seededInt(random, 1, buildings.length);
    const shuffledBuildings = [...buildings];

    for (let index = shuffledBuildings.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffledBuildings[index], shuffledBuildings[swapIndex]] = [shuffledBuildings[swapIndex], shuffledBuildings[index]];
    }

    const selectedBuildings = shuffledBuildings.slice(0, cinemaCount);
    const { dates } = this.getRentalDates(movie);

    for (const building of selectedBuildings) {
      const hallCount = Math.max(1, building.hallCount);
      const occupiedScreenings = await em.find(Screening, { building }, { populate: ['movie'] });
      let hallIndex = movie.id + building.id;
      const startTimes = this.buildScreeningTimes(movie);
      let previousScreeningCount: number | null = null;

      for (const date of dates) {
        const dateKey = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
        const dailyRandom = this.createSeededRandom(this.hashString(`daily-screenings-v1-${movie.id}-${building.id}-${dateKey}`));
        const minDailyCount = Math.max(0, startTimes.length - 2);
        let dailyCount = this.seededInt(dailyRandom, minDailyCount, startTimes.length);

        if (previousScreeningCount === dailyCount && minDailyCount < startTimes.length) {
          dailyCount = minDailyCount + ((dailyCount - minDailyCount + 1) % (startTimes.length - minDailyCount + 1));
        }
        previousScreeningCount = dailyCount;

        const dailyStartTimes = [...startTimes];
        for (let index = dailyStartTimes.length - 1; index > 0; index -= 1) {
          const swapIndex = Math.floor(dailyRandom() * (index + 1));
          [dailyStartTimes[index], dailyStartTimes[swapIndex]] = [dailyStartTimes[swapIndex], dailyStartTimes[index]];
        }
        dailyStartTimes.length = dailyCount;

        for (const startMinutes of dailyStartTimes.sort((first, second) => first - second)) {
          let selectedHall: number | null = null;
          let selectedStart: Date | null = null;
          const lastStartMinutes = 22 * 60 + 30;

          for (let candidateMinutes = startMinutes; candidateMinutes <= lastStartMinutes; candidateMinutes += 10) {
            const candidateStart = new Date(date);
            candidateStart.setHours(Math.floor(candidateMinutes / 60), candidateMinutes % 60, 0, 0);

            for (let offset = 0; offset < hallCount; offset += 1) {
              const candidateHall = ((hallIndex + offset) % hallCount) + 1;
              const hasConflict = occupiedScreenings.some((screening) => screening.hallNumber === candidateHall && this.isScreeningConflict(candidateStart, movie.duration, screening.startsAt, screening.movie.duration));

              if (!hasConflict) {
                selectedHall = candidateHall;
                selectedStart = candidateStart;
                break;
              }
            }

            if (selectedHall !== null) break;
          }

          if (selectedHall === null || selectedStart === null) continue;

          const hallNumber = selectedHall;
          const startsAt: Date = selectedStart;
          const screeningDateKey = [
            startsAt.getFullYear(),
            String(startsAt.getMinutes()).padStart(2, '0'),
            String(startsAt.getHours()).padStart(2, '0'),
            String(startsAt.getDate()).padStart(2, '0'),
            String(startsAt.getMonth() + 1).padStart(2, '0'),
          ].join('');
          const seedKey = `faker-screening-v5-${movie.id}-${building.id}-${hallNumber}-${screeningDateKey}`;
          const screeningRandom = this.createSeededRandom(this.hashString(seedKey));
          const languages = ['English', 'Estonian', 'Russian'];
          const ticketPrice = (900 + this.seededInt(screeningRandom, 0, 200)) / 100;
          const screening = em.create(Screening, {
            seedKey,
            movie,
            building,
            hallNumber,
            startsAt,
            language: languages[this.seededInt(screeningRandom, 0, languages.length - 1)],
            ticketPrice,
          });

          em.persist(screening);
          occupiedScreenings.push(screening);
        }
      }
    }

    await em.flush();
  }

  private static isScreeningConflict(newStart: Date, newDuration: number, existingStart: Date, existingDuration: number): boolean {
    const breakMinutes = 20;
    const newEnd = newStart.getTime() + (newDuration + breakMinutes) * 60 * 1000;
    const existingEnd = existingStart.getTime() + (existingDuration + breakMinutes) * 60 * 1000;
    return newStart.getTime() < existingEnd && existingStart.getTime() < newEnd;
  }
}