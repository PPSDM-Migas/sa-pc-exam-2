/**
 * Pengecekan apakah string nama file mengandung ekstensi yang dibolehkan.
 * @param {String} filename - Nama dari file
 * @param {String[]} allowedExtension - Ekstensi yang diperbolehkan. Note gunakan tanda titik apabila ingin presisi.
 * @return {boolean}
 */
// eslint-disable-next-line
const checkFileExtension = (filename: string, allowedExtension: string[]): boolean => new RegExp(`(${allowedExtension.join('|').replace(/\./gi, '\\.')})$`).test(filename);

/**
 * Karena Laravel menyimpan nama file dengan path, ekstrak string tersebut untuk mendapatkan nama file saja.
 * @param {String} path - String path
 * @return {String} - Nama file
 */
const getFilenameFromPath = (path: string): string => {
  const arr = path.split('/');
  return arr[arr.length - 1];
};

/**
 * Merubah path dari database agar bisa dipanggil sebagai URL
 * @param path - Path dari database
 * @return URL File
 */
const convertPathToLink = (path: string): string => `/${path.replace('public', 'storage')}`;

/**
 * Mengubah object ke format parameter URL
 * @param obj - Object yang akan dikonversi
 * @param mainKey - Key utama dalam URL
 * @returns String query parameter
 */
const convertURLParam = (obj: Record<string, any>, mainKey: string): string => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mapping = ([key, val]) => {
    if (Array.isArray(val)) {
      return val.map((x) => `${mainKey}[${key}][]=${encodeURIComponent(x)}`).join('&');
    }
    const vv = val ? 1 : 0;
    const v = typeof val === 'boolean' ? vv : val;
    return `${mainKey}[${key}]=${encodeURIComponent(v)}`;
  };
  return Object.entries(obj).map(mapping).join('&');
};

/**
 * Pengecekkan apakah browser sudah memiliki key untuk mengatur dark mode, apabila belum maka akan dibuatkan baru.
 */
const defaultDarkModeCheck = (): void => {
  let displayMode: boolean;

  const changeMode = () => {
    if (displayMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  if (!localStorage.getItem('theme')) {
    // eslint-disable-next-line
    displayMode = localStorage.theme === (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    localStorage.setItem('theme', displayMode ? 'dark' : 'light');
    changeMode();
  } else {
    displayMode = localStorage.getItem('theme') === 'dark';
    changeMode();
  }
};

/**
 * Mendapatkan value dari cookie.
 * @param name - Key dari cookie yang ingin diambil nilainya
 * @returns String cookie atau null jika tidak ditemukan
 */
const getCookie = (name: string): string | null => {
  const re = new RegExp(`${name}=([^;]+)`);
  const value = re.exec(document.cookie);
  return value != null ? decodeURIComponent(value[1]) : null;
};

/**
 * Mendapatkan parameter yang ada di URL
 * @param paramName - Key yang akan diambil. Apabila kosong, akan memberikan semua parameter.
 * @returns Nilai parameter atau iterator dari semua param.
 */
const getUrlParameter = (paramName = ''): string | IterableIterator<[string, string]> => {
  const param = new URLSearchParams(window.location.search);
  return paramName ? param.get(paramName) || '' : param.entries();
};

/**
 * Menambahkan parameter baru di URL saat ini.
 * @param paramName - Nama parameter
 * @param paramValue - Nilai parameter
 */
const setUrlParameter = (paramName: string, paramValue: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set(paramName, paramValue);
  // eslint-disable-next-line no-restricted-globals
  history.pushState({}, '', url);
};

export { convertPathToLink, convertURLParam, defaultDarkModeCheck, getCookie, getUrlParameter, setUrlParameter };
