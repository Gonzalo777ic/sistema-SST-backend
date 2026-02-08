import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { PETS } from './pets.entity';

@Entity('pets_pasos')
export class PetsPaso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pets_id', type: 'uuid' })
  petsId: string;

  @ManyToOne(() => PETS, (pets) => pets.pasos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pets_id' })
  pets: PETS;

  @Column({ type: 'int' })
  numero: number;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  peligros: string | null;

  @Column({ name: 'medidas_control', type: 'text', nullable: true })
  medidasControl: string | null;

  @Column({ name: 'epp_requerido', type: 'simple-array', nullable: true })
  eppRequerido: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
