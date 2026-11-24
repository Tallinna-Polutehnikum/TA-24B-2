import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../common/image-upload-options';
import { EditingEnabledGuard } from '../common/guards/editing-enabled.guard';
import { BannerInputDto } from './dto/banner-input.dto';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.findOne(id);
  }

  @Post('manual')
  @UseGuards(EditingEnabledGuard)
  createManualBanner(@Body() input: BannerInputDto) {
    return this.bannersService.createManualBanner(input);
  }

  @Patch(':id')
  @UseGuards(EditingEnabledGuard)
  updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: BannerInputDto
  ) {
    return this.bannersService.updateBanner(id, input);
  }

  @Delete(':id')
  @UseGuards(EditingEnabledGuard)
  deleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.deleteBanner(id);
  }

  @Post('upload')
  @UseGuards(EditingEnabledGuard)
  @UseInterceptors(FileInterceptor('banner', imageUploadOptions('banners')))
  uploadBanner(
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Banner image is required');
    }

    return {image: `/uploads/banners/${file.filename}`};
  }
}