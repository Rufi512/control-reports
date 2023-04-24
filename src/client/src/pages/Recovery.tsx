import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { getCaptcha } from "../Api/AuthApi";
import { Link, useNavigate } from "react-router-dom";
import { getQuestsRecovery } from "../Api/RecoveryApi";
import { toast } from "react-toastify";

interface FormInput {
	user: string;
	option: number;
	recovery:string;
	captcha: string;
}

const Recovery = () => {
	const navigate = useNavigate()

	const [user, setUser] = useState<FormInput>({
		user: "",
		option: 0,
		recovery:"password",
		captcha: "",
	});

	const [captchaUser, setCaptchaUser] = useState({ captcha: "", token: "" });

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormInput>({ defaultValues: { ...user } });

	const request = async () => {
		try {
			const res = await getCaptcha();
			if (res && res.status === 200) {
				setCaptchaUser({
					captcha: res.data.captcha,
					token: res.data.token,
				});
			}
		} catch (err) {
			console.log(err);
		}
	};

	const onSubmit = async (data: FormInput) => {
		// Option 0 request question and option 1 request mail
		
		if(Number(data.option) === 0){
			//After get quests send to page /recovery/question with props from user (recovery, user, id)
			const quests:any = await getQuestsRecovery({token:captchaUser.token,captcha:data.captcha,user:data.user})
			if(quests && quests.status >= 400) return
			navigate(`/recovery/questions/${quests?.data.id}`,{replace:true,state:{quests:quests?.data.quests,id:quests?.data.id,recovery:data.recovery,user:data.user}})
		}

		if(Number(data.option) === 1) toast.error('Opcion no disponible')

	};

	useEffect(() => {
		request();
	}, []);

	return (
		<div className="container-fluid" style={{height: '100vh',justifyContent: 'center',display: 'flex'}}>
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
					<h3 className="text-center">Recuperacion de usuario</h3>
				</div>
				<div className="card-body">
					<form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
						<div className="col-md-12">
							<label
								htmlFor="user"
								className="form-label fw-bold"
							>
								Cedula o usuario
							</label>
							<input
								className="form-control"
								placeholder="Introduzca su cedula o usuario"
								autoComplete="off"
								{...register("user", {
									required: true,
								})}
							/>
							<ErrorMessage
								errors={errors}
								name="user"
								render={({ message }) => (
									<small className="text-danger">
										Debes de escribir tu cedula o usuario
									</small>
								)}
							/>
						</div>
						<div className="col-md-6">
							<label
								htmlFor="recovery"
								className="form-label fw-bold"
							>
								Elija que desea recuperar
							</label>
							<select
								className="form-control"
								{...register("recovery", { required: true })}
							>
								<option value={"password"}>
									Contraseña
								</option>
								<option value={"user"}>Usuario</option>
							</select>
							<ErrorMessage
								errors={errors}
								name="option"
								render={({ message }) => (
									<small className="text-danger">
										Debes de escoger una opcion!
									</small>
								)}
							/>
						</div>
						<div className="col-md-6">
							<label
								htmlFor="option"
								className="form-label fw-bold"
							>
								Elija un metodo de recuperacion
							</label>
							<select
								className="form-control"
								{...register("option", { required: true })}
							>
								<option value={0}>
									Preguntas de seguridad
								</option>
								<option value={1}>Correo electronico</option>
							</select>
							<ErrorMessage
								errors={errors}
								name="option"
								render={({ message }) => (
									<small className="text-danger">
										Debes de escoger una opcion!
									</small>
								)}
							/>
						</div>

						<div className="col-md-12">
							<label
								htmlFor="option"
								className="form-label fw-bold"
							>
								Resuelve el siguiente captcha
							</label>
							<div className="d-flex align-items-center justify-content-between flow-wrap mb-3">
								{captchaUser.captcha ? (
									<img
										src={captchaUser.captcha}
										alt="captcha"
									/>
								) : (
									<p style={{ margin: 0 }}>
										No se ha obtenido el captcha
									</p>
								)}
								<button
									type="button"
									onClick={() => {
										request();
									}}
									className="btn btn-primary"
									style={{ width: "150px", fontSize: "14px" }}
								>
									Recargar Captcha
								</button>
							</div>
							<input
								className="form-control"
								placeholder="Captcha"
								autoComplete="off"
								{...register("captcha", {
									required: true,
								})}
							/>
							<ErrorMessage
								errors={errors}
								name="captcha"
								render={({ message }) => (
									<small className="text-danger">
										Debes completar el captcha
									</small>
								)}
							/>
							<small>El captcha es sensible a la mayusculas y minusculas!</small>
						</div>
						<div className="d-flex align-items-center justify-content-between" style={{flexFlow:'wrap-reverse'}}>
						<Link to="/" className="btn btn-secondary mt-2 mb-2" style={{minWidth:'110px'}}>Volver</Link>
						<button type="submit" className="btn btn-primary mt-2 mb-2" style={{minWidth:'110px'}}>Enviar</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Recovery;