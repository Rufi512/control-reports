import React, { useEffect, useRef, useState } from "react";
import "../../assets/styles/pages/equipment.css";
import { Equipment, Evidences } from "../../types/equipment";
import { useNavigate, useParams } from "react-router-dom";
import { reportsApi } from "../../Api";
import ModalConfirmation from "../../components/ModalConfirmation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faTrash, faFile } from "@fortawesome/free-solid-svg-icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import { Report } from "../../types/report";
import { ReportForm } from "../../components/reports/ReportForm";
import ReportPdf from "../../components/reports/ReportPdf";
import imageDefault from "../../assets/images/notfound.png";
import { pdf } from "@react-pdf/renderer";
import dateformat from "../../hooks/useDateFormat";
import Loader from "../../components/Loader";
import ErrorAdvice from "../../components/ErrorAdvice";
import Cookies from "js-cookie";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ref = useRef(window);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [width, setWidth] = useState(window.innerWidth);
  const [edit, setEdit] = useState(false);
  const [load, setLoad] = useState(false);
  const [errorRequest, setErrorRequest] = useState(false);
  const [report, setReport] = useState<Report>({
    description: "",
    record_type: "informe tecnico",
    record_type_custom: "",
    equipments: [],
    note: "",
    register_date_format: new Date().toISOString().split("T")[0],
    register_date: {
      day: "",
      month: "",
      year: "",
    },
    user: {
      ci: "",
      firstname: "",
      lastname: "",
      position: "",
      _id: "",
      email: "",
    },
    hq:{
      name:"",
      state:"",
      city:"",
      municipality:"",
      location:"",
      phone:"",
      circuit_number:"",
      _id:""
    }
  });

  const [evidencesOnlyRead, setEvidencesOnlyRead] = useState<Evidences[]>([]);

  const [propertiesModal, setPropertiesModal] = useState({
    title: "",
    description: "",
    active: false,
    action_name: "",
  });

  const [evidenceToDelete, setEvidenceToDelete] = useState(0);

  const [equipmentsRead, setEquipmentRead] = useState([]);

  const request = async (id: string | undefined) => {
    toast.dismiss();
    try {
      if (!id) return;
      const res = await reportsApi.getReport(id);
      if (!res || (res && res.status >= 400)) return setErrorRequest(true);
      const data = res.data;
      console.log(data)
      setReport({
        description: data.description,
        equipments: data.equipments,
        record_type_custom: data.record_type,
        register_date_format: `${data.register_date.day}/${data.register_date.month}/${data.register_date.year}`,
        record_type: data.record_type,
        register_date: data.register_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        note: data.note,
        user: data.user || {
          ci: "",
          firstname: "",
          lastname: "",
          position: "",
          _id: "",
          email: "",
        },
        hq: data.hq || {
          name:"",
      state:"",
      city:"",
      municipality:"",
      location:"",
      phone:"",
      circuit_number:"",
      _id:""
        },
      });

      setEquipmentRead(data.equipments || []);
      if (data.evidences && data.evidences.length > 0) {
        const evidences_data = data.evidences.map((el: any) => ({
          url_file: el.file,
          description: el.description,
        }));
        setEvidencesOnlyRead(evidences_data);
      } else {
        setEvidencesOnlyRead([]);
      }
      setLoad(true);
      setEdit(false);
      setErrorRequest(false);
      return true;
    } catch (err) {
      console.log(err);
      setErrorRequest(true);
      setLoad(false);
    }
  };

  const handleResize = () => {
    const actualWidth = window.innerWidth;
    setWidth(actualWidth);
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
        const delete_evidence = await reportsApi.deleteEvidenceReport(
          id || "",
          [evidenceToDelete]
        );
        if (delete_evidence && delete_evidence.status >= 400)
          return toast.error("No se pudo eliminar la evidencia");
        toast.success("Evidencia eliminada");
        setEvidenceToDelete(0);
      }
      if (propertiesModal.action_name === "delete_equipment") {
        const delete_equipment = await reportsApi.deleteReport(id || "");
        if (delete_equipment && delete_equipment.status >= 400)
          return toast.error("No se pudo eliminar el reporte");
        toast.success("Reporte eliminado");
        return navigate("/report/list");
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

  const exportPdf = () => {
    const generatePdfDocument = async () => {
      const blob = await pdf(
        <ReportPdf data={report} equipments={equipmentsRead} evidences={evidencesOnlyRead}/>
      ).toBlob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL);
    };

    generatePdfDocument();
  };

  useEffect(() => {
    request(id);
  }, []);

  useEffect(() => {
    const element = ref.current;

    element.addEventListener("resize", handleResize);

    // 👇️ remove the event listener when the component unmounts
    return () => {
      element.removeEventListener("resize", handleResize);
    };
  }, [window]);

  return (
    <div className="container-fluid d-flex flex-column container-page evidences-detail evidences-form">
      <ModalConfirmation
        title={propertiesModal.title}
        description={propertiesModal.description}
        active={propertiesModal.active}
        action={actionsModal}
      />
      <div className="d-flex flex-column justify-content-between p-3 header-page">
        <h2 className="text-right" style={{ marginLeft: "auto" }}>
          Detalles del reporte
        </h2>
        <hr />
      </div>
      {load ? (
        <div className="container-body-content">
          <div
            className="container-actions-buttons"
            style={{ padding: "0 12px" }}
          >
            <button
              className="btn btn-dark"
              onClick={() => {
                exportPdf();
              }}
            >
              <FontAwesomeIcon icon={faFilePdf} /> <span>Exportar a pdf</span>
            </button>
            <button
              className="btn btn-danger"
              style={{ display: edit ? "block" : "none" }}
              onClick={() => {
                setPropertiesModal({
                  title: "Confirmacion de eliminacion",
                  description: "Estas seguro de eliminar el reporte actual?",
                  active: true,
                  action_name: "delete_equipment",
                });
              }}
            >
              <FontAwesomeIcon icon={faTrash} /> <span>Eliminar Reporte</span>
            </button>
            {
              Cookies.get("rol") == 'admin' || Cookies.get("id_user") == report.user?._id ? <div
              className="form-check form-switch"
              style={{
                width: "max-content",
                height: "inherit",
                display: "flex",
                alignItems: "center",
              }}
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
              <label
                className="form-check-label"
                htmlFor="switch-edit"
                style={{ marginTop: "4px", marginLeft: "5px" }}
              >
                Editar reporte
              </label>
            </div> : ''
            }
          </div>
          <ReportForm
            edit={edit}
            report_detail={report}
            report_evidences={evidencesOnlyRead}
            request={request}
          />
          <div
            className="container-fluid form-equipment"
            style={{ display: edit ? "none" : "block" }}
          >
            <div className="form-row row fields-container">
              <div className="form-group col-md-6">
                <label htmlFor="record_type">Tipo de registro</label>
                <p style={{textTransform:"capitalize"}}>{report.record_type}</p>
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="register_date">Fecha de registro</label>
                <p>{report.register_date_format}</p>
              </div>
            </div>

            <div className="form-row row fields-container">
              <div className="form-group col-md-6">
                <label htmlFor="asset_number">Fecha de creacion</label>
                <p>{report.created_at ? dateformat(report.created_at) : ""}</p>
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="register_date">Fecha de actualizacion</label>
                <p>{report.updated_at ? dateformat(report.updated_at) : ""}</p>
              </div>
            </div>

            <div className="form-group fields-container">
              <label style={{ marginBottom: "10px" }}>Equipos reportados</label>
              {width > 1024 ? (
                <table className="table">
                  <thead
                    className="thead-dark"
                    style={{ background: "#030c16", color: "aliceblue" }}
                  >
                    <tr>
                      <th scope="col" style={{ border: "2px solid white" }}>
                        Numero de bien
                      </th>
                      <th scope="col" style={{ border: "2px solid white" }}>
                        Marca
                      </th>
                      <th scope="col" style={{ border: "2px solid white" }}>
                        Serial
                      </th>
                      <th scope="col" style={{ border: "2px solid white" }}>
                        Modelo
                      </th>
                      <th scope="col" style={{ border: "2px solid white" }}>
                        Incorporado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentsRead.length > 0
                      ? equipmentsRead.map((elm: Equipment, i: number) => {
                          return (
                            <tr key={i}>
                              <td>{elm.asset_number}</td>
                              <td>{elm.brand}</td>
                              <td>{elm.serial}</td>
                              <td>{elm.model}</td>
                              <td>{elm.incorporated ? 'Si': 'No'}</td>
                            </tr>
                          );
                        })
                      : ""}
                  </tbody>
                </table>
              ) : (
                <div className="list-group">
                  {equipmentsRead.length > 0 ? (
                    equipmentsRead.map((el: Equipment, i: number) => {
                      return (
                        <div
                          className="list-group-item list-group-item-action flex-column align-items-start"
                          key={i}
                        >
                          <div className="d-flex w-100 justify-content-between flex-wrap-reverse">
                            <h6 style={{ marginBottom: "0px" }}>
                              Nro de bien:{" "}
                              <span className="fs-6">{el.asset_number}</span>
                            </h6>
                            <small>
                              {el.register_date?.day} /{" "}
                              {el.register_date?.month} /{" "}
                              {el.register_date?.year}
                            </small>
                          </div>
                          <p className="mb-1 p-0">
                            Modelo y marca: {el.model} - {el.brand}
                          </p>
                          <p className="mb-1 p-0">
                            Estado: El equipo {el.incorporated ? 'esta incorporado' : 'no esta incorporado'}
                          </p>
                          <div className="d-flex align-items-start justify-content-between">
                            <small>Serial: {el.serial}</small>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="alert alert-dark" role="alert">
                      Ningun resultado encontrado
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group fields-container">
              <label style={{ marginBottom: "10px" }}>
                Descripcion del registro
              </label>
              <CKEditor
                editor={ClassicEditor}
                disabled={true}
                config={{
                  toolbar: {
                    items: [
                      "heading",
                      "blockQuote",
                      "bold",
                      "italic",
                      "link",
                      "|",
                      "indent",
                      "outdent",
                      "|",
                      "numberedList",
                      "bulletedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  },
                }}
                data={report.description}
              />
            </div>
            <div className="form-group fields-container">
              <label style={{ marginBottom: "10px" }}>Notas del registro</label>
              <CKEditor
                editor={ClassicEditor}
                disabled={true}
                config={{
                  toolbar: {
                    items: [
                      "heading",
                      "blockQuote",
                      "bold",
                      "italic",
                      "link",
                      "|",
                      "indent",
                      "outdent",
                      "|",
                      "numberedList",
                      "bulletedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  },
                }}
                data={report.note}
              />
            </div>
            <div className="form-row row fields-container">
              <div className="form-group col-md-12">
                <label htmlFor="record_type">Usuario asignado</label>
                {report.user?.ci !== "" ? (
                  <p
                    style={{ fontSize: "1.15em", textTransform: "capitalize" }}
                  >
                    {" "}
                    {report.user?.ci} - {report.user?.firstname}{" "}
                    {report.user?.lastname} - {report.user?.position}
                  </p>
                ) : (
                  <p>No se ha encontrado usuario asignado</p>
                )}
              </div>
            </div>

            <div className="form-row row fields-container">
              <div className="form-group col-md-12">
                <label htmlFor="record_type">Sede asignada</label>
                {report.hq?.name !== "" ? (
                  <p
                    style={{ fontSize: "1.15em", textTransform: "capitalize" }}
                  >
                    {" "}
                    {report.hq?.name} - {report.hq?.state} - {report.hq?.city} - {report.hq?.municipality}
                  </p>
                ) : (
                  <p>No se ha encontrado sede asignada</p>
                )}
              </div>
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
                                  onError={(e) => {
                                    e.currentTarget.src = imageDefault;
                                  }}
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
        </div>
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
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center container-page evidences-detail">
          <Loader
            action={() => {
              navigate("/report/list");
            }}
          />
        </div>
      )}
      <div className="m-1 d-flex container-buttons row align-items-start p-2 justify-content-end">
        <button
          type="button"
          className="btn btn-secondary m-0"
          style={{ display: !edit ? "block" : "none" }}
          onClick={() => {
            navigate("/report/list");
          }}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default ReportDetail;
