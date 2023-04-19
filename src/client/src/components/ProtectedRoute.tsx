import { ReactElement, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
//import {verifyToken} from '../API'
const ProtectedRoute = (props: ReactElement) => {
  const location = useLocation();
  const auth = true;
  return auth ? (
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
