import React, { useState, useRef, FormEvent, ChangeEvent, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from '../assets/images/mp.png'
import '../assets/styles/pages/login.css'
import { getCaptcha, loginUser } from "../Api/AuthApi";
//import Cookies from "js-cookie";
//import { loginUser } from "../API";
const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ user: "", password: "", captcha: ""});
  const [captchaUser,setCaptchaUser] = useState({captcha:'',token:''})
  const [showPass, setShowPass] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const hiddenPass = () => {
    if (showPass === true) {
      setShowPass(false);
    } else {
      setShowPass(true);
    }
  };

  const request = async ()=>{
    try{
      const res = await getCaptcha()
      if(res && res.status === 200){
        setCaptchaUser({captcha:res.data.captcha, token:res.data.token})
      }
    }catch(err){
      console.log(err)
    }
  }

  const handleChanges = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmit) return;
    setIsSubmit(true);

    try {
      const res = await loginUser({token:captchaUser.token,body:user});
      if(res && res.status === 200) console.log(res)
      setIsSubmit(false);
    } catch (e) {

      setIsSubmit(false);
      console.log(e);
    }
  };

  useEffect(()=>{
    request()
  },[])

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
              type="text"
              className="field p-2"
              style={{width:'100%', outline:0}}
              id="user"
              name="user"
              onChange={handleChanges}
              value={user.user}
              placeholder="Cedula | Correo"
            />
          </div>
          <div className="form-group d-flex field mb-3">
            <input
              type={showPass ? 'text' : 'password'}
              className="p-2"
              id="password"
              name="password"
              onChange={handleChanges}
              value={user.password}
              placeholder="Contraseña"
              style={{width:'100%',height:'40px',border:'none',outline:0}}
            />
            <button onClick={hiddenPass} type="button" className="label-pass">
            { showPass ? <FontAwesomeIcon icon={faEye}/> : <FontAwesomeIcon icon={faEyeSlash}/>}
            </button>
          </div>
          <div className="mt-3 d-flex">
            <Link to="#" className="mb-3">No puedo acceder a mi cuenta</Link>
          </div>

          <div className="mt-3 d-flex flex-column mb-3">
            <div className="d-flex align-items-center justify-content-between flow-wrap">
            {captchaUser.captcha ? <img src={captchaUser.captcha} alt="captcha"/> : <p style={{margin:0}}>No se ha obtenido el captcha</p> }
            <button type="button" onClick={()=>{request()}} className="btn btn-primary" style={{width:'150px', fontSize:'14px'}}>Recargar Captcha</button>
            </div>
            <input
              type='text'
              className="form-control mt-3 "
              id="captcha"
              name="captcha"
              value={user.captcha}
              onChange={handleChanges}
              placeholder="Introduce el captcha"
            />
            <small className="mt-1">El captcha es sensible a la mayusculas y minusculas!</small>
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