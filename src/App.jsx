import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import TeachersPage from "./pages/Teachers";
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        {/* 🔥 TODAS LAS PÁGINAS CON SIDEBAR */}
        <Route element={<MainLayout />}>
          <Route path="/MainPage" element={<MainPage />} />
          <Route path="/Teachers" element={<TeachersPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;