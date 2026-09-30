import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@lamundialdeseguros.com',
    description: 'Correo electrónico y/o usuario registrado',
  })
  @IsNotEmpty({ message: 'El correo o usuario es requerido' })
  @IsString()
  email!: string;

  @ApiProperty({
    example: 'Mundial2026.',
    description: 'Contraseña del usuario',
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  password!: string;
}
