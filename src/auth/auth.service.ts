import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 30;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepo: Repository<PasswordResetToken>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );
    const refreshToken = await this.createRefreshToken(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role ?? 'user',
      },
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      id: uuidv4(),
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
    });
    await this.userRepo.save(user);
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );
    const refreshToken = await this.createRefreshToken(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: (user as User).role ?? 'user',
      },
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      return {
        message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.',
      };
    }

    await this.passwordResetTokenRepo.delete({ userId: user.id });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES);

    const resetToken = this.passwordResetTokenRepo.create({
      id: uuidv4(),
      userId: user.id,
      tokenHash,
      expiresAt,
      usedAt: null,
    });

    await this.passwordResetTokenRepo.save(resetToken);

    return {
      message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.',
      resetToken: rawToken,
      expiresAt,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const resetToken = await this.passwordResetTokenRepo.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!resetToken || resetToken.usedAt || new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    resetToken.usedAt = new Date();
    resetToken.user.passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepo.save(resetToken.user);
    await this.passwordResetTokenRepo.save(resetToken);
    await this.refreshTokenRepo.delete({ userId: resetToken.user.id });

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async refresh(refreshTokenValue: string) {
    const rt = await this.refreshTokenRepo.findOne({
      where: { token: refreshTokenValue },
      relations: ['user'],
    });
    if (!rt || new Date() > rt.expiresAt) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
    await this.refreshTokenRepo.remove(rt);
    const accessToken = this.jwtService.sign(
      { sub: rt.user.id, email: rt.user.email },
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );
    const newRefresh = await this.createRefreshToken(rt.user.id);
    return { accessToken: accessToken, refreshToken: newRefresh.token };
  }

  private async createRefreshToken(userId: string): Promise<RefreshToken> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    const rt = this.refreshTokenRepo.create({
      id: uuidv4(),
      userId,
      token: uuidv4(),
      expiresAt,
    });
    return this.refreshTokenRepo.save(rt);
  }
}
