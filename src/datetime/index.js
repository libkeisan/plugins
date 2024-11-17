import * as datetime from './actions/datetime';
import * as duration from './actions/duration';
import * as timezone from './timezone';
import { Duration } from './duration';

const ids = {
  suffix: ['th', 'rd', 'st', 'nd'],
  month: [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ],
  era: ['ad', 'bc'],
};

export default {
  tokens: {
    DATETIME: {
      // fields: timestamp, offset
      render: (value) => {
        const { timestamp, offset } = value;
        const date = new Date(timestamp + offset * 1000);
        const iso = date.toISOString();
        return `${iso.slice(0, 19).replace('T', ' ')} ${offset > 0 ? '+' : ''}${offset / 3600}`;
      },
    },
    DURATION: {
      render: (value) => new Duration(value).render(),
    },
  },
  rules: [
    {
      str: `
        n24: NUMBER[0-23]
        n60: NUMBER[0-59]
        ampm: I_AM | I_PM
        num_suffix: ${ids.suffix.map((s) => `I_${s.toUpperCase()}`).join(' | ')}
        month: ${[
          ...ids.month.map((m) => `I_${m.toUpperCase()}`),
          ...ids.month.map((m) => `I_${m.slice(0, 3).toUpperCase()}`),
          'NUMBER[1-12]',
        ].join(' | ')}
        era: ${ids.era.map((e) => `I_${e.toUpperCase()}`).join(' | ')}
        year: NUMBER[1-9999] era?
        date_sep: DIV | MINUS
        date_comp: year | month | NUMBER num_suffix?
        special_date: I_TODAY | I_TOMORROW | I_YESTERDAY | I_NOW

        n24 COLON n60 (COLON n60)? ampm? | n24 ampm -> time
        special_date K_IN IDENT+ -> timezone_set_special
        special_date -> date
        date_comp date_sep? date_comp date_sep? date_comp? -> date
        DATETIME DATETIME -> datetime
      `,
      before: 'neg',
    },
    {
      str: `
        duration_unit: I_SECOND | I_SECONDS | I_SEC | I_SECS | I_SEC | I_MINUTE | I_MINUTES | I_MIN | I_MINS | I_M | I_HOUR | I_HOURS | I_HR | I_HRS | I_H | I_DAY | I_DAYS | I_WEEK | I_WEEKS | I_MONTH | I_MONTHS | I_YEAR | I_YEARS
        duration: NUMBER duration_unit

        duration+ (K_AND duration)? -> duration
        DURATION+ (K_AND DURATION)? (K_TO | K_AS | K_IN) duration_unit -> duration_convert
        DATETIME (PLUS | MINUS) DURATION+ -> date_op
        DATETIME MINUS DATETIME -> date_op

        DATETIME IDENT+ -> timezone_with
        DATETIME K_IN (IDENT | K_OF)+ -> timezone_with
        DATETIME I_CONVERTED? K_TO (IDENT | K_OF)+ -> timezone_set
    `,
      after: 'neg',
    },
  ],
  action: function (name, tokens) {
    if (name === 'date') return datetime.parseDate(tokens, ids);
    if (name === 'time') return datetime.time(tokens);
    if (name === 'datetime') return datetime.datetime(tokens);
    if (name === 'duration') return duration.duration(tokens);
    if (name === 'duration_convert') return duration.convert(tokens);
    if (name === 'date_op') return duration.dateOp(tokens);
    if (name === 'timezone_with') return timezone.wth(tokens);
    if (name === 'timezone_set') return timezone.set(tokens);
    if (name === 'timezone_set_special')
      return timezone.setSpecial(tokens, ids);
    return null;
  },
};
