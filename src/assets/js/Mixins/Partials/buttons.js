// eslint-disable-next-line import/prefer-default-export
export const buttonMixins = {
  buttonColorSet(color) {
    switch (color) {
      case 'primary':
        return 'y__btn-primary';
      case 'secondary':
        return 'y__btn-secondary';
      case 'ternary':
        return 'y__btn-ternary';
      case 'red':
        return 'y__btn-red';
      case 'white':
        return 'y__btn-white';
      case 'green':
        return 'y__btn-green';
      default:
        return color;
    }
  },
  /**
   * Pengaturan padding button.
   * @param {boolean} isHaveDefaultSlot
   * @param {boolean} isExpanded
   * @param {boolean} isSmall
   * @return {string}
   */
  buttonPaddingConfig(isHaveDefaultSlot, isExpanded, isSmall) {
    if (isHaveDefaultSlot) {
      return `py-1.5 pl-3 pr-3 ${isExpanded ? 'w-full' : ''}`;
    }
    // eslint-disable-next-line
    return `${isSmall ? 'h-7' : 'h-9'} all-center ${isExpanded ? 'w-full' : isSmall ? 'w-7' : 'w-9'}`;
  },
};
