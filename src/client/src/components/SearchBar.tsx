import { ChangeEvent, useEffect, useState } from "react";
type Props = {
  searchParams:{
    limit:number
    page:number
    searchHandle:(event:ChangeEvent<HTMLInputElement>)=> void
    searchValue:string,
    dateHandle:(event:ChangeEvent<HTMLInputElement>)=> void
    date:string
    limitHandle:(event:ChangeEvent<HTMLSelectElement>)=> void
    pagesHandle:(event:ChangeEvent<HTMLSelectElement>)=> void
    searchDateHandle:(value:boolean)=> void,
  }
  placeholder: string;
  totalDocs:number
  totalPages:number
  request:()=>void

}

const SearchBar = (props:Props) => {
  const [activeDate,setActiveDate] = useState(false)
  useEffect(()=>{
      return props.searchParams.searchDateHandle(activeDate);
  },[activeDate])
  return (
    <div className="container-fluid p-0">
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder={props.placeholder || ''}
          aria-describedby="basic-addon2"
          onChange={props.searchParams.searchHandle}
          value={props.searchParams.searchValue}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={()=>props.request()}>
            Buscar
          </button>
        </div>
      </div>

      <div className="mb-3">
        <nav className="d-flex flex-row flex-wrap align-items-center justify-content-between p-0 ">

          <div className="d-flex flex-column align-items-start mt-3">
            <label htmlFor="select-elements" style={{ fontWeight: 600 }}>
              Cantidad de elementos:
            </label>
            <select
              id="select-elements"
              className="custom-select w-full form-control"
              onChange={props.searchParams.limitHandle}
              defaultValue={10}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="d-flex flex-column align-items-start mt-3">
            <label htmlFor="select-elements" style={{ fontWeight: 600 }}>
              Pagina Actual:
            </label>
            <select
              id="select-elements"
              className="custom-select w-full form-control"
              onChange={props.searchParams.pagesHandle}
              value={Number(props.searchParams.page)}
            >
              {props.totalPages > 0 ? [...Array(props.totalPages)].map((_el,i)=>{
                return (
                  <option key={i} value={i + 1}>{i + 1}</option> 
                )
              }) : <option value={0}>0</option> }

            </select>
          </div>

          <div className="mt-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="flexCheckDefault"
                onChange={(e)=>setActiveDate(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="flexCheckDefault">
                Filtrar por fecha
              </label>
            </div>
            <input
              className="form-control"
              type="month"
              id="start"
              name="start"
              value={props.searchParams.date}
              onChange={props.searchParams.dateHandle}
              disabled={activeDate ? false : true}
            />
          </div>

        </nav>

        <div className="mt-3">
          <div className="col-md-6">
            <p>
              <span style={{ fontWeight: 600 }}>{props.totalDocs}</span> Resultados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
