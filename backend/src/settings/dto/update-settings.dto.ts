import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @IsOptional()
  shopAddress?: string;

  @IsString()
  @IsOptional()
  shopPhone?: string;

  @IsString()
  @IsOptional()
  shopEmail?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  defaultTaxRate?: number;

  @IsString()
  @IsOptional()
  invoicePrefix?: string;
}
