import { usePage } from '@inertiajs/vue3';
import '@inertiajs/core';

// Augment the module directly
declare module '@inertiajs/core' {
  interface PageProps {
    auth?: {
      fet: string[];
      iwm: boolean;
    };
  }
}

export interface AuthProps {
  fet: string[];
  iwm: boolean;
}

export interface InertiaPageProps {
  auth?: AuthProps;
}

type Signature = {
  [key: string]: never;
};

const findInSignatures = (code: string, signatures: Signature[]): Signature => {
  const filtered = signatures.filter((x) => x.code === code);
  return filtered.length >= 1 ? filtered[0] : signatures[0];
};

/**
 * Mendapatkan permission yang dimiliki oleh pengguna yang sedang login saat ini.
 */
const getUserPermissions = (ignoreWm = false): string | string[] => {
  const mainReturn = (): string[] => usePage().props.auth?.fet ?? [];
  if (ignoreWm) return mainReturn();
  return usePage().props.auth?.iwm === true ? 'wm' : mainReturn();
};

/**
 * Mengecek apakah user bisa mengakses sebuah fitur berdasarkan permission yang dimiliki.
 */
const permissionCheck = (permissionNeeded: string[] | string): boolean => {
  const x = getUserPermissions();
  if (x === 'wm') return true;
  if (typeof x === 'string') return false;
  const createRegex = (pat: string): RegExp => new RegExp(`^${pat.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);

  if (typeof permissionNeeded === 'string') {
    // Single string pattern, check directly
    const regex = createRegex(permissionNeeded);
    return x.some((item: string) => regex.test(item));
  }

  if (Array.isArray(permissionNeeded)) {
    // Array of patterns, check if at least one matches
    return permissionNeeded.some((pat) => {
      const regex = createRegex(pat);
      return x.some((item: string) => regex.test(item));
    });
  }

  throw new TypeError(`Pattern must be a string or an array of strings. Got ${typeof permissionNeeded} instead.`);
};

// eslint-disable-next-line import/prefer-default-export
export { findInSignatures, getUserPermissions, permissionCheck };
