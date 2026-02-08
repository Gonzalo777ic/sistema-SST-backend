import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { PETS } from './pets.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('pets_lecturas')
@Index(['petsId', 'usuarioId'], { unique: true })
export class PetsLectura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pets_id', type: 'uuid' })
  petsId: string;

  @ManyToOne(() => PETS, (pets) => pets.lecturas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pets_id' })
  pets: PETS;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'fecha_lectura', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaLectura: Date;

  @Column({ default: false })
  aceptado: boolean;

  @Column({ name: 'usuario_nombre', type: 'varchar' })
  usuarioNombre: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
