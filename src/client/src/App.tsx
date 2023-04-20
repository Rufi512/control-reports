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
import UserList from "./pages/users/UserList";
import UserDetail from "./pages/users/UserDetail";
import UserRegister from "./pages/users/UserRegister";
import Welcome from "./pages/Welcome";
import LogList from "./pages/logs/LogList";
import Logout from "./pages/Logout";
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
          <Route path="/" element={<CheckLogin><Login/></CheckLogin>} />
          
          {/*Welcome (first_login)*/}
          <Route path="/welcome/:id" element={<Welcome/>}/>
          {/*Not found*/}
          <Route path="/*" element={<NotFound />} />

          <Route
            path="/*"
            element={<ProtectedRoute key={null} type={""} props={undefined} />}
          >
            {/*Protected routes*/}

            {/* Dashboard */}
            <Route path="dashboard" element={<Home />} />

            {/* Equipment Pages*/}
            <Route path="equipment/register" element={<EquipmentRegister />} />
            <Route path="equipment/list" element={<EquipmentList />} />
            <Route path="equipment/detail/:id" element={<EquipmentDetail />} />
            
            {/*Report pages*/}
            <Route path="report/register" element={<ReportRegister />} />
            <Route path="report/list" element={<ReportList />} />
            <Route path="report/detail/:id" element={<ReportDetail />} />

            {/*Users Pages*/}
             <Route path="user/list" element={<UserList />} />
             <Route path="user/detail/:id" element={<UserDetail />} />
             <Route path="user/register" element={<UserRegister />} />

             {/*Logs*/}
             <Route path="log/list" element={<LogList/>}/>
            
          </Route>
          {/*Logout*/}
          <Route path="/logout" element={<Logout />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
