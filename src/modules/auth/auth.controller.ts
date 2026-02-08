import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { ResponseUsuarioDto } from '../usuarios/dto/response-usuario.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto.dni, dto.password);
  }

  @Post('register')
  async register(@Body() dto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    return this.authService.register(dto);
  }
}
