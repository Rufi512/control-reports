import React from 'react'
import { Sidebar } from '../../components/Sidebar'
import EquipmentForm from '../../components/equipments/EquipmentForm'

const EquipmentRegister = () => {
	return (
      <div className="container-fluid d-flex flex-column container-page evidences-form">
        <div className="d-flex flex-column justify-content-between p-3 header-page">
          <h2 className="text-right" style={{marginLeft:'auto'}}>Registro de equipo</h2>
          <hr />
        </div>
        <div className="container-body-content">
        <EquipmentForm create={true} edit={false}/>
        </div>
      </div>
	)
}

export default EquipmentRegister