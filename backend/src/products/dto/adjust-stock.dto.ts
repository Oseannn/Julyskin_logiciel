import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustStockDto {
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
