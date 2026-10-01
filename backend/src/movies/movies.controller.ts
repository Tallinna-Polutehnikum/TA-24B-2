import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MovieInput, MoviesService } from './movies.service';

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

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() input: MovieInput) {
    return this.movies.updateGeneratedMovie(id, input);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movies.deleteGeneratedMovie(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.movies.findOne(id);
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }
}
