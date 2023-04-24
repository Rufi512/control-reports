import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Equipment } from "../../types/equipment";
import "../../assets/styles/components/forms.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { registerEquipment, updateEquipment } from "../../Api/EquipmentsApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

type Props = {
  equipment_detail?: Equipment;
  edit?: boolean;
  create?: boolean;
  request?: (id: string) => void;
  id?: string;
};

interface FormInput extends Equipment {}

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
  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
    reset,
  } = useForm<FormInput>({ defaultValues: { ...equipment } });

  const onSubmit = async (data:Equipment) => {
    let submit;
    let body = { ...data, description: equipmentDescription };

    if (create) submit = await registerEquipment(equipment);
    if (edit) submit = await updateEquipment(id || "", body);

    if (submit && submit.status >= 400) {
      return toast.error(submit.data.message);
    }

    if (create) {
      setEquipmentDescription("");
      toast.success("Equipo registrado!");
      return;
    }

    if (edit && request) {
      toast.success("Equipo modificado!");
      request(id || "");
      return;
    }

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
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="model">Modelo del equipo</label>
         <input
              type="text"
              className="form-control"
              placeholder="Modelo T34..."
              {...register("model", {
                required: true,
                maxLength:40,
                pattern: /^[A-Za-z0-9 áéíóúñ'`]+$/i,
              })}
            />
            <ErrorMessage
              errors={errors}
              name="model"
              render={({ message }) => (
                <small className="text-danger">
                  El campo es requerido y no debe pasar de los 40 caracteres
                </small>
              )}
            />
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="serial">Serial del equipo</label>
          <input
              type="text"
              className="form-control"
              placeholder="Serial..."
              {...register("serial", {
                required: true,
                maxLength:40,
                pattern: /^[A-Za-z0-9áéíóúñ'`]+$/i,
              })}
            />
            <ErrorMessage
              errors={errors}
              name="serial"
              render={({ message }) => (
                <small className="text-danger">
                  El campo es requerido! no debe contener espacios y no debe pasar
                  los 40 caracteres
                </small>
              )}
            />
        </div>
      </div>
      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="brand">Marca del equipo</label>
          <input
              type="text"
              className="form-control"
              placeholder="Marca..."
              {...register("brand", {
                required: true,
                maxLength:40,
                pattern: /^[A-Za-z0-9 áéíóúñ'`]+$/i,
              })}
            />
            <ErrorMessage
              errors={errors}
              name="brand"
              render={({ message }) => (
                <small className="text-danger">
                  El campo es requerido! y no debe pasar los 40 caracteres
                </small>
              )}
            />
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="asset_number">Numero del bien</label>
          <input
              type="text"
              className="form-control"
              placeholder="0000..."
              {...register("model", {
                required: true,
                maxLength:40,
                pattern: /^[0-9]+$/i,
              })}
            />
            <ErrorMessage
              errors={errors}
              name="model"
              render={({ message }) => (
                <small className="text-danger">
                  El campo es requerido! debe contener solo numeros y no pasar de 40 caracteres
                </small>
              )}
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
          type="submit"
          className="btn btn-primary col-md-4"
        >
          {create ? "Registrar Equipo" : "Editar Equipo"}
        </button>
      </div>
    </form>
  );
};

export default EquipmentForm;