import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Sidebar } from '../../components/Sidebar';
import SearchBar from '../../components/SearchBar';
import { Link, useSearchParams } from 'react-router-dom';
import { Equipment } from '../../types/equipment';
import { getEquipments } from '../../Api/EquipmentsApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import "../../assets/styles/pages/equipment.css";
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
  const [equipments, setEquipments] = useState<Equipment[]>([]);

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
    try {
      const res = await getEquipments(searchParams);
      if (!res) return;
      if (res.status >= 400) return;
      setEquipments(res.data.docs);
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
        <div className="header-page">
          <h2 style={{ textAlign: "right", marginTop: "10px" }}>
            Lista de equipos
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
            placeholder="Numero de bien | serial | marca | modelo"
            totalPages={requestParams.totalPages}
            totalDocs={requestParams.totalDocs}
            request={request}
          />
          <div className="container-links" style={{margin:'10px 0', display:'flex', justifyContent:'flex-end'}}>
            <Link to={'/equipment/register'} className="btn btn-primary">
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
                  <th scope="col">Fecha de registro</th>
                </tr>
              </thead>
              <tbody>
                {equipments.length > 0 ? (
                  equipments.map((el: Equipment, i: number) => {
                    return (
                      <tr key={i}>
                        <th scope="row">
                          <Link to={`/equipment/detail/${el._id}`}>{el.asset_number.toUpperCase()}</Link>
                        </th>
                        <td>
                          <Link to={`/equipment/detail/${el._id}`}>{el.brand.toUpperCase()}</Link>
                        </td>
                        <td>
                          <Link to={`/equipment/detail/${el._id}`}>{el.model.toUpperCase()}</Link>
                        </td>
                        <td>
                          <Link to={`/equipment/detail/${el._id}`}>{el.serial.toUpperCase()}</Link>
                        </td>
                        {el.register_date ? <td>
                          <Link to={`/equipment/detail/${el.id}`}>
                            {el.register_date.day}/{el.register_date.month}/
                            {el.register_date.year}
                          </Link>
                        </td> : ''}
                        
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
                        {el.register_date ? 
                          <small>
                            {el.register_date.day}/{el.register_date.month}/
                            {el.register_date.year}
                          </small>
                        : ''}
                      </div>
                      <small>
                        {el.brand.toUpperCase()} - {el.model.toUpperCase()}
                      </small>
                      <br />
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
	)
}


export default EquipmentList