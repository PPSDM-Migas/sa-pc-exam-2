/**
 * Memberikan angka padding di depan dan menjadikannya string
 * @param num Angka yang akan dimanipulasi
 * @param amount Jumlah padding yang akan ditambahkan
 * @param pad Angka/huruf yang menjadi padding
 * @return string angka dalam bentuk string dengan padding
 */
const leadZero = (num: number, amount = 2, pad = '0'): string => String(num).padStart(amount, pad);

/**
 * Menyebutkan terbilang angka
 * @param number Angka yang ingin disebutkan
 * @returns string
 */
const spellNumber = (number: string | number): string => {
  if (Number.isNaN(Number(number))) {
    return '-';
  }

  const numberString = Math.abs(Number(number)).toString();

  const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  const teens = [
    ' sepuluh',
    ' sebelas',
    ' dua belas',
    ' tiga belas',
    ' empat belas',
    ' lima belas',
    ' enam belas',
    ' tujuh belas',
    ' delapan belas',
    ' sembilan belas',
  ];
  const tens = [
    '',
    '',
    ' dua puluh',
    ' tiga puluh',
    ' empat puluh',
    ' lima puluh',
    ' enam puluh',
    ' tujuh puluh',
    ' delapan puluh',
    ' sembilan puluh',
  ];
  const hundreds = [
    '',
    ' seratus',
    ' dua ratus',
    ' tiga ratus',
    ' empat ratus',
    ' lima ratus',
    ' enam ratus',
    ' tujuh ratus',
    ' delapan ratus',
    ' sembilan ratus',
  ];
  const thousands = ['', ' ribu', ' juta', ' miliar', ' triliun'];

  /**
   * Eja setiap 3 digit.
   * @param numString string
   * @returns string
   */
  const spellThreeDigits = (numString: string): string => {
    let result = '';
    const hundredsDigit = parseInt(numString[0], 10);
    const tensDigit = parseInt(numString[1], 10);
    const onesDigit = parseInt(numString[2], 10);

    if (hundredsDigit > 0) {
      result += `${hundreds[hundredsDigit]} `;
    }

    if (tensDigit === 1 && onesDigit > 0) {
      result += teens[onesDigit];
    } else {
      if (tensDigit > 0) {
        result += `${tens[tensDigit]} `;
      }
      if (onesDigit > 0) {
        result += ones[onesDigit];
      }
    }

    return result.trim();
  };

  // Split angka per 3 digit
  const numberParts = numberString.match(/\d{1,3}(?=(\d{3})*$)/g) || [];

  // Handle desimal
  let decimalPart = '';
  if (numberString.includes('.')) {
    decimalPart = ' koma ';
    numberString
      .split('.')[1]
      .split('')
      .map((digit) => ones[Number(digit)])
      .join(' ');
  }

  // Mulai eja :D
  let spelledNumber = '';
  for (let i = numberParts.length - 1; i >= 0; i--) {
    const part = numberParts[i];
    const spelledPart = spellThreeDigits(part.padStart(3, '0'));
    if (spelledPart) {
      spelledNumber = `${spelledPart}${thousands[i] ? ` ${thousands[i]}` : ''} ${spelledNumber}`;
    }
  }

  return spelledNumber.trim() + decimalPart;
};

/**
 * Membulatkan angka desimal.
 * @param number angka
 * @param behindDecimal jumlah desimal
 */
const fixedDecimal = (number: number, behindDecimal = 4): number => parseFloat(number.toFixed(behindDecimal));

const nthAlphabet = (n: number): string => {
  let result = '';
  while (n >= 0) {
    const remainder = n % 26;
    result = String.fromCharCode(remainder + 97) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
};

const formatToIDR = (number: number | string): string => {
  const x = typeof number === 'number' ? number : Number.parseInt(number, 10);

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(x);
};

/**
 * Calculate the average of an array.
 *
 * @param {Array} arrayToCount - The array to calculate the average from.
 * @param {boolean} [withoutZero=true] - Whether to filter out numbers less than or equal to 0 before calculating.
 * @param {number|string} [returnIfEmpty=0] - Value to return if the array is empty after filtering.
 * @param {string|null} [associativeKey=null] - If the array contains objects, specify the key to extract values from.
 * (Note: Does not support multidimensional arrays with depth > 2)
 * @returns {number|string} - The calculated average.
 */
const countAverage = (
  arrayToCount: number[],
  withoutZero = true,
  returnIfEmpty = 0,
  associativeKey = null,
): number | string => {
  if (!Array.isArray(arrayToCount) || arrayToCount.length === 0) return returnIfEmpty;

  if (associativeKey) {
    arrayToCount = arrayToCount.map(item => item?.[associativeKey]).filter(val => val !== undefined);
  }

  arrayToCount = arrayToCount.filter(val => typeof val === 'number' && !isNaN(val));

  if (withoutZero) {
    arrayToCount = arrayToCount.filter(num => num > 0);
  }

  return arrayToCount.length !== 0 ? arrayToCount.reduce((sum, num) => sum + num, 0) / arrayToCount.length : returnIfEmpty;
}

export { leadZero, spellNumber, fixedDecimal, nthAlphabet, formatToIDR, countAverage };
