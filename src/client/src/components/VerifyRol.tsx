import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

type Props = {
	allowedRoles:string[]
}

const VerifyRol = ({ allowedRoles }:Props) => {
	const auth = useAuth()
	return  allowedRoles.includes(auth.rol) ? (
    <Outlet />
  ) : auth?.rol ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/logout" replace/>
  );
}

export default VerifyRol