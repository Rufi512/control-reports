import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EquipmentRegister from "./pages/equipments/EquipmentRegister";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import CheckLogin from "./components/CheckLogin";
import EquipmentList from "./pages/equipments/EquipmentList";
import { ToastContainer } from "react-toastify";
import EquipmentDetail from "./pages/equipments/EquipmentDetail";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <>
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover={false}
    />
      <BrowserRouter>
        <Routes>
          {/*Login*/}
          <Route  path="/" element={<CheckLogin><h1>Hello</h1></CheckLogin>} />
          {/*Not found*/}
          <Route path="/*" element={<NotFound />} />
          <Route
            path="/*"
            element={<ProtectedRoute key={null} type={""} props={undefined} />}
          >
            <Route path="dashboard" element={<Home />} />

            {/*Equipment Pages*/}
            <Route path="equipment/register" element={<EquipmentRegister />} />
            <Route path="equipment/list" element={<EquipmentList />} />
            <Route path="equipment/detail/:id" element={<EquipmentDetail />} />
            
            {/*Logout*/}

            {/*Protected routes*/}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
