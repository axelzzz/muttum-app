import { firstErrorMessage } from './field-error.util';

describe('firstErrorMessage', () => {
  it('returns undefined when there are no errors', () => {
    expect(firstErrorMessage(null, { required: 'Required.' })).toBeUndefined();
  });

  it('returns the message for the error that is present', () => {
    expect(firstErrorMessage({ minlength: true }, { required: 'Required.', minlength: 'Too short.' })).toBe(
      'Too short.',
    );
  });

  it('returns the message for the first matching key when multiple are present', () => {
    expect(
      firstErrorMessage(
        { required: true, minlength: true },
        { required: 'Required.', minlength: 'Too short.' },
      ),
    ).toBe('Required.');
  });

  it('returns undefined when the present error has no matching message', () => {
    expect(firstErrorMessage({ server: true }, { required: 'Required.' })).toBeUndefined();
  });
});
