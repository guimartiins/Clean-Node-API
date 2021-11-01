import { MissingParamError } from '../../errors';
import { IValidation } from './validation';
import { ValidationComposite } from './validation-composite';

interface ISutTypes {
    sut: ValidationComposite;
    validationStubs: IValidation[];
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
    const validationStubs = [makeValidation(), makeValidation()];
    const sut = new ValidationComposite(validationStubs);
    return {
        sut,
        validationStubs,
    };
};

describe('Validation Composite', () => {
    test('should return an error if any validation fails', () => {
        const { sut, validationStubs } = makeSut();
        jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(
            new MissingParamError('field')
        );
        const error = sut.validate({ field: 'any_value' });
        expect(error).toEqual(new MissingParamError('field'));
    });

    test('should return the first error if more then one validation fails', () => {
        const { sut, validationStubs } = makeSut();
        jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(
            new Error()
        );
        jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(
            new MissingParamError('field')
        );
        const error = sut.validate({ field: 'any_value' });
        expect(error).toEqual(new Error());
    });
});
