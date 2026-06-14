import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('media_items')
export class MediaItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  // Postgres `bigint` is returned by the driver as a string to avoid precision
  // loss. File sizes are well within Number.MAX_SAFE_INTEGER, so transform to a
  // real number — otherwise API consumers string-concatenate when summing sizes.
  @Column({
    type: 'bigint',
    transformer: {
      to: (value: number): number => value,
      from: (value: string | null): number => (value == null ? 0 : Number(value)),
    },
  })
  size: number;

  @Column()
  url: string;

  @CreateDateColumn()
  createdAt: Date;
}
