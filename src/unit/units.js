const units = [
  {
    key: 'm',
    aliases: ['meter', 'meters'],
  },
  {
    key: 'mm',
    aliases: ['millimeter', 'millimeters'],
    base: {
      key: 'm',
      factor: 0.001,
    },
  },
  {
    key: 'cm',
    aliases: ['centimeter', 'centimeters'],
    base: {
      key: 'm',
      factor: 0.01,
    },
  },
  {
    key: 'km',
    aliases: ['kilometer', 'kilometers'],
    base: {
      key: 'm',
      factor: 1000,
    },
  },
  {
    key: 'um',
    aliases: ['micrometer', 'micrometers', 'μm'],
    base: {
      key: 'm',
      factor: 0.000001,
    },
  },
  {
    key: 'nm',
    aliases: ['nanometer', 'nanometers'],
    base: {
      key: 'm',
      factor: 0.000000001,
    },
  },
  {
    key: 'in',
    aliases: ['inch', 'inches'],
    base: {
      key: 'm',
      factor: 0.0254,
    },
  },
  {
    key: 'ft',
    aliases: ['foot', 'feet'],
    base: {
      key: 'm',
      factor: 0.3048,
    },
  },
  {
    key: 'yd',
    aliases: ['yard', 'yards'],
    base: {
      key: 'm',
      factor: 0.9144,
    },
  },
  {
    key: 'mi',
    aliases: ['mile', 'miles'],
    base: {
      key: 'm',
      factor: 1609.344,
    },
  },
  {
    key: 'nmi',
    aliases: ['nautical mile', 'nautical miles'],
    base: {
      key: 'm',
      factor: 1852,
    },
  },
  {
    key: 'g',
    aliases: ['gram', 'grams'],
  },
  {
    key: 'kg',
    aliases: ['kilogram', 'kilograms'],
    base: {
      key: 'g',
      factor: 1000,
    },
  },
  {
    key: 't',
    aliases: ['tonne', 'tonnes'],
    base: {
      key: 'kg',
      factor: 1000,
    },
  },
  {
    key: 'ton',
    aliases: ['tons'],
    base: {
      key: 'kg',
      factor: 907.18474,
    },
  },
  {
    key: 'oz',
    aliases: ['ounce', 'ounces'],
    base: {
      key: 'g',
      factor: 28.349523125,
    },
  },
  {
    key: 'lb',
    aliases: ['pound', 'pounds'],
    base: {
      key: 'g',
      factor: 453.59237,
    },
  },
  {
    key: 'st',
    aliases: ['stone', 'stones'],
    base: {
      key: 'kg',
      factor: 6.35029318,
    },
  },
  {
    key: 'l',
    aliases: ['liter', 'liters'],
  },
  {
    key: 'ml',
    aliases: ['milliliter', 'milliliters'],
    base: {
      key: 'l',
      factor: 0.001,
    },
  },
  {
    key: 'gal',
    aliases: ['gallon', 'gallons'],
    base: {
      key: 'l',
      factor: 3.785411784,
    },
  },
  {
    key: 'qt',
    aliases: ['quart', 'quarts'],
    base: {
      key: 'l',
      factor: 0.946352946,
    },
  },
  {
    key: 'pt',
    aliases: ['pint', 'pints'],
    base: {
      key: 'l',
      factor: 0.473176473,
    },
  },
  {
    key: 'floz',
    aliases: ['fl oz', 'fluid ounce', 'fluid ounces'],
    base: {
      key: 'l',
      factor: 0.0295735295625,
    },
  },
  {
    key: 'cup',
    aliases: ['cups'],
    base: {
      key: 'l',
      factor: 0.2365882365,
    },
  },
  {
    key: 'tbsp',
    aliases: ['tablespoon', 'tablespoons'],
    base: {
      key: 'l',
      factor: 0.01478676478125,
    },
  },
  {
    key: 'tsp',
    aliases: ['teaspoon', 'teaspoons'],
    base: {
      key: 'l',
      factor: 0.00492892159375,
    },
  },
];

export default units;
