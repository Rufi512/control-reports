import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { UsersApi, reportsApi } from "../../Api";
import SearchBar from "../../components/SearchBar";
import { Link, useSearchParams } from "react-router-dom";
import "../../assets/styles/pages/equipment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Report } from "../../types/report";
import { User } from "../../types/user";
import { ObjectKeys } from "react-hook-form/dist/types/path/common";
const UserList = () => {
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
  const [users, setUsers] = useState<User[]>([]);

  const labelUser = {
    admin:'Administrador/a',
    user:'Usuario'
  }

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
      const res = await UsersApi.getUsers(searchParams);
      if (!res) return;
      if (res.status >= 400) return;
      setUsers(res.data.docs);
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
            Lista de usuarios
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
            placeholder="Cedula | Nombre | Apellido"
            totalPages={requestParams.totalPages}
            totalDocs={requestParams.totalDocs}
            request={request}
          />
          <div className="container-links" style={{margin:'10px 0', display:'flex', justifyContent:'flex-end'}}>
            <Link to={'/user/register'} className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} />
              <span>Agregar Usuario</span>
              </Link>
          </div>
          {width > 1024 ? (
            <table className="table table-bordered table-equipments">
              <thead>
                <tr>
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
                    console.log(rol)
                    return (
                      <tr key={i}>
                        <th scope="row">
                          <Link to={`/user/detail/${el._id}`}>{el.ci}</Link>
                        </th>
                        <td>
                          <Link to={`/user/detail/${el._id}`}>{el.firstname}</Link>

                        </td>
                        <td>
                          <Link to={`/user/detail/${el._id}`}>{el.lastname}</Link>
                        </td>
                        <td>
                          <Link to={`/user/detail/${el._id}`}>{`${labelUser[rol] || 'Usuario'}`}</Link>
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
                        <small>
                          Cedula: {el.ci}
                        </small>
                      </div>
                      <small>
                        Rol: {el.rol?.name || 'usuario'}
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

export default UserList;
