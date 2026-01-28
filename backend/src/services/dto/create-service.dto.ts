import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceBillingType } from '@prisma/client';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ServiceBillingType)
  billingType: ServiceBillingType;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  unitPrice: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  minDuration?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
