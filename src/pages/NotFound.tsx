import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-hero mb-md">404</h1>
        <p className="text-xl text-secondary mb-lg">Страница не найдена</p>
        <a href="/" className="btn btn-primary">
          Вернуться на главную
        </a>
      </div>
    </div>
  );
};

export default NotFound;
