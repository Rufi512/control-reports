import React, { ChangeEvent, useEffect, useState } from "react";
import { Equipment } from "../../types/equipment";
type Props = {
  equipment_detail?: Equipment;
  edit?: boolean;
  create?: boolean;
  request?: (id: string) => void;
  id?: string;
};

import "../../assets/styles/components/forms.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { registerEquipment, updateEquipment } from "../../Api/EquipmentsApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { fieldTest } from "../SomeFunctions";

const EquipmentForm = ({
  edit,
  create,
  equipment_detail,
  id,
  request,
}: Props) => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment>({
    model: "",
    serial: "",
    asset_number: "",
    description: "",
    brand: "",
  });
  const [equipmentDescription, setEquipmentDescription] = useState("");

  const handleChanges = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "asset_number" && !fieldTest("number", value)) return;
    //serial field without spaces
    if (name === "serial" && /\s/g.test(value)) return;
    setEquipment({ ...equipment, [name]: value });
  };

  const handleForm = async (continue_register: boolean) => {
    let submit;
    let body = { ...equipment, description: equipmentDescription };

    if (create) submit = await registerEquipment(equipment);
    if (edit) submit = await updateEquipment(id || "", body);

    if (submit && submit.status >= 400) {
      return toast.error(submit.data.message);
    }

    if (create && continue_register) {
      setEquipment({
        model: "",
        serial: "",
        asset_number: "",
        description: "",
        brand: "",
      });
      setEquipmentDescription("");
      toast.success("Equipo registrado!");
      return;
    }

    if (edit && request) {
      toast.success("Equipo modificado!");
      request(id || "");
      return;
    }

    if (create) toast.success("Equipo registrado!");

    return navigate("/equipment/list");
  };

  useEffect(() => {
    setEquipment({
      model: equipment_detail?.model || "",
      serial: equipment_detail?.serial || "",
      asset_number: equipment_detail?.asset_number || "",
      description: equipment_detail?.description || "",
      brand: equipment_detail?.brand || "",
    });
    setEquipmentDescription(equipment_detail?.description || "");
  }, [equipment_detail]);

  return (
    <form
      className="p-3 form-container"
      style={{ display: create || edit ? "block" : "none" }}
    >
      <div className="form-row row fields-container">
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
      </div>
      <div className="form-row row fields-container">
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
      </div>

      <div className="form-group fields-container" style={{ marginTop: "5px" }}>
        <label style={{ marginBottom: "10px" }}>Descripcion del equipo</label>
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

export default EquipmentForm;