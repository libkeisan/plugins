import DateParser from '../parser';

const specialDate = (tokens) => {
  const { value } = tokens[0];

  const offset = new Date().getTimezoneOffset() * -60;
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  switch (value.toLowerCase()) {
    case 'now':
      return { timestamp: now.getTime(), offset };
    case 'today':
      return { timestamp: today.getTime(), offset };
    case 'tomorrow':
      today.setDate(today.getDate() + 1);
      return { timestamp: today.getTime(), offset };
    case 'yesterday':
      today.setDate(today.getDate() - 1);
      return { timestamp: today.getTime(), offset };
  }

  return null;
};

export const parseDate = (tokens, ids) => {
  if (tokens.length == 1 && tokens[0].type === 'IDENT') {
    const date = specialDate(tokens);
    if (date) return [{ type: 'DATETIME', value: date }];
    return null;
  }

  const values = [];
  for (const token of tokens) {
    if (token.type == 'NUMBER') {
      const num = token.value;
      if (num.is_percent || num.value < 0 || num.value % 1 !== 0) return null;
      values.push({ value: parseInt(num.value), type: null });
    } else if (token.type == 'IDENT') {
      const value = token.value.toLowerCase();

      if (ids.era.includes(value)) {
        if (values.length === 0) return null;
        const lastIdx = values.length - 1;
        if (values[lastIdx].type !== null) return null;
        values[lastIdx].type = 'YEAR';
        if (value === 'bc') values[lastIdx].value *= -1;
      } else if (ids.suffix.includes(value)) {
        if (values.length === 0) return null;
        const lastIdx = values.length - 1;
        if (values[lastIdx].type !== null) return null;
        values[lastIdx].type = 'DAY';
      }

      let month = 0;
      for (let i = 0; i < ids.month.length; i++) {
        if (ids.month[i].startsWith(value)) {
          month = i + 1;
          break;
        }
      }
      if (month) {
        values.push({ value: month, type: 'MONTH' });
      }
    }
  }

  const parser = new DateParser(values);
  const ret = parser.getDateTime();

  if (!ret) return null;

  return [{ type: 'DATETIME', value: ret }];
};

export const time = (tokens) => {
  let hour = -1;
  let min = -1;
  let sec = -1;
  let hasAmpm = false;

  for (const token of tokens) {
    switch (token.type) {
      case 'NUMBER':
        const num = token.value;
        if (num.is_percent || num.value < 0 || num.value % 1 !== 0) return null;
        if (hour < 0) hour = num.value;
        else if (min < 0) min = num.value;
        else if (sec < 0) sec = num.value;
        else return null;
        break;
      case 'IDENT':
        const value = token.value.toLowerCase();
        if (!['am', 'pm'].includes(value)) return null;
        if (hour === 12) hour = 0;
        if (hour > 12 && value === 'am') return null;
        if (hour < 12 && value === 'pm') hour += 12;
        hasAmpm = true;
        break;
      case 'COLON':
        break;
      default:
        return null;
    }
  }

  if (min < 0 && hasAmpm) min = 0;
  if (hour < 0 || min < 0) return null;
  if (sec < 0) sec = 0;
  if (sec >= 60 || min >= 60 || hour >= 24) return null;

  const now = new Date();
  const offset = now.getTimezoneOffset() * -60;
  const timestamp = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    min,
    sec,
  ).getTime();

  return [{ type: 'DATETIME', value: { timestamp, offset } }];
};

export const datetime = (tokens) => {
  const hasTime = ({ timestamp, offset }) => {
    const date = new Date(timestamp + offset * 1000);
    return (
      date.getUTCHours() > 0 ||
      date.getUTCMinutes() > 0 ||
      date.getUTCSeconds() > 0
    );
  };

  if (tokens.length !== 2) return null;
  if (tokens[0].type !== 'DATETIME' || tokens[1].type !== 'DATETIME')
    return null;

  const dt1 = tokens[0].value;
  const dt2 = tokens[1].value;

  let dateObj;
  let timeObj;

  if (hasTime(dt1) && hasTime(dt2)) return null;
  if (!hasTime(dt1) && !hasTime(dt2)) return null;

  if (hasTime(dt1)) {
    dateObj = dt2;
    timeObj = dt1;
  } else {
    dateObj = dt1;
    timeObj = dt2;
  }

  const date = new Date(dateObj.timestamp + dateObj.offset * 1000);
  const time = new Date(timeObj.timestamp + timeObj.offset * 1000);

  date.setHours(
    time.getUTCHours(),
    time.getUTCMinutes(),
    time.getUTCSeconds(),
    0,
  );

  const offset = date.getTimezoneOffset() * -60;

  return [{ type: 'DATETIME', value: { timestamp: date.getTime(), offset } }];
};
