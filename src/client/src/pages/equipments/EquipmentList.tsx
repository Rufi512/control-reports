import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";
import { Link, useSearchParams } from "react-router-dom";
import { Equipment } from "../../types/equipment";
import { getEquipments } from "../../Api/EquipmentsApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "../../assets/styles/pages/equipment.css";
import Loader from "../../components/Loader";
import ErrorAdvice from "../../components/ErrorAdvice";
import { getSelectsUsers } from "../../Api/UsersApi";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import AsyncSelect from "react-select/async";
const EquipmentList = () => {
  const ref = useRef(window);
  const [width, setWidth] = useState(window.innerWidth);
  const [searchBarParams] = useSearchParams();
  const [searchParams, setSearchParams] = useState({
    limit: 10 || Number(searchBarParams.get("limit")),
    page: 1 || Number(searchBarParams.get("page")),
    search: "" || searchBarParams.get("search")?.toString(),
    searchForDate: searchBarParams.get("date") ? true : false,
    user: "" || searchBarParams.get("user")?.toString(),
    date:
      searchBarParams.get("date")?.toString() ||
      `${new Date().getFullYear()}-${
        new Date().getUTCMonth() + 1 < 10 ? "0" : ""
      }${new Date().getUTCMonth() + 1}`,
  });
  const [requestParams, setRequestParams] = useState({
    hasPrevPage: false,
    hasNextPage: false,
    totalPages: 0,
    totalDocs: 0,
  });

  const [userSelected, setUserSelected] = useState({
    label: "Todos los usuarios",
    value: "",
  });

  const [equipments, setEquipments] = useState<Equipment[]>([]);

  const [isRequest, setIsRequest] = useState(true);

  const [errorRequest, setErrorRequest] = useState(false);

  //Handle window width
  const handleResize = () => {
    const actualWidth = window.innerWidth;
    setWidth(actualWidth);
  };

  //Update the search value
  const searchHandle = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchParams({ ...searchParams, search: value });
  };

  //Update the search date
  const dateHandle = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchParams({ ...searchParams, date: value });
  };
  //Update search by date
  const searchDateHandle = (value: boolean) => {
    setSearchParams({ ...searchParams, searchForDate: value });
  };

  //Update the limit of results
  const limitHandle = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (!Number(value)) return;
    setSearchParams({ ...searchParams, limit: Number(value) });
  };

  //Refresh the current page
  const pagesHandle = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (Number(value) > requestParams.totalPages) return;
    setSearchParams({ ...searchParams, page: Number(value) });
  };

  useEffect(() => {
    const element = ref.current;

    element.addEventListener("resize", handleResize);

    // 👇️ remove the event listener when the component unmounts
    return () => {
      element.removeEventListener("resize", handleResize);
    };
  }, [window]);

  // Request Equipment
  const request = async () => {
    setIsRequest(true);
    try {
      const res = await getEquipments(searchParams);
      setIsRequest(false);
      if (!res) return setErrorRequest(true);
      if (res.status >= 400) return setErrorRequest(true);
      setEquipments(res.data.docs);
      setRequestParams({
        hasPrevPage: res.data.hasPrevPage,
        hasNextPage: res.data.hasNextPage,
        totalPages: res.data.totalPages,
        totalDocs: res.data.totalDocs,
      });
      setErrorRequest(false)
    } catch (err) {
      setIsRequest(false);
      setErrorRequest(true)
      console.log(err);
    }
  };


  const requestUserSelect = async (search: string) => {
    try {
      const res = await getSelectsUsers(search || "");
      if (res && res.status >= 400) {
        toast.error("Error al requerir lista de usuarios");
        return [];
      }
      const data = res?.data || { label: "", value: "" };
      return [{ label: "Todos los usuarios", value: "" }, ...data] || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  const handleSelectUser = (data: any) => {
    setUserSelected({ label: data.label, value: data.value });
    setSearchParams({ ...searchParams, user: data.value });
  };

  const showMyItems = (e:ChangeEvent<HTMLInputElement>) =>{
    const id = Cookies.get('id_user')
    setSearchParams({ ...searchParams, user: e.target.checked ? id : '' })

  }

  useEffect(() => {
    request();
    console.log("call");
  }, [searchParams]);

  return (
    <div className="container-fluid d-flex flex-column container-page container-list">
      <div className="header-page">
        <h2 style={{ textAlign: "right", marginTop: "10px" }}>
          Lista de equipos
        </h2>
        <hr />
      </div>

      
      <div className="container-fluid container-body-content">
      {Cookies.get("rol") == "admin" ? (
              <>

                <label style={{ fontWeight: "600", marginBottom:'4px' }}>Equipos de</label>

                <AsyncSelect
                  loadOptions={requestUserSelect}
                  onChange={handleSelectUser}
                  value={userSelected}
                  defaultOptions
                />
                <br />

              </>
            ) : (
              ""
            )}

        {
          Cookies.get("rol") == 'user' ? (
            <>

            <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="switch-user" onChange={(e)=>showMyItems(e)}/>
                  <label className="form-check-label" htmlFor="switch-user" >Mostrar mis equipos</label>
                </div>
            <br />

          </>
          ): ''
        }

        <SearchBar
          searchParams={{
            limit: 10,
            page: searchParams.page,
            searchHandle,
            searchValue: searchParams.search || "",
            dateHandle,
            date: searchParams.date,
            limitHandle,
            pagesHandle,
            searchDateHandle,
          }}
          placeholder="Numero de bien | serial | marca | modelo"
          totalPages={requestParams.totalPages}
          totalDocs={requestParams.totalDocs}
          request={request}
        />

      

        {isRequest ? (
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ marginTop: "30px" }}
          >
            <Loader/>
          </div>
        ) : (
          errorRequest ? (
          <div className="d-flex flex-column justify-content-center">
            <ErrorAdvice
              action={() => {
                request();
              }}
            />
          </div>
        ) : <div>
            <div
              className="container-links"
              style={{
                margin: "10px 0",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Link to={"/equipment/register"} className="btn btn-primary">
                <FontAwesomeIcon icon={faPlus} />
                <span>Agregar Equipo</span>
              </Link>
            </div>
            {width > 1024 ? (
              <table className="table table-bordered table-equipments">
                <thead>
                  <tr>
                    <th scope="col">Numero de bien</th>
                    <th scope="col">Marca</th>
                    <th scope="col">Modelo</th>
                    <th scope="col">Serial</th>
                    <th scope="col">Registrado por:</th>
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
                              {el.asset_number.toUpperCase() || 'No especificado'}
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
                              {el.serial.toUpperCase() || 'N/A'}
                            </Link>
                          </td>
                          {el.user ? <td>
                            <Link to={`/equipment/detail/${el._id}`}>
                              {el.user.firstname} {el.user.lastname}
                            </Link>
                          </td> : <td> <Link to={`/equipment/detail/${el._id}`}>No especificado</Link></td>}
                          {el.register_date ? (
                            <td>
                              <Link to={`/equipment/detail/${el._id}`}>
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
              <div className="list-group" style={{gap: '20px'}}>
                {equipments.length > 0 ? (
                  equipments.map((el: Equipment, i: number) => {
                    return (
                      <Link
                        to={`/equipment/detail/${el._id}`}
                        className="list-group-item list-group-item-action flex-column align-items-start"
                        key={i}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1" style={{fontSize:'16px'}}>
                             <b>Numero de bien:</b> {el.asset_number.toUpperCase() || 'No especificado'}
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
                        <b>Equipo:</b> {el.brand.toUpperCase()} - {el.model.toUpperCase()}
                        </small>
                        <br />
                        <small>
                          <span style={{ fontWeight: "600" }}>Serial:</span>
                          {el.serial.toUpperCase() || 'N/A'}
                        </small>
                        <br/>
                        {el.user ? <small>
                          <b>Registrado por:{" "}</b>
                          {el.user?.firstname} {el.user?.lastname} 
                        </small> : ''}
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

            <ul
              className="pagination justify-content-end w-auto mt-2"
              style={{ display: requestParams.totalDocs > 0 ? "flex" : "none" }}
            >
              <li
                className={`page-item ${
                  requestParams.hasPrevPage ? "" : "disabled"
                }`}
                onClick={() => {
                  requestParams.hasPrevPage
                    ? setSearchParams({
                        ...searchParams,
                        page: Number(searchParams.page) - 1,
                      })
                    : "";
                }}
              >
                <span className="page-link">Anterior</span>
              </li>
              <li
                className={`page-item ${
                  requestParams.hasNextPage ? "" : "disabled"
                }`}
                onClick={() => {
                  requestParams.hasNextPage
                    ? setSearchParams({
                        ...searchParams,
                        page: Number(searchParams.page) + 1,
                      })
                    : "";
                }}
              >
                <span className="page-link">Siguiente</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentList;