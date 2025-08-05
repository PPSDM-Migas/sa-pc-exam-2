/* eslint-disable no-param-reassign,no-underscore-dangle,class-methods-use-this */
import axios from 'axios';
import { mixins } from "@/assets/js/Mixins/mixinDeprecate.js";
import { isProxy, toRaw } from 'vue'
import {useRouter} from "vue-router";


export default class RequestInstance {
  /**
   * Membuat Instance Axios
   * @param tokenType {string|number}
   */
  constructor(tokenType = 1) {
    this.baseURL = import.meta.env.VITE_BASE_API ?? 'http://127.0.0.1:10600';
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
    });
    this.snip = this.tokenType === 1 ? 'pex' : 'ex';
    this.service = `fuj_${this.snip}`;
    this.requestConfig = {
      headers: {},
      params: {},
      data: null,
    };
    this.tokenType = [1, 2].includes(Number.parseInt(tokenType, 10)) ? Number.parseInt(tokenType, 10) : 1;

    this.axiosInstance.interceptors.request.use(
      (req) => this.requestFulfilled(req),
      (error) => Promise.reject(error),
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (res) => this.responseRejected(res, this.axiosInstance),
    );
  }

  // <========== Pengaturan Cookie ==========>

  /**
   * Set browser cookie untuk menyimpan JWT token
   * @param {string} name Nama key cookie
   * @param {string} value Data yang disimpan dalam cookie
   * @param {Number} lifetimeMinute Lifetime cookie dalam menit
   */
  setCookie(name, value, lifetimeMinute) {
    // let expires = '';
    // if (lifetimeMinute) {
    //   const date = new Date();
    //   date.setTime(date.getTime() + lifetimeMinute * 60 * 1000);
    //   expires = `; expires=${date.toUTCString()}`;
    // }
    // document.cookie = `${name}=${value || ''}${expires}; path=/`;
    sessionStorage.setItem(name, value);
  }

  /**
   * Mendapatkan browser cookie
   * @param {string} name Nama key cookie
   * @returns {null|string}
   */
  getCookie(name) {
    // const nameEQ = `${name}=`;
    // const ca = document.cookie.split(';');
    // for (let i = 0; i < ca.length; i++) {
    //   let c = ca[i];
    //   while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    //   if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    // }
    // return null;
    return sessionStorage.getItem(name) ?? null;
  }

  /**
   * Menghapus browser cookie
   * @param {string} name Nama key cookie yang akan dihapus
   */
  eraseCookie(name) {
    document.cookie = `${name}=; Max-Age=-99999999;`;
    sessionStorage.removeItem(name);
  }

  /**
   * Mendapatkan Access Token
   * @returns {string|null}
   */
  getAccessTk() {
    return this.getCookie(`tkac_${this.service}`);
  }

  /**
   * Mendapatkan Access Token
   * @returns {string|null}
   */
  getRefreshTk() {
    return this.getCookie(`tkrf_${this.service}`);
  }

  setAccessRefreshCookie(access, refresh) {
    this.setCookie(`tkac_${this.service}`, access, 15);
    this.setCookie(`tkrf_${this.service}`, refresh, 150);
  }

  deleteAccessRefreshCookie() {
    this.eraseCookie(`tkac_${this.service}`);
    this.eraseCookie(`tkrf_${this.service}`);
  }

  // <========== Pengelola Token JWT ==========>

  /**
   * Memperbarui token dengan mengirim refresh token ke backend gateway
   * @param {string|null} service Token digunakan untuk service yang mana
   * @returns {Promise<*>}
   */
  async refreshingToken() {
    try {
      const currentRefresh = this.getRefreshTk();
      if (currentRefresh) {
        const response = await axios.post(
          `${this.baseURL}/api/participant-exam/tk-refresh${this.tokenType === 1 ? '1' : '2'}`,
          { refresh: currentRefresh },
        );
        const { access, refresh } = response.data;
        this.setAccessRefreshCookie(access, refresh);
        return access;
      }
      throw new Error('No refresh token available');
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      this.deleteAccessRefreshCookie();
      // TODO: Maybe direct ke login?
      throw error;
    }
  }

  // <========== Pengaturan Interceptor ==========>

  /**
   * Handling di interceptor Axios request ketika fulfilled.
   * @param config Config object dari axios
   * @param {string|null} service Token digunakan untuk service yang mana
   * @returns {Promise<*>}
   */
  async requestFulfilled(config) {
    const accessToken = this.getAccessTk();
    if (!accessToken) {
      console.error('No access token available. Lets get a new one...');
      if (this.getRefreshTk()) {
        await this.refreshingToken()
          .then((access) => {
            config.headers.Authorization = `Bearer ${access}`;
          })
          .catch((e) => {
            console.log(e.message ?? 'Error gaes');
          });
      } else {
        const router = useRouter();
        await router.push('/login');
      }
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  }

  /**
   * Handling di interceptor Axios response ketika rejected.
   * @param error Error yang terjadi
   * @param reqInstance Instance axios target
   * @param {string|null} service Token digunakan untuk service yang mana
   * @returns {Promise<*>}
   */
  async responseRejected(error, reqInstance) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest.headers.Authorization = `Bearer ${await this.refreshingToken()}`;
      return reqInstance(originalRequest);
    }
    return Promise.reject(error);
  }

  /*
   * <========== Axios Parameter Configuration ==========>
   */

  /**
   * Mengatur body dari axios.
   * @param {Object} data Payload request
   * @param {boolean} [asFormData=false] Apabila `true`, body akan dikirim sebagai form data, sedangkan apabila `false`
   * akan menggunakan json.
   * @returns {RequestInstance}
   */
  setBody(data, asFormData = false) {
    // Set the Content-Type header based on useFormData
    this.requestConfig.headers['Content-Type'] = asFormData ? 'multipart/form-data' : 'application/json';

    this.requestConfig.data = asFormData ? mixins.jsonToFormData(data) : data;
    return this;
  }

  /**
   * Mengatur single header dari request.
   * Note apabila key sama, maka value akan ditimpa dengan yang baru.
   * @param {string} key
   * @param {string} value
   * @returns {RequestInstance}
   */
  setHeader(key, value) {
    if (key !== 'Content-Type' || !this.requestConfig.headers['Content-Type']) {
      this.requestConfig.headers[key] = value;
    }
    return this;
  }

  /**
   * Mengatur banyak header dari request.
   * Note apabila key sama, maka value akan ditimpa dengan yang baru.
   * @param {Object} objHeader Object yang setiap key-value pair akan dimasukkan ke Header.
   * @returns {RequestInstance}
   */
  setHeaders(objHeader) {
    Object.keys(objHeader).forEach((key) => {
      if (key !== 'Content-Type' || !this.requestConfig.headers['Content-Type']) {
        this.requestConfig.headers[key] = objHeader[key];
      }
    });
    return this;
  }

  /**
   * Mengatur single URL Parameter dari request.
   * Note apabila key sama, maka value akan ditimpa dengan yang baru.
   * @param {string} key
   * @param {string} value
   * @returns {RequestInstance}
   */
  setUrlParam(key, value) {
    this.requestConfig.params[key] = value;
    return this;
  }

  /**
   * Mengatur banyak URL Parameter dari request.
   * Note apabila key sama, maka value akan ditimpa dengan yang baru.
   * @param {Object} paramsObj Object yang setiap key-value pair akan dimasukkan ke URL Parameter.
   * @returns {RequestInstance}
   */
  setUrlParams(paramsObj) {
    Object.keys(paramsObj).forEach((key) => {
      this.requestConfig.params[key] = paramsObj[key];
    });
    return this;
  }

  /**
   * Mendapatkan config dari object.
   * @returns {{headers: {}, params: {}}}
   */
  getConfig() {
    return {
      params: this.requestConfig.params,
      headers: this.requestConfig.headers,
    };
  }

  /**
   * Menerjemahkan route name ke URL sebenarnya.
   * @param {string} method Metode REST API yang digunakan.
   * @param {string} routeName Nama route di kamus (Biasanya sesuai route laravel)
   * @param {Object} routeParam Object untuk mengisi Query Parameter/Route Parameter dari URL Laravel. Pastikan key
   * sesuai dengan nama dari parameter yang akan diisi.
   * @returns {string}
   */
  setUrl(method, routeName, routeParam) {
    const m = ['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase()) ? method : 'get';
    if (isProxy(routeParam)) {
      routeParam = toRaw(routeParam);
    }
    return mixins.useUrl('srf', routeName, m, routeParam, true);
  }

  /**
   * Eksekusi request get.
   * @param {string} routeName Nama route di kamus (Biasanya sesuai route laravel)
   * @param {Object} routeParam Object untuk mengisi Query Parameter/Route Parameter dari URL Laravel. Pastikan key
   * @returns {Promise<axios.AxiosResponse<any>>}
   */
  get(routeName, routeParam = null) {
    return this.axiosInstance.get(this.setUrl('get', routeName, routeParam), this.getConfig());
  }

  /**
   * Eksekusi request post.
   * @param {string} routeName Nama route di kamus (Biasanya sesuai route laravel)
   * @param {Object} routeParam Object untuk mengisi Query Parameter/Route Parameter dari URL Laravel. Pastikan key
   * @returns {Promise<axios.AxiosResponse<any>>}
   */
  post(routeName, routeParam = null) {
    return this.axiosInstance.post(
      this.setUrl('post', routeName, routeParam),
      this.requestConfig.data,
      this.getConfig(),
    );
  }

  /**
   * Eksekusi request put.
   * @param {string} routeName Nama route di kamus (Biasanya sesuai route laravel)
   * @param {Object} routeParam Object untuk mengisi Query Parameter/Route Parameter dari URL Laravel. Pastikan key
   * @returns {Promise<axios.AxiosResponse<any>>}
   */
  put(routeName, routeParam = null) {
    return this.axiosInstance.put(this.setUrl('put', routeName, routeParam), this.requestConfig.data, this.getConfig());
  }

  /**
   * Eksekusi request delete.
   * @param {string} routeName Nama route di kamus (Biasanya sesuai route laravel)
   * @param {Object} routeParam Object untuk mengisi Query Parameter/Route Parameter dari URL Laravel. Pastikan key
   * @returns {Promise<axios.AxiosResponse<any>>}
   */
  delete(routeName, routeParam = null) {
    return this.axiosInstance.delete(this.setUrl('delete', routeName, routeParam), this.getConfig());
  }

  /**
   * Eksekusi request patch.
   * @param {string} routeName Nama route di kamus (Biasanya sesuai route laravel)
   * @param {Object} routeParam Object untuk mengisi Query Parameter/Route Parameter dari URL Laravel. Pastikan key
   * @returns {Promise<axios.AxiosResponse<any>>}
   */
  patch(routeName, routeParam = null) {
    return this.axiosInstance.patch(
      this.setUrl('patch', routeName, routeParam),
      this.requestConfig.data,
      this.getConfig(),
    );
  }
}
