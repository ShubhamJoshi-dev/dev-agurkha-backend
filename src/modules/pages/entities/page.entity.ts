import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ default: 'default' })
  template: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', nullable: true })
  featuredImageUrl: string | null;

  @Column({ type: 'enum', enum: PageStatus, default: PageStatus.DRAFT })
  status: PageStatus;

  @Column({ default: 'en' })
  locale: string;

  @Column({ type: 'varchar', nullable: true })
  seoTitle: string | null;

  @Column({ type: 'text', nullable: true })
  seoDescription: string | null;

  @Column({ type: 'varchar', nullable: true })
  seoKeywords: string | null;

  @Column({ type: 'varchar', nullable: true })
  seoOgImage: string | null;

  @Column({ type: 'timestamp', nullable: true })
  publishAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
