import { useEffect, useRef, useState } from "react";
import "../../assets/styles/pages/equipment.css";
import "../../assets/styles/pages/user.css";
import { Sidebar } from "../../components/Sidebar";
import { useNavigate, useParams } from "react-router";
import {
	faCircleCheck,
	faCircleXmark,
	faTrash,
	faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UsersApi } from "../../Api";
import { toast } from "react-toastify";
import { User } from "../../types/user";
import UserForm from "../../components/users/UserForm";
import ModalConfirmation from "../../components/ModalConfirmation";
import { Quest } from "../../types/quest";

const UserDetail = () => {
	const navigate = useNavigate();
	const [userRead, setUserRead] = useState<User>();
	const [userQuestions, setUserQuestions] = useState<Quest[]>([]);
	const [avatar, setAvatar] = useState(true);
	const [load, setLoad] = useState(false);
	const [edit, setEdit] = useState(false);
	const { id } = useParams();
	const timer = useRef<NodeJS.Timeout | null>(null);

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
			if (propertiesModal.action_name === "delete_user") {
				const delete_user = await UsersApi.deleteUser(id || "");
				if (delete_user && delete_user.status >= 400)
					return toast.error("No se pudo eliminar el equipo");
				return navigate("/user/list");
			}
			request(id || "");
		} catch (err) {
			console.log(err);
			toast.error("Error al ejecutar accion");
		}
	};

	const request = async (id: string) => {
		try {
			const res = await UsersApi.getUser(id || "");
			console.log(res);
			if (res && res.data){ setUserRead(res.data.user); setUserQuestions(res.data.quests)}
			setAvatar(true);
			setLoad(true);
			setEdit(false);
		} catch (err) {
			console.log(err);
			timer.current = setTimeout(() => {
				request(id || "");
			}, 5000);
			return toast.error(
				"No se pudo obtener la informacion del usuario, reintentando..."
			);
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

			{load ? (
				<div className="container-fluid d-flex flex-column container-page evidences-detail user-detail evidences-form">
					<ModalConfirmation
						title={propertiesModal.title}
						description={propertiesModal.description}
						active={propertiesModal.active}
						action={actionsModal}
					/>
					<div className="d-flex flex-column justify-content-between p-3 header-page">
						<h2 className="text-right" style={{ marginLeft: "auto" }}>
							Detalles de usuario
						</h2>
						<hr />
					</div>
					<div className="container-body-content">
					<div
						className="container-actions-buttons"
						style={{ padding: "0 12px" }}
					   >
						<button
							className="btn btn-danger m-2"
							style={{ display: edit ? "block" : "none" }}
							onClick={() => {
								setPropertiesModal({
									title: "Confirmacion de eliminacion",
									description: "Estas seguro de eliminar el usuario actual?",
									active: true,
									action_name: "delete_user",
								});
							}}
						>
							<FontAwesomeIcon icon={faTrash} /> <span>Eliminar Usuario</span>
						</button>
						<div
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
								Editar Usuario
							</label>
						</div>
					</div>

					<UserForm
						edit={edit}
						create={false}
						userRead={userRead}
						request={request}
						userQuest={userQuestions}
					/>
					<div style={{ display: edit ? "none" : "block" }}>
						<div className="form-group col-md-12 d-flex flex-column align-items-center mb-3 user-data-container">
							{avatar ? (
								<img
									className="profile-picture rounded-circle"
									src={"/" + userRead?.avatar}
									alt="user_profile"
									onError={(e) => {
										console.log(e);
										setAvatar(false);
									}}
								/>
							) : (
								<>
									<div className="default-profile">
										<FontAwesomeIcon icon={faUser} className="icon-profile" />
									</div>
								</>
							)}
							<p className="label-name text-capitalize">
								{`${userRead?.firstname} ${userRead?.lastname}`}
							</p>
							<p className="label-position">{userRead?.position}</p>
							<div className="mt-3">
								<p className="label-rol fs-6">Estado del usuario</p>
								<div
									className="d-flex flex-row"
									style={{
										width: "135px",
										alignItems: "center",
										justifyContent: "center",
										margin: "auto",
									}}
								>
									{userRead?.first_login ? (
										<FontAwesomeIcon
											icon={faCircleXmark}
											style={{
												color: "#eb4040",
												width: "22px",
												height: "22px",
											}}
										/>
									) : (
										<FontAwesomeIcon
											icon={faCircleCheck}
											style={{
												color: "#35b925",
												width: "22px",
												height: "22px",
											}}
										/>
									)}
									<span style={{marginLeft:'6px'}}>
										{userRead?.first_login ? "No verificado" : "Verificado"}
									</span>
								</div>
							</div>
							<p
								className="label-rol text-capitalize fs-5 mt-3"
								style={{ color: "#265eb1" }}
							>
								Usuario
							</p>
							<div className="mt-3">
								<p className="label-rol fs-6">Ultima actualizacion</p>
								<p>{userRead?.updated_at}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			) : (
				<div className="container-fluid d-flex flex-column justify-content-center align-items-center container-page evidences-detail">
					<div className="spinner-border mb-3" role="status">
						<span className="sr-only"></span>
					</div>
					<span className="mb-3">Cargando Información...</span>

					<button
						className="btn btn-primary"
						onClick={() => {
							navigate("/user/list");
						}}
					>
						Volver a la lista
					</button>
				</div>
			)}
		</>
	);
};

export default UserDetail;