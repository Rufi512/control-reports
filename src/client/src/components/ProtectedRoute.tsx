
import {ReactElement, useEffect} from 'react'
import {Navigate, Outlet} from "react-router-dom"
//import {verifyToken} from '../API'
const ProtectedRoute = (props: ReactElement) => {
 useEffect(()=>{
 },[])
 const auth =  true
 return auth ? <Outlet/> : <Navigate to="/"/>
};

export default ProtectedRoute