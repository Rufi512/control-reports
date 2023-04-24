import React from "react";
import "../../assets/styles/pages/equipment.css";
import { ReportForm } from "../../components/reports/ReportForm";

const ReportRegister = () => {
  return (
      <div className="container-fluid d-flex flex-column container-page evidences-form">
        <div className="d-flex flex-column justify-content-between p-3 header-page">
          <h2 className="text-right" style={{marginLeft:'auto'}}>Registro de reporte</h2>
          <hr />
        </div>
        <div className="container-body-content">
        <ReportForm create={true} edit={false}/>
        </div>
      </div>
  );
};

export default ReportRegister;
