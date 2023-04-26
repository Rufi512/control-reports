import React, { useState } from "react";
import { useNavigate } from "react-router";
import UserForm from "../../components/users/UserForm";
import Loader from "../../components/Loader";

const UserRegister = () => {
	const navigate = useNavigate();
	const [load, setLoad] = useState(true);
	const [edit, setEdit] = useState(true);
	return (
		<>
			{load ? (
				<div className="container-fluid d-flex flex-column container-page evidences-form">
					<div className="d-flex flex-column justify-content-between p-3 header-page">
						<h2
							className="text-right"
							style={{ marginLeft: "auto" }}
						>
							Registro de usuario
						</h2>
						<hr />
					</div>
					<div className="container-body-content">
					<UserForm create={true} edit={false} />
					</div>
				</div>
			) : (
				<div className="container-fluid d-flex flex-column justify-content-center align-items-center container-page evidences-detail">
					<Loader action={()=>{navigate("/equipment/list");}}/>
				</div>
			)}
		</>
	);
};

export default UserRegister;