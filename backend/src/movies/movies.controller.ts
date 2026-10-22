import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { EditingEnabledGuard } from '../common/guards/editing-enabled.guard';
import { MovieInput, MovieUpdateInput, MoviesService } from './movies.service';

const uploadDirectory = join(process.cwd(), 'uploads', 'movies');
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
  @UseGuards(EditingEnabledGuard)
  regenerate() {
    return this.movies.seedGeneratedMovies(true);
  }

  @Post()
  @UseGuards(EditingEnabledGuard)
  create(@Body() input: MovieInput) {
    return this.movies.createGeneratedMovie(input);
  }

  @Post('manual')
  @UseGuards(EditingEnabledGuard)
  createManual(@Body() input: MovieUpdateInput) {
    return this.movies.createManualMovie(input);
  }

  @Post('poster')
  @UseGuards(EditingEnabledGuard)
  @UseInterceptors(FileInterceptor('poster', {
    storage: diskStorage({
      destination: uploadDirectory,
      filename: (_request, file, callback) => {
        callback(null, `${randomUUID()}${imageExtensions[file.mimetype] ?? extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      if (!imageExtensions[file.mimetype]) {
        return callback(new BadRequestException('Poster must be a JPEG, PNG, or WebP image.'), false);
      }
      callback(null, true);
    },
  }))
  uploadPoster(@UploadedFile() file: { filename: string } | undefined) {
    if (!file) throw new BadRequestException('Choose a poster image to upload.');
    return { posterUrl: `/uploads/movies/${file.filename}` };
  }

  @Patch(':id')
  @UseGuards(EditingEnabledGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() input: MovieUpdateInput) {
    return this.movies.updateMovie(id, input);
  }

  @Delete(':id')
  @UseGuards(EditingEnabledGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movies.deleteMovie(id);
  }

  @Get('screenings/:id/seats')
  getScreeningSeats(@Param('id', ParseIntPipe) id: number) {
    return this.movies.getScreeningSeats(id);
  }

  @Patch('screenings/:id/seats')
  @UseGuards(EditingEnabledGuard)
  setScreeningSeats(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: unknown
  ) {
    return this.movies.setScreeningSeats(id, input);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.movies.findOne(id);
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }
}
