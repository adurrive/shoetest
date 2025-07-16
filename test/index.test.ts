import shoetest, { escape } from '../src/index';

describe('index module exports', () => {
  it('should export shoetest as default', () => {
    expect(shoetest).toBeDefined();
    expect(typeof shoetest).toBe('object');
    expect(typeof shoetest.simplify).toBe('function');
    expect(typeof shoetest.complexify).toBe('function');
    expect(typeof shoetest.getRegExp).toBe('function');
    expect(typeof shoetest.test).toBe('function');
    expect(typeof shoetest.match).toBe('function');
    expect(typeof shoetest.replace).toBe('function');
  });

  it('should export escape function', () => {
    expect(escape).toBeDefined();
    expect(typeof escape).toBe('function');
    expect(escape('test$')).toBe('test\\$');
  });

  it('should support CommonJS require syntax', () => {
    const required = require('../src/index');
    expect(required).toBeDefined();
    expect(typeof required.simplify).toBe('function');
    expect(typeof required.default.simplify).toBe('function');
    expect(typeof required.escape).toBe('function');
  });
});
