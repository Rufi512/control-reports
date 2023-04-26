import React from 'react'
type Props = {
	action?:()=>void
}
const Loader = ({action}:Props) => {
	return (
		<>
							<div className="spinner-border mb-3" role="status">
								<span className="sr-only"></span>
							</div>
							<span className="mb-3">Cargando Información...</span>

							{action ? <button
								className="btn btn-primary"
								onClick={() => {
									action()
								}}
							>
								Volver a la lista
							</button> : ''}
						</>
	)
}
export default Loader