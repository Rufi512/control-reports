import React from 'react'
import HQForm from '../../components/headquarters/HQForm'

const HQRegister = () => {
  return (
    <div className="container-fluid d-flex flex-column container-page evidences-form">
        <div className="d-flex flex-column justify-content-between p-3 header-page">
          <h2 className="text-right" style={{marginLeft:'auto'}}>Registro de sedes</h2>
          <hr />
        </div>
        <div className="container-body-content">
            <HQForm edit={false} create={true}/>
        </div>
      </div>
  )
}


export default HQRegister