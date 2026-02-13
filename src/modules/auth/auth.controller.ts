import { Body, Controller, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { ResponseUsuarioDto } from '../usuarios/dto/response-usuario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsuariosService } from '../usuarios/usuarios.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto.dni, dto.password);
  }

  @Post('register')
  async register(@Body() dto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    return this.authService.register(dto);
  }

  @Post('verify-password')
  @UseGuards(JwtAuthGuard)
  async verifyPassword(
    @Body('password') password: string,
    @CurrentUser() currentUser: { id: string; dni: string },
  ): Promise<{ valid: boolean }> {
    if (!password) {
      throw new UnauthorizedException('Contraseña requerida');
    }
    const valid = await this.usuariosService.verifyPassword(currentUser.id, password);
    return { valid };
  }
}
