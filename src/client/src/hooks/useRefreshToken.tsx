import React, { useEffect, useState } from 'react'
import { refreshToken } from '../Api/AuthApi'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router'

const useRefreshToken = () => {
	const [session,setSession] = useState({accessToken:Cookies.get('accessToken'),refreshToken:Cookies.get('refreshToken'),rol:Cookies.get('rol'), expireToken:Cookies.get('expireToken')})
	const [error,setError] = useState(false)
	const navigate = useNavigate()
	useEffect(()=>{
		const request = async() =>{
			if(!Cookies.get('refreshToken')) return
			const res = await refreshToken()
			if(!res || res && res.status >= 400){

				Cookies.remove('refreshToken');

				return navigate('/logout')
			
			}
			Cookies.set('accessToken',res?.data.accessToken)
			Cookies.set('refreshToken',res.data.refreshToken)
     	 	Cookies.set('name',res?.data.user.name)
      		Cookies.set('rol',res?.data.user.rol.toLowerCase())
      		Cookies.set('avatar',res?.data.user.avatar)
      		Cookies.set('id_user',res?.data.user.id)
			Cookies.set('expireToken',res?.data.expireToken)
      		setSession({
      			accessToken:res.data.accessToken,
      			refreshToken:res.data.refreshToken,
      			rol:res.data.rol,
				expireToken:res.data.expireToken
      		})
		}
		request()
	},[])

	return {session,error}
}


export default useRefreshToken