import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly movies: MoviesService) {}

  @Get()
  findAll() { return this.movies.findAll(); }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.movies.findOne(id);
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }
}
