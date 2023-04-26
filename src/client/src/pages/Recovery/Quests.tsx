import { ErrorMessage } from "@hookform/error-message";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sendQuests, unBlockUser } from "../../Api/RecoveryApi";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

interface Params {
	state:{
	quests: string[];
	recovery: string;
	user: string;
	id:string
}
}

interface FormInput {
	quests: { question: string; answer: string }[];
}

const Quests = () => {
	const navigate = useNavigate()

	const { state }:Params = useLocation();

	const [quests, setQuests] = useState({
		quests: [],
	});

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormInput>({ defaultValues: { ...quests } });

	const { fields, append, remove } = useFieldArray({
		name: "quests",
		control,
	});

	const [submit, isSubmit] = useState(false);

	const onSubmit = async (data:any)=>{
		try{
			const questsData = data.quests 
			isSubmit(true)
			const res = await sendQuests(state?.id,questsData)
			isSubmit(false)
			if(!res || res.status >= 400) return
			Cookies.set('token',res.data.token)

			if(state.recovery === "user"){
				const unblock = await unBlockUser(state?.id)
				if(!unblock || unblock.status >= 400) return
				toast.success('Usuario desbloqueado!')
				navigate('/')
			}

			if(state.recovery === 'password'){
				navigate(`/recovery/password/${res.data.id}`,{state:{id:res.data.id}})
			}

		}catch(err){
			isSubmit(false)
			console.log(err)
			toast.error('Respuestas de seguridad invalidas')
		}

	}

	useEffect(() => {
		if(!state || !state.quests) return navigate('/recovery/user')
		state.quests.forEach((el:any,i)=>{
		  remove(state.quests.length - 1 - i);

		})

		state.quests.forEach((el:any,i)=>{
		  append({ question: el.question,answer:''});
		})


	}, [state]);

	return (
		<div className="container-fluid" style={{height:'100vh',display:'flex'}}>
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
						{fields.map((field, index) => {
							return (
								<div className="col-md-12" key={field.id}>
									<label
										htmlFor={`quests.${index}.answer`}
										className="form-label fw-bold"
									>
										{field.question}
									</label>
									<input
										className="form-control"
										placeholder="Introduzca su respuesta"
										autoComplete="off"
										{...register(
											`quests.${index}.answer` as const,
											{
												required: true,
											}
										)}
									/>
									<ErrorMessage
										errors={errors}
										name={`quests.${index}.answer`}
										render={({ message }) => (
											<small className="text-danger">
												No debe quedar vacio!
											</small>
										)}
									/>
								</div>
							);
						})}
						<div className="d-flex align-items-center justify-content-between" style={{flexFlow:'wrap-reverse'}}>
						<Link to="/recovery/user" className="btn btn-secondary mt-2 mb-2" style={{minWidth:'110px'}}>Volver</Link>
						<button type="submit" className="btn btn-primary mt-2 mb-2" style={{minWidth:'110px'}} disabled={submit}>{submit ? (
									<div
										className="spinner-border"
										role="status"
									>
										<span className="sr-only"></span>
									</div>
								) : (
									"Enviar"
								)}</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Quests;