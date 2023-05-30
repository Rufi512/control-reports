import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useNavigate } from 'react-router'
type Props ={
	action:()=>void
}
const ErrorAdvice = ({action}:Props) => {
	const navigate = useNavigate();
	return (
		<div className='container-sm p-3 card'>
			<div className="card-body d-flex flex-column align-items-center justify-content-center">
				<FontAwesomeIcon icon={faTriangleExclamation} color='#db3939' fontSize={'3em'}/>
				<p className='fs-5 mt-3'>Error al consultar los datos</p>
				<button className='btn btn-primary' onClick={()=>{action()}}>Reintentar consulta</button>
				<button className='btn btn-secondary mt-2' onClick={()=>{navigate(-1)}}>Volver a la lista</button>
			</div>
		</div>
	)
}


export default ErrorAdvice