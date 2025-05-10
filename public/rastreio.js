
// Simulação do serviço de rastreio em JavaScript
export default async function handler(req, res) {
  const codigo = req.query.codigo;

  if (!codigo) {
    return res.status(400).json({ error: 'Código de rastreamento não informado.' });
  }

  try {
    const response = await fetch('https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Apikey oW-5Hg-c_7IBLiKkOVqFEntY-FTq9YEixDy-4mEFATU'
      },
      body: JSON.stringify({ code: codigo })
    });

    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }

    const apiResponse = await response.json();
    const dados = JSON.parse(apiResponse.json || '{}');

    const statusAtual = (dados.eventos && dados.eventos[0] && dados.eventos[0].descricaoFrontEnd) || 'Status não disponível';
    const dataAtualizacao = (dados.eventos && dados.eventos[0] && dados.eventos[0].dtHrCriado && dados.eventos[0].dtHrCriado.date) || 'Data não disponível';

    return res.json({
      status: statusAtual,
      data: dataAtualizacao
    });
  } catch (error) {
    console.error('Erro na API de rastreio:', error);
    return res.status(500).json({ error: 'Erro ao acessar a API da Wonca.' });
  }
}
