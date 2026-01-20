import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * UserSession entity for JWT refresh tokens and session management.
 * Allows tracking active sessions per user/device.
 */
@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  refreshTokenHash: string;

  // Device info stored as JSON
  @Column({ type: 'text', nullable: true })
  deviceInfo: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  lastUsedAt: Date;

  /**
   * Helper to get device info as object
   */
  getDeviceInfo(): { platform?: string; deviceId?: string; appVersion?: string } | null {
    if (!this.deviceInfo) return null;
    try {
      return JSON.parse(this.deviceInfo);
    } catch {
      return null;
    }
  }

  /**
   * Helper to set device info from object
   */
  setDeviceInfo(info: { platform?: string; deviceId?: string; appVersion?: string }): void {
    this.deviceInfo = JSON.stringify(info);
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return new Date() > new Date(this.expiresAt);
  }
}
