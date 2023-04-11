import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EquipmentRegister from "./pages/equipments/EquipmentRegister";
import EquipmentDetail from "./pages/equipments/EquipmentDetail";
import EquipmentList from "./pages/equipments/EquipmentList";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import CheckLogin from "./components/CheckLogin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReportRegister from "./pages/reports/ReportRegister";
import ReportList from "./pages/reports/ReportList";
import ReportDetail from "./pages/reports/ReportDetail";
import Login from "./pages/Login";
//import ReportRegister from "./pages/reports/ReportRegister";
//import ReportList from "./pages/reports/ReportList";
//import ReportDetail from "./pages/reports/ReportDetail";
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
          <Route  path="/" element={<CheckLogin><Login/></CheckLogin>} />
          {/*Not found*/}
          <Route path="/*" element={<NotFound />} />
          <Route
            path="/*"
            element={<ProtectedRoute key={null} type={""} props={undefined} />}
          >
            <Route path="dashboard" element={<Home />} />
            {/* Equipment Pages*/}
            <Route path="equipment/register" element={<EquipmentRegister />} />
            <Route path="equipment/list" element={<EquipmentList />} />
            <Route path="equipment/detail/:id" element={<EquipmentDetail />} />
            

            <Route path="report/register" element={<ReportRegister />} />
            <Route path="report/list" element={<ReportList />} />
            <Route path="report/detail/:id" element={<ReportDetail />} />
            {/*Report Pages
            <Route path="report/list" element={<ReportList />} />
            <Route path="report/detail/:id" element={<ReportDetail />} />
            */}
            
            {/*Logout*/}

            {/*Protected routes*/}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
