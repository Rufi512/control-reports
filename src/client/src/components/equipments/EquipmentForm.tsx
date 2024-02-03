import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Equipment } from "../../types/equipment";
import "../../assets/styles/components/forms.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { registerEquipment, updateEquipment } from "../../Api/EquipmentsApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
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
    incorporated:false
  });

  const [equipmentDescription, setEquipmentDescription] = useState("");
  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
    control,
    reset,
  } = useForm<FormInput>({ defaultValues: { ...equipment } });

  const [submit,isSubmit] = useState(false)

  const onSubmit = async (data:Equipment) => {
    if(submit) return 
    try{
    isSubmit(true)
    let toSubmit;
    let body = { ...data, description: equipmentDescription };
    if (create) toSubmit = await registerEquipment(body);
    if (edit) toSubmit = await updateEquipment(id || "", body);
    isSubmit(false)
    if (toSubmit && toSubmit.status >= 400) {
      return toast.error(toSubmit.data.message);
    }

    if (create) {
      setEquipmentDescription("");
      toast.success("Equipo registrado!");
      return reset();
    }

    if (edit && request) {
      toast.success("Equipo modificado!");
      request(id || "");
      return;
    }
}catch(err){
  isSubmit(false)
  console.log(err)
}
  };

  useEffect(() => {
    setEquipment({
      model: equipment_detail?.model || "",
      serial: equipment_detail?.serial || "",
      asset_number: equipment_detail?.asset_number || "",
      description: equipment_detail?.description || "",
      brand: equipment_detail?.brand || "",
      incorporated:equipment_detail?.incorporated || false
    });
    setEquipmentDescription(equipment_detail?.description || "");
    setValue("model", equipment_detail?.model || '');
    setValue("serial", equipment_detail?.serial || '');
    setValue("asset_number", equipment_detail?.asset_number || '');
    setValue("description", equipment_detail?.description || '');
    setValue("brand", equipment_detail?.brand || '');
    setValue("incorporated", equipment_detail?.incorporated || false);
    setEquipmentDescription(equipment_detail?.description || '')
  }, [equipment_detail]);

  return (
    <form
      className="p-3 form-container"
      style={{ display: create || edit ? "block" : "none" }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="model">Modelo del equipo  <span className="text-danger fs-6">*</span></label>
          <Controller
							name="model"
							control={control}
							rules={{ required: true, pattern: /^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/i, maxLength:40}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="Modelo T34..."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.match(/^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/i) && e.target.value.length < 40 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
							/>
						<ErrorMessage
							errors={errors}
							name="model"
							render={({ message }) => (
								<small className="text-danger">
									El campo es requerido! y no debe pasar los 40 caracteres
								</small>
							)}
						/>

        </div>
        <div className="form-group col-md-6">
          <label htmlFor="serial">Serial del equipo  <span className="text-danger fs-6"></span></label>
          <Controller
							name="serial"
							control={control}
							rules={{ required: false, pattern: /^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/i, maxLength:40}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="Serial..."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.match(/^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/i) && e.target.value.length < 40 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
							/>
						<ErrorMessage
							errors={errors}
							name="serial"
							render={({ message }) => (
								<small className="text-danger">
									No debe pasar los 40 caracteres
								</small>
							)}
						/>

        </div>
      </div>
      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="brand">Marca del equipo  <span className="text-danger fs-6">*</span></label>
          <Controller
							name="brand"
							control={control}
							rules={{ required: true, pattern: /^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/i, maxLength:40}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="Marca..."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.match(/^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/i) && e.target.value.length < 40 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
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
          <label htmlFor="asset_number">Numero de bien  <span className="text-danger fs-6"></span></label>
          <Controller
							name="asset_number"
							control={control}
							rules={{ required: false, pattern: /^[0-9]+$/i, maxLength:40}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="0000.."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.match(/^[0-9]+$/i) && e.target.value.length < 40 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
							/>
						<ErrorMessage
							errors={errors}
							name="asset_number"
							render={({ message }) => (
								<small className="text-danger">
									Debe contener solo numeros y no debe pasar los 40 caracteres
								</small>
							)}
						/>
        </div>
      </div>

      <div className="form-row row fields-container">
        <div className="form-group col-md-12">
          <label htmlFor="switch-inc">El equipo esta incorporado?  <span className="text-danger fs-6"></span></label>
          <div
							className="form-check form-switch"
							style={{ width: "max-content"}}
						>
							<input
								className="form-check-input"
								type="checkbox"
								id="switch-inc"
								onChange={(e) => {
                  console.log(e.target.checked)
									if(e.target.checked){
                    setEquipment({...equipment,incorporated: true})
                    setValue("incorporated", true);
                  }else{
                    setEquipment({...equipment,incorporated: false})
                    setValue("incorporated", false);
                  }
								}}
								checked={equipment?.incorporated}
							/>
							<label className="form-check-label" htmlFor="switch-inc">
								Incorporado
							</label>
						</div>
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
          disabled={submit}
        >
          {!submit ? `${create ? "Registrar Equipo" : "Editar Equipo"}` : ''}
          {submit ? 
          <div className="spinner-border" role="status">
            <span className="sr-only"></span>
          </div>
          : ''}
        </button>
      </div>
    </form>
  );
};

export default EquipmentForm;