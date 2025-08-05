// eslint-disable-next-line import/prefer-default-export
export const cardMixins = {
  /**
   * Pilihan warna background card body.
   * @param {string} color
   * @return {string|*}
   */
  cardColorSet(color) {
    switch (color) {
      case 'normal':
        return 'card-normal';
      case 'sub':
        return 'card-sub';
      case 'primary':
        return 'card-primary';
      case 'secondary':
        return 'card-secondary';
      case 'ternary':
        return 'card-ternary';
      case 'red':
        return 'card-red';
      case 'green':
        return 'card-green';
      case 'light':
        return 'card-light';
      case 'dark':
        return 'card-dark';
      default:
        return color;
    }
  },
  /**
   * Pilihan warna background card header dan/atau footer.
   * @param {string} color
   * @return {string|*}
   */
  cardAttributeColorSet(color) {
    switch (color) {
      case 'primary':
        return 'card-atr-primary';
      case 'secondary':
        return 'card-atr-secondary';
      case 'ternary':
        return 'card-atr-ternary';
      default:
        return color;
    }
  },
  /**
   * Pilihan warna background card popup.
   * @param {string} color
   * @return {string|*}
   */
  cardPopupColorSet(color) {
    switch (color) {
      case 'primary':
        return 'card-pop-primary';
      case 'secondary':
        return 'card-pop-secondary';
      case 'ternary':
        return 'card-pop-ternary';
      default:
        return color;
    }
  },
};
