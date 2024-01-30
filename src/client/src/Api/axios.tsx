import axios from "axios";
import { useNavigate } from "react-router";
import { refreshToken } from "./AuthApi";
import Cookies from "js-cookie";

const customFetch = axios.create({});
customFetch.interceptors.request.use(
  async (response) => {
      const res = await refreshToken();
      if (!res || (res && res.status >= 400)){
         window.location.href = "/logout";
        }
      Cookies.set("accessToken", res?.data.accessToken);
      Cookies.set("refreshToken", res?.data.refreshToken);
      Cookies.set("name", res?.data.user.name);
      Cookies.set("rol", res?.data.user.rol.toLowerCase());
      Cookies.set("avatar", res?.data.user.avatar);
      Cookies.set("id_user", res?.data.user.id);
      Cookies.set("expireToken", res?.data.expireToken);

    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status >= 400 && !originalRequest._retry) {
      

      return customFetch(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default customFetch;
