import React, { useState, useRef, FormEvent, ChangeEvent } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  faEye,
  faEyeSlash,
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from '../assets/images/mp.png'
import '../assets/styles/pages/login.css'
//import Cookies from "js-cookie";
//import { loginUser } from "../API";
const Login = () => {
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState({ user: "", password: "", recaptcha: "" });
  const [showPass, setShowPass] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const hiddenPass = () => {
    if (showPass === true) {
      setShowPass(false);
    } else {
      setShowPass(true);
    }
  };

  const onCaptcha = async (value: string) => {
    if (value) {
      console.log("No es el xocas");
      setUser({ ...user, recaptcha: value });
    } else {
      setUser({ ...user, recaptcha: "" });
    }
  };

  const handleChanges = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmit) return;
    setIsSubmit(true);
    const toastId = toast.loading("Verificando datos...", {
      closeOnClick: true,
    });
    try {
      /*
      const res = await loginUser(user);
      recaptchaRef.current.reset();
      setIsSubmit(false);
      if (res.status >= 400) {
        return toast.update(toastId, {
          render: res.data.message,
          type: "error",
          isLoading: false,
          closeOnClick: true,
          autoClose: 5000,
        });
      }
*/
      //Cookies.set("token", res.data.token);
      //Cookies.set("rol", res.data.rol);
      /*
      toast.update(toastId, {
        render: "Ingreso Correcto",
        type: "success",
        isLoading: false,
        closeOnClick: true,
        autoClose: 3000,
      });*/

      navigate("/home");
    } catch (e) {
      toast.update(toastId, {
        render: "Fallo al verificar informacion",
        type: "error",
        isLoading: false,
        closeOnClick: true,
        autoClose: 3000,
      });
      setIsSubmit(false);
      console.log(e);
    }
  };

  return (
    <React.Fragment>
      <div
        className="container-sm d-flex align-items-center m-auto container-login"
        style={{ height: "100vh" }}
      >
        <form className="form m-auto" onSubmit={handleSubmit}>
          <div className="d-flex flex-column align-items-center mb-3">
          <img src={logo} alt="logo" className="mb-3" style={{width:'70px'}}/>
          <h3>Sistema de registro</h3>
          </div>
          <div className="form-group mb-3">
            <input
              type="email"
              className="field p-2"
              style={{width:'100%', outline:0}}
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              placeholder="Enter email"
            />
          </div>
          <div className="form-group d-flex field mb-3">
            <input
              type={showPass ? 'text' : 'password'}
              className="p-2"
              id="exampleInputPassword1"
              placeholder="Password"
              style={{width:'100%',height:'40px',border:'none',outline:0}}
            />
            <button onClick={hiddenPass} type="button" className="label-pass">
            { showPass ? <FontAwesomeIcon icon={faEye}/> : <FontAwesomeIcon icon={faEyeSlash}/>}
            </button>
          </div>
          <div className="mt-3 d-flex">
            <Link to="#" className="mb-3">No puedo acceder a mi cuenta</Link>
          </div>
          <button type="submit" className="btn btn-primary">
            Ingresar
          </button>
        </form>
      </div>
    </React.Fragment>
  );
};

export default Login;