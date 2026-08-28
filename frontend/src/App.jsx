import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { ExplorePage } from "./pages/ExplorePage";
import { RecipeLabPage } from "./pages/RecipeLabPage";
import { SwapPage } from "./pages/SwapPage";
import { SteerPage } from "./pages/SteerPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="recipe-lab" element={<RecipeLabPage />} />
        <Route path="swap" element={<SwapPage />} />
        <Route path="steer" element={<SteerPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
