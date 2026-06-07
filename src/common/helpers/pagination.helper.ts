import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { Paginated } from '../dto/paginated.dto';

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  page: number,
  perPage: number,
): Promise<Paginated<T>> {
  const [data, total] = await qb
    .skip((page - 1) * perPage)
    .take(perPage)
    .getManyAndCount();
  return { data, total, page, perPage };
}

/**
 * Parses a sort string like `-createdAt` or `sortOrder` into
 * [field, direction] tuple. Falls back to [fallbackField, 'DESC'].
 */
export function parseSort(
  sort: string | undefined,
  allowed: string[],
  fallback: string = 'createdAt',
): [string, 'ASC' | 'DESC'] {
  if (!sort) return [fallback, 'DESC'];

  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;

  if (!allowed.includes(field)) return [fallback, 'DESC'];
  return [field, desc ? 'DESC' : 'ASC'];
}
