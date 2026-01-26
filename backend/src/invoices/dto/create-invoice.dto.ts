import { IsUUID, IsArray, IsOptional, IsString, IsNumber, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class InvoiceItemDto {
  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;
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
