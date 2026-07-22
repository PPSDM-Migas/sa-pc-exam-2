import { saToast } from '@bpmlib/vue-satoast';

const typeMap = {
  success: 'success', green: 'success',
  danger: 'error', red: 'error', error: 'error',
  warning: 'warning', yellow: 'warning',
  info: 'info', blue: 'info', x: 'info',
};

export function pushLegacyToast(payload) {
  if (typeof payload === 'string') {
    saToast.info(payload);
    return;
  }
  const { content, type, title, duration } = payload;
  const method = typeMap[type] ?? 'info';
  saToast[method](content, { title, duration });
}
