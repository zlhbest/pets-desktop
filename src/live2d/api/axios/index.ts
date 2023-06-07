import axios, { AxiosStatic } from "axios";

// const base = {
//   axios: axios,
//   baseUrl: "https://api.openai.com",
// };

export class axiosUtil {
  baseUrl: string;
  axios: AxiosStatic;
  constructor(base_url: string) {
    this.baseUrl = base_url;
    this.axios = axios;
    //全局参数，自定义参数可在发送请求时设置
    this.axios.defaults.timeout = 300000000; //超时时间ms
    this.axios.defaults.withCredentials = false;
    // 请求时的拦截
    //回调里面不能获取错误信息
    this.axios.interceptors.request.use(
      function (config) {
        return config;
      },
      function (error) {
        // 当请求异常时做一些处理
        console.log("请求异常：" + JSON.stringify(error));
        return Promise.reject(error);
      }
    );

    this.axios.interceptors.response.use(
      function (response) {
        // Do something with response data

        return response;
      },
      function (error) {
        // Do something with response error
        console.log("响应出错：" + error);
        return Promise.reject(error);
      }
    );
  }
  getAxios(): AxiosStatic {
    return this.axios;
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
