import { UNITS, Duration, parseUnit } from '../duration';

export const duration = (tokens) => {
  const list = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'NUMBER':
        const num = token.value;
        if (num.is_percent || num.value % 1 !== 0) return null;
        list.push(new Duration({ value: parseInt(num.value) }));
        break;
      case 'IDENT':
        if (token.value.toLowerCase() === 'and') break;
        const unit = parseUnit(token.value);
        if (unit === UNITS.UNKNOWN) return null;
        if (list.length === 0) return null;
        list[list.length - 1].unit = unit;
        break;
      default:
        return null;
    }
  }

  if (list.some((d) => d.unit === UNITS.UNKNOWN)) return null;
  return list.map((d) => ({ type: 'DURATION', value: d }));
};

export const convert = (tokens) => {
  let seconds = 0;

  for (const token of tokens.slice(0, -1)) {
    switch (token.type) {
      case 'DURATION':
        const dur = token.value;
        seconds += dur.getSeconds();
        break;
      case 'IDENT':
        break;
      default:
        return null;
    }
  }

  const last = tokens[tokens.length - 1];
  if (last.type !== 'IDENT') return null;
  const unit = parseUnit(last.value);
  if (unit === UNITS.UNKNOWN) return null;

  const dur = new Duration({ value: seconds, unit: UNITS.SECOND });
  return [{ type: 'DURATION', value: dur.convert(unit) }];
};

const dateDiff = (tokens) => {
  if (tokens.length !== 3) return null;
  if (tokens[1].type !== 'MINUS') return null;

  const { timestamp: t1 } = tokens[0].value;
  const { timestamp: t2 } = tokens[2].value;
  const seconds = Math.floor((t1 - t2) / 1000);
  const dur = new Duration({ value: seconds, unit: UNITS.SECOND });

  return [{ type: 'DURATION', value: dur }];
};

export const dateOp = (tokens) => {
  if (tokens.length < 2) return null;
  if (tokens[0].type !== 'DATETIME') return null;

  const last = tokens[tokens.length - 1];
  if (last.type === 'DATETIME') return dateDiff(tokens);
  if (last.type !== 'DURATION') return null;

  let factor = 0;
  let durIdx = 2;
  switch (tokens[1].type) {
    case 'PLUS':
      factor = 1;
      break;
    case 'MINUS':
      factor = -1;
      break;
    case 'DURATION':
      durIdx = 1;
      const dur = tokens[1].value;
      if (dur.value >= 0) return null;
      factor = 1;
      break;
    default:
      return null;
  }

  if (factor === 0) return null;

  const base = tokens[0].value;
  for (const token of tokens.slice(durIdx)) {
    if (token.type !== 'DURATION') return null;
    const dur = token.value;
    base.timestamp += factor * dur.getSeconds() * 1000;
  }

  return [{ type: 'DATETIME', value: base }];
};
