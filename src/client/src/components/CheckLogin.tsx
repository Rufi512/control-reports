import {useState,useEffect, PropsWithChildren, ReactElement} from 'react'
import {Navigate} from "react-router-dom"
import Cookies from 'js-cookie'
import useAuth from '../hooks/useAuth';

const CheckLogin = ({children}:any) => {
   const [isLogin,setIsLogin] = useState(false)
   const [isLoad,setIsLoad] = useState(false)
   const auth = useAuth()
   useEffect(() => {
      if(auth.accessToken) setIsLogin(true);
      setIsLoad(true)
   }, [])
   if(isLoad){
      return isLogin ? <Navigate to="/dashboard"/> : children 
   }
   return <></> 
};

export default CheckLogin