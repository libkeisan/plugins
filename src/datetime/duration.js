export const UNITS = {
  UNKNOWN: 'UNKNOWN',
  SECOND: 'SECOND',
  MINUTE: 'MINUTE',
  HOUR: 'HOUR',
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
};

const FACTORS = {
  [UNITS.UNKNOWN]: 0,
  [UNITS.SECOND]: 1,
  [UNITS.MINUTE]: 60,
  [UNITS.HOUR]: 3600,
  [UNITS.DAY]: 24 * 3600,
  [UNITS.WEEK]: 7 * 24 * 3600,
  [UNITS.MONTH]: 30 * 24 * 3600,
  [UNITS.YEAR]: 365 * 24 * 3600,
};

export const parseUnit = (_str) => {
  const str = _str.toLowerCase();
  if (str.startsWith('s')) return UNITS.SECOND;
  if (str.startsWith('h')) return UNITS.HOUR;
  if (str.startsWith('d')) return UNITS.DAY;
  if (str.startsWith('w')) return UNITS.WEEK;
  if (str.startsWith('y')) return UNITS.YEAR;
  if (str.startsWith('mo')) return UNITS.MONTH;
  if (str.startsWith('m')) return UNITS.MINUTE;
  return UNITS.UNKNOWN;
};

export class Duration {
  constructor({
    value = 0,
    unit = UNITS.UNKNOWN,
    displayUnit = UNITS.UNKNOWN,
  }) {
    this.value = value;
    this.unit = unit;
    this.displayUnit = displayUnit;
  }

  getSeconds() {
    return this.value * FACTORS[this.unit];
  }

  convert(unit) {
    if (unit === UNITS.UNKNOWN) return this;

    const seconds = this.getSeconds();
    const value = Math.floor(seconds / FACTORS[unit]);

    return new Duration({ value, unit, displayUnit: unit });
  }

  breakdown() {
    if (!this.value) return [this];

    const parts = [];

    let seconds = this.getSeconds();

    for (const [unit, factor] of Object.entries(FACTORS).reverse()) {
      if (!factor) continue;
      const value = Math.floor(seconds / factor);
      if (value) {
        parts.push(new Duration({ value, unit }));
        seconds -= value * factor;
      }
      if (!seconds) break;
    }

    return parts;
  }

  render() {
    let parts = [];
    if (this.displayUnit != UNITS.UNKNOWN) {
      parts.push(this.convert(this.displayUnit));
    } else {
      parts = this.breakdown();
    }

    return parts.map((part) => `${part.value} ${part.unit}`).join(' ');
  }
}
