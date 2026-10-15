import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { MovieInput, MovieUpdateInput, MoviesService } from './movies.service';

const uploadDirectory = join(__dirname, '..', '..', 'uploads');
const imageExtensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

mkdirSync(uploadDirectory, { recursive: true });

@Controller('movies')
export class MoviesController {
  constructor(private readonly movies: MoviesService) {}

  @Get()
  findAll() { return this.movies.findAll(); }

  @Post('regenerate')
  regenerate() {
    return this.movies.seedGeneratedMovies(true);
  }

  @Post()
  create(@Body() input: MovieInput) {
    return this.movies.createGeneratedMovie(input);
  }

  @Post('manual')
  createManual(@Body() input: MovieUpdateInput) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Movie editing is only available outside production');
    }
    return this.movies.createManualMovie(input);
  }

  @Post('poster')
  @UseInterceptors(FileInterceptor('poster', {
    storage: diskStorage({
      destination: uploadDirectory,
      filename: (_request, file, callback) => {
        callback(null, `${randomUUID()}${imageExtensions[file.mimetype] ?? extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      if (process.env.NODE_ENV === 'production') {
        return callback(new ForbiddenException('Movie editing is only available outside production'), false);
      }
      if (!imageExtensions[file.mimetype]) {
        return callback(new BadRequestException('Poster must be a JPEG, PNG, or WebP image.'), false);
      }
      callback(null, true);
    },
  }))
  uploadPoster(@UploadedFile() file: { filename: string } | undefined) {
    if (!file) throw new BadRequestException('Choose a poster image to upload.');
    return { posterUrl: `/uploads/${file.filename}` };
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() input: MovieUpdateInput) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Movie editing is only available outside production');
    }
    return this.movies.updateMovie(id, input);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Movie editing is only available outside production');
    }
    return this.movies.deleteMovie(id);
  }

  @Get('screenings/:id/seats')
  getScreeningSeats(@Param('id', ParseIntPipe) id: number) {
    return this.movies.getScreeningSeats(id);
  }

  @Patch('screenings/:id/seats')
  setScreeningSeats(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: unknown
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Seat editing is only available outside production');
    }

    return this.movies.setScreeningSeats(id, input);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.movies.findOne(id);
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }
}
