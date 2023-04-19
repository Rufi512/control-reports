import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faDesktop } from "@fortawesome/free-solid-svg-icons";
import '../assets/styles/pages/home.css'
const Home = () => {
  return (
      <div className="container-fluid container-dashboard container-page">
        <div
          className="flex row flex-wrap"
          style={{ padding: "5px 12px", justifyContent: "space-around" }}
        >
          <a
            className="col-lg-4 mt-2"
            href="#"
            style={{
              display: "flex",
              textDecoration: "none",
              background: "#1f343e",
              padding: "5px 10px",
              borderRadius: "5px",
              position: "relative",
            }}
          >
            <div className="small-box">
              <div className="inner">
                <h3 className="text-white">150</h3>
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
          </a>
          <a
            className="col-lg-4 mt-2"
            href="#"
            style={{
              display: "flex",
              textDecoration: "none",
              background: "#1f343e",
              padding: "5px 10px",
              borderRadius: "5px",
              position: "relative",
            }}
          >
            <div className="small-box">
              <div className="inner">
                <h3 className="text-white">150</h3>
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
          </a>
        </div>

        <hr />
        <div>
          <h3>Actividad reciente</h3>
          <ul className="list-group">
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>

          </ul>
        </div>
        <hr />
        <div>
          <h3>Usuarios registrado recientemente</h3>
          <ul className="list-group">
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>

          </ul>
        </div>
        <hr />
        <div>
          <h3>Equipos registrado recientemente</h3>
          <ul className="list-group">
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>
            <li className="list-group-item p-0">
              <a href="#">Cras justo dsf - 27.663.352 - 27 marzo del 2013</a>
            </li>

          </ul>
        </div>
        <hr />
      </div>
  );
};

export default Home;
