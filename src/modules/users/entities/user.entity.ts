import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

/**
 * User entity for app users (separate from admin_users).
 * Supports Google and Apple OAuth authentication.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Authentication
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  // OAuth providers
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  googleId: string | null;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  appleId: string | null;

  // Profile
  @Column({ type: 'varchar', length: 100, nullable: true })
  displayName: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  // Preferences stored as JSON
  @Column({ type: 'text', nullable: true })
  notificationPreferences: string;

  // Metadata
  @Column({ nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Helper to get notification preferences as object
   */
  getNotificationPreferences(): { push: boolean; email: boolean; priceAlerts: boolean } {
    if (!this.notificationPreferences) {
      return { push: true, email: true, priceAlerts: true };
    }
    try {
      return JSON.parse(this.notificationPreferences);
    } catch {
      return { push: true, email: true, priceAlerts: true };
    }
  }

  /**
   * Helper to set notification preferences from object
   */
  setNotificationPreferences(prefs: { push?: boolean; email?: boolean; priceAlerts?: boolean }): void {
    const current = this.getNotificationPreferences();
    this.notificationPreferences = JSON.stringify({ ...current, ...prefs });
  }
}
