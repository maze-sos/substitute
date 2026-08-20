import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Home } from "./pages/Home";
import { RecipeDetail } from "./pages/RecipeDetail";
import { IngredientDetail } from "./pages/IngredientDetail";
import { Pantry } from "./pages/Pantry";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/ingredients/:id" element={<IngredientDetail />} />
            <Route path="/pantry" element={<Pantry />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
