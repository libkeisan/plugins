export default class DateParser {
  constructor(values) {
    this.values = values;
  }

  get year() {
    for (const value of this.values) {
      if (value.type === 'YEAR') return value.value;
    }
    return null;
  }

  get month() {
    for (const value of this.values) {
      if (value.type === 'MONTH') return value.value;
    }
    return null;
  }

  get day() {
    for (const value of this.values) {
      if (value.type === 'DAY') return value.value;
    }
    return null;
  }

  isValid() {
    if (![2, 3].includes(this.values.length)) return false;

    let year, month, day;
    for (const value of this.values) {
      switch (value.type) {
        case 'YEAR':
          if (year) return false;
          year = value.value;
          break;
        case 'MONTH':
          if (month) return false;
          month = value.value;
          break;
        case 'DAY':
          if (day) return false;
          day = value.value;
          break;
      }
    }

    if (month && (month < 1 || month > 12)) return false;
    if (day && (day < 1 || day > 31)) return false;

    return true;
  }

  countUnknowns() {
    let count = 0;
    for (const value of this.values) {
      if (value.type === null) count++;
    }
    return count;
  }

  unknowns(cb) {
    for (const value of this.values) {
      if (value.type === null) cb(value);
    }
  }

  setFirstUnknown(type) {
    for (const value of this.values) {
      if (value.type === null) {
        value.type = type;
        return;
      }
    }
  }

  complete() {
    if (!this.isValid()) return;
    if (this.countUnknowns() === 0) return;

    // If we only got 2 numbers and none of them are clearly date components,
    //   we shouldn't guess anything and should treat them as numbers
    if (this.countUnknowns() === 2 && this.values.length === 2) return;

    if (!this.year) {
      this.unknowns((value) => {
        if (value.value >= 1900 && value.value <= 2100) {
          value.type = 'YEAR';
        }
      });
    }

    if (!this.day && this.year !== null) {
      this.unknowns((value) => {
        if (value.value > 12 && value.value <= 31) {
          value.type = 'DAY';
        }
      });
    }

    if (this.countUnknowns() === 1) {
      if (this.values.length === 3) {
        if (this.year !== null && this.month !== null) {
          this.setFirstUnknown('DAY');
          return;
        }
        if (this.year !== null && this.day !== null) {
          this.setFirstUnknown('MONTH');
          return;
        }
        if (this.month !== null && this.day !== null) {
          this.setFirstUnknown('YEAR');
          return;
        }
      } else {
        if (this.year != null && this.day != null) {
          this.setFirstUnknown('MONTH');
          return;
        } else if (this.month != null) {
          const unknownValue = this.values.find((v) => v.type === null);
          if (unknownValue.value > 31) {
            this.setFirstUnknown('YEAR');
          } else {
            this.setFirstUnknown('DAY');
          }
        }
      }
    }
  }

  getDateTime() {
    this.complete();
    if (!this.isValid()) return null;
    if (this.month == null) return null;

    const now = new Date();
    const offset = now.getTimezoneOffset() * -60;

    const year = this.year || now.getFullYear();
    const month = this.month;
    const day = this.day || 1;

    const timestamp = new Date(year, month - 1, day).getTime();
    return { timestamp, offset };
  }
}
