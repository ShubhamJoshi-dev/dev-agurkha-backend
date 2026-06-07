import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SetupSuperAdminDto {
  @ApiProperty({ example: 'superadmin@example.com' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'Super Admin', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value.trim())
  name: string;

  @ApiProperty({ example: 'strongPassword123', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({
    example: 'my-secret-setup-key',
    description: 'Must match the SETUP_SECRET environment variable',
  })
  @IsString()
  @IsNotEmpty()
  setupSecret: string;
}
