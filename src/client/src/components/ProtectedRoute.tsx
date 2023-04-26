import { ReactElement, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import Cookies from "js-cookie";
import useAuth from "../hooks/useAuth";
//import {verifyToken} from '../API'
const ProtectedRoute = (props: ReactElement) => {
  const location = useLocation();
  const navigate = useNavigate()
  const auth = useAuth()
  const [token,setToken] = useState(false)

  useEffect(()=>{
    if(!auth.accessToken) return navigate('/logout')
    setToken(true)
  },[])

  return token ? (
    <>
      <div className="container-fluid d-flex flex-row p-0">
        <Sidebar page={location.pathname.split('/')[1]} />
        <Outlet />
      </div>
    </>
  ) : (
    <></>
  );
};

export default ProtectedRoute;
