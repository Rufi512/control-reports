import React, { ChangeEvent, useEffect, useState } from "react";
import { Report, Evidences } from "../../types/report";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import { registerReport, updateReport } from "../../Api/ReportsApi";
import AsyncSelect from "react-select/async";
import makeAnimated from "react-select/animated";
import { getEquipmentsSelect } from "../../Api/EquipmentsApi";
import { Equipment } from "../../types/equipment";
import { getSelectsUsers } from "../../Api/UsersApi";
import imageDefault from '../../assets/images/notfound.png'

const animatedComponents = makeAnimated();

type Props = {
  report_detail?: Report;
  edit?: boolean;
  create?: boolean;
  report_evidences?: Evidences[];
  request?: (id: string) => void;
};

interface ReportForm extends Report {
  userId: string;
}

export const ReportForm = ({
  report_detail,
  report_evidences,
  edit,
  create,
  request,
}: Props) => {
  const { id } = useParams();
  let navigate = useNavigate();

  const [report, setReport] = useState<ReportForm>({
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
    userId: "",
  });

  const [reportDescription, setReportDescription] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [customSelect, setCustomSelect] = useState(false);
  const [evidences, setEvidences] = useState<Evidences[]>([]);
  const [evidencesOld, setEvidencesOld] = useState<Evidences[]>([]);

  const [equipmentsSelected, setEquipmentsSelected] = useState<Equipment[]>([]);
  const [userSelected, setUserSelected] = useState({
    label: "Elegir usuario",
    value: "",
  });
  const [evidencesInSelect, setEvidencesInSelect] = useState([]);

  //Add new object in evidences array
  const handleAddEvidences = () => {
    setEvidences([...evidences, { file: null, description: "", preview: "" }]);
  };

  const handleChanges = (event: ChangeEvent<HTMLInputElement | any>) => {
    const { name, value } = event.target;
    console.log(name, value);
    setReport({ ...report, [name]: value });
  };

  const handleChangeSelect2 = (data: any) => {
    const ids = data.map((el: any) => el.value);
    console.log(ids);
    setReport({ ...report, equipments: ids });
    setEvidencesInSelect(data);
  };

  const handleSelectUser = (data: any) => {
    setUserSelected({ label: data.label, value: data.value });
    setReport({ ...report, userId: data.value });
    console.log(data.value)
  };

  const removeEquipmentsSelected = (position: number) => {
    const equipments = [...equipmentsSelected];
    const newList = equipments.filter((_el, i) => i !== position);
    setEquipmentsSelected(newList);
  };

  // Update the changes of an evidences array including.
  const handleChangesEvidences = (
    event: ChangeEvent<HTMLInputElement>,
    position: number
  ) => {
    const { name, value, files } = event.target;

    const evidencesList = evidences;

    if (name === "description") evidences[position].description = value;
    if (name === "file") {
      if (files && files?.length > 0) {
        evidences[position].file = files[0];
        if (/\.(jpe?g|png|gif)$/i.test(files[0].name) === false) {
          evidences[position].preview = "";
        } else {
          evidences[position].preview = URL.createObjectURL(files[0]);
        }
      } else {
        evidences[position].file = null;
        evidences[position].preview = "";
      }
    }
    setEvidences([...evidencesList]);
  };

  //Update description from evidence registered
  const handleChangesExitsEvidences = (
    event: ChangeEvent<HTMLInputElement>,
    position: number
  ) => {
    const { name, value } = event.target;
    const evidencesList = [...evidencesOld];
    if (name === "description") evidencesOld[position].description = value;
    setEvidencesOld([...evidencesList]);
  };

  // Remove an evidence from an array of objects, only if it is the last in the list.
  const deleteEvidence = (position: number) => {
    if (evidences.length - 1 !== position) return;
    const evidencesFilter = evidences.filter((_el, i) => position !== i);
    setEvidences(evidencesFilter);
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (value === "custom") {
      setReport({ ...report, [name]: "custom" });
      return setCustomSelect(true);
    }
    setCustomSelect(false);
    setReport({ ...report, [name]: value });
  };

  const handleForm = async (continue_register: boolean) => {
    let formData = new FormData();
    if(!report.userId) return toast.error('Debes de asignar un usuario')
    for (const [key, value] of Object.entries(report)) {

        if (key === "description") {
          if(!reportDescription || reportDescription == "") return toast.error('Es necesaria la descripcion!')
          formData.append(`description`, `${reportDescription}`);
        }
        if(key === "record_type" ){
          formData.append(`record_type`, `${value}`);
        }
        if (key === "record_type_custom" && value !== "") {
          formData.delete("record_type");
          formData.append(`record_type`, `${value}`);
        }
        if (key === "note") {
          formData.append(`note`, `${reportNote}`);
        }

        if (key === "equipments") {
          report.equipments.forEach((el: string) => {
            formData.append(`${key}`, el);
          });
          equipmentsSelected.forEach((elm: Equipment) => {
            formData.append(`${key}`, `${elm._id}`);
          });
        } 
 

      if (key === "register_date_format") {
        console.log("register:", value);
        formData.append("register_date", `${value}`);
      }
    }

    formData.append("userId", `${userSelected.value}`);

    formData.delete("record_type_custom");
    formData.delete("register_date_format");
    for (const evidence of evidences) {
      formData.append("evidences", evidence.file ? evidence.file : Object({}));
      formData.append(`evidences_description`, `${evidence.description}`);
    }

    if (evidencesOld.length > 0) {
      for (const evidence of evidencesOld) {
        formData.append(`evidences_description_old`, `${evidence.description}`);
      }
    }


    let result;
    if (create) result = await registerReport(formData);
    if (edit) result = await updateReport(id || "", formData);
    if (result) {
      console.log(result);
      if (result.status >= 400) {
        return toast.error("No se pudo registrar el equipo");
      }
      toast.success(result.data.message);
      setEvidences([]);
      setEvidencesInSelect([]);
      setUserSelected({label:'Elegir usuario',value:''})
      if (request) return request(id || "");
    }

    if (continue_register) {
      setReport({
        description: "",
        record_type: "informe tecnico",
        record_type_custom: "",
        note: "",
        equipments: [],
        register_date_format: new Date().toISOString().split("T")[0],
        register_date: {
          day: "",
          month: "",
          year: "",
        },
        userId: "",
      });
      setReportDescription("");
      setReportNote("");
      
      return;
    }

    return navigate("/report/list");
  };

  useEffect(() => {
    setReport({
      description: report_detail?.description || "",
      record_type: report_detail?.record_type || "informe tecnico",
      record_type_custom: report_detail?.record_type_custom || "",
      note: report_detail?.note || "",
      equipments: [],
      register_date_format:
        report_detail?.register_date_format
          .split("/")
          .reverse()
          .map((el) => (el.length === 1 ? `0${el}` : `${el}`))
          .join("-") || new Date().toISOString().split("T")[0],
      register_date: {
        day: "",
        month: "",
        year: "",
      },
      userId: report_detail?.user?._id || '',
    });

    if (report_detail) {
      setCustomSelect(
        (report_detail.record_type && report.record_type === "diagnostico") ||
          report.record_type === "informe tecnico"
          ? false
          : true
      );
    }
    setEquipmentsSelected(report_detail?.equipments || []);
    setReportDescription(report_detail?.description || "");
    setReportNote(report_detail?.note || "");
    setEvidencesOld(report_evidences || []);
    setUserSelected({label:report_detail?.user ? `${report_detail.user?.ci} - ${report_detail.user?.firstname} - ${report_detail.user?.lastname} - ${report_detail.user?.position}` : 'Elige un usuario', value:report_detail?.user?._id || ''})
  }, [report_detail]);

  const requestOptionsSelect = async (search: string) => {
    try {
      const res = await getEquipmentsSelect(search);
      if (res && res.status >= 400)
        return toast.error("Error al requerir lista de equipos");
      //filter options by selected equipments
      const equipmentFilter = equipmentsSelected.map((el) => {
        return el._id;
      });
      const list = res?.data.filter(
        (el: any) => !equipmentFilter.includes(el.value)
      );
      return list || [];
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const requestUserSelect = async (search: string) => {
    try {
      const res = await getSelectsUsers(search || "");
      if (res && res.status >= 400)
        return toast.error("Error al requerir lista de equipos");
      return res?.data || [];
    } catch (err) {
      console.log(err);
      return;
    }
  };

  return (
    <form
      className="container-fluid form-equipment"
      style={{ display: edit || create ? "block" : "none" }}
    >
      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="record_type">Tipo de registro</label>
          <select
            className="form-select"
            id="record_type"
            name="record_type"
            onChange={handleSelect}
            value={
              (report.record_type && report.record_type === "diagnostico") ||
              report.record_type === "informe tecnico" ||
              report.record_type === ""
                ? report.record_type
                : "custom"
            }
          >
            <option value="informe tecnico">Informe tecnico</option>
            <option value="diagnostico">Diagnostico</option>
            <option value="custom">Personalizado</option>
          </select>
          <input
            type="text"
            style={{ display: customSelect ? "flex" : "none" }}
            className="form-control"
            name="record_type_custom"
            placeholder="Informe | Comunicado..."
            value={report.record_type_custom || ""}
            onInput={handleChanges}
            disabled={customSelect ? false : true}
            autoComplete="off"
          />
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="register_date">Fecha de registro</label>
          <input
            type="date"
            className="form-control"
            id="register_date_format"
            name="register_date_format"
            onInput={handleChanges}
            value={
              report.register_date_format ||
              new Date().toISOString().split("T")[0]
            }
          />
        </div>
      </div>
      {edit ? (
        <div className="form-group">
          <h5>Equipos registrados</h5>
          <div className="mt-3 mb-3">
            {equipmentsSelected.map((el, i) => {
              return (
                <div
                  className="d-flex badge bg-primary mb-3"
                  style={{ maxWidth: "max-content" }}
                  key={i}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {el.asset_number} - {el.model} - {el.brand} - {el.serial}
                  </span>
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "none",
                      margin: "0",
                      marginLeft: "10px",
                      padding: "0 5px",
                    }}
                    onClick={(e) => {
                      removeEquipmentsSelected(i);
                    }}
                  >
                    <FontAwesomeIcon
                      style={{ color: "#fff" }}
                      icon={faRectangleXmark}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="form-group">
      <label style={{ marginBottom: "10px" }}>Elegir equipos a reportar</label>
        <AsyncSelect
          isMulti
          components={animatedComponents}
          loadOptions={requestOptionsSelect}
          onChange={handleChangeSelect2}
          value={evidencesInSelect}
        />
        <small className="text-muted">Escribe en el campo para seleccionar equipo</small>
      </div>
      <div className="form-group fields-container">
        <label style={{ marginBottom: "10px" }}>Descripcion del registro</label>
        <CKEditor
          editor={ClassicEditor}
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
          data={reportDescription}
          onReady={(editor) => {
            // You can store the "editor" and use when it is needed.
            console.log("Editor is ready to use!", editor);
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            setReportDescription(data);
          }}
        />
      </div>

      <div className="form-group fields-container">
        <label style={{ marginBottom: "10px" }}>Notas del registro</label>
        <CKEditor
          editor={ClassicEditor}
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
          data={reportNote}
          onReady={(editor) => {
            // You can store the "editor" and use when it is needed.
            console.log("Editor is ready to use!", editor);
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            setReportNote(data);
          }}
        />
      </div>

      <div className="form-group fields-container">
        <label>Asignar al usuario</label>
        <div className="form-group">
          <AsyncSelect
            components={animatedComponents}
            loadOptions={requestUserSelect}
            onChange={handleSelectUser}
            value={userSelected}
          />
          <small className="text-muted pt-3 mt-3">Escribe en el campo para seleccionar usuario</small>
        </div>
      </div>
      <hr />
      <div className="form-group mt-3">
        <h5>Evidencias del registro</h5>
        {evidencesOld.map((el, i) => {
          return (
            <div className="evidences-detail" key={i}>
              <div
                className="form-row column evidences-container"
                style={{ padding: "10px 12px" }}
              >
                <div className="form-row row ">
                  <div
                    className="form-group col-md-6 column"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <label htmlFor="name">Evidencia {i + 1}</label>
                    <a
                      href={"/" + el.url_file}
                      target="__blank"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textDecoration: "none",
                      }}
                    >
                      {el.url_file
                        ?.split(".")
                        .pop()
                        ?.match(/(jpg|png|jpeg|webp)$/) ? (
                        <img
                          className="img img-thumbnail"
                          src={"/" + el.url_file || ""}
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
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        placeholder="descripcion"
                        onChange={(e) => handleChangesExitsEvidences(e, i)}
                        value={el.description || ""}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <hr />
            </div>
          );
        })}
        {evidences.length > 0 ? (
          evidences.map((_el, i) => {
            return (
              <div key={i}>
                <div
                  className="form-row column evidences-container"
                  style={{ padding: "10px 12px" }}
                >
                  <div className="form-row row ">
                    <div
                      className="form-group col-md-6 column"
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <label htmlFor="name">
                        Evidencia {evidencesOld.length + i + 1}
                      </label>
                      {evidences[i].preview ? (
                        <img
                          className="img img-thumbnail"
                          src={evidences[i].preview || ""}
                          onError={(e)=>{e.currentTarget.src = imageDefault}}
                          alt="prev"
                        />
                      ) : evidences[i].preview === "" && evidences[i].file ? (
                        <p>Archivo cargado</p>
                      ) : (
                        <p>Ningun Archivo seleccionado</p>
                      )}
                      <input
                        name="file"
                        type="file"
                        className="form-control"
                        onChange={(e) => handleChangesEvidences(e, i)}
                      />
                    </div>
                    <div className="form-group col-md-6 d-flex flex-column justify-content-between description-container">
                      <div>
                        <label htmlFor="model">Descripcion</label>
                        <input
                          type="text"
                          name="description"
                          className="form-control"
                          placeholder="descripcion"
                          onChange={(e) => handleChangesEvidences(e, i)}
                          value={evidences[i].description || ""}
                          autoComplete="off"
                        />
                      </div>
                      {evidences.length - 1 === i ? (
                        <div className="container-buttons">
                          <button
                            type="button"
                            className="btn btn-danger col-md-6"
                            style={{ marginTop: "auto" }}
                            onClick={() => deleteEvidence(i)}
                          >
                            Borrar
                          </button>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
                <hr />
              </div>
            );
          })
        ) : (
          <div
            className="form-row column "
            style={{
              display: `${
                evidencesOld.length > 0 || evidences.length > 0
                  ? "none"
                  : "block"
              }`,
            }}
          >
            <h2>Ninguna evidencia a registar</h2>
          </div>
        )}

        <div
          className="row p-2 justify-content-end"
          style={{ marginTop: "15px" }}
        >
          <button
            type="button"
            className="btn btn-success col-md-4 m-lg-1"
            onClick={handleAddEvidences}
          >
            Añadir evidencia{" "}
          </button>
        </div>
      </div>

      <hr />
      <div
        className="container-buttons row p-2 justify-content-end"
        style={{ marginTop: "15px" }}
      >
        <button
          type="button"
          onClick={(e) => handleForm(false)}
          className="btn btn-primary col-md-4"
        >
          {create ? "Registrar Reporte" : "Editar Reporte"}
        </button>

        <button
          type="button"
          onClick={(e) => handleForm(true)}
          className="btn btn-primary col-md-4"
          style={{ display: `${edit ? "none" : "block"}` }}
        >
          Registrar y Continuar
        </button>
      </div>
    </form>
  );
};