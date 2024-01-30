import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import useRefreshToken from "./useRefreshToken";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
const useAuth = () => {
  const [auth, setAuth] = useState({
    rol: Cookies.get("rol"),
    accessToken: Cookies.get("accessToken"),
    refreshToken: Cookies.get("refreshToken"),
    expireToken: Cookies.get("expireToken"),
  });
  const { session, error } = useRefreshToken();
  const navigate = useNavigate();
  useEffect(() => {
    //Refresh token if time expire
    if (
      !Cookies.get("accessToken") ||
      !Cookies.get("refreshToken") ||
      !Cookies.get("expireToken")
    ) {
      if (error) return navigate("/logout");
      setAuth({
        rol: session.rol || "",
        accessToken: session.accessToken || "",
        refreshToken: session.refreshToken,
        expireToken: Cookies.get("expireToken"),
      });
    }
	
    
  }, []);

  return auth;
};

export default useAuth;
