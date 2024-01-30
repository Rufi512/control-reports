import React, { useEffect } from 'react'
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { logout } from '../Api/AuthApi';
const Logout = () => {
	const navigate = useNavigate();
	useEffect(() => {
		const logoutUser = async ()=>{
			await logout()
			Object.keys(Cookies.get()).forEach(function(cookieName) {
				Cookies.remove(cookieName);
		  });
		  navigate('/')
		}
		logoutUser()
	}, []);
	return <></>;
};
export default Logout