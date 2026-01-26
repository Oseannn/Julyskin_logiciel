import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  sellingPrice: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  purchasePrice: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  alertThreshold?: number;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
