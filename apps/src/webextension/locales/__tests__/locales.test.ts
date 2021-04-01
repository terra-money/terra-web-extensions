import { en, ko } from '../';

describe('locales', () => {
  test('should read texts', () => {
    expect(en['wallet.change-password']).toBe('Change password');
    expect(ko['wallet.change-password']).toBe('비밀번호 변경');
  });
});
