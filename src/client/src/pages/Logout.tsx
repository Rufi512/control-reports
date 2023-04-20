import React, { useEffect } from 'react'
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
const Logout = () => {
	const navigate = useNavigate();
	useEffect(() => {
		Cookies.remove("token");
		Cookies.remove("rol");
		Cookies.remove("user");
		console.log("All removed");
		navigate('/')
	}, [navigate]);
	return <></>;
};
export default Logout