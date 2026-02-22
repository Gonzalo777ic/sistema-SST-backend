import { TipoHabitoNocivo } from '../entities/habito-nocivo.entity';

export class ResponseHabitoNocivoDto {
  id: string;
  tipo: TipoHabitoNocivo;
  cantidad: string | null;
  frecuencia: string | null;
  trabajador_id: string;
}
