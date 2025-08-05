import AxiosForm from '@/assets/js/Mixins/Class/AxiosForm';
import { reactive } from 'vue';

/**
 * Membuat object dari class FormTemplate.
 * Digunakan ketika request anda Axios.
 * @param {Object} data Data dari form
 * @param theDefault Data default dari form
 * @returns {UnwrapNestedRefs<AxiosForm>}
 */
const useFormTemplate = (data = null, theDefault = undefined) => {
  return reactive(new AxiosForm(data, theDefault));
};
/**
 *
 * @param data
 * @param theDefault
 * @returns {AxiosForm}
 */
const useFormTemplateNonReactive = (data = null, theDefault = undefined) => {
  return new AxiosForm(data, theDefault);
};

export { useFormTemplate, useFormTemplateNonReactive };
