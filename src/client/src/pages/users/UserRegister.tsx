import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { useNavigate } from "react-router";
import UserForm from "../../components/users/UserForm";

const UserRegister = () => {
	const navigate = useNavigate();
	const [load, setLoad] = useState(true);
	const [edit, setEdit] = useState(true);
	return (
		<div className="container-fluid d-flex flex-row p-0 evidences-form">
			<Sidebar page={"users"} />

			{load ? (
				<div className="container-fluid d-flex flex-column container-page">
					<div className="d-flex flex-column justify-content-between p-3">
						<h2
							className="text-right"
							style={{ marginLeft: "auto" }}
						>
							Registro de usuario
						</h2>
						<hr />
					</div>
					<UserForm create={true} edit={false} />
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
		</div>
	);
};

export default UserRegister;