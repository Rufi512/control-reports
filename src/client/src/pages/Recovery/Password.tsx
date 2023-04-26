import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { recoveryPassword } from "../../Api/RecoveryApi";

interface Params {
	state: { id: string };
}

const Password = () => {
	const { state }: Params = useLocation();
	const navigate = useNavigate();

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
		confirmPassword: "",
	});

	const [submit, isSubmit] = useState(false);

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

	const handleChangesPassword = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "password") validatePassword(value);
		setUserPassword({ ...userPassword, [name]: value });
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		try {
			for (const [key, value] of Object.entries(validationPass)) {
				if (key === "spaces" && value === false) continue;
				if (value === false)
					return toast.error(
						"Complete los requisitos de la contraseña"
					);
			}

			const setPass =
				userPassword.password === userPassword.confirmPassword;

			if (!setPass) return toast.error("Las contraseña no coinciden");
			isSubmit(true);
			const res = await recoveryPassword(state?.id, userPassword);
			isSubmit(false);
			if (!res || res.status >= 400) return;
			toast.success("Contraseña restablecida");
			return navigate("/");
		} catch (err) {
			isSubmit(false);
			console.log(err);
			toast.error("No se pudo restablecer la contraseña");
		}
	};

	useEffect(() => {}, []);

	return (
		<div
			className="container-fluid"
			style={{ height: "100vh", display: "flex" }}
		>
			<div
				className="card"
				style={{
					maxWidth: "780px",
					padding: "20px",
					margin: "auto",
					boxShadow: "0px 1px 14px 1px #818c9b4d",
				}}
			>
				<div className="card-header">
					<h3 className="text-center">Recuperacion de contraseña</h3>
				</div>

				<div className="card-body">
					<form className="row g-3" onSubmit={handleSubmit}>
						<p className="p-0 m-0 mt-2" style={{ fontWeight: 600 }}>
							La contraseña debe de cumplir los siguientes puntos:
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
						<div className="col-md-6">
							<label
								htmlFor={`password`}
								className="form-label fw-bold"
							>
								Introduzca su nueva contraseña
							</label>
							<input
								type="text"
								className="form-control"
								id="password"
								name="password"
								placeholder="Confirmar contraseña"
								onInput={handleChangesPassword}
								value={userPassword.password || ""}
								autoComplete="off"
							/>
						</div>
						<div className="col-md-6">
							<label
								htmlFor={`confirmPassword`}
								className="form-label fw-bold"
							>
								Confirme la contraseña
							</label>
							<input
								type="password"
								className="form-control"
								id="confirmPassword"
								name="confirmPassword"
								placeholder="Confirmar contraseña"
								onInput={handleChangesPassword}
								value={userPassword.confirmPassword || ""}
								autoComplete="off"
							/>
						</div>

						<div
							className="d-flex align-items-center justify-content-between"
							style={{ flexFlow: "wrap-reverse" }}
						>
							<Link
								to="/recovery/user"
								className="btn btn-secondary mt-2 mb-2"
								style={{ minWidth: "110px" }}
							>
								Volver
							</Link>
							<button
								type="submit"
								className="btn btn-primary mt-2 mb-2"
								style={{ minWidth: "110px" }}
								disabled={submit}
							>
								{submit ? (
									<div
										className="spinner-border"
										role="status"
									>
										<span className="sr-only"></span>
									</div>
								) : (
									"Enviar"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Password;