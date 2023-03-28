import {useState,useEffect, PropsWithChildren, ReactElement} from 'react'
import {Navigate} from "react-router-dom"
//import {verifyToken} from '../API'

const CheckLogin = ({children}:any) => {
   const [isLogin,setIsLogin] = useState(true)
   const [isLoad,setIsLoad] = useState(true)
   useEffect(() => {
    /*
      const request = async() =>{
         const res = await verifyToken(true)
         if(res.status < 400){
            setIsLogin(true)
         }
         setIsLoad(true)
      }
      request()
      */
   }, [])
   if(isLoad){
      return isLogin ? <Navigate to="/dashboard"/> : children 
   }
   return <div><h1>pez</h1></div>
};

export default CheckLogin