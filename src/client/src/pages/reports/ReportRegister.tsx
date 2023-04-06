import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import "../../assets/styles/pages/equipment.css";
import { fieldTest } from "../../components/SomeFunctions";
import { registerEquipment } from "../../Api/EquipmentsApi";
import { toast } from "react-toastify";
import { ReportForm } from "../../components/reports/ReportForm";

const ReportRegister = () => {
  return (
    <div className="container-fluid d-flex flex-row p-0 evidences-form">
      <Sidebar page={'reports'} />
      <div className="container-fluid d-flex flex-column container-page">
        <div className="d-flex flex-column justify-content-between p-3">
          <h2 className="text-right" style={{marginLeft:'auto'}}>Registro de reporte</h2>
          <hr />
        </div>
        <ReportForm create={true} edit={false}/>
      </div>
    </div>
  );
};

export default ReportRegister;
