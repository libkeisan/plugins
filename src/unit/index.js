import units from './units';

const getUnit = (name) => {
  for (const unit of units) {
    if ([unit.key, ...unit.aliases].includes(name.toLowerCase())) {
      return unit;
    }
  }

  return null;
};

const convert = (value, src, dst) => {
  if (src.key === dst.key) return value;
  if (src.base?.key === dst.key) return value * src.base.factor;
  if (dst.base?.key === src.key) return value / dst.base.factor;
  if (src.base?.key !== dst.base?.key || !src.base || !dst.base)
    throw new Error('incompatible units');

  const factor = src.base.factor / dst.base.factor;
  return value * factor;
};

export default {
  rules: [
    {
      str: `
        convert: I_TO | I_AS | I_IN
        (NUMBER IDENT+ | IDENT+ NUMBER) convert IDENT+ -> cast
      `,
      after: 'binop',
    },
  ],
  action: (name, tokens) => {
    let num;
    let src;
    let dst;
    let keyword;

    for (const token of tokens) {
      switch (token.type) {
        case 'NUMBER':
          num = token.value;
          break;
        case 'IDENT':
          if (!keyword) {
            if (src) src += ' ' + token.value;
            else src = token.value;
          } else {
            if (dst) dst += ' ' + token.value;
            else dst = token.value;
          }
          break;
        case 'KEYWORD':
          keyword = token.value;
          break;
      }
    }

    if (!num || !src || !dst) return null;

    keisan.log(JSON.stringify({ num, src, dst }));

    const srcUnit = getUnit(src);
    const dstUnit = getUnit(dst);
    if (!srcUnit || !dstUnit) return null;

    keisan.log(JSON.stringify({ srcUnit, dstUnit }));

    const result = convert(num.value, srcUnit, dstUnit);

    keisan.log(JSON.stringify({ result }));

    return [
      { type: 'NUMBER', value: { value: result } },
      { type: 'IDENT', value: dstUnit.key },
    ];
  },
};
