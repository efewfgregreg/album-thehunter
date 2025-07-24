const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { defineString } = require('firebase-functions/params');

// NOVO MÉTODO (2ª Geração): Define o parâmetro que vai ler o segredo.
// O nome "MERCADOPAGO_ACCESSTOKEN" deve ser o mesmo que você colocará no arquivo .env
const mercadopagoAccessToken = defineString("MERCADOPAGO_ACCESSTOKEN");

exports.createPaymentPreference = onCall(async (request) => {
  // A verificação de autenticação agora usa o objeto 'request'
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Você precisa estar logado para fazer um pagamento."
    );
  }

  // O cliente do Mercado Pago é inicializado aqui dentro
  // e usa .value() para pegar o valor do parâmetro definido acima.
  const client = new MercadoPagoConfig({ 
      accessToken: mercadopagoAccessToken.value() 
  });

  const preference = new Preference(client);

  try {
    const result = await preference.create({
        body: {
            items: [
              {
                id: "acesso-album-01", // um id único para o item
                title: "Acesso Vitalício - Álbum de Caça TheHunter",
                description: "Liberação de acesso a todas as funcionalidades do aplicativo.",
                quantity: 1,
                currency_id: "BRL", // Moeda: Real Brasileiro
                unit_price: 15.00,
              },
            ],
            // URLs para onde o usuário será redirecionado após o pagamento
            back_urls: {
              success: "https://album-thehunter.web.app", // URL do seu site
              failure: "https://album-thehunter.web.app",
              pending: "https://album-thehunter.web.app",
            },
            auto_return: "approved",
            // O ID do usuário agora fica em request.auth.uid
            external_reference: request.auth.uid, 
        }
    });

    console.log("Preferência de pagamento criada:", result.id);
    // Retorna o ID da preferência para o seu site
    return { preferenceId: result.id };

  } catch (error) {
    console.error("Erro ao criar preferência de pagamento:", error);
    throw new HttpsError(
      "internal",
      "Não foi possível criar a preferência de pagamento."
    );
  }
});