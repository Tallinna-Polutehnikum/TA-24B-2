import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { EditingEnabledGuard } from '../common/guards/editing-enabled.guard';
import { VouchersService } from './vouchers.service';

const uploadDirectory = join(process.cwd(), 'uploads', 'vouchers');
const imageExtensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

mkdirSync(uploadDirectory, { recursive: true });

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchers: VouchersService) {}

  @Get()
  findAll() {
    return this.vouchers.findAll();
  }

  @Post()
  @UseGuards(EditingEnabledGuard)
  create(@Body() input: unknown) {
    return this.vouchers.create(input);
  }

  @Patch(':id')
  @UseGuards(EditingEnabledGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() input: unknown) {
    return this.vouchers.update(id, input);
  }

  @Delete(':id')
  @UseGuards(EditingEnabledGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vouchers.delete(id);
  }

  @Post('upload')
  @UseGuards(EditingEnabledGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: uploadDirectory,
      filename: (_request, file, callback) => {
        callback(null, `${randomUUID()}${imageExtensions[file.mimetype] ?? extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      if (!imageExtensions[file.mimetype]) {
        return callback(new BadRequestException('Voucher image must be a JPEG, PNG, or WebP image.'), false);
      }
      callback(null, true);
    },
  }))
  uploadImage(@UploadedFile() file: { filename: string } | undefined) {
    if (!file) throw new BadRequestException('Choose a voucher image to upload.');
    return { image: `/uploads/vouchers/${file.filename}` };
  }
}
