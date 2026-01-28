import { IsUUID, IsArray, IsOptional, IsString, IsNumber, IsInt, ValidateNested, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';

class InvoiceItemDto {
  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  quantity?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  duration?: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  clientId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  taxRate?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
