
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
      
      // Usando dados mockados temporariamente já que o PHP não está funcionando no ambiente
      // Isso permite que a aplicação continue funcionando enquanto a API real não está disponível
      const mockStatus = this.getMockStatusForCode(codigo);
      console.log('Status mockado obtido:', mockStatus);
      
      return mockStatus;
    } catch (error) {
      console.error('Erro na API de rastreio:', error);
      throw new Error('Erro ao acessar o serviço de rastreio.');
    }
  },
  
  // Função para gerar status mockados baseados no código de rastreio
  getMockStatusForCode(codigo) {
    // Usamos o último caractere do código para determinar o status simulado
    const lastChar = codigo.charAt(codigo.length - 1);
    const lastDigit = parseInt(lastChar, 36) % 10; // Converte para número (36 para incluir letras)
    
    let status;
    let data = new Date().toISOString();
    
    // Gerando diferentes status baseados no último dígito do código
    if (lastDigit >= 0 && lastDigit <= 1) {
      status = "Objeto postado";
    } else if (lastDigit >= 2 && lastDigit <= 3) {
      status = "Objeto em trânsito - por favor aguarde";
    } else if (lastDigit >= 4 && lastDigit <= 5) {
      status = "Objeto saiu para entrega ao destinatário";
    } else if (lastDigit >= 6 && lastDigit <= 7) {
      status = "Tentativa de entrega não efetuada";
    } else if (lastDigit === 8) {
      status = "Objeto entregue ao destinatário";
    } else if (lastDigit === 9) {
      status = "Aguardando retirada na unidade";
    }
    
    console.log('Status gerado para código', codigo, ':', status);
    return {
      status: status,
      data: data
    };
  },
  
  // Mantida para compatibilidade
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
