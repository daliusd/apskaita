const LT_NUMBERS = {
  0: 'nulis',
  1: 'vienas',
  2: 'du',
  3: 'trys',
  4: 'keturi',
  5: 'penki',
  6: 'šeši',
  7: 'septyni',
  8: 'aštuoni',
  9: 'devyni',
  10: 'dešimt',
  11: 'vienuolika',
  12: 'dvylika',
  13: 'trylika',
  14: 'keturiolika',
  15: 'penkiolika',
  16: 'šešiolika',
  17: 'septyniolika',
  18: 'aštuoniolika',
  19: 'devyniolika',
  20: 'dvidešimt',
  30: 'trisdešimt',
  40: 'keturiasdešimt',
  50: 'penkiasdešimt',
  60: 'šešiasdešimt',
  70: 'septyniasdešimt',
  80: 'aštuoniasdešimt',
  90: 'devyniasdešimt',
  100: 'šimtas',
};

const formsFor100 = {
  1: 'šimtas',
  2: 'šimtai',
};

const formsForNextPart = {
  1: {
    0: 'tūkstančių',
    1: 'tūkstantis',
    2: 'tūkstančiai',
  },
  2: {
    0: 'milijonų',
    1: 'milijonas',
    2: 'milijonai',
  },
  3: {
    0: 'milijardų',
    1: 'milijardas',
    2: 'milijardai',
  },
};

const formsEuros = {
  0: 'eurų',
  1: 'euras',
  2: 'eurai',
};

function getForm(number) {
  if (number % 10 === 0 || (number > 10 && number < 20)) {
    return 0;
  } else if (number % 10 === 1) {
    return 1;
  }
  return 2;
}

function getPartInWords(part) {
  const belowHundred = part % 100;
  let words = '';
  if (belowHundred > 0 && belowHundred < 20) {
    words = LT_NUMBERS[belowHundred];
  } else if (belowHundred >= 20) {
    const lastDigit = belowHundred % 10;
    words =
      LT_NUMBERS[belowHundred - lastDigit] +
      (lastDigit !== 0 ? ' ' + LT_NUMBERS[lastDigit] : '');
  }

  if (part >= 100) {
    const digit = Math.floor(part / 100);
    words =
      LT_NUMBERS[digit] +
      ' ' +
      formsFor100[getForm(digit)] +
      (words ? ' ' + words : '');
  }

  return words;
}

export function getPriceInWords(price: number): string {
  if (price === 0) {
    return LT_NUMBERS[0] + ' ' + formsEuros[0];
  }

  let tp = 0;
  let words = '';
  while (price !== 0) {
    if (tp === 4) {
      return 'PER DIDELIS SKAIČIUS';
    }

    const part = price % 1000;
    if (part !== 0) {
      const inWords = getPartInWords(part);
      const form = getForm(part % 100);
      words =
        inWords +
        ' ' +
        (tp === 0 ? formsEuros[form] : formsForNextPart[tp][form]) +
        (words ? ' ' + words : '');
    } else {
      if (tp === 0) {
        words = formsEuros[0];
      }
    }

    price = (price - part) / 1000;

    tp++;
  }

  return words;
}
