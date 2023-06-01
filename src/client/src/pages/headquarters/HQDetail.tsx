import React, { useEffect, useState } from "react";
import { Headquarter } from "../../types/headquarter";
import ModalConfirmation from "../../components/ModalConfirmation";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import dateformat from "dateformat";
import ErrorAdvice from "../../components/ErrorAdvice";
import Loader from "../../components/Loader";
import { deleteHeadquarter, getHeadquarter } from "../../Api/HQApi";
import HQForm from "../../components/headquarters/HQForm";
import ReportList from "../reports/ReportList";

const HQDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [load, setLoad] = useState(true);
  const [edit, setEdit] = useState(false);
  const [errorRequest, setErrorRequest] = useState(false);

  const [headquarters, setHeadquarters] = useState<Headquarter>({
    name: "",
    state: "",
    location: "",
    municipality: "",
    city: "",
    phone: "",
    circuit_number: "",
    created_at: "",
    updated_at: "",
  });

  //Set state to show in modal confirmation
  const [propertiesModal, setPropertiesModal] = useState({
    title: "",
    description: "",
    active: false,
    action_name: "",
  });

  const request = async (id: string) => {
    try {
      const res = await getHeadquarter(id);
      setHeadquarters({
        name: res?.data.name,
        state: res?.data.state,
        location: res?.data.location,
        municipality: res?.data.municipality,
        city: res?.data.city,
        phone: res?.data.phone,
        circuit_number: res?.data.circuit_number,
        created_at: res?.data.created_at,
        updated_at: res?.data.updated_at,
      });
      setLoad(true);
      setEdit(false);
    } catch (err) {
      console.log(err);
      setLoad(true);
      setErrorRequest(true);
    }
  };

  const actionsModal = async (cancel: boolean) => {
    if (cancel) {
      setPropertiesModal({
        title: "",
        description: "",
        active: false,
        action_name: "",
      });
      return;
    }
    try {
      if (propertiesModal.action_name === "delete_hq") {
        const delete_hq = await deleteHeadquarter(id || "");
        if (delete_hq && delete_hq.status >= 400)
          return toast.error("No se pudo eliminar el equipo");
        toast.success("Sede eliminada!");
        return navigate("/hq/list");
      }
    } catch (err) {
      console.log(err);
      toast.error("Ocurrio un error al realizar la peticion");
    }
  };

  useEffect(() => {
    request(id || "");
  }, []);

  return (
    <>
      <ModalConfirmation
        active={propertiesModal.active}
        title={propertiesModal.title}
        description={propertiesModal.description}
        action={actionsModal}
      />
      <div className="container-fluid d-flex flex-column container-page evidences-form">
        <div className="d-flex flex-column justify-content-between p-3 header-page">
          <h2 className="text-right" style={{ marginLeft: "auto" }}>
            Detalles de la sede
          </h2>
          <hr />
        </div>
        <div className="container-body-content">
          {load ? (
            <>
              <div
                className="container-actions-buttons"
                style={{ padding: "0 12px" }}
              >
                <button
                  className="btn btn-danger m-2"
                  style={{ display: edit ? "block" : "none" }}
                  onClick={() => {
                    setPropertiesModal({
                      title: "Confirmacion de eliminacion",
                      description: "Estas seguro de eliminar la sede actual?",
                      active: true,
                      action_name: "delete_hq",
                    });
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} /> <span>Eliminar sede</span>
                </button>
                <div
                  className="form-check form-switch"
                  style={{ width: "max-content" }}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="switch-edit"
                    onChange={(e) => {
                      setEdit(e.target.checked);
                    }}
                    checked={edit}
                  />
                  <label className="form-check-label" htmlFor="switch-edit">
                    Editar sede
                  </label>
                </div>
              </div>

              {/*Form HQ*/}
              <HQForm
                edit={edit}
                create={false}
                hq_detail={headquarters}
                id={id}
                request={request}
              />
              <div
                className="container-fluid form-equipment equipment-detail"
                style={{ display: edit ? "none" : "block" }}
              >
                <div className="form-row row fields-container">
                  <div className="form-group col-md-6">
                    <label htmlFor="model">Nombre de la sede</label>
                    <p>{headquarters.name}</p>
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="serial">Municipio</label>
                    <p className="text-uppercase">
                      {headquarters.municipality}
                    </p>
                  </div>
                </div>
                <div className="form-row row fields-container">
                  <div className="form-group col-md-6">
                    <label htmlFor="brand">Estado</label>
                    <p>{headquarters.state}</p>
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="asset_number">Ciudad</label>
                    <p>{headquarters.city}</p>
                  </div>
                </div>

                <div className="form-row row fields-container">
                  <div className="form-group col-md-6">
                    <label htmlFor="brand">Numero telefonico</label>
                    <p>{headquarters.phone || "Sin identificar"}</p>
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="asset_number">Numero de circuito</label>
                    <p>{headquarters.circuit_number || "Sin identificar"}</p>
                  </div>
                </div>

                <div className="form-group col-md-12">
                    <label htmlFor="location">Localidad</label>
                    <p>{headquarters.location || "Sin identificar"}</p>
                  </div>
                <div className="form-row row fields-container">
                  <div className="form-group col-md-6">
                    <label htmlFor="asset_number">Fecha de creacion</label>
                    <p>
                      {headquarters.created_at
                        ? dateformat(headquarters.created_at)
                        : ""}
                    </p>
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="register_date">
                      Fecha de actualizacion
                    </label>
                    <p>
                      {headquarters.updated_at
                        ? dateformat(headquarters.updated_at)
                        : ""}
                    </p>
                  </div>
                </div>
                     <hr />   
                {!edit ? (
                  <>
                    <div className="d-flex flex-column justify-content-start p-1">
                      <h4 className="text-start p-0">
                        Reportes registrados en la sede
                      </h4>
                        <ReportList HqData={true} HqId={id || ""} />
                      <hr />
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div className="m-1 d-flex container-buttons row align-items-start p-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary m-0"
                  style={{ display: !edit ? "block" : "none" }}
                  onClick={() => {
                    navigate("/hq/list");
                  }}
                >
                  Volver
                </button>
              </div>
              
            </>
          ) : errorRequest ? (
            <div
              className="d-flex flex-column justify-content-center"
              style={{ height: "75vh" }}
            >
              <ErrorAdvice
                action={() => {
                  request(id || "");
                }}
              />
            </div>
          ) : (
            <div
              className="container-fluid d-flex flex-column justify-content-center align-items-center container-page evidences-detail"
              style={{ marginTop: "-70px" }}
            >
              <Loader
                action={() => {
                  navigate("/hq/list");
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HQDetail;
