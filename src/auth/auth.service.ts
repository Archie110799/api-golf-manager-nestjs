import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
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

  async forgotPassword(email: string) {
    // No-op for now; could send email later
    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      // TODO: send reset link
    }
    return { message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' };
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
