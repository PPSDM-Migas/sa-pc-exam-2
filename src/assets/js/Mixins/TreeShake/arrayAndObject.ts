const jsonToFormData = (json: Record<string, any>, formData: FormData = new FormData(), parentKey = ''): FormData => {
  Object.keys(json).forEach((key) => {
    const value = json[key];
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (value instanceof FileList) {
      Array.from(value).forEach((file, index) => formData.append(`${newKey}[${index}]`, file));
    } else if (value instanceof File) {
      formData.append(newKey, value);
    } else if (value instanceof Date) {
      formData.append(newKey, value.toISOString());
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => jsonToFormData(v, formData, `${newKey}[${i}]`));
    } else if (typeof value === 'object' && value !== null) {
      jsonToFormData(value, formData, newKey);
    } else if (value !== null) {
      formData.append(newKey, String(value));
    }
  });

  return formData;
};

/**
 * Map an object to a new object, ensuring missing values are filled with defaults.
 *
 * @param obj - The object to merge.
 * @param defaults - The default values.
 * @returns The merged object.
 */
const mapObject = <T extends Record<string, any>, U extends Partial<T>>(obj: T, defaults: U): T & U => ({
  ...obj,
  ...Object.keys(defaults).reduce((acc, key) => {
    if (!(key in obj)) {
      acc[key as keyof U] = defaults[key as keyof U];
    }
    return acc;
  }, {} as U),
});

const arrayRange = (length: number, start = 0, step = 1): number[] =>
  Array.from({ length }, (_, i) => start + i * step);

/**
 * Fungsi untuk sorting string
 * @param a - Pembanding kiri.
 * @param b - Pembanding kanan.
 * @param key - Apabila a dan b merupakan object, key adalah isi dari object yang akan dibandingkan.
 * @returns {number}
 */
const sortString = (a: string | Record<string, any>, b: string | Record<string, any>, key?: string): number => {
  if (key) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return String(a[key]).localeCompare(String(b[key]));
  }
  return String(a).localeCompare(String(b));
};

export { arrayRange, jsonToFormData, mapObject, sortString };
