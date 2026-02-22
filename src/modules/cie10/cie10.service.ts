import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Cie10 } from './entities/cie10.entity';

@Injectable()
export class Cie10Service {
  constructor(
    @InjectRepository(Cie10)
    private readonly cie10Repository: Repository<Cie10>,
  ) {}

  /**
   * Busca códigos CIE10 por código o descripción.
   * Incluye categoria_nivel0 (descripción del padre más amplio) para contexto en el dropdown.
   */
  async search(q: string, limit = 20): Promise<Array<Cie10 & { categoria_nivel0?: string }>> {
    const trimmed = (q || '').trim();
    if (!trimmed) return [];

    const pattern = `%${trimmed}%`;
    const items = await this.cie10Repository.find({
      where: [
        { code: ILike(pattern) },
        { description: ILike(pattern) },
      ],
      take: limit,
      order: { code: 'ASC' },
    });

    const codesNivel0 = [...new Set(items.map((i) => i.code0).filter(Boolean))] as string[];
    const padresNivel0 =
      codesNivel0.length > 0
        ? await this.cie10Repository.find({ where: { code: In(codesNivel0) } })
        : [];
    const mapPadre = Object.fromEntries(padresNivel0.map((p) => [p.code, p.description]));

    return items.map((i) => ({
      ...i,
      categoria_nivel0: i.code0 ? mapPadre[i.code0] : undefined,
    }));
  }

  /**
   * Obtiene el linaje (ancestros) de un código CIE10.
   * Retorna las descripciones de code_0, code_1, code_2 en orden (más amplio → más específico).
   */
  async getLinaje(code: string): Promise<{
    item: Cie10 | null;
    ancestros: Array<{ code: string; description: string; level: number }>;
  }> {
    const item = await this.cie10Repository.findOne({ where: { code } });
    if (!item) return { item: null, ancestros: [] };

    const codes = [item.code0, item.code1, item.code2].filter(Boolean) as string[];
    if (codes.length === 0) return { item, ancestros: [] };

    const ancestros = await this.cie10Repository.find({ where: { code: In(codes) } });
    const orden = codes.map((c) => ancestros.find((a) => a.code === c)).filter(Boolean) as Cie10[];

    return {
      item,
      ancestros: orden.map((a) => ({ code: a.code, description: a.description, level: a.level })),
    };
  }
}
