
// Browser-compatible tracking service for the Wonca API
const rastreioService = {
  async getTrackingStatus(codigo) {
    if (!codigo) {
      throw new Error('Código de rastreamento não informado.');
    }

    try {
      // Get the token from localStorage or use the default
      const token = localStorage.getItem("apiToken") || "oW-5Hg-c_7IBLiKkOVqFEntY-FTq9YEixDy-4mEFATU";
      
      console.log(`Buscando status para código: ${codigo}`);
      
      // Make request via our PHP proxy
      const response = await fetch(`rastreio.php?codigo=${encodeURIComponent(codigo)}&token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Parse the response
      const responseData = await response.json();
      
      // Check for error
      if (responseData.error) {
        console.error('Erro retornado pelo proxy:', responseData.error);
        throw new Error(responseData.error);
      }
      
      return this.parseTrackingResponse(responseData);
    } catch (error) {
      console.error('Erro na API de rastreio:', error);
      throw new Error('Erro ao acessar a API da Wonca.');
    }
  },
  
  parseTrackingResponse(apiResponse) {
    if (!apiResponse || !apiResponse.json) {
      throw new Error('Resposta inválida da API');
    }
    
    try {
      const dados = JSON.parse(apiResponse.json || '{}');
      const statusAtual = (dados.eventos && dados.eventos[0] && dados.eventos[0].descricaoFrontEnd) || 'Status não disponível';
      const dataAtualizacao = (dados.eventos && dados.eventos[0] && dados.eventos[0].dtHrCriado && dados.eventos[0].dtHrCriado.date) || 'Data não disponível';
      
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
