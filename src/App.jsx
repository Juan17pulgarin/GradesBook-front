import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import TeachersPage from "./pages/Teachers";
import MainLayout from "./components/layout/MainLayout";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Courses from "./pages/Courses";
import StudentMain from "./pages/StudentMain";
import TeachersMain from "./pages/TeachersMain";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />


        <Route path="/StudentMain" element={<StudentMain />} />
        <Route path="/TeachersMain" element={<TeachersMain />} />


        <Route element={<MainLayout />}>

          <Route path="/MainPage" element={<MainPage />} />
          <Route path="/Teachers" element={<TeachersPage />} />
          <Route path="/Students" element={<Students />} />
          <Route path="/Subjects" element={<Subjects />} />
          <Route path="/Courses" element={<Courses />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;