
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem("profileName") || "Admin",
    phone: localStorage.getItem("profilePhone") || "(11) 98765-4321",
    quote: localStorage.getItem("profileQuote") || "Transforme cada desafio em uma oportunidade de crescimento.",
    avatar: localStorage.getItem("profileAvatar") || ""
  });

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card principal do perfil */}
          <Card className="col-span-1 lg:col-span-2 bg-black/60 border border-white/10">
            <CardHeader className="flex flex-col items-center space-y-4 pb-6">
              <Avatar className="h-32 w-32">
                {profileData.avatar ? (
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                ) : (
                  <AvatarFallback className="text-4xl bg-primary/20 text-primary">
                    {profileData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">{profileData.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1 text-gray-400">
                  <Phone size={16} />
                  <span>{profileData.phone}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-t border-white/10 pt-6 text-center">
                <blockquote className="italic text-lg text-gray-300">
                  "{profileData.quote}"
                </blockquote>
              </div>
            </CardContent>
          </Card>
          
          {/* Card informativo */}
          <Card className="bg-black/60 border border-white/10">
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Email</p>
                <p className="font-medium">admin@trackmaster.com</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Função</p>
                <p className="font-medium">Administrador</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Membro desde</p>
                <p className="font-medium">Janeiro 2024</p>
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={() => navigate('/settings')} 
                  className="w-full bg-primary/20 hover:bg-primary/30 text-primary py-2 rounded-md transition-colors"
                >
                  Editar Perfil
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
