import { ChangeEvent, useEffect, useRef, useState } from "react";
import SearchBar from "../../components/SearchBar";
import { useSearchParams } from "react-router-dom";
import { getLogs } from "../../Api/LogsApi";
import "../../assets/styles/pages/equipment.css";
import { Log } from "../../types/log";
import dateformat from "../../hooks/useDateFormat";
import Loader from "../../components/Loader";
import ErrorAdvice from "../../components/ErrorAdvice";

const LogList = () => {
  const ref = useRef(window);
  const [width, setWidth] = useState(window.innerWidth);
  const [searchBarParams] = useSearchParams();
  const [searchParams, setSearchParams] = useState({
    limit: 10 || Number(searchBarParams.get("limit")),
    page: 1 || Number(searchBarParams.get("page")),
    search: "" || searchBarParams.get("search")?.toString(),
    searchForDate: searchBarParams.get("date") ? true : false,
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
  const [logs, setLogs] = useState<Log[]>([]);

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

  // Request Equipment
  const request = async () => {
    setIsRequest(true);
    try {
      const res = await getLogs(searchParams);
      setIsRequest(false);
      if (!res) return setErrorRequest(true);
      if (res.status >= 400) return setErrorRequest(true);
      setLogs(res.data.docs);
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
          Actividades de usuarios
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
          placeholder=""
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
            {width > 1024 ? (
              <table className="table table-bordered table-equipments">
                <thead>
                  <tr>
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
                            {el.ip}
                          </th>
                          <td className="text-capitalize p-2">
                            {el.user ? "" : "Desconocido"} {el.user?.firstname}{" "}
                            {el.user?.lastname}
                          </td>
                          <td className="p-2">{el.reason}</td>
                          <td className="p-2">
                            {dateformat(el.created_at || "")}
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
                        </div>
                        <small className="text-capitalize">
                          <span style={{ fontWeight: "600" }}>Usuario: </span>
                          {el.user ? "" : "Desconocido"} {el.user?.firstname}{" "}
                          {el.user?.lastname}
                        </small>
                        <br />
                        <small>
                          <span style={{ fontWeight: "600" }}>Razon: </span>
                          {el.reason}
                        </small>
                        <br />
                        <small>
                          <span style={{ fontWeight: "600" }}>Fecha: </span>
                          {dateformat(el.created_at)}
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

export default LogList;