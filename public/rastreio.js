
// Browser-compatible tracking service for the Wonca API
const rastreioService = {
  async getTrackingStatus(codigo) {
    if (!codigo) {
      throw new Error('Código de rastreamento não informado.');
    }

    try {
      // Get the token from localStorage or use the default
      const token = localStorage.getItem("apiToken") || "oW-5Hg-c_7IBLiKkOVqFEntY-FTq9YEixDy-4mEFATU";
      
      // Use a CORS proxy for browser compatibility
      const corsProxyUrl = "https://cors-anywhere.herokuapp.com/";
      const apiUrl = "https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track";
      
      const response = await fetch(`${corsProxyUrl}${apiUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${token}`,
          'Origin': window.location.origin
        },
        body: JSON.stringify({ code: codigo })
      });

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
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
    } catch (error) {
      console.error('Erro na API de rastreio:', error);
      throw new Error('Erro ao acessar a API da Wonca.');
    }
  }
};

export default rastreioService;
