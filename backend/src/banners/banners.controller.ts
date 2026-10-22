import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { EditingEnabledGuard } from '../common/guards/editing-enabled.guard';
import { BannersService } from './banners.service';

const uploadDirectory = join(process.cwd(), 'uploads', 'banners');
mkdirSync(uploadDirectory, { recursive: true });

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
  createManualBanner(@Body() input: unknown) {
    return this.bannersService.createManualBanner(input);
  }

  @Patch(':id')
  @UseGuards(EditingEnabledGuard)
  updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: unknown
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
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: diskStorage({
        destination: uploadDirectory,

        filename: (req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          callback(null, `${randomUUID()}${extension}`);
        }
      }),

      limits: {fileSize: 10 * 1024 * 1024},

      fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const valid = allowedTypes.includes(file.mimetype) && allowedExtensions.includes(extname(file.originalname).toLowerCase());

        if (!valid) {
          return callback(new BadRequestException('Only JPG, PNG and WEBP images are allowed'), false);
        }

        callback(null, true);
      }
    })
  )
  uploadBanner(
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Banner image is required');
    }

    return {image: `/uploads/banners/${file.filename}`};
  }
}