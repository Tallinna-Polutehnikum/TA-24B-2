import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsDefined,
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateMovieDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/\S/)
  @MaxLength(160)
  title?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/\S/)
  @MaxLength(80)
  genre?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(1)
  duration?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/\S/)
  @MaxLength(5000)
  description?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(500)
  posterUrl?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(500)
  bannerUrl?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(500)
  trailerUrl?: string;
}

export class MovieUpdateDto extends CreateMovieDto {
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsObject()
  @ValidateNested()
  @Type(() => MovieRatingDto)
  rating?: MovieRatingDto | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MovieCreatorDto)
  creators?: MovieCreatorDto[];
}

export class MovieRatingDto {
  @IsDefined()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(10)
  score!: number;

  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  voteCount!: number;
}

export class MovieCreatorDto {
  @IsString()
  @Matches(/\S/)
  @MaxLength(160)
  name!: string;

  @IsString()
  @Matches(/\S/)
  @MaxLength(80)
  role!: string;
}
