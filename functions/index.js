const functions = require("firebase-functions");
// Importa as classes necessárias da biblioteca moderna do Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Inicializa o cliente do Mercado Pago com o Access Token de forma segura
const client = new MercadoPagoConfig({ 
    accessToken: functions.config().mercadopago.accesstoken 
});

/**
 * Esta função é chamada pelo seu site para criar uma preferência de pagamento.
 * Ela gera um link de checkout seguro do Mercado Pago.
 */
exports.createPaymentPreference = functions.https.onCall(async (data, context) => {
  // Verifica se o usuário que está fazendo o pedido está logado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Você precisa estar logado para fazer um pagamento."
    );
  }

  // Cria uma instância da classe Preference, passando o cliente
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
                unit_price: 15.00, // <<<<<<<<<<<<<<< ALTERE AQUI O VALOR SIMBÓLICO
              },
            ],
            // URLs para onde o usuário será redirecionado após o pagamento
            back_urls: {
              success: "https://album-thehunter.web.app", // URL do seu site
              failure: "https://album-thehunter.web.app",
              pending: "https://album-thehunter.web.app",
            },
            auto_return: "approved",
            // Guarda o ID do usuário do Firebase para sabermos quem pagou
            external_reference: context.auth.uid, 
        }
    });

    console.log("Preferência de pagamento criada:", result.id);
    // Retorna o ID da preferência para o seu site
    return { preferenceId: result.id };

  } catch (error) {
    console.error("Erro ao criar preferência de pagamento:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Não foi possível criar a preferência de pagamento."
    );
  }
});
