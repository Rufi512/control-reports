import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { reportsApi } from "../../Api";
import SearchBar from "../../components/SearchBar";
import { Link, useSearchParams } from "react-router-dom";
import "../../assets/styles/pages/equipment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Report } from "../../types/report";
const EquipmentList = () => {
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
  const [reports, setReports] = useState<Report[]>([]);

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
    try {
      const res = await reportsApi.getReports(searchParams);
      if (!res) return;
      if (res.status >= 400) return;
      setReports(res.data.docs);
      setRequestParams({
        hasPrevPage: res.data.hasPrevPage,
        hasNextPage: res.data.hasNextPage,
        totalPages: res.data.totalPages,
        totalDocs: res.data.totalDocs,
      });
      console.log(res.data)
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    request();
  }, [searchParams]);

  return (
      <div className="container-fluid d-flex flex-column container-page container-list">
        <div>
          <h2 style={{ textAlign: "right", marginTop: "10px" }}>
            Lista de reportes
          </h2>
          <hr />
        </div>
        <div className="container-fluid">
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
            placeholder="Tipo de reporte"
            totalPages={requestParams.totalPages}
            totalDocs={requestParams.totalDocs}
            request={request}
          />
          <div className="container-links" style={{margin:'10px 0', display:'flex', justifyContent:'flex-end'}}>
            <Link to={'/report/register'} className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} />
              <span>Agregar reporte</span>
              </Link>
          </div>
          {width > 1024 ? (
            <table className="table table-bordered table-equipments">
              <thead>
                <tr>
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
                          <Link to={`/report/detail/${el.id}`}>{el.record_type?.toUpperCase()}</Link>
                        </th>
                        <td>
                          <Link to={`/report/detail/${el.id}`}>{el.register_date.day}/{el.register_date.month}/{el.register_date.year}</Link>

                        </td>
                        <td>
                          <Link to={`/report/detail/${el.id}`}>{el.equipments.length}</Link>
                        </td>
                        <td>
                          <Link to={`/report/detail/${el.id}`}>{`${el.updated_at}`}</Link>
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
      </div>
  );
};

export default EquipmentList;
