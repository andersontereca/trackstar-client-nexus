
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge"; 
import { 
  Menu, X, Home, Package, Users, Settings, LogOut, Activity,
  BarChart, HelpCircle, Bell, Search, ChevronDown, User, RefreshCw
} from "lucide-react";

interface TrackingStats {
  success: number;
  errors: number;
  errorDetails: string[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  trackingStats?: TrackingStats;
  onResetTrackingStats?: () => void;
}

const DashboardLayout = ({ 
  children, 
  trackingStats = { success: 0, errors: 0, errorDetails: [] },
  onResetTrackingStats 
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Sessão encerrada",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Função para verificar se o link está ativo
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Total de notificações
  const notificationCount = Math.min(trackingStats.errors, 99);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar para mobile (overlay) */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative z-50 w-64 h-full bg-black border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo e botão de fechar */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                TrackMaster
              </span>
            </Link>
            <button 
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Links de navegação */}
          <nav className="flex-grow py-4 overflow-y-auto">
            <div className="px-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1 px-2">
              {[
                { icon: <Home size={18} />, text: "Dashboard", path: "/dashboard" },
                { icon: <Package size={18} />, text: "Pedidos", path: "/dashboard" },
                { icon: <Users size={18} />, text: "Clientes", path: "/dashboard" },
                { icon: <Activity size={18} />, text: "Rastreamento", path: "/dashboard" },
                { icon: <BarChart size={18} />, text: "Relatórios", path: "/dashboard" },
                { icon: <User size={18} />, text: "Meu Perfil", path: "/profile" },
                { icon: <Settings size={18} />, text: "Configurações", path: "/settings" },
                { icon: <HelpCircle size={18} />, text: "Ajuda", path: "/dashboard" }
              ].map((item, index) => (
                <Link 
                  key={index}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path) 
                      ? "bg-primary text-white" 
                      : "text-gray-400 hover:bg-secondary hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Seção de usuário */}
          <div className="p-4 border-t border-white/10">
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-400 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra de navegação superior */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-black">
          <div className="flex items-center">
            <button 
              className="lg:hidden text-gray-400 hover:text-white mr-4"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold">Gerenciador de Clientes</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notificações */}
            <div className="relative">
              <button 
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-secondary relative"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <Bell size={20} />
                {trackingStats.errors > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {notificationCount}
                  </span>
                )}
              </button>
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-secondary border border-white/10 rounded-lg shadow-lg z-50 py-2">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                    <h3 className="font-medium">Notificações de Rastreio</h3>
                    {(trackingStats.success > 0 || trackingStats.errors > 0) && onResetTrackingStats && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onResetTrackingStats();
                          setNotificationOpen(false);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <RefreshCw size={12} />
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {trackingStats.success > 0 && (
                      <div className="px-4 py-3 hover:bg-black/20 border-b border-white/5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Rastreamentos bem-sucedidos</p>
                          <Badge variant="success" className="text-xs">{trackingStats.success}</Badge>
                        </div>
                      </div>
                    )}
                    
                    {trackingStats.errors > 0 && (
                      <div className="px-4 py-3 hover:bg-black/20 border-b border-white/5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Erros de rastreamento</p>
                          <Badge variant="destructive" className="text-xs">{trackingStats.errors}</Badge>
                        </div>
                      </div>
                    )}

                    {trackingStats.errorDetails.length > 0 && (
                      <div className="mt-2">
                        <p className="px-4 py-2 text-xs font-medium text-gray-400">Detalhes dos erros recentes:</p>
                        {trackingStats.errorDetails.map((error, index) => (
                          <div key={index} className="px-4 py-2 text-xs border-b border-white/5 hover:bg-black/20">
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {trackingStats.success === 0 && trackingStats.errors === 0 && (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-400">Nenhuma notificação disponível</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu do usuário */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 p-1 hover:bg-secondary rounded-lg"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-bold text-primary">
                    {localStorage.getItem("profileName")?.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {localStorage.getItem("profileName") || "Admin"}
                </span>
                <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-secondary border border-white/10 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-black/20">
                      Meu Perfil
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-black/20">
                      Configurações
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-black/20 text-red-400"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background/95 to-background/90">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
