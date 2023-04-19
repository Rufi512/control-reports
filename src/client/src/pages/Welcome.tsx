import React, { ChangeEvent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { User } from "../types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faUser } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/pages/user.css";
const Welcome = () => {
	const [user, setUser] = useState<User>({
		firstname: "",
		lastname: "",
		ci: "",
		position: "",
		email: "",
		rolAssign: "",
		avatar: "",
	});

	interface FormInput extends User {}

	const {
		register,
		formState: { errors },
		setValue,
		handleSubmit,
		reset,
	} = useForm<FormInput>({ defaultValues: { ...user } });

	const [validationPass, setValidationPass] = useState({
		numbers: false,
		mayus: false,
		minus: false,
		spaces: false,
		specials: false,
		lengthWords: false,
	});

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

	const handleChangesPassword = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "password") validatePassword(value);
		setUserPassword({ ...userPassword, [name]: value });
	};

	const validatePassword = async (password: string) => {
		console.log(password);
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
		console.log(validationPass);
	};

	return (
		<div className="container-fluid user-form">
			<div
				className="card"
				style={{
					maxWidth: "780px",
					padding: "20px",
					margin: "40px auto",
					boxShadow:'0px 1px 14px 1px #818c9b4d'
				}}
			>
				<div className="card-header">
					<h2 className="card-title text-center p-2">
						Complete su registro
					</h2>
				</div>
				<div className="card-body">
					<form className="row g-3" >

					<div className="profile-picture-form flex-column">
						<label
							htmlFor="avatar"
							style={{ display: "flex", flexDirection: "column" }}
						>
							<span style={{ fontWeight: "600", margin: "auto" }}>
								Foto de perfil
							</span>
							{uploadAvatar.file ? (
								<div className="default-profile">
									{" "}
									<img
										className="profile-picture rounded-circle"
										src={`${
											uploadAvatar.preview
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
						<small className="mt-1 fs-5 text-muted">Opcional</small>
					</div>

						<div className="col-md-6">
							<label
								htmlFor="firstname"
								className="form-label fw-bold"
							>
								Nombre
							</label>
							<input
								className="form-control"
								placeholder="Su nombre completo"
								autoComplete="off"
								{...register("firstname", {
									pattern: /^[A-Za-z ñ'`]+$/i,
									required: true,
									maxLength: 40,
								})}
							/>
							<ErrorMessage
								errors={errors}
								name="firstname"
								render={({ message }) => (
									<small className="text-danger">
										Debe contener solo letras y no debe
										pasar los 40 caracteres
									</small>
								)}
							/>
						</div>
						<div className="col-md-6">
							<label
								htmlFor="lastname"
								className="form-label fw-bold"
							>
								Apellido
							</label>
							<input
								className="form-control"
								placeholder="Su apellido completo"
								autoComplete="off"
								{...register("lastname", {
									pattern: /^[A-Za-z ñ'`]+$/i,
									required: true,
									maxLength: 40,
								})}
							/>
							<ErrorMessage
								errors={errors}
								name="lastname"
								render={({ message }) => (
									<small className="text-danger">
										Debe contener solo letras y no debe
										pasar los 40 caracteres
									</small>
								)}
							/>
						</div>

						<div className="col-md-6">
							<label htmlFor="ci" className="form-label fw-bold">
								Cedula
							</label>
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
										Debe contener solo numeros y no debe
										pasar los 12 caracteres
									</small>
								)}
							/>
						</div>

						<div className="col-md-6">
							<label
								htmlFor="position"
								className="form-label fw-bold"
							>
								Posicion
							</label>
							<input
								type="text"
								className="form-control"
								placeholder="Posicion"
								autoComplete="off"
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

						<div className="col-md-12">
							<label
								htmlFor="email"
								className="form-label fw-bold"
							>
								Email
							</label>
							<input
								type="email"
								className="form-control"
								autoComplete="off"
								placeholder="tuemail@email.com"
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

						<div className="col-md-6">
							<label
								htmlFor="password"
								className="form-label fw-bold"
							>
								Contraseña
							</label>
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

						<div className="col-md-6">
							<label
								htmlFor="compare"
								className="form-label fw-bold"
							>
								Confirmar contraseña
							</label>
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

						<div className="d-flex align-items-start justify-content-between">
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
										Contiene al menos un caracter en
										mayuscula
									</li>
									<li
										className={`list-group-item ${
											validationPass.minus
												? "text-decoration-line-through"
												: ""
										}`}
									>
										Contiene al menos un caracter en
										minuscula
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
						</div>
						<hr />
						<h4>Preguntas de seguridad</h4>
						<p className="mt-1">En los siguientes campos escriba sus preguntas de seguridad para evitar perder acceso a su cuenta</p>
						<div className="col-md-6">
							<label
								htmlFor="firstname"
								className="form-label fw-bold"
							>
								Pregunta
							</label>
							<input
								className="form-control"
								type="text"
								placeholder="Pregunta"
								autoComplete="off"
							/>
						</div>
						<div className="col-md-6">
							<label
								htmlFor="lastname"
								className="form-label fw-bold"
							>
								Repuesta
							</label>
							<input
								className="form-control"
								type="text"
								placeholder="Respuesta"
								autoComplete="off"
							/>
						</div>
						<button className="btn btn-primary" type="button" style={{width: '205px',marginLeft: 'auto',marginRight: '10px'}}>Añadir nueva pregunta</button>
						<hr/>
						<button className="btn btn-primary" type="button">Enviar formulario</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Welcome;