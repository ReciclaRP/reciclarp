export function makeElement(overrides = {}) {
  const element = {
    tagName: 'DIV',
    style: { display: '' },
    children: [],
    listeners: {},
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
    readOnly: false,
    className: '',
    addEventListener(type, listener) {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }

      this.listeners[type].push(listener);
    },
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    async click(event = {}) {
      for (const listener of this.listeners.click || []) {
        await listener(event);
      }
    },
    ...overrides,
  };

  return element;
}

export function makeDocument(elements = {}) {
  return {
    cookie: '',
    elements,
    getElementById(id) {
      return this.elements[id] ?? null;
    },
    querySelector(selector) {
      return this.elements[selector] ?? null;
    },
    querySelectorAll(selector) {
      return this.elements[selector] ?? [];
    },
    createElement(tagName) {
      return makeElement({ tagName: String(tagName).toUpperCase() });
    },
    addEventListener() {},
  };
}

export function makeWindow({ search = '', location = {}, ...overrides } = {}) {
  return {
    location: { href: 'http://localhost/', search, ...location },
    ...overrides,
  };
}

/**
 * Give a fake document browser-like cookie semantics: writes append to the
 * existing jar, and already-expired cookies are removed.
 */
export function installCookieJar(document) {
  let jar = [];
  const writes = [];

  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get() {
      return jar.join('; ');
    },
    set(rawValue) {
      const value = String(rawValue);
      writes.push(value);

      const [pair, ...attributes] = value.split(';').map((part) => part.trim());
      const separator = pair.indexOf('=');
      const name = separator === -1 ? pair : pair.slice(0, separator);
      const cookieValue = separator === -1 ? '' : pair.slice(separator + 1);
      const expires = attributes.find((attribute) =>
        attribute.toLowerCase().startsWith('expires'),
      );

      let expired = false;
      if (expires) {
        const equals = expires.indexOf('=');
        const date = new Date(expires.slice(equals + 1).trim());
        expired = !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
      }

      jar = jar.filter((cookie) => cookie.split('=')[0] !== name);
      if (!expired && cookieValue !== '') {
        jar.push(`${name}=${cookieValue}`);
      }
    },
  });

  return { writes };
}
