class Currency {
  constructor() {
    this.raw = keisan.load('rates.json');
    if (!this.raw) this.fetch();
    this.data = JSON.parse(this.raw);

    const nextUpdate = this.data.time_next_update_unix;
    if (nextUpdate < Date.now() / 1000) this.fetch();
  }

  fetch() {
    keisan.log('Fetching currency data');
    const res = keisan.get('https://open.er-api.com/v6/latest/USD');
    if (!res || res.status !== 200)
      throw new Error('Failed to fetch currency data');
    this.raw = res.body;
    this.data = JSON.parse(this.raw);
    keisan.save('rates.json', this.raw);
  }

  get(str) {
    const rates = this.data?.rates || {};
    return parseFloat(rates[str]) || 0;
  }
}

export default {
  rules: ['NUMBER IDENT[3] (I_TO | I_AS | I_IN) IDENT[3] -> currency'],
  action: (name, tokens) => {
    const currency = new Currency();
    const rate1 = currency.get(tokens[1].value);
    const rate2 = currency.get(tokens[3].value);

    if (!rate1 || !rate2) return null;
    const num = tokens[0].value;
    num.value *= rate2 / rate1;

    return [
      { type: 'NUMBER', value: num },
      { type: 'IDENT', value: tokens[3].value },
    ];
  },
};
