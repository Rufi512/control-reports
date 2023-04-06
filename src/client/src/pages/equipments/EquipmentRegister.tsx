import React from 'react'
import { Sidebar } from '../../components/Sidebar'
import EquipmentForm from '../../components/equipments/EquipmentForm'

const EquipmentRegister = () => {
	return (
		 <div className="container-fluid d-flex flex-row p-0 evidences-form">
      <Sidebar page={"equipments"} />
      <div className="container-fluid d-flex flex-column container-page">
        <div className="d-flex flex-column justify-content-between p-3">
          <h2 className="text-right" style={{marginLeft:'auto'}}>Registro de equipo</h2>
          <hr />
        </div>
        <EquipmentForm create={true} edit={false}/>
      </div>
    </div>
	)
}

export default EquipmentRegister