import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PublishStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('news_posts')
export class NewsPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  excerpt: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column()
  category: string;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status: PublishStatus;

  @Column({ default: 'en' })
  locale: string;

  @Column({ type: 'varchar', nullable: true })
  seoTitle: string | null;

  @Column({ type: 'text', nullable: true })
  seoDescription: string | null;

  @Column({ type: 'varchar', nullable: true })
  seoOgImage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
