import { isReactive, toRaw } from 'vue';

export default class AxiosForm {
  constructor(initData = {}, defaultData = undefined) {
    this.open = false;
    this.disable = false;

    this.form = isReactive(initData) ? toRaw(initData) : initData;
    if (defaultData) this.default = isReactive(defaultData) ? toRaw(defaultData) : defaultData;
    else this.default = structuredClone(this.form);

    this.errors = {};
    Object.keys(this.form).forEach((e) => {
      this.errors[e] = [];
    });
    this.mode = 'Tambah'; // Tambah, Kelola, Edit, Delete
  }

  onDisplay() {
    return this.open;
  }

  onDisable() {
    return this.disabled;
  }

  /**
   * Merubah nilai open => Menyembunyikan/menampilkan modal.
   * @param {Boolean|0} val - Apabila didefinisi, maka rubah sesuai nilai yang didefinisi. Jika tidak rubah sesuai
   * lawan dari yang sekarang.
   */
  toggleDisplay(val = 0) {
    if (val === 0) this.open = !this.open;
    else this.open = val;
  }

  /**
   * Merubah nilai disabled => Apakah form bisa ditutup atau tidak.
   * @param {Boolean|0} val - Apabila didefinisi, maka rubah sesuai nilai yang didefinisi. Jika tidak rubah sesuai
   * lawan dari yang sekarang.
   */
  toggleDisable(val = 0) {
    if (val === 0) this.disabled = !this.disabled;
    else this.disabled = val;
  }

  /**
   * Rubah value dan key dari form agar sesuai dengan default.
   */
  setDefault() {
    this.form = this.default;
  }

  /**
   * Mengatur agar semua variabel di set ke false.
   */
  allFalse() {
    this.disabled = false;
    this.open = false;
  }

  /**
   * Mendapatkan isi variabel data.
   * @param {String} [targetKey=null] - Melihat data di key yang disebutkan saja, tidak semua form.
   * @return {Object}
   */
  get(targetKey = null) {
    if (targetKey) return this.form[targetKey];
    return this.form;
  }

  setErrors(err) {
    this.errors = err;
  }

  getErrors(key) {
    return key && Object.keys(this.errors).includes(key) ? this.errors[key] : [];
  }

  modifyDefault(newObj) {
    this.default = isReactive(newObj) ? structuredClone(toRaw(newObj)) : structuredClone(newObj);
  }

  modifyForm(newObj, defaultToo = false) {
    this.form = isReactive(newObj) ? structuredClone(toRaw(newObj)) : structuredClone(newObj);

    if (defaultToo) this.modifyDefault(newObj);
  }

  getMode() {
    return this.mode;
  }

  setMode(crud = 'c') {
    this.mode = {
      c: 'Tambah',
      u: 'Kelola',
      d: 'Delete',
    }[crud];
  }
}
