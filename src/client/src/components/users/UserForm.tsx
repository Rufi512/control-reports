import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { User } from "../../types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faUser } from "@fortawesome/free-solid-svg-icons";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { toast } from "react-toastify";
import { UsersApi } from "../../Api";
type Props = {
	create: boolean;
	edit: boolean;
	userRead?: User;
	request?: (id: string) => void;
};

interface FormInput extends User {}

const UserForm = ({ edit, create, userRead, request }: Props) => {
	const [user, setUser] = useState<User>({
		firstname: "",
		lastname: "",
		ci: "",
		position: "",
		email: "",
		rolAssign: "",
		avatar: "",
	});

	const {
		register,
		formState: { errors },
		setValue,
		handleSubmit,
		reset,
	} = useForm<FormInput>({ defaultValues: { ...user } });

	const [userPassword, setUserPassword] = useState({
		password: "",
		compare: "",
	});

	type stateAvatar = {
		file: any;
		preview: string;
	};
	const [uploadAvatar, setUploadAvatar] = useState<stateAvatar>({
		file: null,
		preview: "",
	});

	const [confirmPassword, setConfirmPassword] = useState(false);

	const handleChangesPassword = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setUserPassword({ ...userPassword, [name]: value });
	};

	const handleDeleteAvatar = async () => {
		const confirm = window.confirm("Estas seguro de eliminar la foto?");
		if (confirm && userRead && request) {
			await UsersApi.deleteAvatar(userRead?._id || "");
			request(userRead?._id || "");
		}
	};

	const handleChangeAvatar = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		setUploadAvatar({ file: null, preview: "" });

		if (files && files[0]) {
			return setUploadAvatar({
				file: files[0],
				preview: URL.createObjectURL(files[0]),
			});
		}
	};

	const onSubmit: SubmitHandler<FormInput> = async (data) => {
		try {
			toast.dismiss();
			let formData = new FormData();
			if (create && !edit) {
				const setPass = userPassword.password === userPassword.compare;
				if (!setPass) return toast.error("Las contraseña no coinciden");
				formData.append("password", userPassword.password);
			}

			if (edit && confirmPassword) {
				formData.append("password", userPassword.password);
				formData.append("allowPassword", `${confirmPassword}`);
			}

			for (const [key, value] of Object.entries(data)) {
				if (key === "rolAssign") {
					formData.append("rol", value);
					continue;
				}
				if (key === "avatar") {
					if (uploadAvatar.file)
						formData.append("avatar", uploadAvatar.file);
					continue;
				}

				formData.append(`${key}`, value);
			}
			const body = { ...data, password: userPassword.password, rol:data.rolAssign };

			const res = create
				? await UsersApi.registerUser(body)
				: await UsersApi.editUser(userRead?._id || "", formData);

			//Clean form
			if (res && res.status === 200 && create) {
				if (create) reset();
				setUserPassword({ password: "", compare: "" });
			}

			if (edit && request && res && res.status === 200) {
				setUserPassword({ password: "", compare: "" });
				setConfirmPassword(false);
				request(userRead?._id || "");
			}
		} catch (err) {
			toast.error("No se pudo enviar la informacion");
			console.log(err);
		}
	};

	useEffect(() => {
		if (!userRead) return;
		setValue("ci", userRead.ci);
		setValue("firstname", userRead.firstname);
		setValue("lastname", userRead.lastname);
		setValue("email", userRead.email);
		setValue("position", userRead.position);
		setValue("rolAssign", userRead?.rol?.name.toLowerCase());
		setUser({ ...user, avatar: userRead?.avatar });
	}, [userRead]);

	return (
		<form
			className="form user-form p-3"
			onSubmit={handleSubmit(onSubmit)}
			style={{ display: edit || create ? "block" : "none" }}
		>
			{edit ? (
				<div className="profile-picture-form flex-column">
					<label
						htmlFor="avatar"
						style={{ display: "flex", flexDirection: "column" }}
					>
						<span style={{ fontWeight: "600", margin: "auto" }}>
							Foto de perfil
						</span>
						{uploadAvatar.file || user.avatar !== "" ? (
							<div className="default-profile">
								{" "}
								<img
									className="profile-picture rounded-circle"
									src={`${
										uploadAvatar.preview ||
										"/" + user.avatar
									}`}
									onError={(e) => {
										setUploadAvatar({
											file: null,
											preview: "",
										});
										setUser({ ...user, avatar: "" });
									}}
									alt="profile_user"
								/>{" "}
								<div>
									<FontAwesomeIcon icon={faPencil} />
								</div>{" "}
							</div>
						) : (
							<div className="default-profile">
								<FontAwesomeIcon
									icon={faUser}
									className="icon-profile"
								/>{" "}
								<div>
									<FontAwesomeIcon icon={faPencil} />
								</div>
							</div>
						)}
					</label>
					<input
						type="file"
						className="form-control"
						id="avatar"
						name="avatar"
						autoComplete="off"
						onChange={handleChangeAvatar}
						hidden
					/>
					<div style={{ marginTop: "10px" }}>
						{user.avatar ? (
							<button
								className="btn btn-danger"
								type="button"
								onClick={handleDeleteAvatar}
							>
								Eliminar foto de perfil
							</button>
						) : (
							""
						)}
					</div>
				</div>
			) : (
				""
			)}
			<div className="form-row row fields-container">
				<div className="form-group col-md-6 fields-container">
					<label htmlFor="ci">Cedula</label>
					<input
						className="form-control"
						placeholder="012345678"
						autoComplete="off"
						{...register("ci", {
							pattern: /^[0-9]+$/i,
							required: true,
							maxLength: 12,
						})}
					/>
					<ErrorMessage
						errors={errors}
						name="ci"
						render={({ message }) => (
							<small className="text-danger">
								Debe contener solo numeros y no debe pasar los
								12 caracteres
							</small>
						)}
					/>
				</div>
				<div className="form-group col-md-6 fields-container">
					<label htmlFor="email">Email</label>
					<input
						type="text"
						className="form-control"
						placeholder="Email"
						{...register("email", {
							required: true,
							pattern: /^\S+@\S+$/i,
						})}
					/>
					<ErrorMessage
						errors={errors}
						name="email"
						render={({ message }) => (
							<small className="text-danger">
								Introduce un email valido
							</small>
						)}
					/>
				</div>
			</div>
			<div className="form-row row fields-container">
				<div className="form-group col-md-6">
					<label>Nombre</label>
					<input
						type="text"
						className="form-control"
						placeholder="Nombre"
						{...register("firstname", {
							required: true,
							pattern: /^[A-Za-z ñ'`]+$/i,
						})}
					/>
					<ErrorMessage
						errors={errors}
						name="firstname"
						render={({ message }) => (
							<small className="text-danger">
								Debe contener solo letras y no debe pasar los 40
								caracteres
							</small>
						)}
					/>
				</div>
				<div className="form-group col-md-6">
					<label>Apellido</label>
					<input
						type="text"
						className="form-control"
						placeholder="Apellido"
						{...register("lastname", {
							required: true,
							pattern: /^[A-Za-z ñ'`]+$/i,
						})}
					/>
					<ErrorMessage
						errors={errors}
						name="lastname"
						render={({ message }) => (
							<small className="text-danger">
								Debe contener solo letras y no debe pasar los 40
								caracteres
							</small>
						)}
					/>
				</div>
			</div>
			<div className="form-row row fields-container">
				<div className="form-group col-md-6">
					<label>Rol</label>
					<select
						className="form-control"
						{...register("rolAssign", { required: true })}
					>
						<option value="user">Usuario</option>
						<option value="admin">Administrador/a</option>
					</select>
					<ErrorMessage
						errors={errors}
						name="rolAssign"
						render={({ message }) => (
							<small className="text-danger">
								Debes de asignar un rol al usuario
							</small>
						)}
					/>
				</div>
				<div className="form-group col-md-6">
					<label>Posicion</label>
					<input
						type="text"
						className="form-control"
						placeholder="Posicion"
						{...register("position", {
							required: true,
							pattern: /^[A-Za-z0-9 ñ'`]+$/i,
						})}
					/>
					<ErrorMessage
						errors={errors}
						name="position"
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
					<label>Contraseña</label>
					<input
						type="text"
						className="form-control"
						id="password"
						name="password"
						placeholder="Contraseña"
						onInput={handleChangesPassword}
						value={userPassword.password || ""}
						autoComplete="off"
					/>
				</div>
				<div className="form-group col-md-6">
					<label>Confirmar Contraseña</label>
					<input
						type="password"
						className="form-control"
						id="compare"
						name="compare"
						placeholder="Confirmar contraseña"
						onInput={handleChangesPassword}
						value={userPassword.compare || ""}
						autoComplete="off"
					/>
				</div>
			</div>
			<div
				className="form-check form-switch"
				style={{
					width: "max-content",
					height: "inherit",
					display: "flex",
					alignItems: "center",
					marginLeft: "auto",
				}}
			>
				<input
					className="form-check-input"
					type="checkbox"
					id="switch-password-edit"
					onChange={(e) => {
						setConfirmPassword(e.target.checked);
					}}
					checked={confirmPassword}
				/>
				<label
					className="form-check-label"
					htmlFor="switch-password-edit"
					style={{ marginTop: "4px", marginLeft: "5px" }}
				>
					Confirmar cambio de contraseña
				</label>
			</div>

			<hr />
			<div
				className="container-buttons row p-2 justify-content-end"
				style={{ marginTop: "15px" }}
			>
				<button type="submit" className="btn btn-primary col-md-4">
					{create ? "Registrar Usuario" : "Guardar cambios"}
				</button>
			</div>
		</form>
	);
};

export default UserForm;