import { MissingParamError } from '../../errors';
import { IValidation } from './validation';
import { ValidationComposite } from './validation-composite';

interface ISutTypes {
    sut: ValidationComposite;
    validationStub: IValidation;
}
const makeValidation = (): IValidation => {
    class ValidationStub implements IValidation {
        validate(input: any): Error | undefined {
            return undefined;
        }
    }

    return new ValidationStub();
};

const makeSut = (): ISutTypes => {
    const validationStub = makeValidation();
    const sut = new ValidationComposite([validationStub]);
    return {
        sut,
        validationStub,
    };
};

describe('Validation Composite', () => {
    test('should return an error if any validation fails', () => {
        const { sut, validationStub } = makeSut();
        jest.spyOn(validationStub, 'validate').mockReturnValueOnce(
            new MissingParamError('field')
        );
        const error = sut.validate({ field: 'any_value' });
        expect(error).toEqual(new MissingParamError('field'));
    });
});
