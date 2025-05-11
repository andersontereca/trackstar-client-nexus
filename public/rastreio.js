
// Browser-compatible tracking service for the Wonca API
const rastreioService = {
  async getTrackingStatus(codigo) {
    if (!codigo) {
      throw new Error('Código de rastreamento não informado.');
    }

    try {
      // Get the token from localStorage or use the default
      const token = localStorage.getItem("apiToken") || "oW-5Hg-c_7IBLiKkOVqFEntY-FTq9YEixDy-4mEFATU";
      
      // Make request via our PHP proxy
      const response = await fetch("rastreio.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          code: codigo,
          token: token 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      return this.parseTrackingResponse(apiResponse);
    } catch (error) {
      console.error('Erro na API de rastreio:', error);
      throw new Error('Erro ao acessar a API da Wonca.');
    }
  },
  
  parseTrackingResponse(apiResponse) {
    if (!apiResponse || !apiResponse.json) {
      throw new Error('Resposta inválida da API');
    }
    
    const dados = JSON.parse(apiResponse.json || '{}');
    const statusAtual = (dados.eventos && dados.eventos[0] && dados.eventos[0].descricaoFrontEnd) || 'Status não disponível';
    const dataAtualizacao = (dados.eventos && dados.eventos[0] && dados.eventos[0].dtHrCriado && dados.eventos[0].dtHrCriado.date) || 'Data não disponível';
    
    return {
      status: statusAtual,
      data: dataAtualizacao
    };
  }
};

export default rastreioService;
