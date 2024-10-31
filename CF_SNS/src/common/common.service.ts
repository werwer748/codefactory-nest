import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { BaseModel } from './entities/base.entity';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { ENV_HOST_KEY, ENV_JWT_SECRET_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.const';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonService {
  constructor(
    private readonly configService: ConfigService,
  ) {}
  // 그냥 T로 받아도 되지만 모든 엔티티가 BaseModel을 상속받고 있기때문에
  // 조금 더 상세한 타입을 잡아주기위해 extends BaseModel을 추가
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string
  ) {
    if (dto.page) {
      return this.pagePaginate(
        dto,
        repository,
        overrideFindOptions,
      )
    } else {
      return this.cursorPaginate(
        dto,
        repository,
        overrideFindOptions,
        path
      )
    }
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    }
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    })

    const lastItem = results.length === dto.take ? results.at(-1) : null;

    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(
      `${protocol}://${host}/${path}`
    );

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id__less_than' && key !== 'where__id__more_than') {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      const key =
        dto.order__createdAt === 'ASC' ? 'where__id__more_than' : 'where__id__less_than'

      nextUrl.searchParams.append(key, lastItem.id.toString())
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    /**
     * 해당 함수에서 반환해야하는 값
     * where,
     * order,
     * take,
     * skip -> page 기반일때만!
     *
     * 처리할 로직 정리
     * 1. where로 시작한다면 필터 로직을 적용한다.
     * 2. order로 시작한다면 정렬 로직을 적용한다.
     * 3. 필터 로직을 적용한다면 '__' 기준으로 split 했을 때 값이 3개인지 2개인지 확인한다.
     *    3-1. 3개로 나뉘면 FILTER_MAPPER에서 해당하는 operator 함수를 찾아서 적용한다.
     *          ['where', 'id', 'more_than']
     *    3-2. 2개로 나뉘면 정확한 값을 필터하는 것이기 때문에 operator 없이 적용한다.
     *          ['where', 'id']
     * 4. order의 경우 3-2와 같은 방법으로 적용한다.
     */

    let where: FindOptionsWhere<T> = {}
    let order: FindOptionsOrder<T> = {}

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        }
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereFilter(key, value),
        }
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    }
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};

    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2 또는 3이어야 합니다. - ${key}`
      )
    }

    // where__id = 3
    if (split.length === 2) {
      // ['where', 'id']
      const [_, field] = split;

      // { id: 3 }
      options[field] = value;
    } else {
      /**
       * 길이가 3 => Typeorm 유틸리티가 필요
       * where__id__more_than...
       *
       * 3번째 값을 사용하려면?
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * field 값에 FILTER_MAPPER에 해당되는 utility를 가져온 후
       * 값에 적용한다.
       */
        // ['where', 'id', 'more_than']
      const [_, field, operator] = split;

      const values = value.toString().split(',');

      if (operator === 'i_like' || operator === 'like') {
        options[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        options[field] = FILTER_MAPPER[operator](...values);
      }
    }

    return options;
  }
}
