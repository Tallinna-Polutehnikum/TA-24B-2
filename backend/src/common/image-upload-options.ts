import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const allowedTypes: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function imageUploadOptions(folder: string): MulterOptions {
  const destination = join(process.cwd(), 'uploads', folder);
  mkdirSync(destination, { recursive: true });

  return {
    storage: diskStorage({
      destination,
      filename: (_request, file, callback) => {
        callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      const extensions = allowedTypes[file.mimetype];
      const extension = extname(file.originalname).toLowerCase();

      if (!extensions?.includes(extension)) {
        return callback(new BadRequestException('Only JPG, PNG and WEBP images are allowed'), false);
      }

      callback(null, true);
    },
  };
}
