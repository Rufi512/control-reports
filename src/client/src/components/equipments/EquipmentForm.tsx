import React, { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { registerEquipment, updateEquipment } from "../../Api/EquipmentsApi";
import { fieldTest } from "../SomeFunctions";
import { Equipment, Evidences } from "../../types/equipment";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

type Props = {
  equipment_detail?: Equipment;
  edit?: boolean;
  create?: boolean;
  equipment_evidences?: Evidences[];
  request?: (id: string) => void;
};

export const EquipmentForm = ({
  equipment_detail,
  equipment_evidences,
  edit,
  create,
  request,
}: Props) => {
  const { id } = useParams();
  let navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment>({
    description: "",
    asset_number: "",
    model: "",
    serial: "",
    brand: "",
    record_type: "",
    record_type_custom: "",
    register_date_format: new Date().toISOString().split("T")[0],
    register_date: {
      day: "",
      month: "",
      year: "",
    },
  });

  const [equipmentDescription, setEquipmentDescription] = useState("");

  const [customSelect, setCustomSelect] = useState(false);
  const [evidences, setEvidences] = useState<Evidences[]>([]);
  const [evidencesOld, setEvidencesOld] = useState<Evidences[]>([]);

  //Add new object in evidences array
  const handleAddEvidences = () => {
    setEvidences([...evidences, { file: null, description: "", preview: "" }]);
  };

  const handleChanges = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "asset_number" && !fieldTest("number", value)) return;
    //serial field without spaces
    if (name === "serial" && /\s/g.test(value)) return;
    setEquipment({ ...equipment, [name]: value });
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
      setEquipment({ ...equipment, [name]: "" });
      return setCustomSelect(true);
    }
    setCustomSelect(false);
    setEquipment({ ...equipment, [name]: value });
  };

  const handleForm = async (continue_register: boolean) => {
    let formData = new FormData();
    for (const [key, value] of Object.entries(equipment)) {
      if (key !== "register_date") {
        if (key === "description") {
          formData.append(`description`, `${equipmentDescription}`);
        } else if (key === "record_type_custom" && value !== "") {
          formData.delete("record_type");
          formData.append(`record_type`, `${value}`);
        } else {
          formData.append(`${key}`, `${value}`);
        }
      }
      if (key === "register_date_format") {
        console.log("register:", value);
        formData.append("register_date", `${value}`);
      }
    }

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
    if (create) result = await registerEquipment(formData);
    if (edit) result = await updateEquipment(id || "", formData);
    if (result) {
      console.log(result);
      if (result.status >= 400) {
        return toast.error("No se pudo registrar el equipo");
      }
      toast.success(result.data.message);
      setEvidences([]);
      if (request) return request(id || "");
    }

    if (continue_register) {
      setEquipment({
        description: "",
        asset_number: "",
        model: "",
        serial: "",
        brand: "",
        record_type: "",
        record_type_custom: "",
        register_date_format: new Date().toISOString().split("T")[0],
        register_date: {
          day: "",
          month: "",
          year: "",
        },
      });
      setEquipmentDescription("");
      return;
    }

    return navigate("/equipment/list");
  };

  useEffect(() => {
    setEquipment({
      description: equipment_detail?.description || "",
      asset_number: equipment_detail?.asset_number || "",
      model: equipment_detail?.model || "",
      serial: equipment_detail?.serial || "",
      brand: equipment_detail?.brand || "",
      record_type: equipment_detail?.record_type || "",
      record_type_custom: equipment_detail?.record_type || "",
      register_date_format:
        equipment_detail?.register_date_format
          .split("/")
          .reverse()
          .map((el) => (el.length === 1 ? `0${el}` : `${el}`))
          .join("-") || new Date().toISOString().split("T")[0],
      register_date: equipment_detail?.register_date || {
        day: "",
        month: "",
        year: "",
      },
    });

    if (equipment_detail) {
      setCustomSelect(
        (equipment_detail.record_type &&
          equipment.record_type === "diagnostico") ||
          equipment.record_type === "informe tecnico"
          ? false
          : true
      );
    }

    setEquipmentDescription(equipment_detail?.description || "");
  }, [equipment_detail]);

  useEffect(() => {
    setEvidencesOld(equipment_evidences || []);
  }, [equipment_evidences]);
  console.log(equipment.record_type);
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
              (equipment.record_type &&
                equipment.record_type === "diagnostico") ||
              equipment.record_type === "informe tecnico" ||
              equipment.record_type === ""
                ? equipment.record_type
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
            value={equipment.record_type_custom || ""}
            onInput={handleChanges}
            disabled={customSelect ? false : true}
            autoComplete="off"
          />
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="model">Modelo del equipo</label>
          <input
            type="text"
            className="form-control"
            id="model"
            name="model"
            placeholder="Logitech SR40"
            onInput={handleChanges}
            value={equipment.model || ""}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="serial">Serial del equipo</label>
          <input
            type="text"
            className="form-control"
            id="serial"
            name="serial"
            placeholder="SERIAL1234"
            onInput={handleChanges}
            value={equipment.serial.toUpperCase() || ""}
            autoComplete="off"
          />
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="brand">Marca del equipo</label>
          <input
            type="text"
            className="form-control"
            id="brand"
            name="brand"
            placeholder="HP | AMD | Intel"
            onInput={handleChanges}
            value={equipment.brand || ""}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="asset_number">Numero del bien</label>
          <input
            type="text"
            className="form-control"
            id="asset_number"
            name="asset_number"
            placeholder="123434324"
            onInput={handleChanges}
            value={equipment.asset_number || ""}
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
              equipment.register_date_format ||
              new Date().toISOString().split("T")[0]
            }
          />
        </div>
      </div>

      <div className="form-group fields-container">
        <label style={{ marginBottom: "10px" }}>Descripcion del registro</label>
        <CKEditor
          editor={ClassicEditor}
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
          data={equipmentDescription}
          onReady={(editor) => {
            // You can store the "editor" and use when it is needed.
            console.log("Editor is ready to use!", editor);
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            setEquipmentDescription(data);
          }}
        />
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
          {create ? "Registrar Equipo" : "Editar Equipo"}
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