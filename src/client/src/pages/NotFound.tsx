import React,{useEffect} from 'react'
import { useNavigate } from "react-router-dom";
const NotFound = () => {
	let navigate = useNavigate()
	
	useEffect(()=>{
	/*if(Cookies.get("token")){
		return navigate('/home')
	}*/
	navigate('/dashboard')
	},[navigate])
	return (
		<div>
			
		</div>
	)
}

export default NotFound