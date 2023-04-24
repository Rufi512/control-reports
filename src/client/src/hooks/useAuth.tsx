import React, { useState,useEffect } from 'react'
import Cookies from 'js-cookie'
import useRefreshToken from './useRefreshToken'
const useAuth = () => {
	const data_user = useRefreshToken()
	const [auth,setAuth] = useState({rol:data_user.rol || '',accessToken:data_user.accessToken || '' ,refreshToken:data_user.refreshToken})
	return auth
}


export default useAuth