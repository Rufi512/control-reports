import { ChangeEvent, useEffect, useRef, useState } from "react";
import { UsersApi } from "../../Api";
import SearchBar from "../../components/SearchBar";
import { Link, useSearchParams } from "react-router-dom";
import "../../assets/styles/pages/equipment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Loader from "../../components/Loader";
import ErrorAdvice from "../../components/ErrorAdvice";
import { Headquarter } from "../../types/headquarter";
import dateformat from "dateformat";
import { getHeadquarters } from "../../Api/HQApi";

const HQList = () => {
  const ref = useRef(window);
  const [width, setWidth] = useState(window.innerWidth);
  const [searchBarParams] = useSearchParams();
  const [searchParams, setSearchParams] = useState({
    limit: 10 || Number(searchBarParams.get("limit")),
    page: 1 || Number(searchBarParams.get("page")),
    search: "" || searchBarParams.get("search")?.toString(),
    searchForDate: searchBarParams.get("date") ? true : false,
    date:''
  });
  const [requestParams, setRequestParams] = useState({
    hasPrevPage: false,
    hasNextPage: false,
    totalPages: 0,
    totalDocs: 0,
  });
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);


  const handleResize = () => {
    const actualWidth = window.innerWidth;
    setWidth(actualWidth);
  };

  const searchHandle = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchParams({ ...searchParams, search: value });
  };

  const dateHandle = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchParams({ ...searchParams, date: value });
  };

  const searchDateHandle = (value: boolean) => {
    setSearchParams({ ...searchParams, searchForDate: value });
  };

  const limitHandle = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (!Number(value)) return;
    setSearchParams({ ...searchParams, limit: Number(value) });
  };

  const pagesHandle = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (Number(value) > requestParams.totalPages) return;
    setSearchParams({ ...searchParams, page: Number(value) });
  };

  const [isRequest, setIsRequest] = useState(true);

  const [errorRequest, setErrorRequest] = useState(false);

  useEffect(() => {
    const element = ref.current;

    element.addEventListener("resize", handleResize);

    // 👇️ remove the event listener when the component unmounts
    return () => {
      element.removeEventListener("resize", handleResize);
    };
  }, [window]);

  // Request Data
  const request = async () => {
    setIsRequest(true);
    try {
      const res = await getHeadquarters(searchParams);
      setIsRequest(false);
      if (!res) return setErrorRequest(true);
      if (res.status >= 400) return setErrorRequest(true);
      setHeadquarters(res.data.docs);
      setRequestParams({
        hasPrevPage: res.data.hasPrevPage,
        hasNextPage: res.data.hasNextPage,
        totalPages: res.data.totalPages,
        totalDocs: res.data.totalDocs,
      });
      setErrorRequest(false);
    } catch (err) {
      setErrorRequest(true);
      setIsRequest(false);
      console.log(err);
    }
  };

  useEffect(() => {
    request();
  }, [searchParams]);

  return (
    <div className="container-fluid d-flex flex-column container-page container-list">
      <div className="header-page">
        <h2 style={{ textAlign: "right", marginTop: "10px" }}>
          Lista de sedes
        </h2>
        <hr />
      </div>
      <div className="container-fluid container-body-content">
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
          placeholder="Cedula | Nombre | Apellido"
          totalPages={requestParams.totalPages}
          totalDocs={requestParams.totalDocs}
          request={request}
        />
        {isRequest ? (
          <div
            className="container-fluid d-flex flex-column justify-content-center align-items-center"
            style={{ marginTop: "30px" }}
          >
            <Loader />
          </div>
        ) : errorRequest ? (
          <div className="d-flex flex-column justify-content-center">
            <ErrorAdvice
              action={() => {
                request();
              }}
            />
          </div>
        ) : (
          <div>
            <div
              className="container-links"
              style={{
                margin: "10px 0",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Link to={"/hq/register"} className="btn btn-primary">
                <FontAwesomeIcon icon={faPlus} />
                <span>Agregar Usuario</span>
              </Link>
            </div>
            {width > 1024 ? (
              <table className="table table-bordered table-equipments">
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Ciudad</th>
                    <th scope="col">Circuito</th>
                    <th scope="col">Fecha de registro</th>
                  </tr>
                </thead>
                <tbody>
                  {headquarters.length > 0 ? (
                    headquarters.map((el: Headquarter, i: number) => {
                      return (
                        <tr key={i}>
                          <th scope="row">
                            <Link to={`/hq/detail/${el._id}`}>{el.name}</Link>
                          </th>
                          <td>
                            <Link to={`/hq/detail/${el._id}`}>
                              {el.state}
                            </Link>
                          </td>
                          <td>
                            <Link to={`/hq/detail/${el._id}`}>
                              {el.city}
                            </Link>
                          </td>
                          <td>
                            <Link to={`/hq/detail/${el._id}`}>{el.circuit_number || 'Sin identificar'}</Link>
                          </td>
                          <td>
                            <Link to={`/hq/detail/${el._id}`}>{dateformat(el.created_at)}</Link>
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
                {headquarters.length > 0 ? (
                  headquarters.map((el: Headquarter, i: number) => {
                    console.log(el)
                    return (
                      <Link
                        to={`/hq/detail/${el._id}`}
                        className="list-group-item list-group-item-action flex-column align-items-start"
                        key={i}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">
                            {el.name}
                          </h5>
                        </div>
                        <small>
                          Estado:<span style={{ fontWeight: "600" }}>{el.state}</span>{" "}
                        </small>
                        <br/>
                        <small>
                          Ciudad:<span style={{ fontWeight: "600" }}>{el.city}</span>{" "}
                        </small>
                        <br/>
                        <small>
                          Numero de circuito:<span style={{ fontWeight: "600" }}>{el.circuit_number || 'Sin identificar'} </span>{" "}
                        </small>
                        <br/>
                        <small>
                            Fecha de registro: {dateformat(el.created_at)}
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

export default HQList;