import { readFileSync } from 'node:fs';
import vm from 'node:vm';

import { describe, expect, it, vi } from 'vitest';

import { makeElement } from './support/dom.js';

const source = readFileSync(
  new URL('../sitescripts/create-suggest.js', import.meta.url),
  'utf8',
);

function loadScript(inputs) {
  const log = vi.fn();
  const context = {
    console: { log },
    document: {
      querySelectorAll(selector) {
        if (selector !== '.point-form input') {
          throw new Error(`Unexpected selector: ${selector}`);
        }

        return inputs;
      },
    },
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'create-suggest.js' });

  return { context, log };
}

function makeInputs(overrides = {}) {
  return [
    makeElement({ value: 'R. Alberto de Oliveira, 1988', ...overrides.address }),
    makeElement({ value: '09:00', ...overrides.opens }),
    makeElement({ value: '17:00', ...overrides.closes }),
    makeElement({ checked: true, ...overrides.paper }),
    makeElement({ checked: false, ...overrides.metals }),
    makeElement({ checked: true, ...overrides.organic }),
    makeElement({ checked: false, ...overrides.biological }),
  ];
}

describe('create-suggest form script', () => {
  it('reads the address, opening hours, and material checkboxes', () => {
    const inputs = makeInputs();
    const { context } = loadScript(inputs);

    expect(context.readForm()).toEqual({
      address: 'R. Alberto de Oliveira, 1988',
      hours: {
        opens: '09:00',
        closes: '17:00',
      },
      materials: {
        paper: true,
        metals: false,
        organic: true,
        biological: false,
      },
    });
  });

  it('reflects the current values of the form inputs', () => {
    const inputs = makeInputs();
    inputs[0].value = 'Av. Brasil, 100';
    inputs[1].value = '08:00';
    inputs[2].value = '18:00';
    inputs[3].checked = false;
    inputs[4].checked = true;
    inputs[5].checked = false;
    inputs[6].checked = true;

    const { context } = loadScript(inputs);

    expect(context.readForm()).toEqual({
      address: 'Av. Brasil, 100',
      hours: { opens: '08:00', closes: '18:00' },
      materials: {
        paper: false,
        metals: true,
        organic: false,
        biological: true,
      },
    });
  });

  it('putData logs the collected form data', () => {
    const inputs = makeInputs();
    const { context, log } = loadScript(inputs);

    context.putData('suggest');

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith({
      address: 'R. Alberto de Oliveira, 1988',
      hours: { opens: '09:00', closes: '17:00' },
      materials: {
        paper: true,
        metals: false,
        organic: true,
        biological: false,
      },
    });
  });
});
