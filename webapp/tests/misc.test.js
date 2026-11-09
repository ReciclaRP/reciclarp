import { describe, expect, it } from 'vitest';

import { descriptionFromPointTypes } from '../src/logic/misc.js';

function pointWith(flags) {
  return {
    accepts_paper: 0,
    accepts_metal: 0,
    accepts_organic: 0,
    accepts_biological: 0,
    ...flags,
  };
}

describe('descriptionFromPointTypes', () => {
  it('describes an empty set of materials with just a full stop', () => {
    expect(descriptionFromPointTypes(pointWith({}))).toBe('.');
  });

  it.each([
    [{ accepts_paper: 1 }, 'papel.'],
    [{ accepts_metal: 1 }, 'metal.'],
    [{ accepts_organic: 1 }, 'orgânicos.'],
    [{ accepts_biological: 1 }, 'biológicos.'],
    [{ accepts_paper: 1, accepts_metal: 1 }, 'metal, papel.'],
    [{ accepts_paper: 1, accepts_organic: 1 }, 'orgânicos, papel.'],
    [{ accepts_metal: 1, accepts_biological: 1 }, 'biológicos, metal.'],
    [
      {
        accepts_paper: 1,
        accepts_metal: 1,
        accepts_organic: 1,
        accepts_biological: 1,
      },
      'biológicos, metal, orgânicos, papel.',
    ],
  ])('formats %o as %s', (flags, expected) => {
    expect(descriptionFromPointTypes(pointWith(flags))).toBe(expected);
  });

  it('uses a stable order regardless of object key order', () => {
    const point = {
      accepts_biological: 1,
      accepts_paper: 1,
      accepts_organic: 1,
      accepts_metal: 1,
    };

    expect(descriptionFromPointTypes(point)).toBe(
      'biológicos, metal, orgânicos, papel.',
    );
  });

  it('treats truthy numeric strings as accepted materials', () => {
    expect(descriptionFromPointTypes({ accepts_paper: '1' })).toBe('papel.');
  });

  it('returns false for missing input', () => {
    expect(descriptionFromPointTypes(null)).toBe(false);
    expect(descriptionFromPointTypes(undefined)).toBe(false);
    expect(descriptionFromPointTypes(0)).toBe(false);
    expect(descriptionFromPointTypes(false)).toBe(false);
  });
});
