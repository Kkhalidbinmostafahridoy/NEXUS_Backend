import { Body, Controller, Get, HttpCode, Post, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { IsEmail, IsString, MinLength } from "class-validator";
import { PrismaService } from "../shared/prisma.service";

class RegisterDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(10) password!: string;
}
class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}
class RefreshDto {
  @IsString() refreshToken!: string;
}
export class AuthService {
  private readonly jwt = new JwtService();
  constructor(private readonly prisma: PrismaService) {}
  async register(input: RegisterDto) {
    const passwordHash = await argon2.hash(input.password);
    const user = await this.prisma.user.create({
      data: { name: input.name, email: input.email.toLowerCase(), passwordHash },
    });
    return this.issue(user);
  }
  async login(input: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, input.password)))
      throw new UnauthorizedException("Invalid email or password");
    return this.issue(user);
  }
  async refresh(token: string) {
    try {
      const data = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.refreshSecret,
      });
      const user = await this.prisma.user.findUnique({ where: { id: data.sub } });
      if (!user || !user.refreshTokenHash || !(await argon2.verify(user.refreshTokenHash, token)))
        throw new Error();
      return this.issue(user);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
  async logout(token: string) {
    try {
      const { sub } = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.refreshSecret,
      });
      await this.prisma.user.update({ where: { id: sub }, data: { refreshTokenHash: null } });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
  private get accessSecret() {
    return process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET!;
  }
  private get refreshSecret() {
    return process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET!;
  }
  private async issue(user: { id: string; email: string; name: string; role: unknown }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: "15m",
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: "30d",
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await argon2.hash(refreshToken) },
    });
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post("register") register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }
  @HttpCode(200) @Post("login") login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }
  @HttpCode(200) @Post("refresh") refresh(@Body() body: RefreshDto) {
    return this.auth.refresh(body.refreshToken);
  }
  @HttpCode(204) @Post("logout") logout(@Body() body: RefreshDto) {
    return this.auth.logout(body.refreshToken);
  }
  @Get("me") me() {
    return {
      message:
        "Send an access token to protected routes. Add a JWT guard before exposing this endpoint publicly.",
    };
  }
}
