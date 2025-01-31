const percent = (tokens, isTo) => {
  const nums = tokens.filter((t) => t.type === 'NUMBER').map((t) => t.value);

  if (nums.length === 1) {
    if (!isTo) return null;
    const num = nums[0];
    num.is_percent = true;
    return { type: 'NUMBER', value: num };
  }
  if (nums.length === 2) {
    const n1 = nums[0];
    const n2 = nums[1];
    return {
      type: 'NUMBER',
      value: {
        value: n1.value / n2.value,
        is_percent: isTo,
        merged_minus: false,
      },
    };
  }

  return null;
};

export default {
  rules: [
    `
      NUMBER I_AS I_% I_OF NUMBER -> percent_to
      NUMBER (I_TO | I_AS | I_IN) I_% -> percent_to
      NUMBER I_IS NUMBER I_OF I_WHAT -> percent_of
    `,
  ],
  action: (name, tokens) => {
    let token;
    if (name === 'percent_to') token = percent(tokens, true);
    if (name === 'percent_of') token = percent(tokens, false);
    if (!token) return null;
    return [token];
  },
};
