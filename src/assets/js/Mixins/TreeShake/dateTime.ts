/* eslint-disable indent */
/**
 * Menghitung umur berdasarkan tanggal lahir
 * @param {string|Date} birthDate - Birth date string or Date object
 * @returns {number} Age in years
 */
const calculateAge = (birthDate: string | Date): number => {
  console.log(birthDate);
  // Convert string to Date object if necessary
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;

  // Validate date
  if (Number.isNaN(birth.getTime())) {
    throw new Error('Invalid date provided');
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  // Adjust age if birthday hasn't occurred this year
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return Math.max(0, age);
};

/**
 * Mengecek apakah input merupakan Object Date yang valid.
 * @param date variabel yang akan dicek
 * @return true apabila merupakan Date
 */
const isValidDate = (date: any): boolean => date instanceof Date && !Number.isNaN(date.getTime());

/**
 *
 * @param inputDate
 */
const convertISODate = (inputDate: Date | null): string | null => {
  if (!inputDate || !isValidDate(inputDate)) return null;
  const timestamp = inputDate.getTime() - inputDate.getTimezoneOffset() * 60000;
  const correctDate = new Date(timestamp);
  return correctDate.toISOString().split('.')[0].replace('T', ' ');
};

/**
 * Menerjemahkan date string ke string tanggal yang dipahami user.
 * @param date - Tanggal yang akan dimasukkan. Apabila String, pastikan sesuai ISO 8061
 * (Misal: 2020-01-01T00:02:00Z)
 * @param [withDay=false] - Apabila true, maka hari juga akan ditulis.
 * @param [timeDelimiter=null] - Kata yang menjadi pemisah antara tanggal dan waktu [Misal timeDelimiter =
 * "Pukul", maka outputnya "dd-mm-yyyy Pukul hh:mm:ss"]. Apabila kosong/null, maka waktu tidak akan ditampilkan.
 * @param [shortMonth=false] - Apabila true, penulisan bulan akan disingkat 3 huruf.
 * @param [shortDay=false] - Apabila true, penulisan hari akan disingkat 3 huruf.
 * @param [withoutDate=false] - Apabila true, hanya menampilkan Bulan dan Tahun saja. Parameter ini akan
 * mengoverride withDay dan timeDelimiter karena tidak menampilkan 2 hal tersebut.
 * @param [onlyTime=false] - Hanya mengembalikan waktu saja
 * @return String tanggal sesuai permintaan :)
 */
const translateDate = (
  date: string | Date,
  withDay = false,
  timeDelimiter: string | null = null,
  shortMonth = false,
  shortDay = false,
  withoutDate = false,
  onlyTime = false,
): string => {
  let result: Date;
  if (date instanceof Date) {
    result = date;
  } else {
    result = new Date(date);
  }

  if (!isValidDate(result)) return '';

  const days = shortDay
    ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    : ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];

  // eslint-disable-next-line
  const longMonth = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const months = shortMonth
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    : longMonth;

  if (withoutDate) return `${months[result.getMonth()]} ${result.getFullYear()}`;
  if (onlyTime) {
    return `${result.getHours().toString().padStart(2, '0')}:${result.getMinutes().toString().padStart(2, '0')}:${result
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
  }

  const day = withDay ? `${days[result.getDay()]}, ` : '';
  const time = timeDelimiter
    ? ` ${timeDelimiter} ${result.getHours().toString().padStart(2, '0')}:${result
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${result.getSeconds().toString().padStart(2, '0')}`
    : '';

  return `${day}${result.getDate()} ${months[result.getMonth()]} ${result.getFullYear()}${time}`;
};

/**
 * Menerjemahkan date string ke string tanggal yang dipahami user.
 * @param date1
 * @param date2
 * @param withoutDay
 */
const translateDateRange = (date1: string | Date, date2: string | Date, withoutDay = false): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);

  if (!isValidDate(d1) || !isValidDate(d2)) return '';

  const getDay = (dt: Date) => dt.toLocaleDateString('id', options).split(',')[0];
  const getMonth = (dt: Date) => dt.toLocaleDateString('id', { month: 'long' });

  if (d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
    return `${withoutDay ? '' : `${getDay(d1)}, ${d1.getDate()} ${getMonth(d1)} ${d1.getFullYear()}`}`;
  }
  if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
    const useDay = withoutDay ? '' : `${getDay(d1)} - ${getDay(d2)}, `;
    return `${useDay}${d1.getDate()}-${d2.getDate()} ${getMonth(d1)} ${d1.getFullYear()}`;
  }
  if (d1.getFullYear() === d2.getFullYear()) {
    const p1 = `${withoutDay ? '' : `${getDay(d1)}, `}${d1.getDate()} ${getMonth(d1)}`;
    const p2 = `${withoutDay ? '' : `${getDay(d2)}, `}${d2.getDate()} ${getMonth(d2)}`;
    return `${p1} - ${p2} ${d1.getFullYear()}`;
  }
  return `${d1.toLocaleDateString('id', options)} - ${d2.toLocaleDateString('id', options)}`;
};

export { calculateAge, convertISODate, translateDate, translateDateRange };
