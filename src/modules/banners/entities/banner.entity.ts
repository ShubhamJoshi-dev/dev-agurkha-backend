import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BannerCategory } from '../../banner-categories/entities/banner-category.entity';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  ctaLabel: string | null;

  @Column({ type: 'varchar', nullable: true })
  ctaUrl: string | null;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => BannerCategory, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'categoryId' })
  category: BannerCategory;

  @Column({ default: 'en' })
  locale: string;

  @Column({ type: 'timestamp', nullable: true })
  publishFrom: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  publishTo: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
