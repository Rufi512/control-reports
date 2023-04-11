import React, { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Equipment } from "../../types/equipment";
import "../../assets/styles/components/forms.css";
import { deleteEquipment, getEquipment } from "../../Api/EquipmentsApi";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import EquipmentForm from "../../components/equipments/EquipmentForm";
import ModalConfirmation from "../../components/ModalConfirmation";

const EquipmentDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const timer = useRef<NodeJS.Timeout | null>(null);
	const [load, setLoad] = useState(false);
	const [edit, setEdit] = useState(false);

	const [equipment, setEquipment] = useState<Equipment>({
		model: "",
		serial: "",
		asset_number: "",
		description: "",
		brand: "",
		updated_at: "",
		created_at: "",
	});

	const [propertiesModal, setPropertiesModal] = useState({
		title: "",
		description: "",
		active: false,
		action_name: "",
	});

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

	const request = async (id: string) => {
		try {
			const res = await getEquipment(id);
			if (res && res.status >= 400)
				return toast.error("No se pudo cargar la informacion");
			setEquipment({
				model: res?.data.model,
				serial: res?.data.serial,
				asset_number: res?.data.asset_number,
				description: res?.data.description,
				brand: res?.data.brand,
				created_at: res?.data.created_at,
				updated_at: res?.data.updated_at,
			});
			console.log("pass");
			setEdit(false);
			setLoad(true);
		} catch (error) {
			setLoad(false);
			toast.dismiss();
			toast.error("No se pudo cargar el equipo :( reintentando en 5 segundos");
			throw Error("Error al requerir información");
		}
	};

	useEffect(() => {
		const callApi = async () => {
			try {
				await request(id || "");
			} catch (err) {
				timer.current = setTimeout(() => {
					request(id || "");
				}, 5000);
			}
		};

		callApi();

		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, []);

	return (
		<>
			<ModalConfirmation
				active={propertiesModal.active}
				title={propertiesModal.title}
				description={propertiesModal.description}
				action={actionsModal}
			/>
			<div className="container-fluid d-flex flex-row p-0 evidences-form">
				<Sidebar page={"equipments"} />
				<div className="container-fluid d-flex flex-column container-page">
					<div className="d-flex flex-column justify-content-between p-3">
						<h2 className="text-right" style={{ marginLeft: "auto" }}>
							Detalles del equipo
						</h2>
						<hr />
					</div>

					<div
						className="d-flex flex-row align-items-center flex-wrap"
						style={{ padding: "0 12px", height: "54px" }}
					>
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

					{load ? (
						<>
							<EquipmentForm
								edit={edit}
								create={false}
								equipment_detail={equipment}
								id={id}
								request={request}
							/>

							<div
								className="container-fluid form-equipment equipment-detail"
								style={{ display: edit ? "none" : "block" }}
							>
								<div className="form-row row fields-container">
									<div className="form-group col-md-6">
										<label htmlFor="model">Modelo del equipo</label>
										<p>{equipment.model}</p>
									</div>
									<div className="form-group col-md-6">
										<label htmlFor="serial">Serial del equipo</label>
										<p className="text-uppercase">{equipment.serial}</p>
									</div>
								</div>
								<div className="form-row row fields-container">
									<div className="form-group col-md-6">
										<label htmlFor="brand">Marca del equipo</label>
										<p>{equipment.brand}</p>
									</div>
									<div className="form-group col-md-6">
										<label htmlFor="asset_number">Numero del bien</label>
										<p>{equipment.asset_number}</p>
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
										<label htmlFor="register_date">
											Fecha de actualizacion
										</label>
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
										data={equipment.description}
									/>
								</div>
							</div>
						</>
					) : (
						<div className="container-fluid d-flex flex-column justify-content-center align-items-center container-page evidences-detail">
							<div className="spinner-border mb-3" role="status">
								<span className="sr-only"></span>
							</div>
							<span className="mb-3">Cargando Información...</span>

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
		</>
	);
};

export default EquipmentDetail;