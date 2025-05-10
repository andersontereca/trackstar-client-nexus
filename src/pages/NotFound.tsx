
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Tentativa de acesso à rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-black to-background p-4">
      <div className="glass-card w-full max-w-md p-8 text-center animate-slide-in-bottom">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
          <span className="text-3xl">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Página Não Encontrada</h1>
        <p className="text-gray-400 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="btn-primary"
            onClick={() => navigate("/")}
          >
            Voltar ao Início
          </Button>
          <Button 
            variant="outline" 
            className="btn-outline"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </div>
      </div>
      
      {/* Efeitos decorativos */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/10 rounded-full filter blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent/10 rounded-full filter blur-3xl animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

export default NotFound;
