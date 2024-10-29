import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException
} from '@nestjs/common';

@Injectable()
export class PasswordPipe implements PipeTransform {

  /**
   * transform?
   * PipeTransform을 구현할 때 필수로 작성해야하는 함수
   *
   * value => 파이프로 검증할 값
   * return 해주는값은 파이프를 통과했을 때 변경되거나 검증이 통과된 value 다
   *
   * ArgumentMetadata? - 타고들어가서 확인가능
   * type: Paramtype; => 어디서 가져온 데이터인지 (body, query, param)
   * metatype? => 사용자가 이 타입을 꺼낼 때 정의한 타입
   * data? => 꺼낼때 사용한 키값 @Body('userId')라면 userId
   */
  transform(value: any, metadata: ArgumentMetadata): any {
    const valueToString = value.toString();

    if (valueToString.length > 8) {
      throw new BadRequestException('비밀번호는 8자 이하로 입력해주세요!');
    }
    return valueToString;
  }
}

@Injectable()
export class MaxLengthPipe implements PipeTransform {
  constructor(private readonly length: number) {
  }

  transform(value: any, metadata: ArgumentMetadata): any {
    const valueToString = value.toString();

    if (valueToString.length > this.length) {
      throw new BadRequestException(`최대 길이는 ${this.length}입니다.`);
    }

    return valueToString;
  }
}

@Injectable()
export class MinLengthPipe implements PipeTransform {
  constructor(private readonly length: number) {
  }

  transform(value: any, metadata: ArgumentMetadata): any {
    const valueToString = value.toString();

    if (valueToString.length < this.length) {
      throw new BadRequestException(`최소 길이는 ${this.length}입니다.`);
    }

    return valueToString;
  }
}