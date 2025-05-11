
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, KeyRound, Shield } from "lucide-react";

// Esquema de validação para o formulário de perfil
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  phone: z.string().min(8, {
    message: "Telefone deve ser válido.",
  }),
  quote: z.string().min(3, {
    message: "Frase deve ter pelo menos 3 caracteres.",
  }),
  avatar: z.string().optional(),
});

// Esquema de validação para o formulário de token API
const apiTokenSchema = z.object({
  token: z.string().min(10, {
    message: "Token API deve ter pelo menos 10 caracteres.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type ApiTokenFormValues = z.infer<typeof apiTokenSchema>;

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Formulário de perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: localStorage.getItem("profileName") || "Admin",
      phone: localStorage.getItem("profilePhone") || "(11) 98765-4321",
      quote: localStorage.getItem("profileQuote") || "Transforme cada desafio em uma oportunidade de crescimento.",
      avatar: localStorage.getItem("profileAvatar") || "",
    },
  });

  // Formulário de token API
  const tokenForm = useForm<ApiTokenFormValues>({
    resolver: zodResolver(apiTokenSchema),
    defaultValues: {
      token: localStorage.getItem("apiToken") || "oW-5Hg-c_7IBLiKkOVqFEntY-FTq9YEixDy-4mEFATU",
    },
  });

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  // Função para atualizar perfil
  const onProfileSubmit = (data: ProfileFormValues) => {
    localStorage.setItem("profileName", data.name);
    localStorage.setItem("profilePhone", data.phone);
    localStorage.setItem("profileQuote", data.quote);
    localStorage.setItem("profileAvatar", data.avatar || "");

    toast.success("Perfil atualizado com sucesso!");
  };

  // Função para atualizar token API
  const onTokenSubmit = (data: ApiTokenFormValues) => {
    localStorage.setItem("apiToken", data.token);

    toast.success("Token API atualizado com sucesso!");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:w-[400px]">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="apitoken" className="flex items-center gap-2">
              <KeyRound size={16} />
              <span>Token API</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba de Perfil */}
          <TabsContent value="profile">
            <Card className="bg-black/60 border border-white/10">
              <CardHeader>
                <CardTitle>Editar Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="flex justify-center mb-6">
                      <Avatar className="h-24 w-24">
                        {profileForm.watch("avatar") ? (
                          <AvatarImage src={profileForm.watch("avatar")} alt="Avatar preview" />
                        ) : (
                          <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                            {profileForm.watch("name").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="quote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frase Inspiradora</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua frase inspiradora" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Imagem de Perfil</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://exemplo.com/imagem.jpg" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit">Salvar Alterações</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Token API */}
          <TabsContent value="apitoken">
            <Card className="bg-black/60 border border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Token da API de Rastreamento</CardTitle>
                  <CardDescription>
                    Configure o token da API Wonca para rastreamento de pedidos.
                  </CardDescription>
                </div>
                <Shield className="h-6 w-6 text-orange-400" />
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...tokenForm}>
                  <form onSubmit={tokenForm.handleSubmit(onTokenSubmit)} className="space-y-6">
                    <FormField
                      control={tokenForm.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token API</FormLabel>
                          <FormControl>
                            <Input placeholder="Insira o token da API Wonca" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="text-sm text-muted-foreground">
                      <p>O token será usado para autenticar as requisições à API de rastreamento Wonca.</p>
                      <p className="mt-1">Para obter um token, acesse o portal de desenvolvedores Wonca.</p>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">Atualizar Token</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
