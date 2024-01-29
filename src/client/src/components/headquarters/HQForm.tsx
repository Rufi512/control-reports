import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import "../../assets/styles/components/forms.css";
import { registerEquipment, updateEquipment } from "../../Api/EquipmentsApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { SubmitHandler, useForm,Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Headquarter } from "../../types/headquarter";
import { registerHeadquarter, updateHeadquarter } from "../../Api/HQApi";
import Select from "react-select";

type Props = {
  hq_detail?: Headquarter;
  edit?: boolean;
  create?: boolean;
  request?: (id: string) => void;
  id?: string;
};

interface FormInput extends Headquarter {}

const HQForm = ({ edit, create, hq_detail, id, request }: Props) => {
  const navigate = useNavigate();

  const [headquarter, setHeadquarter] = useState<Headquarter>({
    name: "",
    state: "",
    location: "",
    municipality: "",
    city: "",
    phone: "",
    circuit_number: "",
  });

  const states_avalaibles = [
    { value: "Amazonas", label: "Amazonas" },
    { value: "Anzoátegui", label: "Anzoátegui" },
    { value: "Apure", label: "Apure" },
    { value: "Aragua", label: "Aragua" },
    { value: "Barinas", label: "Barinas" },
    { value: "Bolívar", label: "Bolívar" },
    { value: "Carabobo", label: "Carabobo" },
    { value: "Cojedes", label: "Cojedes" },
    { value: "Delta Amacuro", label: "Delta Amacuro" },
    { value: "Falcón", label: "Falcón" },
    { value: "Guárico", label: "Guárico" },
    { value: "Lara", label: "Lara" },
    { value: "Mérida", label: "Mérida" },
    { value: "Miranda", label: "Miranda" },
    { value: "Monagas", label: "Monagas" },
    { value: "Nueva Esparta", label: "Nueva Esparta" },
    { value: "Portuguesa", label: "Portuguesa" },
    { value: "Sucre", label: "Sucre" },
    { value: "Táchira", label: "Táchira" },
    { value: "Trujillo", label: "Trujillo" },
    { value: "Vargas", label: "Vargas" },
    { value: "Yaracuy", label: "Yaracuy" },
    { value: "Zulia", label: "Zulia" }
  ];

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
    control,
    reset,
  } = useForm<FormInput>({ defaultValues: { ...headquarter } });

  const [submit, isSubmit] = useState(false);

  const onSubmit = async (data: Headquarter) => {
    if (submit) return;
    try {
      let body = { ...data};
      console.log(body)
      isSubmit(true);
      let toSubmit;
      if(!states_avalaibles.find((elm)=> elm.value === body.state) || !body.state){
        isSubmit(false)
        return toast.error('Debes seleccionar un estado valido')
      }
      if (create) toSubmit = await registerHeadquarter(body);
      if (edit) toSubmit = await updateHeadquarter(id || "", body);
      isSubmit(false);
      if (toSubmit && toSubmit.status >= 400) {
        return toast.error(toSubmit.data.message);
      }

      if (create) {
        toast.success("Sede registrada!");
        return reset();
      }

      if (edit && request) {
        toast.success("Sede modificada!");
        request(id || "");
        return;
      }
    } catch (err) {
      isSubmit(false);
      console.log(err);
    }
  };

  useEffect(() => {
    setHeadquarter({
      name: "",
      state: "",
      municipality: "",
      location: "",
      city: "",
      phone: "",
      circuit_number: "",
    });
    setValue("name", hq_detail?.name || "");
    setValue("state", hq_detail?.state || "");
    setValue("municipality", hq_detail?.municipality || "");
    setValue("location", hq_detail?.location || "");
    setValue("city", hq_detail?.city || "");
    setValue("phone", hq_detail?.phone || "");
    setValue("circuit_number", hq_detail?.circuit_number || "");
    setHeadquarter({...headquarter,state:hq_detail?.state || ''})
  }, [hq_detail]);

  return (
    <form
      className="p-3 form-container"
      style={{ display: create || edit ? "block" : "none" }}
      onSubmit={handleSubmit(onSubmit)}
    >
        <div className="form-group col-md-12 fields-container">
          <label htmlFor="name">Nombre de la sede <span className="text-danger fs-6">*</span></label>
          <Controller
							name="name"
							control={control}
							rules={{ required: true, pattern: /^[A-Za-z0-9 áéíóúñ'`]+$/i, maxLength:40}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="Sede..."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.match(/^[A-Za-z0-9 áéíóúñ'`]+$/i) && e.target.value.length < 40 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
							/>
						<ErrorMessage
							errors={errors}
							name="name"
							render={({ message }) => (
								<small className="text-danger">
									El campo es requerido! y no debe pasar los 40 caracteres
								</small>
							)}
						/>
        </div>
      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="state">Estado  <span className="text-danger fs-6">*</span></label>
          <Select options={states_avalaibles} onChange={(e)=>{setValue("state", e?.value || ""); setHeadquarter({...headquarter,state:e?.value || ''})}} value={{label:headquarter.state || '',value:headquarter.state || ''}} />
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="city">Ciudad  <span className="text-danger fs-6">*</span></label>

          <Controller
							name="city"
							control={control}
							rules={{ required: true,
                maxLength: 40,
                pattern: /^[A-Za-z áéíóúñ'`]+$/i,}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="Ciudad..."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.match(/^[A-Za-z áéíóúñ'`]+$/i) && e.target.value.length < 40 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
							/>
						<ErrorMessage
							errors={errors}
							name="city"
							render={({ message }) => (
								<small className="text-danger">
									El campo es requerido! no debe contener numeros y no debe pasar los 40 caracteres
								</small>
							)}
						/>

        </div>
      </div>
      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="municipality">Municipio <span className="text-danger fs-6">*</span></label>
          <Controller
							name="municipality"
							control={control}
							rules={{ required: true, pattern: /^[A-Za-z áéíóúñ'`]+$/i, maxLength:40}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="Municipio..."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.match(/^[A-Za-z áéíóúñ'`]+$/i) && e.target.value.length < 40 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
							/>
						<ErrorMessage
							errors={errors}
							name="municipality"
							render={({ message }) => (
								<small className="text-danger">
									El campo es requerido! y no debe pasar los 40 caracteres
								</small>
							)}
						/>
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="location">Localidad <span className="text-danger fs-6">*</span></label>
          <Controller
							name="location"
							control={control}
							rules={{ required: true, maxLength:150}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="Localidad..."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.length < 150 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
							/>
						<ErrorMessage
							errors={errors}
							name="location"
							render={({ message }) => (
								<small className="text-danger">
									El campo es requerido! y no debe pasar los 150 caracteres
								</small>
							)}
						/>

        </div>
      </div>

      <div className="form-row row fields-container">
        <div className="form-group col-md-6">
          <label htmlFor="phone">Telefono</label>

          <Controller
							name="phone"
							control={control}
							rules={{ required: false, maxLength: 24, pattern: /^[0-9]+$/i}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="Telefono..."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.match(/^[0-9]+$/i) && e.target.value.length < 24 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
							/>
						<ErrorMessage
							errors={errors}
							name="phone"
							render={({ message }) => (
								<small className="text-danger">
									Solo debe contener numeros y no pasar de 24 caracteres
								</small>
							)}
						/>

            
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="circuit_number">Circuito</label>

          <Controller
							name="circuit_number"
							control={control}
							rules={{ required: false, maxLength: 10, pattern: /^[0-9]+$/i}}
							render={({ field }) => {
								
								return (
								  <input
								  className="form-control"
                  placeholder="0000..."
								  autoComplete="off"
									{...field}
									onChange={(e) => e.target.value.match(/^[0-9]+$/i) && e.target.value.length < 10 || e.target.value == '' ? field.onChange(e.target.value) : ''}
								  />
								)
							  }}
							/>
						<ErrorMessage
							errors={errors}
							name="circuit_number"
							render={({ message }) => (
								<small className="text-danger">
									Solo debe contener numeros y no pasar de 10 caracteres
								</small>
							)}
						/>

        </div>
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
          {!submit ? `${create ? "Registrar Sede" : "Editar Sede"}` : ""}
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

export default HQForm;
