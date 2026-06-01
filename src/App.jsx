import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import MainPage from "./pages/MainPage/MainPage";
import TeachersPage from "./pages/Teachers/Teachers";
import MainLayout from "./components/layout/MainLayout";
import Students from "./pages/Students/Students";
import Subjects from "./pages/Subjects/Subjects";
import Courses from "./pages/Courses/Courses";
import StudentMain from "./pages/StudentMain/StudentMain";
import TeachersMain from "./pages/TeachersMain/TeachersMain";

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