import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { User } from "../../types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faUser } from "@fortawesome/free-solid-svg-icons";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { toast } from "react-toastify";
import { UsersApi } from "../../Api";
import { Quest } from "../../types/quest";
import { deleteQuest, registerQuest } from "../../Api/UsersApi";
type Props = {
	create: boolean;
	edit: boolean;
	userRead?: User;
	userQuest?: Quest[];
	request?: (id: string) => void;
};

interface FormInput extends User {}

const UserForm = ({ edit, create, userRead, request, userQuest }: Props) => {
	const [user, setUser] = useState<User>({
		firstname: "",
		lastname: "",
		ci: "",
		position: "",
		email: "",
		rolAssign: "",
		avatar: "",
	});

	const [validationPass, setValidationPass] = useState({
		numbers: false,
		mayus: false,
		minus: false,
		spaces: false,
		specials: false,
		lengthWords: false,
	});

	const [quest, setQuest] = useState<Quest>({ question: "", answer: "" });

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

	const [submit, isSubmit] = useState(false);

	const handleChangesPassword = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "password") validatePassword(value);
		setUserPassword({ ...userPassword, [name]: value });
	};

	const handleChangesQuests = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setQuest({ ...quest, [name]: value });
	};

	const handleDeleteAvatar = async () => {
		if (submit) return;
		try {
			const confirm = window.confirm("Estas seguro de eliminar la foto?");
			if (confirm && userRead && request) {
				isSubmit(true);
				await UsersApi.deleteAvatar(userRead?._id || "");
				isSubmit(false);
				request(userRead?._id || "");
			}
		} catch (err) {
			console.log(err);
			isSubmit(false);
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

	const handleSubmitQuest = async () => {
		if (submit) return;
		try {
			isSubmit(true);
			const res = await registerQuest(
				userRead?._id || "",
				Object({ quests: [quest] })
			);

			isSubmit(false);
			if (res && res.status === 200 && request) {
				request(userRead?._id || "");
				setQuest({ question: "", answer: "" });
			}
		} catch (err) {
			isSubmit(false);
			console.log(err);
		}
	};

	const handleDeleteQuestionSubmit = async (question: string, id: string) => {
		if (submit) return;
		try {
			isSubmit(true);
			if (
				window.confirm(
					"Estas seguro de eliminar la pregunta:" + question
				)
			) {
				const res = await deleteQuest(id, userRead?._id || "");
				isSubmit(false);
				if (res && res.status === 200 && request)
					request(userRead?._id || "");
			}
		} catch (err) {
			console.log(err);
			isSubmit(false);
		}
	};

	const onSubmit: SubmitHandler<FormInput> = async (data) => {
		if (submit) return;
		isSubmit(true);
		try {
			toast.dismiss();
			let formData = new FormData();
			if (create && !edit) {
				const setPass = userPassword.password === userPassword.compare;
				if (!setPass) {
					isSubmit(false);
					return toast.error("Las contraseña no coinciden");
				}
				formData.append("password", userPassword.password);
			}

			if (edit && confirmPassword) {
				formData.append("password", userPassword.password);
				formData.append("allowPassword", `${confirmPassword}`);
			}

			if (create || (confirmPassword && edit)) {
				for (const [key, value] of Object.entries(validationPass)) {
					if (key === "spaces" && value === false) continue;
					if (value === false) {
						isSubmit(false);
						return toast.error(
							"Complete los requisitos de la contraseña"
						);
					}
				}
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
			const body = {
				...data,
				password: userPassword.password,
				rol: data.rolAssign,
			};

			const res = create
				? await UsersApi.registerUser(body)
				: await UsersApi.editUser(userRead?._id || "", formData);

			isSubmit(false);
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

			setValidationPass({
				numbers: false,
				mayus: false,
				minus: false,
				spaces: false,
				specials: false,
				lengthWords: false,
			});
		} catch (err) {
			isSubmit(false);
			toast.error("No se pudo enviar la informacion");
			console.log(err);
		}
	};

	const validatePassword = async (password: string) => {
		const regexMinus = new RegExp(/[a-z]/);
		const regexSpecials = new RegExp(
			/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
		);
		const regexMayuscula = new RegExp(/[A-Z]/);
		const regexNumerico = new RegExp(/[0-9]/);
		const regexSpaces = new RegExp(/\s/g);

		setValidationPass({
			lengthWords: password.length > 5,
			specials: regexSpecials.test(password),
			mayus: regexMayuscula.test(password),
			numbers: regexNumerico.test(password),
			minus: regexMinus.test(password),
			spaces: regexSpaces.test(password),
		});
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
		<>
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
						<label htmlFor="ci">Cedula  <span className="text-danger fs-6">*</span></label>
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
									Debe contener solo numeros y no debe pasar
									los 12 caracteres
								</small>
							)}
						/>
					</div>
					<div className="form-group col-md-6 fields-container">
						<label htmlFor="email">Email  <span className="text-danger fs-6">*</span></label>
						<input
							type="text"
							className="form-control"
							placeholder="Email"
							autoComplete="off"
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
						<label>Nombre  <span className="text-danger fs-6">*</span></label>
						<input
							type="text"
							className="form-control"
							placeholder="Nombre"
							autoComplete="off"
							{...register("firstname", {
								required: true,
								pattern: /^[A-Za-z áéíóúñ'`]+$/i,
							})}
						/>
						<ErrorMessage
							errors={errors}
							name="firstname"
							render={({ message }) => (
								<small className="text-danger">
									Debe contener solo letras y no debe pasar
									los 40 caracteres
								</small>
							)}
						/>
					</div>
					<div className="form-group col-md-6">
						<label>Apellido  <span className="text-danger fs-6">*</span></label>
						<input
							type="text"
							className="form-control"
							placeholder="Apellido"
							autoComplete="off"
							{...register("lastname", {
								required: true,
								pattern: /^[A-Za-z áéíóúñ'`]+$/i,
							})}
						/>
						<ErrorMessage
							errors={errors}
							name="lastname"
							render={({ message }) => (
								<small className="text-danger">
									Debe contener solo letras y no debe pasar
									los 40 caracteres
								</small>
							)}
						/>
					</div>
				</div>
				<div className="form-row row fields-container">
					<div className="form-group col-md-6">
						<label>Rol  <span className="text-danger fs-6">*</span></label>
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
						<label htmlFor="position">Cargo  <span className="text-danger fs-6">*</span></label>
						<input
							type="text"
							className="form-control"
							placeholder="Cargo"
							autoComplete="off"
							{...register("position", {
								required: true,
								pattern: /^[A-Za-z0-9 áéíóúñ'`]+$/i,
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
						<label>Contraseña <span className="text-danger fs-6">*</span></label>
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
						<label>Confirmar Contraseña <span className="text-danger fs-6">*</span></label>
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
				<div className="d-flex align-items-start justify-content-between">
					{(edit && confirmPassword) || create ? (
						<div
							className="d-flex flex-column"
							style={{
								width: "max-content",
								height: "inherit",
								display: "flex",
								alignItems: "flex-start",
							}}
						>
							<p className="p-0 mb-3">
								La contraseña debe de cumplir los siguientes
								puntos:
							</p>
							<ul className="list-group p-0">
								<li
									className={`list-group-item ${
										validationPass.lengthWords
											? "text-decoration-line-through"
											: ""
									}`}
								>
									Contener mas de 5 caracteres
								</li>
								<li
									className={`list-group-item ${
										validationPass.numbers
											? "text-decoration-line-through"
											: ""
									}`}
								>
									Contiene al menos un numero
								</li>
								<li
									className={`list-group-item ${
										validationPass.mayus
											? "text-decoration-line-through"
											: ""
									}`}
								>
									Contiene al menos un caracter en mayuscula
								</li>
								<li
									className={`list-group-item ${
										validationPass.minus
											? "text-decoration-line-through"
											: ""
									}`}
								>
									Contiene al menos un caracter en minuscula
								</li>
								<li
									className={`list-group-item ${
										validationPass.specials
											? "text-decoration-line-through"
											: ""
									}`}
								>
									Contiene caracteres especiales
								</li>
								<li
									className={`list-group-item ${
										validationPass.spaces
											? ""
											: "text-decoration-line-through"
									}`}
								>
									No contener espacios
								</li>
							</ul>
						</div>
					) : (
						""
					)}

					<div
						className="form-check form-switch"
						style={{
							width: "max-content",
							height: "inherit",
							display: edit ? "flex" : "none",
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
						{!submit
							? `${
									create
										? "Registrar Usuario"
										: "Guardar cambios"
							  }`
							: ""}
						{submit ? (
							<div className="spinner-border" role="status">
								<span className="sr-only"></span>
							</div>
						) : (
							""
						)}
					</button>
				</div>

				<hr />
			</form>

			<div
				className="container-quests pb-5"
				style={{ display: edit ? "block" : "none" }}
			>
				<h4>Preguntas de seguridad registradas</h4>
				<ul className="list-group">
					{userQuest
						? userQuest.map((el: Quest, i: number) => {
								return (
									<li
										className="list-group-item d-flex align-items-center justify-content-between"
										key={i}
									>
										<span>{el.question}</span>{" "}
										<button
											className="btn btn-danger"
											onClick={() => {
												handleDeleteQuestionSubmit(
													el.question,
													el._id || ""
												);
											}}
										>
											Eliminar
										</button>
									</li>
								);
						  })
						: ""}
				</ul>
				<div
					className="d-flex flex-column mt-3"
					style={{
						display:
							userQuest && userQuest?.length < 4
								? "flex"
								: "none",
					}}
				>
					<div className="form-row row fields-container">
						<div className="form-group col-md-6 fields-container">
							<label htmlFor="ci">Escribe la pregunta</label>
							<input
								className="form-control"
								placeholder="Cual fue mi..."
								autoComplete="off"
								type="text"
								name="question"
								value={quest.question}
								onInput={handleChangesQuests}
							/>
						</div>
						<div className="form-group col-md-6 fields-container">
							<label htmlFor="email">Escribe la respuesta</label>
							<input
								type="text"
								className="form-control"
								placeholder="..."
								name="answer"
								value={quest.answer}
								onInput={handleChangesQuests}
							/>
						</div>
					</div>
					<div className="d-flex container-fluid justify-content-end p-0">
						<button
							className="mt-4 btn btn-primary"
							type="button"
							onClick={handleSubmitQuest}
						>
							Agregar pregunta
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default UserForm;