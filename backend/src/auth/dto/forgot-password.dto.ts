import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@lamundialdeseguros.com',
    description: 'Correo electrónico registrado en la tabla seusuariosweb (columna xcorreo)',
  })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un formato de correo electrónico válido' })
  email!: string;
}
