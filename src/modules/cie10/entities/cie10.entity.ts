import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('cie10')
@Index('idx_cie10_code', ['code'])
@Index('idx_cie10_description', ['description'])
export class Cie10 {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ name: 'code_0', type: 'varchar', length: 20, nullable: true })
  code0: string | null;

  @Column({ name: 'code_1', type: 'varchar', length: 20, nullable: true })
  code1: string | null;

  @Column({ name: 'code_2', type: 'varchar', length: 20, nullable: true })
  code2: string | null;
}
