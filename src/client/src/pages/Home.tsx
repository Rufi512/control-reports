import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressCard,
  faDesktop,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/pages/home.css";
import { Link } from "react-router-dom";
import { Report } from "../types/report";
import { useEffect, useRef, useState } from "react";
import { User } from "../types/user";
import { Equipment } from "../types/equipment";
import { getResumen } from "../Api/LogsApi";
import { Log } from "../types/log";
import Cookies from "js-cookie";
import useAuth from "../hooks/useAuth";
const Home = () => {
  const ref = useRef(window);
  const auth = useAuth();
  const [width, setWidth] = useState(window.innerWidth);

  const handleResize = () => {
    const actualWidth = window.innerWidth;
    setWidth(actualWidth);
  };

  const [lengths, setLegths] = useState({
    equipments: 0,
    reports: 0,
    users: 0,
  });

  const [reports, setReports] = useState<Report[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  const [equipments, setEquipments] = useState<Equipment[]>([]);

  const [logs, setLogs] = useState<Log[]>([]);

  const [load, isLoad] = useState(false);

  const [status, setStatus] = useState({
    text: "Cargando informacion...",
    check: true,
  });

  const labelUser = {
    admin: "Administrador/a",
    user: "Usuario",
  };

  const request = async () => {
    setTimeout(() => {
      setStatus({
        text: "No se pudo cargar la informacion, intente recargar",
        check: false,
      });
    }, 3000);
    try {
      const res = await getResumen(
        Cookies.get("rol") === "admin" ? "admin" : "user"
      );
      if (!res || res.status > 400) return;
      if (Cookies.get("rol") === "admin") {
        setReports(res?.data.reports);
        setUsers(res?.data.users);
        setEquipments(res?.data.equipments);
        setLogs(res?.data.logs);
        setLegths({
          equipments: res?.data?.length_data.equipments,
          reports: res?.data?.length_data.reports,
          users: res?.data?.length_data.users,
        });
        return isLoad(true);
      }

      if (Cookies.get("rol") === "user") {
        setReports(res?.data.reports);
        setEquipments(res?.data.equipments);
        setLegths({
          equipments: res?.data?.length_data.equipments,
          reports: res?.data?.length_data.reports,
          users: 0,
        });
        return isLoad(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    request();
  }, []);

  useEffect(() => {
    const element = ref.current;

    element.addEventListener("resize", handleResize);

    // 👇️ remove the event listener when the component unmounts
    return () => {
      element.removeEventListener("resize", handleResize);
    };
  }, [window]);
  return (
    <div className="container-fluid container-dashboard container-page">
      <div className="d-flex flex-column justify-content-between p-3 header-page">
        <h2 className="text-right" style={{ marginLeft: "auto" }}>
          Detalles de actividad
        </h2>
      </div>
      {load ? (
        <>
          <div
            className="flex row flex-wrap container-body-content"
            style={{ padding: "5px 12px", justifyContent: "space-around" }}
          >
            {lengths.users > 0 ? (
              <Link
                className="col-lg-3 mt-1"
                to="/user/list"
                style={{
                  display: "flex",
                  textDecoration: "none",
                  background: "#0d2952",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  position: "relative",
                }}
              >
                <div className="small-box">
                  <div className="inner">
                    <h3 className="text-white">{lengths.users}</h3>
                    <p className="text-white">Usuarios registrado</p>
                  </div>
                  <div
                    className="icon"
                    style={{
                      width: "auto",
                      position: "absolute",
                      top: 15,
                      right: 10,
                      transform: "rotate(325deg)",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faAddressCard}
                      color="white"
                      width={55}
                      height={55}
                      style={{ height: "50px", opacity: 0.3 }}
                    />
                  </div>
                </div>
              </Link>
            ) : (
              ""
            )}
            <Link
              className="col-lg-3 mt-1"
              to="/equipment/list"
              style={{
                display: "flex",
                textDecoration: "none",
                background: "#0d2952",
                padding: "5px 10px",
                borderRadius: "5px",
                position: "relative",
              }}
            >
              <div className="small-box">
                <div className="inner">
                  <h3 className="text-white">{lengths.equipments}</h3>
                  <p className="text-white">Equipos registrado</p>
                </div>
                <div
                  className="icon"
                  style={{
                    width: "auto",
                    position: "absolute",
                    top: 15,
                    right: 10,
                    transform: "rotate(325deg)",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faDesktop}
                    color="white"
                    width={55}
                    height={55}
                    style={{ height: "50px", opacity: 0.3 }}
                  />
                </div>
              </div>
            </Link>

            <Link
              className="col-lg-3 mt-1"
              to="/report/list"
              style={{
                display: "flex",
                textDecoration: "none",
                background: "#0d2952",
                padding: "5px 10px",
                borderRadius: "5px",
                position: "relative",
              }}
            >
              <div className="small-box">
                <div className="inner">
                  <h3 className="text-white">{lengths.reports}</h3>
                  <p className="text-white">Reportes registrados</p>
                </div>
                <div
                  className="icon"
                  style={{
                    width: "auto",
                    position: "absolute",
                    top: 15,
                    right: 10,
                    transform: "rotate(325deg)",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faFlag}
                    color="white"
                    width={55}
                    height={55}
                    style={{ height: "50px", opacity: 0.3 }}
                  />
                </div>
              </div>
            </Link>
          </div>

          <hr />
          <div>
            <h3>Reportes registrados recientemente</h3>
            {width > 1024 ? (
              <table className="table table-bordered table-equipments">
                <thead>
                  <tr style={{ background: "#f3f3f3" }}>
                    <th scope="col">Tipo de registro</th>
                    <th scope="col">Fecha de registro</th>
                    <th scope="col">Equipos reportados</th>
                    <th scope="col">Ultima modificacion</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((el: Report, i: number) => {
                      return (
                        <tr key={i}>
                          <th scope="row">
                            <Link to={`/report/detail/${el.id}`}>
                              {el.record_type?.toUpperCase()}
                            </Link>
                          </th>
                          <td>
                            <Link to={`/report/detail/${el.id}`}>
                              {el.register_date.day}/{el.register_date.month}/
                              {el.register_date.year}
                            </Link>
                          </td>
                          <td>
                            <Link to={`/report/detail/${el.id}`}>
                              {el.equipments.length}
                            </Link>
                          </td>
                          <td>
                            <Link
                              to={`/report/detail/${el.id}`}
                            >{`${el.updated_at}`}</Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontSize: "1.2em",
                        }}
                      >
                        Ningun resultado encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="list-group">
                {reports.length > 0 ? (
                  reports.map((el: Report, i: number) => {
                    return (
                      <Link
                        to={`/report/detail/${el.id}`}
                        className="list-group-item list-group-item-action flex-column align-items-start"
                        key={i}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">
                            {el.record_type?.toUpperCase()}
                          </h5>
                          <small>
                            {el.register_date.day}/{el.register_date.month}/
                            {el.register_date.year}
                          </small>
                        </div>
                        <small>
                          Equipos registrados: {el.equipments.length}
                        </small>
                      </Link>
                    );
                  })
                ) : (
                  <div className="alert alert-dark" role="alert">
                    Ningun resultado encontrado
                  </div>
                )}
              </div>
            )}
          </div>
          <hr />
          <div>
            <h3>Equipos registrado recientemente</h3>
            {width > 1024 ? (
              <table className="table table-bordered table-equipments">
                <thead>
                  <tr style={{ background: "#f3f3f3" }}>
                    <th scope="col">Numero de bien</th>
                    <th scope="col">Marca</th>
                    <th scope="col">Modelo</th>
                    <th scope="col">Serial</th>
                    <th scope="col">Fecha de registro</th>
                  </tr>
                </thead>
                <tbody>
                  {equipments.length > 0 ? (
                    equipments.map((el: Equipment, i: number) => {
                      return (
                        <tr key={i}>
                          <th scope="row">
                            <Link to={`/equipment/detail/${el._id}`}>
                              {el.asset_number.toUpperCase()}
                            </Link>
                          </th>
                          <td>
                            <Link to={`/equipment/detail/${el._id}`}>
                              {el.brand.toUpperCase()}
                            </Link>
                          </td>
                          <td>
                            <Link to={`/equipment/detail/${el._id}`}>
                              {el.model.toUpperCase()}
                            </Link>
                          </td>
                          <td>
                            <Link to={`/equipment/detail/${el._id}`}>
                              {el.serial.toUpperCase()}
                            </Link>
                          </td>
                          {el.register_date ? (
                            <td>
                              <Link to={`/equipment/detail/${el.id}`}>
                                {el.register_date.day}/{el.register_date.month}/
                                {el.register_date.year}
                              </Link>
                            </td>
                          ) : (
                            ""
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontSize: "1.2em",
                        }}
                      >
                        Ningun resultado encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="list-group">
                {equipments.length > 0 ? (
                  equipments.map((el: Equipment, i: number) => {
                    return (
                      <Link
                        to={`/equipment/detail/${el._id}`}
                        className="list-group-item list-group-item-action flex-column align-items-start"
                        key={i}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">
                            {el.asset_number.toUpperCase()}
                          </h5>
                          {el.register_date ? (
                            <small>
                              {el.register_date.day}/{el.register_date.month}/
                              {el.register_date.year}
                            </small>
                          ) : (
                            ""
                          )}
                        </div>
                        <small>
                          {el.brand.toUpperCase()} - {el.model.toUpperCase()}
                        </small>
                        <small>
                          <span style={{ fontWeight: "600" }}>Serial:</span>
                          {el.serial.toUpperCase()}
                        </small>
                      </Link>
                    );
                  })
                ) : (
                  <div className="alert alert-dark" role="alert">
                    Ningun resultado encontrado
                  </div>
                )}
              </div>
            )}
          </div>
          <hr />
          {users.length > 0 && Cookies.get("rol") === "admin" ? (
            <div>
              <h3>Usuarios registrado recientemente</h3>
              {width > 1024 ? (
                <table className="table table-bordered table-equipments">
                  <thead>
                    <tr style={{ background: "#f3f3f3" }}>
                      <th scope="col">Cedula</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Apellido</th>
                      <th scope="col">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((el: User, i: number) => {
                        type ObjectKey = keyof typeof labelUser;
                        const rol = el.rol?.name as ObjectKey;
                        return (
                          <tr key={i}>
                            <th scope="row">
                              <Link to={`/user/detail/${el._id}`}>{el.ci}</Link>
                            </th>
                            <td>
                              <Link to={`/user/detail/${el._id}`}>
                                {el.firstname}
                              </Link>
                            </td>
                            <td>
                              <Link to={`/user/detail/${el._id}`}>
                                {el.lastname}
                              </Link>
                            </td>
                            <td>
                              <Link to={`/user/detail/${el._id}`}>{`${
                                labelUser[rol] || "Usuario"
                              }`}</Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            fontSize: "1.2em",
                          }}
                        >
                          Ningun resultado encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="list-group">
                  {users.length > 0 ? (
                    users.map((el: User, i: number) => {
                      type ObjectKey = keyof typeof labelUser;
                      const rol = el.rol?.name as ObjectKey;
                      return (
                        <Link
                          to={`/user/detail/${el._id}`}
                          className="list-group-item list-group-item-action flex-column align-items-start"
                          key={i}
                        >
                          <div className="d-flex w-100 justify-content-between">
                            <h5 className="mb-1">
                              {el.firstname} {el.lastname}
                            </h5>
                            <small>Cedula: {el.ci}</small>
                          </div>
                          <small>Rol: {labelUser[rol] || "Usuario"}</small>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="alert alert-dark" role="alert">
                      Ningun resultado encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            ""
          )}
          <hr />
          {logs.length > 0 && Cookies.get("rol") === "admin" ? (
            <div>
              <h3>Actividad registrada recientemente</h3>
              {width > 1024 ? (
                <table className="table table-bordered table-equipments">
                  <thead>
                    <tr style={{ background: "#f3f3f3" }}>
                      <th scope="col">Direccion IP</th>
                      <th scope="col">Usuario</th>
                      <th scope="col">Razon</th>
                      <th scope="col">Realizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((el: Log, i: number) => {
                        return (
                          <tr key={i}>
                            <th scope="row" className="p-2">
                              <span>{el.ip}</span>
                            </th>
                            <td className="text-capitalize p-2">
                              <span>
                                {el.user ? "" : "Desconocido"}{" "}
                                {el.user?.firstname} {el.user?.lastname}
                              </span>
                            </td>
                            <td className="p-2">
                              <span>{el.reason}</span>
                            </td>
                            <td className="p-2">
                              <span>{el.created_at}</span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            fontSize: "1.2em",
                          }}
                        >
                          Ningun resultado encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="list-group">
                  {logs.length > 0 ? (
                    logs.map((el: Log, i: number) => {
                      return (
                        <span
                          className="list-group-item list-group-item-action flex-column align-items-start"
                          key={i}
                        >
                          <div className="d-flex w-100 justify-content-between">
                            <h5 className="mb-1">{el.ip}</h5>

                            <small>{el.created_at}</small>
                          </div>
                          <small className="text-capitalize">
                            {el.user ? "" : "Desconocido"} {el.user?.firstname}{" "}
                            {el.user?.lastname}
                          </small>
                          <small>
                            <span style={{ fontWeight: "600" }}>Razon:</span>
                            {el.reason}
                          </small>
                        </span>
                      );
                    })
                  ) : (
                    <div className="alert alert-dark" role="alert">
                      Ningun resultado encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            ""
          )}
          <hr />
        </>
      ) : (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center container-page evidences-detail">
          <div className="spinner-border mb-3" role="status">
            <span className="sr-only"></span>
          </div>
          <span className="mb-3">{status.text}</span>

          {!status.check ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                request();
              }}
            >
              Recargar
            </button>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
