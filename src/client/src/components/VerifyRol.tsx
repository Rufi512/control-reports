import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

type Props = {
	allowedRoles:string[]
}

const VerifyRol = ({ allowedRoles }:Props) => {
	return  allowedRoles.includes(Cookies.get('rol') || '') ? (
    <Outlet />
  ) : Cookies.get('rol') ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/logout" replace/>
  );
}

export default VerifyRol