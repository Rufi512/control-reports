import React, { useEffect } from 'react'
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
const Logout = () => {
	const navigate = useNavigate();
	useEffect(() => {
		Object.keys(Cookies.get()).forEach(function(cookieName) {
  			Cookies.remove(cookieName);
		});
		navigate('/')
	}, [navigate]);
	return <></>;
};
export default Logout