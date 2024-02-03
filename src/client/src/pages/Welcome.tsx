import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { User } from "../types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/pages/user.css";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router";
import { getFirstLogin, validateUser } from "../Api/UsersApi";
const Welcome = () => {
  const { id } = useParams();
  const token = Cookies.get("token");
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    firstname: "",
    lastname: "",
    ci: "",
    position: "",
    email: "",
    rolAssign: "",
    avatar: "",
  });

  interface FormInput extends User {
    quests: {
      questions: string;
      answers: string;
    }[];
  }

  const {
    register,
    formState: { errors },
    control,
    setValue,
    handleSubmit,
    reset,
    setFocus,
  } = useForm<FormInput>({ defaultValues: { ...user } });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control, // control props comes from useForm (optional: if you are using FormContext)
      name: "quests", // unique name for your Field Array
    }
  );

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

  const [submit, isSubmit] = useState(false);

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
    const regexMinus = new RegExp(/[a-z]/);
    const regexSpecials = new RegExp(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/);
    const regexMayuscula = new RegExp(/[A-Z]/);
    const regexNumerico = new RegExp(/[0-9]/);
    const regexSpaces = new RegExp(/\s/g);

    setValidationPass({
      lengthWords: password.length > 7,
      specials: regexSpecials.test(password),
      mayus: regexMayuscula.test(password),
      numbers: regexNumerico.test(password),
      minus: regexMinus.test(password),
      spaces: regexSpaces.test(password),
    });
  };

  const request = async () => {
    try {
      const res = await getFirstLogin(id || "", token || "");
      if (!res || res.status >= 400) return navigate("/");
      const userData: User = res?.data.user;
      setValue("firstname", userData.firstname, { shouldValidate: true });
      setValue("lastname", userData.lastname, { shouldValidate: true });
      setValue("ci", userData.ci, { shouldValidate: true });
      setValue("position", userData.position, { shouldValidate: true });
      setValue("email", userData.email, { shouldValidate: true });
      setFocus("firstname");
    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    if (submit) return;
    try {
      let formData = new FormData();
      //Confirm password
      for (const [key, value] of Object.entries(validationPass)) {
        if (key === "spaces" && value === false) continue;
        if (value === false) {
          isSubmit(false);
          return toast.error("Complete los requisitos de la contraseña");
        }
      }

      const setPass = userPassword.password === userPassword.compare;

      if (!setPass) {
        isSubmit(false);
        return toast.error("Las contraseña no coinciden");
      }

      formData.append(`password`, userPassword.password);
      formData.append(`verifyPassword`, userPassword.compare);
      //Check if questions repeat
      if (data.quests.length < 2) {
        isSubmit(false);
        return toast.error("Escribe minimo dos preguntas de seguridad");
      }
      const newQuestions: string[] = data.quests.map((field) =>
        field.questions.toLowerCase()
      );

      const duplicatedNewQuestions = newQuestions.filter(
        (item: string, index: number) => newQuestions.indexOf(item) !== index
      );

      if (duplicatedNewQuestions.length > 0) {
        isSubmit(false);
        return toast.error("Las preguntas no se pueden repetir");
      }

      //Submit field user
      for (const [key, value] of Object.entries(data)) {
        if (key === "avatar") {
          if (uploadAvatar.file) formData.append("avatar", uploadAvatar.file);
          continue;
        }

        formData.append(`${key}`, value);
      }

      for (const { questions, answers } of data.quests) {
        formData.append(`questions`, questions);
        formData.append(`answers`, answers);
      }
      // petition to validate
      const res = await validateUser(id || "", token || "", formData);
      isSubmit(false);
      if (res && res?.status === 200) {
        toast.success("Usuario verificado!");
        navigate("/logout");
      }
    } catch (err) {
      isSubmit(false);
      console.log(err);
    }
  };

  useEffect(() => {
    remove(0); // The remove action is happened after the second render
    append({
      questions: "",
      answers: "",
    });
    request();
  }, []);

  return (
    <div className="container-fluid user-form">
      <div
        className="card"
        style={{
          maxWidth: "780px",
          padding: "20px",
          margin: "40px auto",
          boxShadow: "0px 1px 14px 1px #818c9b4d",
        }}
      >
        <div className="card-header">
          <h2 className="card-title text-center p-2">Complete su registro</h2>
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
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
                      src={`${uploadAvatar.preview}`}
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
                    <FontAwesomeIcon icon={faUser} className="icon-profile" />{" "}
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
              <label htmlFor="firstname" className="form-label fw-bold">
                Nombre
              </label>
              <input
                className="form-control"
                placeholder="Su nombre completo"
                autoComplete="off"
                {...register("firstname", {
                  pattern: /^[A-Za-z áéíóúñ'`]+$/i,
                  required: true,
                  maxLength: 40,
                })}
              />
              <ErrorMessage
                errors={errors}
                name="firstname"
                render={({ message }) => (
                  <small className="text-danger">
                    Debe contener solo letras y no debe pasar los 40 caracteres
                  </small>
                )}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="lastname" className="form-label fw-bold">
                Apellido
              </label>
              <input
                className="form-control"
                placeholder="Su apellido completo"
                autoComplete="off"
                {...register("lastname", {
                  pattern: /^[A-Za-z áéíóúñ'`]+$/i,
                  required: true,
                  maxLength: 40,
                })}
              />
              <ErrorMessage
                errors={errors}
                name="lastname"
                render={({ message }) => (
                  <small className="text-danger">
                    Debe contener solo letras y no debe pasar los 40 caracteres
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
                    Debe contener solo numeros y no debe pasar los 12 caracteres
                  </small>
                )}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="position" className="form-label fw-bold">
                Posicion
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Posicion"
                autoComplete="off"
                readOnly={Cookies.get('rol') == 'admin' ? false : true}
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

            <div className="col-md-12">
              <label htmlFor="email" className="form-label fw-bold">
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
              <label htmlFor="password" className="form-label fw-bold">
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
              <label htmlFor="compare" className="form-label fw-bold">
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
                    Contener minimo 7 caracteres
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
                      validationPass.mayus ? "text-decoration-line-through" : ""
                    }`}
                  >
                    Contiene al menos un caracter en mayuscula
                  </li>
                  <li
                    className={`list-group-item ${
                      validationPass.minus ? "text-decoration-line-through" : ""
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
            </div>
            <hr />
            <h4>Preguntas de seguridad</h4>
            <p className="mt-1">
              En los siguientes campos escriba sus preguntas de seguridad para
              evitar perder acceso a su cuenta
            </p>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="d-flex row position-relative mb-3 pt-4"
              >
                <div className="col-md-6 d-flex flex-column">
                  <label
                    htmlFor={`quests.${index}.questions`}
                    className="form-label fw-bold"
                  >
                    Pregunta
                  </label>
                  <input
                    className="form-control"
                    autoComplete="off"
                    {...register(`quests.${index}.questions` as const, {
                      maxLength: 40,
                      required: true,
                    })}
                  />
                  <ErrorMessage
                    errors={errors}
                    name={`quests.${index}.questions`}
                    render={({ message }) => (
                      <small className="text-danger">
                        Introduce la pregunta de seguridad
                      </small>
                    )}
                  />
                </div>
                <div className="col-md-6 d-flex flex-column">
                  <label
                    htmlFor={`quests.${index}.answers`}
                    className="form-label fw-bold"
                  >
                    Repuesta
                  </label>
                  <input
                    className="form-control"
                    autoComplete="off"
                    {...register(`quests.${index}.answers` as const, {
                      required: true,
                    })}
                  />
                  <ErrorMessage
                    errors={errors}
                    name={`quests.${index}.answers`}
                    render={({ message }) => (
                      <small className="text-danger">
                        Introduce la respuesta
                      </small>
                    )}
                  />
                </div>
                {index !== 0 ? (
                  <button
                    className="btn btn-danger"
                    onClick={() => remove(index)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 40,
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} color="#ffffff" />
                  </button>
                ) : (
                  ""
                )}
              </div>
            ))}

            {fields.length < 4 ? (
              <button
                className="btn btn-primary"
                type="button"
                style={{
                  width: "205px",
                  marginLeft: "auto",
                  marginRight: "10px",
                }}
                onClick={() =>
                  append({
                    questions: "",
                    answers: "",
                  })
                }
              >
                Añadir nueva pregunta
              </button>
            ) : (
              ""
            )}
            <hr />
            <button className="btn btn-primary" type="submit" disabled={submit}>
              {!submit ? "Enviar datos" : ""}
              {submit ? (
                <div className="spinner-border" role="status">
                  <span className="sr-only"></span>
                </div>
              ) : (
                ""
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Welcome;