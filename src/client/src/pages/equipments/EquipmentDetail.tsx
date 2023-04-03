import React, { useEffect, useState } from "react";
import "../../assets/styles/pages/equipment.css";
import { Equipment, Evidences } from "../../types/equipment";
import { Sidebar } from "../../components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteEquipment,
  deleteEvidenceEquipment,
  getEquipment,
} from "../../Api/EquipmentsApi";
import ModalConfirmation from "../../components/ModalConfirmation";
import { EquipmentForm } from "../../components/equipments/EquipmentForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faTrash, faFile } from "@fortawesome/free-solid-svg-icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [load, setLoad] = useState(false);
  const [equipment, setEquipment] = useState<Equipment>({
    description: "",
    asset_number: "",
    model: "",
    serial: "",
    brand: "",
    register_date_format: "",
    record_type: "",
    register_date: {
      day: "",
      month: "",
      year: "",
    },
  });
  const [evidencesOnlyRead, setEvidencesOnlyRead] = useState<Evidences[]>([]);
  const [propertiesModal, setPropertiesModal] = useState({
    title: "",
    description: "",
    active: false,
    action_name: "",
  });
  const [evidenceToDelete, setEvidenceToDelete] = useState(0);

  const request = async (id: string | undefined) => {
    try {
      if (!id) return;
      const res = await getEquipment(id);
      if (!res) return;
      const data = res.data as Equipment;
      setEquipment({
        description: data.description,
        asset_number: data.asset_number,
        model: data.model,
        serial: data.serial,
        brand: data.brand,
        register_date_format: `${data.register_date.day}/${data.register_date.month}/${data.register_date.year}`,
        record_type: data.record_type,
        register_date: data.register_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
      if (data.evidences && data.evidences.length > 0) {
        const evidences_data = data.evidences.map((el) => ({
          url_file: el.file,
          description: el.description,
        }));
        setEvidencesOnlyRead(evidences_data);
      }
      setLoad(true);
      setEdit(false);
    } catch (err) {
      console.log(err);
      setLoad(false);
      toast.dismiss();
      toast.error("No se pudo cargar el equipo :(");
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
      if (propertiesModal.action_name === "delete_evidences") {
        const delete_evidence = await deleteEvidenceEquipment(id || "", [
          evidenceToDelete,
        ]);
        if (delete_evidence && delete_evidence.status >= 400)
          return toast.error("No se pudo eliminar la evidencia");
        toast.success("Evidencia eliminada");
        setEvidenceToDelete(0);
      }
      if (propertiesModal.action_name === "delete_equipment") {
        const delete_equipment = await deleteEquipment(id || "");
        if (delete_equipment && delete_equipment.status >= 400)
          return toast.error("No se pudo eliminar el equipo");
        toast.success("Equipo eliminado");
        return navigate("/equipment/list");
      }
      setPropertiesModal({
        title: "",
        description: "",
        active: false,
        action_name: "",
      });
      request(id || "");
    } catch (err) {
      console.log(err);
      toast.error("No se pudo eliminar la evidencia");
    }
  };

  useEffect(() => {
    request(id);
  }, []);

  return (
    <div className="container-fluid d-flex flex-row p-0 evidences-form">
      <Sidebar page={"equipments"} />

      <div className="container-fluid d-flex flex-column container-page evidences-detail">
        <ModalConfirmation
          title={propertiesModal.title}
          description={propertiesModal.description}
          active={propertiesModal.active}
          action={actionsModal}
        />
        <div className="d-flex flex-column justify-content-between p-3">
          <h2 className="text-right" style={{ marginLeft: "auto" }}>
            Detalles del equipo
          </h2>
          <hr />
        </div>
        {load ? (
          <>
            <div
              className="d-flex flex-row align-items-center flex-wrap"
              style={{ padding: "0 12px" }}
            >
              <button className="btn btn-dark">
                <FontAwesomeIcon icon={faFilePdf} /> <span>Exportar a pdf</span>
              </button>
              <button
                className="btn btn-danger m-2"
                style={{ display: edit ? "block" : "none" }}
                onClick={() => {
                  setPropertiesModal({
                    title: "Confirmacion de eliminacion",
                    description: "Estas seguro de eliminar el equipo actual?",
                    active: true,
                    action_name: "delete_equipment",
                  });
                }}
              >
                <FontAwesomeIcon icon={faTrash} /> <span>Eliminar Equipo</span>
              </button>
              <div
                className="form-check form-switch"
                style={{ width: "max-content", marginLeft: "auto" }}
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
                  Editar equipo
                </label>
              </div>
            </div>
            <EquipmentForm
              edit={edit}
              equipment_detail={equipment}
              equipment_evidences={evidencesOnlyRead}
              request={request}
            />
            <div
              className="container-fluid form-equipment"
              style={{ display: edit ? "none" : "block" }}
            >
              <div className="form-row row fields-container">
                <div className="form-group col-md-6">
                  <label htmlFor="record_type">Tipo de registro</label>
                  <p>{equipment.record_type}</p>
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="model">Modelo del equipo</label>
                  <p>{equipment.model}</p>
                </div>
              </div>
              <div className="form-row row fields-container">
                <div className="form-group col-md-6">
                  <label htmlFor="serial">Serial del equipo</label>
                  <p className="text-uppercase">{equipment.serial}</p>
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="brand">Marca del equipo</label>
                  <p>{equipment.brand}</p>
                </div>
              </div>
              <div className="form-row row fields-container">
                <div className="form-group col-md-6">
                  <label htmlFor="asset_number">Numero del bien</label>
                  <p>{equipment.asset_number}</p>
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="register_date">Fecha de registro</label>
                  <p>{equipment.register_date_format}</p>
                </div>
              </div>
              <div className="form-row row fields-container">
                <div className="form-group col-md-6">
                  <label htmlFor="asset_number">Fecha de creacion</label>
                  <p>
                    {equipment.created_at
                      ? String(new Date(equipment.created_at).toUTCString())
                      : ""}
                  </p>
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="register_date">Fecha de actualizacion</label>
                  <p>
                    {equipment.updated_at
                      ? String(new Date(equipment.updated_at).toUTCString())
                      : ""}
                  </p>
                </div>
              </div>

              <div className="form-group fields-container">
                <label style={{ marginBottom: "10px" }}>
                  Descripcion del registro
                </label>
                <CKEditor
                  editor={ClassicEditor}
                  disabled={true}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "numberedList",
                      "bulletedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                  data={equipment.description}
                />
              </div>
              <hr />
              <div className="form-group fields-container">
                <label
                  style={{
                    marginBottom: "10px",
                    fontSize: "1.3em",
                    textAlign: "center",
                  }}
                >
                  Evidencias del registro
                </label>
                {evidencesOnlyRead.length > 0 ? (
                  evidencesOnlyRead.map((ev, i) => {
                    if (ev.url_file) {
                      console.log(
                        ev.url_file
                          .split(".")
                          .pop()
                          ?.match(/(jpg|png|jpeg|webp)$/)
                      );
                    }
                    return (
                      <div className="evidences-detail" key={i}>
                        <div
                          className="form-row column evidences-container"
                          style={{ padding: "10px 12px" }}
                        >
                          <div className="form-row row ">
                            <div
                              className="form-group col-md-6 column"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label htmlFor="name">Evidencia {i + 1}</label>
                              <a
                                href={"/" + ev.url_file}
                                target="__blank"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  textDecoration: "none",
                                }}
                              >
                                {ev.url_file
                                  ?.split(".")
                                  .pop()
                                  ?.match(/(jpg|png|jpeg|webp)$/) ? (
                                  <img
                                    className="img img-thumbnail"
                                    src={"/" + ev.url_file || ""}
                                    alt="prev"
                                  />
                                ) : (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      textDecoration: "none",
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faFile}
                                      style={{
                                        marginTop: "10px",
                                        width: "50px",
                                        height: "50px",
                                      }}
                                    />
                                    <p
                                      style={{
                                        fontSize: "20px",
                                        marginTop: "5px",
                                        color: "white",
                                        borderRadius: "3px",
                                        background: "#3487db",
                                      }}
                                    >
                                      Archivo
                                    </p>
                                  </div>
                                )}
                              </a>
                            </div>
                            <div className="form-group col-md-6 d-flex flex-column justify-content-between description-container">
                              <div>
                                <label htmlFor="model">Descripcion</label>
                                <p style={{ wordWrap: "break-word" }}>
                                  {ev.description}
                                </p>
                              </div>

                              <div className="container-buttons">
                                <button
                                  type="button"
                                  className="btn btn-danger col-md-6"
                                  style={{ marginTop: "auto" }}
                                  onClick={() => {
                                    setEvidenceToDelete(i);
                                    setPropertiesModal({
                                      title: "Confirmacion de eliminacion",
                                      description:
                                        "Estas seguro de eliminar la evidencia actual?",
                                      active: true,
                                      action_name: "delete_evidences",
                                    });
                                  }}
                                >
                                  Borrar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr />
                      </div>
                    );
                  })
                ) : (
                  <p>Ninguna evidencia registrada</p>
                )}
              </div>
              <hr />
            </div>{" "}
          </>
        ) : (
          <div className="container-fluid d-flex flex-column container-page evidences-detail">
            <p>No se pudo cargar el equipo</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate("/equipment/list");
              }}
            >
              Volver a la lista
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetail;