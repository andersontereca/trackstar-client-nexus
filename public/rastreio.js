
// Browser-compatible tracking service
const rastreioService = {
  async getTrackingStatus(codigo) {
    if (!codigo) {
      throw new Error('Código de rastreamento não informado.');
    }

    try {
      // Get the token from localStorage or use the default
      const token = localStorage.getItem("apiToken") || "oW-5Hg-c_7IBLiKkOVqFEntY-FTq9YEixDy-4mEFATU";
      
      console.log(`Buscando status para código: ${codigo}`);
      
      // Chamada real para o serviço PHP de rastreio
      const response = await fetch(`/rastreio.php?codigo=${encodeURIComponent(codigo)}&token=${encodeURIComponent(token)}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta da API de rastreio:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Parse the tracking data
      return this.parseTrackingResponse(data);
    } catch (error) {
      console.error('Erro na API de rastreio:', error);
      throw new Error('Erro ao acessar o serviço de rastreio.');
    }
  },
  
  // Função para analisar a resposta da API de rastreio
  parseTrackingResponse(apiResponse) {
    if (!apiResponse || !apiResponse.json) {
      throw new Error('Resposta inválida da API');
    }
    
    try {
      const dados = JSON.parse(apiResponse.json || '{}');
      const statusAtual = (dados.eventos && dados.eventos[0] && dados.eventos[0].descricao) || 'Status não disponível';
      const dataAtualizacao = (dados.eventos && dados.eventos[0] && dados.eventos[0].dtHrCriado) || 'Data não disponível';
      
      console.log('Dados de rastreio processados com sucesso:', { status: statusAtual, data: dataAtualizacao });
      
      return {
        status: statusAtual,
        data: dataAtualizacao
      };
    } catch (parseError) {
      console.error('Erro ao processar resposta da API:', parseError, apiResponse);
      throw new Error('Erro ao processar resposta da API');
    }
  }
};

export default rastreioService;
