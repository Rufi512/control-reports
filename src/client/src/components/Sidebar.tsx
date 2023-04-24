import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faDesktop,
  faFlag,
  faHouse,
  faTableList,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/images/mp.png";
import "../assets/styles/sidebar.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import avatarDefault from "../assets/images/account.png";
import Cookies from "js-cookie";
import useAuth from "../hooks/useAuth";
type Props = {
  page: string;
};
export const Sidebar = (props: Props) => {
  const ref = useRef(window);
  const auth = useAuth()
  const [dropdown, setDropdown] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [nameRol,setNameRol] = useState("")
  useEffect(() => {
    //listen click outside in class dropdown and class sidebar
    const handleClickOutside = (event: any) => {
      if (dropdown && !event.target.closest(".dropdown")) {
        setDropdown(false);
      }
      if (
        mobileSidebar &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".button-sidebar")
      ) {
        setMobileSidebar(false);
      }
    };

    const element = ref.current;

    element.addEventListener("click", handleClickOutside);

    // 👇️ remove the event listener when the component unmounts
    setNameRol(auth.rol)
    return () => {
      element.removeEventListener("click", handleClickOutside);
    };
  }, [dropdown, mobileSidebar]);

  //change visibility dropdown
  const handleDropdown = (event: any) => {
    if (dropdown) return setDropdown(false);
    return setDropdown(true);
  };

  const handleMobileSidebar = (event: any) => {
    if (mobileSidebar) return setMobileSidebar(false);
    return setMobileSidebar(true);
  };

  return (
    <>
      <button className="button-sidebar" onClick={handleMobileSidebar}>
        <FontAwesomeIcon icon={faBars} style={{ height: "30px" }} />
      </button>
      <div
        className={`d-flex flex-column flex-shrink-0 p-3 bg-light sidebar ${
          mobileSidebar ? "sidebar-active" : ""
        }`}
      >
        <button
          onClick={handleMobileSidebar}
          className="button-exit"
          style={{
            width: "50px",
            height: "50px",
            border: "none",
            background: "none",
          }}
        >
          <FontAwesomeIcon
            icon={faXmark}
            style={{ width: "30px", height: "30px" }}
          />
        </button>
        <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
          <img
            src={logo}
            alt="logo"
            style={{ width: "60px", marginRight: "10px" }}
          />
          <span style={{ fontSize: "1.2em" }}>Sistema de registro</span>
        </div>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item" onClick={() => setMobileSidebar(false)}>
            <Link
              to="/dashboard"
              className={`nav-link ${
                props.page === "dashboard" ? "active" : "link-dark"
              }`}
              aria-current="page"
            >
              <FontAwesomeIcon icon={faHouse} />
              <p>Inicio</p>
            </Link>
          </li>
          <li className="nav-item" onClick={() => setMobileSidebar(false)}>
            <Link
              to="/equipment/list"
              className={`nav-link ${
                props.page === "equipment" ? "active" : "link-dark"
              }`}
            >
              <FontAwesomeIcon icon={faDesktop} />
              <p>Lista de equipos</p>
            </Link>
          </li>
          <li className="nav-item" onClick={() => setMobileSidebar(false)}>
            <Link
              to="/report/list"
              className={`nav-link ${
                props.page === "report" ? "active" : "link-dark"
              }`}
            >
              <FontAwesomeIcon icon={faFlag} />
              <p>Lista de reportes</p>
            </Link>
          </li>
          {nameRol === "admin" ? (
            <>
              <li className="nav-item" onClick={() => setMobileSidebar(false)}>
                <Link
                  to="/user/list"
                  className={`nav-link ${
                    props.page === "user" ? "active" : "link-dark"
                  }`}
                >
                  <FontAwesomeIcon icon={faUser} />
                  <p>Usuarios</p>
                </Link>
              </li>
              <li className="nav-item" onClick={() => setMobileSidebar(false)}>
                <Link
                  to="/log/list"
                  className={`nav-link ${
                    props.page === "log" ? "active" : "link-dark"
                  }`}
                >
                  <FontAwesomeIcon icon={faTableList} />
                  <p>Actividades</p>
                </Link>
              </li>
            </>
          ) : (
            <></>
          )}
        </ul>
        <hr />
        <div className="dropdown">
          <button
            className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle container-fluid"
            style={{
              background: "none",
              border: "none",
              outline: 0,
              height: "50px",
              width: "auto",
              marginRight: "100%",
            }}
            data-bs-toggle="dropdown"
            aria-expanded="false"
            onClick={handleDropdown}
          >
            <img
              src={"/" + Cookies.get("avatar") || avatarDefault}
              onError={(e) => {
                e.currentTarget.src = avatarDefault;
              }}
              alt="avatar-user"
              width="32"
              height="32"
              className="rounded-circle me-2"
            />
            <strong style={{ textTransform: "capitalize" }}>
              {Cookies.get("name")}
            </strong>
          </button>
          <ul
            className={`dropdown-menu text-small shadow ${
              dropdown ? "dropdown-menu-show" : ""
            }`}
          >
            <li onClick={() => setMobileSidebar(false)}>
              <Link
                className="dropdown-item"
                to={`/user/detail/${Cookies.get("id_user")}`}
              >
                Opciones
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link className="dropdown-item" to="/logout">
                Cerrar sesion
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};