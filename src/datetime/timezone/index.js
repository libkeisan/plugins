import moment from './moment-timezone.js';
import Fuse from './fuse.js';
import cities from './cities.js';
import { parseDate } from '../actions/datetime.js';

const fuse = new Fuse(cities, {
  keys: ['city_ascii', 'country', 'iso2'],
  includeScore: true,
  threshold: 0.3,
});

export const search = (str) => {
  const matches = fuse.search(str);
  keisan.log(JSON.stringify(matches));
  const zones = [...new Set(matches.map((m) => m.item.timezone))];
  if (!zones.length) return null;
  if (zones.length > 1) throw new Error('Multiple matches found');
  return zones[0];
};

export const setSpecial = (tokens, ids) => {
  const parsed = parseDate([tokens[0]], ids);
  if (parsed.length !== 1 || parsed[0].type !== 'DATETIME') return null;
  return set([parsed[0], { type: 'KEYWORD', value: 'to' }, ...tokens.slice(1)]);
};

const op = (tokens, isSet) => {
  const { timestamp, offset } = tokens[0].value;
  const m = moment.unix(timestamp / 1000).utcOffset(offset / 60);
  if (!m.isValid()) return null;

  const ids = tokens
    .slice(1)
    .map((t) => {
      switch (t.type) {
        case 'IDENT':
          return t.value;
        case 'KEYWORD':
          if (t.value?.toLowerCase() === 'of') return t.value;
          return null;
        default:
          return null;
      }
    })
    .filter(Boolean);
  if (!ids.length) return null;

  const zone = search(ids.join(' '));
  if (!zone) return null;
  const zoneOffset =
    moment
      .unix(timestamp / 1000)
      .tz(zone)
      .utcOffset() * 60;

  let datetime;
  if (isSet) {
    // keep the timestamp unchanged, but update the date and
    //   time values to match the new timezone
    datetime = { timestamp, offset: zoneOffset };
  } else {
    // keep the date and time values unchanged, but update
    //   the timestamp to match the new timezone
    datetime = {
      timestamp: m.utcOffset(zoneOffset / 60, true).unix() * 1000,
      offset: zoneOffset,
    };
  }

  return [{ type: 'DATETIME', value: datetime }];
};

export const set = (tokens) => op(tokens, true);
export const wth = (tokens) => op(tokens, false);
