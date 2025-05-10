
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-black to-background">
      {/* NavBar */}
      <header className="w-full backdrop-blur-md bg-black/30 border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              TrackMaster
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
              Recursos
            </a>
            <a href="#benefits" className="text-sm text-gray-300 hover:text-white transition-colors">
              Benefícios
            </a>
            <a href="#testimonials" className="text-sm text-gray-300 hover:text-white transition-colors">
              Depoimentos
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="hidden md:flex" 
              onClick={() => navigate('/login')}
            >
              Entrar
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary to-indigo-500 hover:opacity-90 transition-opacity"
              onClick={() => navigate('/login')}
            >
              Experimente Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary mb-4 animate-slide-in-bottom opacity-0" style={{ animationDelay: '0.1s' }}>
              Sistema de Gerenciamento de Clientes
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-in-bottom opacity-0" style={{ animationDelay: '0.3s' }}>
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Gerencie seus clientes e rastreie pedidos em um único lugar
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 animate-slide-in-bottom opacity-0" style={{ animationDelay: '0.5s' }}>
              Interface moderna e intuitiva para acompanhar todos os seus pedidos, 
              com atualizações em tempo real dos status de entrega.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center animate-slide-in-bottom opacity-0" style={{ animationDelay: '0.7s' }}>
              <Button 
                className="btn-primary text-lg bg-gradient-to-r from-primary to-indigo-500"
                onClick={() => navigate('/login')}
              >
                Comece Agora
              </Button>
              <Button 
                variant="outline" 
                className="btn-outline text-lg"
                onClick={() => navigate('/login')}
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/20 rounded-full filter blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent/10 rounded-full filter blur-3xl animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Recursos Poderosos
              </span>
            </h2>
            <p className="text-gray-400">
              Todas as ferramentas que você precisa para gerenciar seus clientes e rastrear entregas com eficiência
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Rastreamento Automatizado",
                description: "Atualizações automáticas do status de todos os pedidos em um único clique",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: "Organização por Status",
                description: "Categorização automática dos pedidos por status - Agendado, Aprovado, Atrasado, Cancelado",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )
              },
              {
                title: "Exportação Avançada",
                description: "Exporte seus dados para Excel com um clique, formatados e prontos para uso",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="dashboard-card flex flex-col items-center text-center animate-slide-in-bottom opacity-0"
                style={{ animationDelay: `${0.1 + index * 0.2}s` }}
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
                Por que escolher o TrackMaster?
              </span>
            </h2>
            <p className="text-gray-400">
              Nosso sistema oferece vantagens exclusivas para seu negócio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: "Economize Tempo",
                description: "Automatize atualizações de rastreamento e reduza o tempo gasto em trabalho manual em até 80%.",
              },
              {
                title: "Melhore a Comunicação",
                description: "Tenha informações precisas e atualizadas para compartilhar com seus clientes sobre o status de entregas.",
              },
              {
                title: "Interface Intuitiva",
                description: "Design moderno e fácil de usar que não precisa de treinamento especial.",
              },
              {
                title: "100% Seguro",
                description: "Seus dados são criptografados e armazenados com segurança em nossos servidores.",
              }
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="flex gap-4 items-start animate-slide-in-left opacity-0"
                style={{ animationDelay: `${0.1 + index * 0.2}s` }}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-accent/20 text-accent flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-bg-shift"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Registre-se hoje e receba acesso gratuito por 14 dias. 
              Sem compromissos, sem cartão de crédito.
            </p>
            <Button 
              className="btn-primary text-lg px-8 py-3 bg-gradient-to-r from-primary to-indigo-500"
              onClick={() => navigate('/login')}
            >
              Experimente Grátis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/60 border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                TrackMaster
              </div>
              <p className="text-gray-400 mt-2">Gerenciamento de clientes e rastreamento simplificado</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-medium mb-2 text-sm text-white/70">NAVEGAÇÃO</h3>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Recursos</a></li>
                  <li><a href="#benefits" className="text-gray-400 hover:text-white transition-colors">Benefícios</a></li>
                  <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Depoimentos</a></li>
                </ul>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-medium mb-2 text-sm text-white/70">CONTATO</h3>
                <ul className="space-y-2">
                  <li className="text-gray-400">suporte@trackmaster.com</li>
                  <li className="text-gray-400">+55 11 9 4276-0562</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} TrackMaster. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
