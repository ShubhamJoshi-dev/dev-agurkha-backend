import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MenuLocation {
  HEADER = 'header',
  FOOTER = 'footer',
}

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MenuLocation })
  location: MenuLocation;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column()
  label: string;

  @Column()
  linkType: string;

  @Column()
  linkValue: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
