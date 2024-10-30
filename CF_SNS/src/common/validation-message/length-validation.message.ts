import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments) => {
  /**
   * ValidationArguments 프로퍼티
   *
   * 1. value -> 검증하려는 값 (입력된 값)
   * 2. constraints -> 파라미터에 입력한 제한 사항 1 ~ 20자 제한이라면
   *    ex) args.constraints[0] -> 1
   *        args.constraints[1] -> 20
   * 3. targetName -> 검증하고 있는 클래스의 이름
   * 4. object -> 검증하고 있는 객체
   * 5. property -> 검증중인 프로퍼티 이름
   */
  if (args.constraints.length === 2) {
    return `${args.property}은 `
      +`${args.constraints[0]}~${args.constraints[1]}자 이내로 `
      + `입력이 가능합니다.`;
  } else {
    return `${args.property}은 `
      + `최소 ${args.constraints[0]}자 이상 입력이 필요합니다.`;
  }
};