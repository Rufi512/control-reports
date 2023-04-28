import React, { useState,useEffect } from 'react'
import Cookies from 'js-cookie'
import useRefreshToken from './useRefreshToken'
import { useNavigate } from 'react-router'
const useAuth = () => {
	const [auth,setAuth] = useState({rol:Cookies.get('rol') || '',accessToken:Cookies.get('accessToken') || '' ,refreshToken:Cookies.get('refreshToken')})
	const {session,error} = useRefreshToken()
	const navigate = useNavigate()
	useEffect(()=>{
		//Refresh token if time expire 
		let today = new Date() 
		let expireTime = Number(Cookies.get('timeExpire')) 
		if(today.getTime() >= expireTime || !Cookies.get('accessToken') || !Cookies.get('refreshToken') || !expireTime){
			if(error) return navigate('/logout')
			setAuth({rol:session.rol || '',accessToken:session.accessToken || '' ,refreshToken:session.refreshToken})
		}
	},[])

	return auth
}


export default useAuth