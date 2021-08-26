const { cleanHeaders } = require('../../src/lib/cleanHeaders');

describe('cleanHeaders', () => {
  it('should b64-encode key in ReadMe-friendly format', () => {
    expect(cleanHeaders('test')).toStrictEqual({ Authorization: 'Basic dGVzdDo=' });
  });

  it('should filter out undefined headers', () => {
    expect(cleanHeaders('test', { 'x-readme-version': undefined })).toStrictEqual({ Authorization: 'Basic dGVzdDo=' });
  });

  it('should filter out null headers', () => {
    expect(cleanHeaders('test', { 'x-readme-version': undefined, Accept: null })).toStrictEqual({
      Authorization: 'Basic dGVzdDo=',
    });
  });

  it('should pass in properly defined headers', () => {
    expect(
      cleanHeaders('test', { 'x-readme-version': undefined, Accept: null, 'Content-Type': 'application/json' })
    ).toStrictEqual({
      Authorization: 'Basic dGVzdDo=',
      'Content-Type': 'application/json',
    });
  });
});
