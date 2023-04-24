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
import Recovery from "./pages/Recovery";
import Quests from "./pages/Recovery/Quests";
import Password from "./pages/Recovery/Password";
import VerifyRol from "./components/VerifyRol";

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

          {/*recovery users*/}
          <Route path="/recovery/user" element={<Recovery/>}/>
          <Route path="/recovery/questions/:id" element={<Quests/>}/>
          <Route path="/recovery/password/:id" element={<Password/>}/>

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

            {/*Users Pages (admin only)*/}
            <Route path="user/*" element={<VerifyRol allowedRoles={['admin']}/>}>
             <Route path="list" element={<UserList />} />
             <Route path="register" element={<UserRegister />} />
            </Route>
            <Route path="user/*" element={<VerifyRol allowedRoles={['admin','user']}/>}>
             <Route path="detail/:id" element={<UserDetail />} />
            
            </Route>
             {/*Logs*/}
            <Route path="log/*" element={<VerifyRol allowedRoles={['admin']}/>}>
             <Route path="list" element={<LogList/>}/>
            </Route>
            
          </Route>
          {/*Logout*/}
          <Route path="/logout" element={<Logout />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
