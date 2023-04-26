import React, { useEffect, useState } from 'react'
import { refreshToken } from '../Api/AuthApi'
import { useNavigate } from 'react-router'
import Cookies from 'js-cookie'

const useRefreshToken = () => {
	const [session,setSession] = useState({accessToken:Cookies.get('accessToken'),refreshToken:Cookies.get('refreshToken'),rol:Cookies.get('rol')})
	const [error,setError] = useState(false)
	const navigate = useNavigate()
	useEffect(()=>{
		const request = async() =>{
			const res = await refreshToken()
			if(!res || res && res.status >= 400) return setError(true)
			Cookies.set('accessToken',res?.data.accessToken)
			Cookies.set('refreshToken',res.data.refreshToken)
     	 	Cookies.set('name',res?.data.user.name)
      		Cookies.set('rol',res?.data.user.rol.toLowerCase())
      		Cookies.set('avatar',res?.data.user.avatar)
      		Cookies.set('id_user',res?.data.user.id)
      		setSession({
      			accessToken:res.data.accessToken,
      			refreshToken:res.data.refreshToken,
      			rol:res.data.rol
      		})
		}
		request()
	},[])

	return {session,error}
}


export default useRefreshToken