import { buttonMixins } from '@/assets/js/Mixins/Partials/buttons';
import { cardMixins } from '@/assets/js/Mixins/Partials/cards';

import { reactive } from 'vue';
import AxiosForm from '@/assets/js/Mixins/Class/AxiosForm';

// eslint-disable-next-line import/prefer-default-export
export const mixins = {
  ...buttonMixins,
  ...cardMixins,
  arrayRange(length, start = 0, step = 1) {
    return Array.from({ length }, (_, i) => start + i * step);
  },
  /**
   * Pengecekan apakah string nama file mengandung ekstensi yang dibolehkan.
   * @param {String} filename - Nama dari file
   * @param {String[]} allowedExtension - Ekstensi yang diperbolehkan. Note gunakan tanda titik apabila ingin presisi.
   * @return {boolean}
   */
  checkFileExtension(filename, allowedExtension) {
    return new RegExp(`(${allowedExtension.join('|').replace(/\./gi, '\\.')})$`).test(filename);
  },
  /**
   * Menampilkan konfirmasi reload
   * @param ev Browser Event
   */
  confirmUnload(ev) {
    ev.preventDefault();
    // eslint-disable-next-line no-param-reassign
    ev.returnValue = '';
  },
  /**
   * Merubah URL file yang di generate oleh Eloquent agar bisa diakses.
   *
   * TODO: Delete ini nanti ganti convertPathToLink
   * @param link
   * @return {string}
   */
  convertFilePath(link) {
    return `storage${link.substring(6)}`;
  },
  /**
   * Merubah path dari database agar bisa dipanggil sebagai URL
   * @param {String} path - Path dari database
   * @return {String} URL File
   */
  convertPathToLink(path) {
    return `/${path.replace('public', 'storage')}`;
  },
  /**
   * Merubah tanggal dengan format JS (yyyy-mm-ddThh:mm:ss.zzzz) ke format yang bisa diterima SQL (yyyy-mm-dd hh:mm:ss).
   * Fungsi toISOString() merubah waktu dari locale ke timezone UTC (GMT+0) oleh karena itu tanggal dirubah dulu sesuai
   * offset dari timezone agar output benar.
   * @param {Date} inputDate - Tanggal input.
   * @return {String} - String tanggal dengan format yyyy-mm-dd hh:mm:ss
   */
  convertISODate(inputDate) {
    if (!inputDate && !this.isValidDate(inputDate)) return null;
    const timestamp = inputDate.getTime() - inputDate.getTimezoneOffset() * 60000;
    const correctDate = new Date(timestamp);
    return correctDate.toISOString().split('.').shift().replaceAll('T', ' ');
  },
  convertURLParam(obj, mainKey) {
    return Object.entries(obj)
      .map(([key, val]) => {
        if (this.checkVarType(val) === 'array') {
          return val.map((x) => `${mainKey}[${key}][]=${x}`).join('&');
        }
        // eslint-disable-next-line
        const v = val === true || val === false ? (val ? 1 : 0) : val;
        return `${mainKey}[${key}]=${v}`;
      })
      .join('&');
  },
  /**
   * Date() secara default merubah ke local timezone, maka apabila langsung menggunakan Date() maka untuk jam Indonesia
   * akan maju 7 jam. Fungsi ini mengatasi hal tersebut.
   *
   * TODO: Ini kenapa ngga langsung aja ._.
   * @param isoDateStr String Date yang akan dirubah menjadi Date()
   * @returns {Date} Ya hasilnya :D
   */
  createLocalDate(isoDateStr) {
    return new Date(isoDateStr);
  },
  /**
   * Pengecekkan apakah browser sudah memiliki key untuk mengatur dark mode, apabila belum maka akan dibuatkan baru.
   */
  defaultDarkModeCheck() {
    let displayMode;

    const changeMode = function () {
      if (displayMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };

    if (!localStorage.getItem('theme')) {
      // Sesuaikan dengan konfigurasi dark mode dari sistem.
      // eslint-disable-next-line
      displayMode = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

      // Buat item di localstorage
      localStorage.setItem('theme', displayMode ? 'dark' : 'light');
      changeMode();
    } else {
      // Sesuaikan dengan item yang ada di localstorage
      displayMode = localStorage.getItem('theme') === 'dark';
      changeMode();
    }
  },
  // TODO: Kenapa ngga langsung juga ._.
  firstDateOfMonth() {
    const cur = new Date();
    return `${cur.getFullYear()}-${cur.getMonth() + 1}-1`;
  },
  fixedDecimal(number, behindDecimal = 4) {
    return parseFloat(parseFloat(number).toFixed(behindDecimal));
  },
  /**
   * Mendapatkan value dari cookie.
   * @param {string} name - Key dari cookie yang ingin diambil nilannya
   * @returns {string|null}
   */
  getCookie(name) {
    const re = new RegExp(`${name}=([^;]+)`);
    const value = re.exec(document.cookie);
    return value != null ? decodeURIComponent(value[1]) : null;
  },

  /**
   * Karena Laravel menyimpan nama file dengan path, ekstrak string tersebut untuk mendapatkan nama file saja.
   * @param {String} path - String path
   * @return {String} - Nama file
   */
  getFilenameFromPath(path) {
    const arr = path.split('/');
    return arr[arr.length - 1];
  },
  /**
   * Mendapatkan parameter yang ada di URL
   *
   * @param paramName Key yang akan diambil. Apabila kosong, akan memberikan value iterator dari semua param.
   * @returns {string|IterableIterator<[string, string]>}
   */
  getUrlParameter(paramName = '') {
    const param = new URLSearchParams(window.location.search);
    return paramName ? param.get(paramName) : param.entries();
  },
  /**
   * Mengecek apakah user bisa mengakses sebuah fitur berdasarkan permission yang dimiliki.
   * @param permissionNeeded
   * @returns {boolean}
   */
  permissionCheck(permissionNeeded) {
    const x = this.getUserPermissions();
    if (x === 'wm') return true;

    const createRegex = (pat) => new RegExp(`^${pat.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);

    if (typeof permissionNeeded === 'string') {
      // Single string pattern, check directly
      const regex = createRegex(permissionNeeded);
      return x.some((item) => regex.test(item));
    }

    if (Array.isArray(permissionNeeded)) {
      // Array of patterns, check if at least one matches
      return permissionNeeded.some((pat) => {
        const regex = createRegex(pat);
        return x.some((item) => regex.test(item));
      });
    }

    throw new TypeError('Pattern must be a string or an array of strings');
  },
  async loadServerFile(url) {
    try {
      // Fetch the image data from the server
      const response = await fetch(url);
      const blob = await response.blob(); // Convert the response to a Blob
      const contentDisposition = response.headers.get('content-disposition');
      // Extract the file name from the URL
      // eslint-disable-next-line
      const fileName = contentDisposition != null ? contentDisposition.split(';')[1].split('=')[1] : url.split('/').pop().split('?')[0]; // Remove query parameters

      const supportedMime = ['image/', 'audio/', 'video/', 'application/'];
      const checkString = (str) => supportedMime.some((mime) => str.includes(mime));

      if (!checkString(blob.type)) {
        // eslint-disable-next-line
        console.error('Unsupported file type:', blob.type);
        throw Error;
      }

      // Create a File object from the Blob
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      // eslint-disable-next-line
      console.error('Error downloading image:', error);
      return null;
    }
  },
  /**
   * Menambahkan parameter baru di url saat ini.
   *
   * @param paramName
   * @param paramValue
   */
  setUrlParameter(paramName, paramValue) {
    const url = new URL(window.location.href);
    url.searchParams.set(paramName, paramValue);
    // eslint-disable-next-line no-restricted-globals
    history.pushState({}, '', url);
  },
  /**
   * Pengecekkan apakah argumen yang dikirim merupakan instance dari Date dan merupakan date yang valid
   * @param {Object|Date} date - Object yang akan dicek.
   * @return {boolean} - true/false sesuai apakah date merupakan object Date.
   */
  isValidDate(date) {
    // eslint-disable-next-line no-restricted-globals
    return date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date);
  },
  jsonToFormData(json, formData = new FormData(), parentKey = '') {
    Object.keys(json).forEach((key) => {
      const value = json[key];
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (value instanceof FileList) {
        value.forEach((file, index) => formData.append(`${newKey}[${index}]`, file));
      } else if (value instanceof File) {
        formData.append(newKey, value);
      } else if (value instanceof Date) {
        formData.append(newKey, value.toISOString());
      } else if (Array.isArray(value)) {
        value.forEach((v, i) => this.jsonToFormData(v, formData, `${newKey}[${i}]`));
      } else if (typeof value === 'object' && value !== null) {
        this.jsonToFormData(value, formData, newKey);
      } else if (value !== null) {
        // Check for null values and omit them
        formData.append(newKey, value);
      }
      // No else block needed here since null values are handled above
    });

    return formData;
  },
  leadZero(num, amount = 2, pad = '0') {
    return String(num).padStart(amount, pad);
  },
  /**
   * Map object ke object baru untuk menggabungkan nilai yang hilang
   *
   * @param obj
   * @param defaults
   * @returns {*}
   */
  mapObject(obj, defaults) {
    return {
      ...obj,
      ...Object.keys(defaults).reduce((acc, key) => {
        if (!Object.hasOwn(obj, key)) {
          acc[key] = defaults[key];
        }
        return acc;
      }, {}),
    };
  },
  nthAlphabet(n) {
    let result = '';
    while (n >= 0) {
      const remainder = n % 26;
      result = String.fromCharCode(remainder + 97) + result;
      n = Math.floor(n / 26) - 1;
    }
    return result;
  },
  /**
   * Menyebutkan terbilang angka
   * @param {string|Number} number Angka yang ingin disebutkan
   * @returns {string}
   */
  spellNumber(number) {
    if (Number.isNaN(number)) {
      return '-';
    }

    const numberString = Math.abs(number).toString();

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
     * @param numString
     * @returns {string}
     */
    const spellThreeDigits = (numString) => {
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
    const numberParts = numberString.split(/(\d{3})/).filter(Boolean);

    // Handle desimal
    let decimalPart = '';
    if (numberString.indexOf('.') !== -1) {
      decimalPart = ' koma ';
      numberString
        .split('.')[1]
        .split('')
        .map((digit) => ones[digit])
        .join('');
    }

    // Mulai eja :D
    let spelledNumber = '';
    for (let i = numberParts.length - 1; i >= 0; i--) {
      const part = numberParts[i];
      const spelledPart = spellThreeDigits(part);
      if (spelledPart) {
        spelledNumber = `${spelledPart + (thousands[i] ? ` ${thousands[i]}` : '')} ${spelledNumber}`;
      }
    }

    return spelledNumber.trim() + decimalPart;
  },
  /**
   * Fungsi untuk sorting string
   * @param {String|Object} a - Pembanding kiri.
   * @param {String|Object} b - Pembanding kanan.
   * @param {String} key - Apabila a dan b merupakan object, key adalah isi dari object yang akan dibandingkan.
   * @returns {number}
   */
  sortString(a, b, key = undefined) {
    if (key) return `${a[key]}`.localeCompare(b[key]);
    return a.localeCompare(b);
  },
  /**
   * Menerjemahkan date string ke string tanggal yang dipahami user.
   * @param {String|Date} date - Tanggal yang akan dimasukkan. Apabila String, pastikan sesuai ISO 8061
   * (Misal: 2020-01-01T00:02:00Z)
   * @param {Boolean} [withDay=false] - Apabila true, maka hari juga akan ditulis.
   * @param {String} [timeDelimiter=null] - Kata yang menjadi pemisah antara tanggal dan waktu [Misal timeDelimiter =
   * "Pukul", maka outputnya "dd-mm-yyyy Pukul hh:mm:ss"]. Apabila kosong/null, maka waktu tidak akan ditampilkan.
   * @param {Boolean} [shortMonth=false] - Apabila true, penulisan bulan akan disingkat 3 huruf.
   * @param {Boolean} [shortDay=false] - Apabila true, penulisan hari akan disingkat 3 huruf.
   * @param {Boolean} [withoutDate=false] - Apabila true, hanya menampilkan Bulan dan Tahun saja. Parameter ini akan
   * mengoverride withDay dan timeDelimiter karena tidak menampilkan 2 hal tersebut.
   * @return {string}
   */
  translateDate(
    date,
    withDay = false,
    timeDelimiter = null,
    shortMonth = false,
    shortDay = false,
    withoutDate = false,
    onlyTime = false,
  ) {
    let result = null;
    if (date instanceof Date) result = date;
    else result = this.createLocalDate(date);

    let days;
    let months;
    if (shortDay) {
      days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    } else {
      days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    }

    if (shortMonth) {
      months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    } else {
      months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
    }

    if (withoutDate) return `${months[result.getMonth()]} ${result.getFullYear()}`;
    if (onlyTime) {
      const hour = `0${result.getHours()}`.slice(-2);
      const minute = `0${result.getMinutes()}`.slice(-2);
      const second = `0${result.getSeconds()}`.slice(-2);
      return `${hour}:${minute}:${second}`;
    }

    const day = withDay ? `${days[result.getDay()]}, ` : '';
    let time = null;
    if (timeDelimiter) {
      const hour = `0${result.getHours()}`.slice(-2);
      const minute = `0${result.getMinutes()}`.slice(-2);
      const second = `0${result.getSeconds()}`.slice(-2);
      time = ` ${timeDelimiter} ${hour}:${minute}:${second}`;
    } else time = '';

    return `${day}${result.getDate()} ${months[result.getMonth()]} ${result.getFullYear()}${time}`;
  },
  translateDateRange(date1, date2, withoutDay = false) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    let output = '';

    const getDay = (dt) => dt.toLocaleDateString('id', options).split(',')[0];
    const getMon = (dt) => dt.toLocaleDateString('id', { month: 'long' });

    // Check if the dates are on the same month
    if (d1.getMonth() === d2.getMonth()) {
      const useDay = withoutDay ? '' : `${getDay(d1)} - ${getDay(d2)}, `;
      output = `${useDay}${d1.getDate()}-${d2.getDate()} ${getMon(d1)} ${d1.getFullYear()}`;
      // eslint-disable-next-line brace-style
    }
    // Check if the dates are in the same year but different months
    else if (d1.getFullYear() === d2.getFullYear()) {
      const p1 = `${withoutDay ? '' : `${getDay(d1)}, `}${d1.getDate()} ${getMon(d1)}`;
      const p2 = `${withoutDay ? '' : `${getDay(d2)}, `}${d2.getDate()} ${getMon(d2)}`;
      output = `${p1} - ${p2} ${d1.getFullYear()}`;
    }
    // If the dates are in different years
    else {
      output = `${d1.toLocaleDateString('id', options)} - ${d2.toLocaleDateString('id', options)}`;
    }

    return output;
  },
  checkVarType(variable, target = null) {
    const localCheck = (checkedVar) => Object.prototype.toString.call(checkedVar).slice(8, -1).toLowerCase();
    if (!target) return localCheck(variable);
    if (target === 'object' || target === 'obj') return Object.prototype.toString.call(variable) === '[object Object]';

    return localCheck(variable) === target;
  },
  /**
   * Membuat object dari class FormTemplate.
   * Digunakan ketika request anda Axios.
   * @param {Object} data Data dari form
   * @param theDefault Data default dari form
   * @returns {UnwrapNestedRefs<AxiosForm>}
   */
  useFormTemplate(data = null, theDefault = undefined) {
    return reactive(new AxiosForm(data, theDefault));
  },
  /**
   *
   * @param data
   * @param theDefault
   * @returns {AxiosForm}
   */
  useFormTemplateNonReactive(data = null, theDefault = undefined) {
    return new AxiosForm(data, theDefault);
  },
  formatToIDR(number) {
    let x = number;
    if (typeof x !== 'number') {
      x = Number.parseInt(number, 10);
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  },
};
