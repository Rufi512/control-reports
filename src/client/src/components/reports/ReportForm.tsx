import React, { ChangeEvent, useEffect, useState } from "react";
import { Report, Evidences } from "../../types/report";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faRectangleXmark, faTrash } from "@fortawesome/free-solid-svg-icons";
import { registerReport, updateReport } from "../../Api/ReportsApi";
import AsyncSelect from "react-select/async";
import makeAnimated from "react-select/animated";
import { getEquipmentsSelect } from "../../Api/EquipmentsApi";
import { Equipment } from "../../types/equipment";
import { getSelectsUsers } from "../../Api/UsersApi";
import imageDefault from "../../assets/images/notfound.png";
import { getSelectsHq } from "../../Api/HQApi";

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
  hqId:string
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
    record_type: "Informe Tecnico",
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
    hqId:"",
  });

  const [reportDescription, setReportDescription] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [customSelect, setCustomSelect] = useState(false);
  const [evidences, setEvidences] = useState<Evidences[]>([]);
  const [evidencesOld, setEvidencesOld] = useState<Evidences[]>([]);

  const [equipmentsSelected, setEquipmentsSelected] = useState<Equipment[]>([]);

  const [hqSelected, setHqSelected] = useState({
    label: "Elige la sede",
    value: "",
  });

  const [evidencesInSelect, setEvidencesInSelect] = useState([]);

  const [submit, isSubmit] = useState(false);

  //Add new object in evidences array
  const handleAddEvidences = () => {
    setEvidences([...evidences, { file: null, description: "", preview: "" }]);
  };

  const handleChanges = (event: ChangeEvent<HTMLInputElement | any>) => {
    const { name, value } = event.target;
    setReport({ ...report, [name]: value });
  };

  const handleChangeSelect2 = (data: any) => {
    const ids = data.map((el: any) => el.value);
    setReport({ ...report, equipments: ids });
    setEvidencesInSelect(data);
  };


  const handleSelectHq = (data: any) => {
    setHqSelected({label: data.label, value: data.value })
    setReport({ ...report, hqId: data.value });

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
    event: ChangeEvent<HTMLTextAreaElement>,
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

  const handleTypeReport = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (value === "custom") {
      setReport({ ...report, [name]: "custom" });
      return setCustomSelect(true);
    }
    setCustomSelect(false);
    setReport({ ...report, record_type_custom: "",[name]: value  });
  };

  const handleForm = async (continue_register: boolean) => {
    if (submit) return;
    try {
      isSubmit(true);
      let formData = new FormData();

      if (!report.hqId) {
        isSubmit(false);
        return toast.error("Debes de asignar una sede en el reporte");
      }
      for (const [key, value] of Object.entries(report)) {
        if (key === "description") {
          if (!reportDescription || reportDescription == "") {
            isSubmit(false);
            return toast.error("Es necesaria la descripcion!");
          }
          formData.append(`description`, `${reportDescription}`);
        }
        if (key === "record_type") {
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

        if (
          (create && report.equipments.length <= 0) ||
          (edit &&
            report.equipments.length <= 0 &&
            equipmentsSelected.length <= 0)
        ) {
          isSubmit(false);
          return toast.error("Debes de escoger equipos a registrar");
        }

        if (key === "register_date_format") {
          formData.append("register_date", `${value}`);
        }
      }

      formData.append("hqId", `${hqSelected.value}`);
      formData.delete("record_type_custom");
      formData.delete("register_date_format");
      for (const evidence of evidences) {
        formData.append(
          "evidences",
          evidence.file ? evidence.file : Object({})
        );
        formData.append(`evidences_description`, `${evidence.description}`);
      }

      if (evidencesOld.length > 0) {
        for (const evidence of evidencesOld) {
          formData.append(
            `evidences_description_old`,
            `${evidence.description}`
          );
        }
      }
      // When validate all data procced to send the form
      let result;
      if (create) result = await registerReport(formData);
      if (edit) result = await updateReport(id || "", formData);
      isSubmit(false);
      if (result) {
        console.log(result);
        if (result.status >= 400) {
          return toast.error("No se pudo registrar el equipo");
        }
        toast.success(result.data.message);
        setEvidences([]);
        setEvidencesInSelect([]);
        setHqSelected({label: "Elige la sede", value: ""})
        setCustomSelect(false);
        if (request) return request(id || "");
      }

      if (continue_register) {
        setReport({
          description: "",
          record_type: "Informe Tecnico",
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
          hqId:""
        });
        setReportDescription("");
        setReportNote("");

        return;
      }

      return navigate("/report/list");
    } catch (err) {
      isSubmit(false);
      console.log(err);
    }
  };

  useEffect(() => {
    setReport({
      description: report_detail?.description || "",
      record_type: report_detail?.record_type || "Informe Tecnico",
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
      userId: report_detail?.user?._id || "",
      hqId: report_detail?.hq?._id || ""
    });

    if (report_detail) {
      setCustomSelect(true)
      setCustomSelect(report.record_type === "Informe Tecnico" || report.record_type === "Diagnostico"  ? false : true);
    }
    setEquipmentsSelected(report_detail?.equipments || []);
    setReportDescription(report_detail?.description || "");
    setReportNote(report_detail?.note || "");
    setEvidencesOld(report_evidences || []);

    setHqSelected({
      label: report_detail?.hq
        ? `${report_detail.hq?.name} - ${report_detail.hq?.state} - ${report_detail.hq?.city} - ${report_detail.hq?.municipality}`
        : "Elige una sede",
      value: report_detail?.hq?._id || "",
    });
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


  const requestHqSelect = async (search: string) => {
    try {
      const res = await getSelectsHq(search || "");
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
          <label htmlFor="record_type">Tipo de registro  <span className="text-danger fs-6">*</span></label>
          <select
            className="form-select"
            id="record_type"
            name="record_type"
            onChange={handleTypeReport}
            value={
              (report.record_type && report.record_type === "Diagnostico") ||
              report.record_type === "Informe Tecnico" 
                ? report.record_type
                : "custom"
            }
          >
            <option value="Informe Tecnico">Informe tecnico</option>
            <option value="Diagnostico">Diagnostico</option>
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
          <label htmlFor="register_date">Fecha de registro  <span className="text-danger fs-6">*</span></label>
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
          <div className="mt-3 mb-3 list-group">
            {equipmentsSelected.map((el, i) => {
              return (
                <div className="list-group-item list-group-item-action flex-column align-items-start" key={i}>
                  <div className="d-flex w-100 justify-content-between flex-wrap-reverse">
                    <h6 style={{marginBottom:'0px'}}>Nro de bien: <span className="fs-6">{el.asset_number}</span></h6>
                    <small>
                      {el.register_date?.day} / {el.register_date?.month} /{" "}
                      {el.register_date?.year}
                    </small>
                  </div>
                  <p className="mb-1 p-0">
                    Modelo y marca: {el.model} - {el.brand}
                  </p>
                  <div className="d-flex align-items-start justify-content-between">
                  <small>Serial: {el.serial}</small>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={(e) => {
                      removeEquipmentsSelected(i);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="form-group">
        <label style={{ marginBottom: "10px" }}>
          Elegir equipos a reportar  <span className="text-danger fs-6">*</span>
        </label>
        <AsyncSelect
          isMulti
          components={animatedComponents}
          loadOptions={requestOptionsSelect}
          onChange={handleChangeSelect2}
          value={evidencesInSelect}
          defaultOptions
        />
        <small className="text-muted">
          Escribe en el campo para seleccionar equipo
        </small>
      </div>
      <div className="form-group fields-container">
        <label style={{ marginBottom: "10px" }}>Descripcion del registro  <span className="text-danger fs-6">*</span></label>
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
        <label>Sede del reporte:</label>
        <div className="form-group">
          <AsyncSelect
            components={animatedComponents}
            loadOptions={requestHqSelect}
            onChange={handleSelectHq}
            value={hqSelected}
            defaultOptions
          />
          <small className="text-muted pt-3 mt-3">
            Escribe en el campo para seleccionar usuario
          </small>
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
                      target="_blank"
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
                      <textarea
                        name="description"
                        rows={7}
                        className="form-control"
                        placeholder="descripcion"
                        onChange={(e) => handleChangesExitsEvidences(e, i)}
                        value={el.description || ""}
                        autoComplete="off"
                      ></textarea>
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
                          onError={(e) => {
                            e.currentTarget.src = imageDefault;
                          }}
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
          onClick={(e) => handleForm(true)}
          className="btn btn-primary col-md-4"
          disabled={submit}
        >
          {!submit ? `${create ? "Registrar Reporte" : "Editar Reporte"}` : ""}
          {submit ? (
            <div className="spinner-border" role="status">
              <span className="sr-only"></span>
            </div>
          ) : (
            ""
          )}
        </button>
      </div>
    </form>
  );
};