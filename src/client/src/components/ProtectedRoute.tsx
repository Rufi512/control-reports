import { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import Cookies from "js-cookie";
import useAuth from "../hooks/useAuth";
//import {verifyToken} from '../API'
const ProtectedRoute = (props: ReactElement) => {
  const location = useLocation();
  const auth = useAuth()
  const token = auth.accessToken;
  return token ? (
    <>
      <div className="container-fluid d-flex flex-row p-0">
        <Sidebar page={location.pathname.split('/')[1]} />
        <Outlet />
      </div>
    </>
  ) : (
    <Navigate to="/" />
  );
};

export default ProtectedRoute;
