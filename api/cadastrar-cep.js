export default async function handler(req, res) {
  // Permite chamadas do Plasmic
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  const { cep, estado, cidade, bairro, logradouro } = req.body || {};

  if (!cep || !estado || !cidade || !bairro || !logradouro)
    return res.status(400).json({ error: "Dados incompletos" });

  const cmsId = process.env.PLASMIC_CMS_ID;
  const cmsToken = process.env.PLASMIC_CMS_TOKEN;

  try {
    const response = await fetch(
      `https://data.plasmic.app/api/v1/cms/databases/${cmsId}/tables/infoCeps/rows`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-plasmic-api-cms-tokens": `${cmsId}:${cmsToken}`,
        },
        body: JSON.stringify({
          rows: [
            {
              data: {
                cep,
                estado,
                cidade,
                bairro,
                logradouro,
              },
            },
          ],
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Falha ao cadastrar no CMS",
        details: result,
      });
    }

    return res.status(201).json({
      success: true,
      message: "CEP cadastrado!",
      record: result,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno",
    });
  }
}
