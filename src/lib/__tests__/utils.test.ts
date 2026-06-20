import { cn } from '@/lib/utils';

describe('cn — Tailwind class 合并工具', () => {
  it('合并多个 class 字符串', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('移除冲突的 Tailwind 类', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8');
  });

  it('处理空字符串', () => {
    expect(cn('px-4', '', 'py-2')).toBe('px-4 py-2');
  });

  it('处理 undefined 和 null', () => {
    expect(cn('px-4', undefined, null, 'py-2')).toBe('px-4 py-2');
  });

  it('处理条件 class', () => {
    const isActive = true;
    const disabled = false;
    expect(cn('base', isActive && 'active', disabled && 'disabled')).toBe(
      'base active',
    );
  });

  it('处理数组形式', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2');
  });

  it('处理对象形式', () => {
    expect(cn({ 'px-4': true, 'py-2': false, 'mx-4': true })).toBe(
      'px-4 mx-4',
    );
  });

  it('空参数返回空字符串', () => {
    expect(cn()).toBe('');
  });
});
