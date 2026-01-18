import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for rejecting a pending deal
 */
export class RejectDealDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
