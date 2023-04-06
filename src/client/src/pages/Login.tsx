import React, { useState, useRef, FormEvent, ChangeEvent } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { faEye, faEyeSlash, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import Cookies from "js-cookie";
//import { loginUser } from "../API";
const Login = () => {
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState({user:'',password:'',recaptcha:''});
  const [showPass, setShowPass] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const hiddenPass = () => {
    if (showPass === true) {
      setShowPass(false);
    } else {
      setShowPass(true);
    }
  };

  const onCaptcha = async (value:string) => {
    if (value) {
      console.log("No es el xocas");
      setUser({ ...user, recaptcha: value });
    } else {
      setUser({ ...user, recaptcha: "" });
    }
  };

  const handleChanges = (event:ChangeEvent<HTMLInputElement>) =>{
    const {name,value} = event.target
    setUser({ ...user, [name]:value })
  }

  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    if (isSubmit) return;
    setIsSubmit(true);
    const toastId = toast.loading("Verificando datos...", {
      closeOnClick: true,
    });
    try {/*
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
      <div className="container-login">
        <h1>Sistema de registro juan bosco</h1>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <p>Cedula o Correo electronico</p>
            <div className="field-content">
              <div className="icon">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <input
                type="text"
                placeholder="Introduce tu cedula o correo"
                name="user"
                onInput={(e) => {handleChanges}}
                value={user.user}
              />
            </div>
          </label>
          <label className="field">
            <p>Contraseña</p>
            <div className="field-content">
              <div className="icon">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Introduzca su contraseña"
                name="password"
                onInput={(e) => {
                  handleChanges
                }}
                value={user.password}
              />
              <div
                className="button"
                onClick={(e) => {
                  hiddenPass();
                }}
              >
                {showPass ? (
                  <FontAwesomeIcon icon={faEye} />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />

                )}
              </div>
            </div>
          </label>

          <div className="links-users">
            <Link to="/unblocked/user/" className="forgot">
              Desbloqueo de usuario
            </Link>

            <Link to="/forgot-password" className="forgot">
              Olvidaste tu contraseña?
            </Link>
          </div>
          
          <div className="captcha_container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6Lf0i_seAAAAADa-22kcxr_u8f2AXw3zIP_vf-aa"
              onChange={onCaptcha}
            />
          </div>
          <button type="submit" className="button-submit">
            Ingresar
          </button>
        </form>
      </div>
    </React.Fragment>
  );
};

export default Login;