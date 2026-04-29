/**
 * Modulo: Prazos de licenciamento por UF
 * Exibe apenas datas validadas em fonte oficial para o exercicio de 2026.
 * Quando a confirmacao oficial nao foi fechada no app, os prazos exatos sao ocultados.
 */

const PRAZOS_LICENCIAMENTO_UF = {
    SC: {
        nome: "Santa Catarina",
        status: "verificado",
        datas: [
            "31/03/2026",
            "30/04/2026",
            "31/05/2026",
            "30/06/2026",
            "31/07/2026",
            "31/08/2026",
            "30/09/2026",
            "31/10/2026",
            "30/11/2026",
            "31/12/2026"
        ],
        obs: "Calendario oficial da SEF/SC para 2026, com vencimento por final de placa.",
        fonteLabel: "SEF/SC - Prazos do IPVA e licenciamento",
        fonteUrl: "https://www.sef.sc.gov.br/servicos/servico/93"
    },
    SP: {
        nome: "Sao Paulo",
        status: "nao_verificado",
        obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026.",
        fonteLabel: "Detran-SP - Licenciamento digital",
        fonteUrl: "https://gestaoconteudo.detran.sp.gov.br/wps/portal/portaldetran/cidadao/veiculos/fichaservico/Licenciamento/licenciamento%20digital/b3fba327-cd93-44cd-b0ef-4794f9ce068f/%21ut/p/z1/tVjZdqM4EP2aedShtCI9gtdgJ7TjdhLz0kcI4WHGwVnc6Ul__YhMlvEG7tDmwUKm6tZV6aok8BLvxktK_VQs9LpYlXrp-vNEfKMcpirEAcB40oWA9YczfN7DY4W96xcD2LgCCC9JSAEGU_CSyp-9-svLCwlBPPgSSSkJfIFX_w-D3lUfAnlJ-7gXE5DiOH84cAXb8SHsQTASjlznAsMAvCtvHnrz8eg5PJvskNmJtgnGu4HjSidxPOjjuMN2_HeiJcck81CAKW4aTL2_I7gRX4ZD58_iaIhFn8jRO__DBhvxIfpKHbw_usLjgA4mYjv-rkGNfxw1-FcGSX16rpvUmtRr5dpL9ph8yDkmew029bZFclfQLwbRBDrDoSTjAe52IFCMnZ9FIwqKNiCMdkPsTnPTRM1dovxDQid97l0_FfaHNytXD7euCkwrxDtTZN4cp4C1EQxRawliVEqUMp6hHBRhVikjBPaG0BTBbxmhHv6KtYSPmsqOq4vFX_f3SeAlZlWu7T9r7-Zu9bDWy8yuH3T5B2y3S7soHpfa6FV1XyxX9rFCIQ_nnfOFI6fXf6KizFfezdvT7TFuLndZM0kiS7OUpRgBaItY7n40JTmihuSp0sww_KaBdx0CcyMLOPh9OhkTEOK3wB9iP8InZT_kJ2U_O21y4rbwUdNGcbx8XVCdVZp91OhOL4pSF2VhCkdqawzQPeu-FBky5mdugsnhMThxZZwQgdxyk4iB5khSxRFYHyvgqcEZ24HfqGG1KfoM_FYNJdASPmraqvYv_c9QH4ywX-0P4bQbEwKDmsxYCcLQXCCOrUZMSY4UpApJhpUwLM0xgYbES78lfNS0eX1Cm-VqXWnyvWQeOMBMa7gTI1nGuUHcvHDPLVKUujmQBAuqFGCFG-AJOy28aAkfNR3_9mvyKOzjJ83VkdX9d5vrn_bh_rsuMzd_v5KdA4eai5rkK6sgN7lBWBhAjKe8kqRFKcaUaJErsLQB3vdbwkdNR7L9yT8K-xMrZv309lf75MQCnzL3LKzJPRVuAFYJlDkc5EqMQSkhGFlp3KDBKkZEA_vopPAs5C3ho6a3pv3KOQq7lXJ-JTkHXsku6OHkpDRP3dHGRyZTDp6ZDKVgc8R8xXJlLAiZN8DXvcj8BvgraAkfNX4Q6Lx_m0iwd3c7m83K5-K_C_192bsc_gwv0KCTyh9f89truX5pX7sfzTOtzObRU9UkKV_cfjvvUb582rD56O4C_f9p1V38CyCAxco%21/dz/d5/L2dBISEvZ0FBIS9nQSEh/?1dmy=&pagedesign=portaldetran%2FPT-FichaServicosVisualizarImpressao&urile=wcm%3Apath%3A%2Fportaldetran%2Fdetran%2Fsa-veiculos%2FSA-ServicosOnline%2FSA-Licenciamento%2FLicenciamento%2Bdigital%2Fb3fba327-cd93-44cd-b0ef-4794f9ce068f"
    },
    PR: {
        nome: "Parana",
        status: "nao_verificado",
        obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026.",
        fonteLabel: "Detran-PR - Licenciamento de frotas",
        fonteUrl: "https://www.detran.pr.gov.br/servicos/Veiculo/Guias-para-pagamento-e-taxas/Emitir-guia-para-pagamento-de-licenciamento-de-frotas-4n3nddoZ"
    },
    RS: {
        nome: "Rio Grande do Sul",
        status: "verificado",
        datas: [
            "31/07/2026",
            "31/07/2026",
            "31/07/2026",
            "31/07/2026",
            "31/07/2026",
            "31/07/2026",
            "31/07/2026",
            "31/07/2026",
            "31/07/2026",
            "31/07/2026"
        ],
        obs: "Prazo unico do exercicio 2026, conforme Portaria DetranRS numero 555/2025.",
        fonteLabel: "DetranRS - Consultar calendario de IPVA e licenciamento",
        fonteUrl: "https://www.detran.rs.gov.br/veiculos/servicos/986"
    },
    RJ: {
        nome: "Rio de Janeiro",
        status: "verificado",
        datas: [
            "31/05/2026",
            "31/05/2026",
            "31/05/2026",
            "30/06/2026",
            "30/06/2026",
            "30/06/2026",
            "31/07/2026",
            "31/07/2026",
            "31/07/2026",
            "31/07/2026"
        ],
        obs: "Calendario oficial 2026 por grupos de final de placa: 0 a 3, 4 a 6 e 7 a 9.",
        fonteLabel: "Detran-RJ - Calendario anual de licenciamento 2026",
        fonteUrl: "https://www.detran.rj.gov.br/_documento.asp?cod=12223"
    },
    MG: {
        nome: "Minas Gerais",
        status: "verificado",
        datas: [
            "31/03/2026",
            "31/03/2026",
            "31/03/2026",
            "31/03/2026",
            "31/03/2026",
            "31/03/2026",
            "31/03/2026",
            "31/03/2026",
            "31/03/2026",
            "31/03/2026"
        ],
        obs: "Taxa de Renovacao do Licenciamento Anual do Veiculo (TRLAV) com vencimento em 31/03/2026, sem escalonamento por final de placa.",
        fonteLabel: "SEF/MG - Vencimento da terceira parcela do IPVA 2026",
        fonteUrl: "https://www.fazenda.mg.gov.br/noticias/2026/2026.04.06_IPVA_Parcela3/index.html"
    },
    ES: {
        nome: "Espirito Santo",
        status: "verificado",
        datas: [
            "09/09/2026",
            "09/09/2026",
            "10/09/2026",
            "10/09/2026",
            "11/09/2026",
            "11/09/2026",
            "14/09/2026",
            "14/09/2026",
            "15/09/2026",
            "15/09/2026"
        ],
        obs: "Calendario oficial 2026 do Detran-ES por pares de final de placa.",
        fonteLabel: "Detran-ES - Calendario de Licenciamento 2026 (PDF)",
        fonteUrl: "https://detran.es.gov.br/Media/detran/Calendarios%20de%20pagamento/2026/Calend%C3%A1rio%20de%20Licenciamento%202026.pdf"
    },
    BA: { nome: "Bahia", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    PE: { nome: "Pernambuco", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    CE: { nome: "Ceara", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    DF: { nome: "Distrito Federal", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    GO: { nome: "Goias", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    MT: { nome: "Mato Grosso", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    MS: { nome: "Mato Grosso do Sul", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    PA: { nome: "Para", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    AM: { nome: "Amazonas", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    AC: { nome: "Acre", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    AL: { nome: "Alagoas", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    AP: { nome: "Amapa", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    MA: { nome: "Maranhao", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    PB: { nome: "Paraiba", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    PI: { nome: "Piaui", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    RN: { nome: "Rio Grande do Norte", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    RO: { nome: "Rondonia", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    RR: { nome: "Roraima", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    SE: { nome: "Sergipe", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." },
    TO: { nome: "Tocantins", status: "nao_verificado", obs: "Calendario removido do app ate validacao oficial completa do exercicio 2026." }
};

const PRAZOS_ORDEM_FINAIS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const PRAZOS_PLACEHOLDER = "Consulte o calendario oficial da UF";
const UF_ORIGEM_SEQUENCIAS = [{"inicial":"AAA","final":"BEZ","estado":"Parana","sigla":"PR"},{"inicial":"BFA","final":"GKI","estado":"Sao Paulo","sigla":"SP"},{"inicial":"GKJ","final":"HOK","estado":"Minas Gerais","sigla":"MG"},{"inicial":"HOL","final":"HQE","estado":"Maranhao","sigla":"MA"},{"inicial":"HQF","final":"HTW","estado":"Mato Grosso do Sul","sigla":"MS"},{"inicial":"HTX","final":"HZA","estado":"Ceara","sigla":"CE"},{"inicial":"HZB","final":"IAP","estado":"Sergipe","sigla":"SE"},{"inicial":"IAQ","final":"JDO","estado":"Rio Grande do Sul","sigla":"RS"},{"inicial":"JDP","final":"JKR","estado":"Distrito Federal","sigla":"DF"},{"inicial":"JKS","final":"JSZ","estado":"Bahia","sigla":"BA"},{"inicial":"JTA","final":"JWE","estado":"Para","sigla":"PA"},{"inicial":"JWF","final":"JXY","estado":"Amazonas","sigla":"AM"},{"inicial":"JXZ","final":"KAU","estado":"Mato Grosso","sigla":"MT"},{"inicial":"KAV","final":"KFC","estado":"Goias","sigla":"GO"},{"inicial":"KFD","final":"KME","estado":"Pernambuco","sigla":"PE"},{"inicial":"KMF","final":"LVE","estado":"Rio de Janeiro","sigla":"RJ"},{"inicial":"LVF","final":"LWQ","estado":"Piaui","sigla":"PI"},{"inicial":"LWR","final":"MMM","estado":"Santa Catarina","sigla":"SC"},{"inicial":"MMN","final":"MOW","estado":"Paraiba","sigla":"PB"},{"inicial":"MOX","final":"MTZ","estado":"Espirito Santo","sigla":"ES"},{"inicial":"MUA","final":"MVK","estado":"Alagoas","sigla":"AL"},{"inicial":"MVL","final":"MXG","estado":"Tocantins","sigla":"TO"},{"inicial":"MXH","final":"MZM","estado":"Rio Grande do Norte","sigla":"RN"},{"inicial":"MZN","final":"NAG","estado":"Acre","sigla":"AC"},{"inicial":"NAH","final":"NBA","estado":"Roraima","sigla":"RR"},{"inicial":"NBB","final":"NEH","estado":"Rondonia","sigla":"RO"},{"inicial":"NEI","final":"NFB","estado":"Amapa","sigla":"AP"},{"inicial":"NFC","final":"NGZ","estado":"Goias","sigla":"GO"},{"inicial":"NHA","final":"NHT","estado":"Maranhao","sigla":"MA"},{"inicial":"NHU","final":"NIX","estado":"Piaui","sigla":"PI"},{"inicial":"NIY","final":"NJW","estado":"Mato Grosso","sigla":"MT"},{"inicial":"NJX","final":"NLU","estado":"Goias","sigla":"GO"},{"inicial":"NLV","final":"NMO","estado":"Alagoas","sigla":"AL"},{"inicial":"NMP","final":"NNI","estado":"Maranhao","sigla":"MA"},{"inicial":"NNJ","final":"NOH","estado":"Rio Grande do Norte","sigla":"RN"},{"inicial":"NOI","final":"NPB","estado":"Amazonas","sigla":"AM"},{"inicial":"NPC","final":"NPQ","estado":"Mato Grosso","sigla":"MT"},{"inicial":"NPR","final":"NQK","estado":"Paraiba","sigla":"PB"},{"inicial":"NQL","final":"NRE","estado":"Ceara","sigla":"CE"},{"inicial":"NRF","final":"NSD","estado":"Mato Grosso do Sul","sigla":"MS"},{"inicial":"NSE","final":"NTC","estado":"Para","sigla":"PA"},{"inicial":"NTD","final":"NTW","estado":"Bahia","sigla":"BA"},{"inicial":"NTX","final":"NUG","estado":"Mato Grosso","sigla":"MT"},{"inicial":"NUH","final":"NUL","estado":"Roraima","sigla":"RR"},{"inicial":"NUM","final":"NVF","estado":"Ceara","sigla":"CE"},{"inicial":"NVG","final":"NVN","estado":"Sergipe","sigla":"SE"},{"inicial":"NVO","final":"NWR","estado":"Goias","sigla":"GO"},{"inicial":"NWS","final":"NXQ","estado":"Maranhao","sigla":"MA"},{"inicial":"NXR","final":"NXT","estado":"Acre","sigla":"AC"},{"inicial":"NXU","final":"NXW","estado":"Pernambuco","sigla":"PE"},{"inicial":"NXX","final":"NYG","estado":"Minas Gerais","sigla":"MG"},{"inicial":"NYH","final":"NZZ","estado":"Bahia","sigla":"BA"},{"inicial":"OAA","final":"OAO","estado":"Amazonas","sigla":"AM"},{"inicial":"OAP","final":"OBS","estado":"Mato Grosso","sigla":"MT"},{"inicial":"OBT","final":"OCA","estado":"Para","sigla":"PA"},{"inicial":"OCB","final":"OCU","estado":"Ceara","sigla":"CE"},{"inicial":"OCV","final":"ODT","estado":"Espirito Santo","sigla":"ES"},{"inicial":"ODU","final":"OEI","estado":"Piaui","sigla":"PI"},{"inicial":"OEJ","final":"OES","estado":"Sergipe","sigla":"SE"},{"inicial":"OET","final":"OFH","estado":"Paraiba","sigla":"PB"},{"inicial":"OFI","final":"OFW","estado":"Para","sigla":"PA"},{"inicial":"OFX","final":"OGG","estado":"Paraiba","sigla":"PB"},{"inicial":"OGH","final":"OHA","estado":"Goias","sigla":"GO"},{"inicial":"OHB","final":"OHK","estado":"Alagoas","sigla":"AL"},{"inicial":"OHL","final":"OHW","estado":"Rondonia","sigla":"RO"},{"inicial":"OHX","final":"OIQ","estado":"Ceara","sigla":"CE"},{"inicial":"OIR","final":"OJQ","estado":"Maranhao","sigla":"MA"},{"inicial":"OJR","final":"OKC","estado":"Rio Grande do Norte","sigla":"RN"},{"inicial":"OKD","final":"OKH","estado":"Santa Catarina","sigla":"SC"},{"inicial":"OKI","final":"OLG","estado":"Bahia","sigla":"BA"},{"inicial":"OLH","final":"OLN","estado":"Tocantins","sigla":"TO"},{"inicial":"OLO","final":"OMH","estado":"Minas Gerais","sigla":"MG"},{"inicial":"OMI","final":"OOF","estado":"Goias","sigla":"GO"},{"inicial":"OOG","final":"OOU","estado":"Mato Grosso do Sul","sigla":"MS"},{"inicial":"OOV","final":"ORC","estado":"Minas Gerais","sigla":"MG"},{"inicial":"ORD","final":"ORM","estado":"Alagoas","sigla":"AL"},{"inicial":"ORN","final":"OSV","estado":"Ceara","sigla":"CE"},{"inicial":"OSW","final":"OTZ","estado":"Para","sigla":"PA"},{"inicial":"OUA","final":"OUE","estado":"Piaui","sigla":"PI"},{"inicial":"OUF","final":"OVD","estado":"Bahia","sigla":"BA"},{"inicial":"OVE","final":"OVF","estado":"Espirito Santo","sigla":"ES"},{"inicial":"OVH","final":"OVL","estado":"Espirito Santo","sigla":"ES"},{"inicial":"OVM","final":"OVV","estado":"Distrito Federal","sigla":"DF"},{"inicial":"OVW","final":"OVY","estado":"Piaui","sigla":"PI"},{"inicial":"OVZ","final":"OWG","estado":"Rio Grande do Norte","sigla":"RN"},{"inicial":"OWH","final":"OXK","estado":"Minas Gerais","sigla":"MG"},{"inicial":"OXQ","final":"OXZ","estado":"Maranhao","sigla":"MA"},{"inicial":"OYA","final":"OYC","estado":"Tocantins","sigla":"TO"},{"inicial":"OYD","final":"OYK","estado":"Espirito Santo","sigla":"ES"},{"inicial":"OYL","final":"OYZ","estado":"Pernambuco","sigla":"PE"},{"inicial":"OZC","final":"OZV","estado":"Bahia","sigla":"BA"},{"inicial":"OZW","final":"PBZ","estado":"Distrito Federal","sigla":"DF"},{"inicial":"PCA","final":"PED","estado":"Pernambuco","sigla":"PE"},{"inicial":"PEE","final":"PFQ","estado":"Pernambuco","sigla":"PE"},{"inicial":"PFR","final":"PGK","estado":"Pernambuco","sigla":"PE"},{"inicial":"PGL","final":"PGU","estado":"Pernambuco","sigla":"PE"},{"inicial":"PGV","final":"PGZ","estado":"Pernambuco","sigla":"PE"},{"inicial":"PHA","final":"PHZ","estado":"Amazonas","sigla":"AM"},{"inicial":"PIA","final":"PIZ","estado":"Piaui","sigla":"PI"},{"inicial":"PJA","final":"PLZ","estado":"Bahia","sigla":"BA"},{"inicial":"PMA","final":"POZ","estado":"Ceara","sigla":"CE"},{"inicial":"PPA","final":"PPZ","estado":"Espirito Santo","sigla":"ES"},{"inicial":"PQA","final":"PRZ","estado":"Goias","sigla":"GO"},{"inicial":"PSA","final":"PTZ","estado":"Maranhao","sigla":"MA"},{"inicial":"PUA","final":"PZZ","estado":"Minas Gerais","sigla":"MG"},{"inicial":"QAA","final":"QAZ","estado":"Mato Grosso do Sul","sigla":"MS"},{"inicial":"QBA","final":"QCZ","estado":"Mato Grosso","sigla":"MT"},{"inicial":"QDA","final":"QEZ","estado":"Para","sigla":"PA"},{"inicial":"QFA","final":"QFZ","estado":"Paraiba","sigla":"PB"},{"inicial":"QGA","final":"QGZ","estado":"Rio Grande do Norte","sigla":"RN"},{"inicial":"QHA","final":"QJZ","estado":"Santa Catarina","sigla":"SC"},{"inicial":"QKA","final":"QKM","estado":"Tocantins","sigla":"TO"},{"inicial":"QKN","final":"QKZ","estado":"Sergipe","sigla":"SE"},{"inicial":"QLA","final":"QLM","estado":"Alagoas","sigla":"AL"},{"inicial":"QLN","final":"QLT","estado":"Amapa","sigla":"AP"},{"inicial":"QLU","final":"QLZ","estado":"Acre","sigla":"AC"},{"inicial":"QMA","final":"QMP","estado":"Sergipe","sigla":"SE"},{"inicial":"QMQ","final":"QQZ","estado":"Minas Gerais","sigla":"MG"},{"inicial":"QRB","final":"QRM","estado":"Espirito Santo","sigla":"ES"},{"inicial":"QRN","final":"QRZ","estado":"Piaui","sigla":"PI"},{"inicial":"QSA","final":"QSM","estado":"Paraiba","sigla":"PB"},{"inicial":"QSN","final":"QSZ","estado":"Sao Paulo","sigla":"SP"},{"inicial":"QTA","final":"QTJ","estado":"Rondonia","sigla":"RO"},{"inicial":"QTK","final":"QTM","estado":"Santa Catarina","sigla":"SC"},{"inicial":"QTN","final":"QTS","estado":"Goias","sigla":"GO"},{"inicial":"QTU","final":"QTZ","estado":"Bahia","sigla":"BA"},{"inicial":"QUA","final":"QUZ","estado":"Minas Gerais","sigla":"MG"},{"inicial":"QVA","final":"QVZ","estado":"Para","sigla":"PA"},{"inicial":"QWA","final":"QWF","estado":"Tocantins","sigla":"TO"},{"inicial":"QWG","final":"QWL","estado":"Alagoas","sigla":"AL"},{"inicial":"QWM","final":"QWQ","estado":"Acre","sigla":"AC"},{"inicial":"QWR","final":"QXZ","estado":"Minas Gerais","sigla":"MG"},{"inicial":"QYA","final":"QYZ","estado":"Pernambuco","sigla":"PE"},{"inicial":"QZA","final":"QZZ","estado":"Amazonas","sigla":"AM"},{"inicial":"RAA","final":"RAJ","estado":"Santa Catarina","sigla":"SC"},{"inicial":"RAK","final":"RAZ","estado":"Mato Grosso","sigla":"MT"},{"inicial":"RBA","final":"RBJ","estado":"Espirito Santo","sigla":"ES"},{"inicial":"RBK","final":"RCN","estado":"Goias","sigla":"GO"},{"inicial":"RCO","final":"RDR","estado":"Bahia","sigla":"BA"},{"inicial":"RDS","final":"REB","estado":"Santa Catarina","sigla":"SC"},{"inicial":"REC","final":"REV","estado":"Distrito Federal","sigla":"DF"},{"inicial":"REW","final":"REZ","estado":"Mato Grosso do Sul","sigla":"MS"},{"inicial":"RFA","final":"RGD","estado":"Minas Gerais","sigla":"MG"},{"inicial":"RGE","final":"RGM","estado":"Rio Grande do Norte","sigla":"RN"},{"inicial":"RGO","final":"RGU","estado":"Alagoas","sigla":"AL"},{"inicial":"RGV","final":"RGZ","estado":"Alagoas","sigla":"AL"},{"inicial":"RHA","final":"RHZ","estado":"Parana","sigla":"PR"},{"inicial":"RIA","final":"RIL","estado":"Ceara","sigla":"CE"},{"inicial":"RIM","final":"RIN","estado":"Tocantins","sigla":"TO"},{"inicial":"RIP","final":"RKV","estado":"Rio de Janeiro","sigla":"RJ"},{"inicial":"RKW","final":"RLP","estado":"Santa Catarina","sigla":"SC"},{"inicial":"RLQ","final":"RLZ","estado":"Paraiba","sigla":"PB"},{"inicial":"RMA","final":"RMC","estado":"Tocantins","sigla":"TO"},{"inicial":"RMD","final":"RNZ","estado":"Minas Gerais","sigla":"MG"},{"inicial":"ROA","final":"ROZ","estado":"Maranhao","sigla":"MA"},{"inicial":"RPA","final":"RPZ","estado":"Bahia","sigla":"BA"},{"inicial":"RQA","final":"RQL","estado":"Rio Grande do Norte","sigla":"RN"},{"inicial":"RQM","final":"RQV","estado":"Espirito Santo","sigla":"ES"},{"inicial":"RQW","final":"RRH","estado":"Sergipe","sigla":"SE"},{"inicial":"RRI","final":"RRZ","estado":"Mato Grosso","sigla":"MT"},{"inicial":"RSA","final":"RSF","estado":"Tocantins","sigla":"TO"},{"inicial":"RSG","final":"RST","estado":"Piaui","sigla":"PI"},{"inicial":"RSU","final":"RSZ","estado":"Rondonia","sigla":"RO"},{"inicial":"RTA","final":"RVZ","estado":"Minas Gerais","sigla":"MG"},{"inicial":"RWA","final":"RWJ","estado":"Mato Grosso do Sul","sigla":"MS"},{"inicial":"RWK","final":"RXJ","estado":"Para","sigla":"PA"},{"inicial":"RXK","final":"RYZ","estado":"Santa Catarina","sigla":"SC"},{"inicial":"RZA","final":"RZD","estado":"Roraima","sigla":"RR"},{"inicial":"RZE","final":"RZZ","estado":"Pernambuco","sigla":"PE"},{"inicial":"SAA","final":"SAJ","estado":"Alagoas","sigla":"AL"},{"inicial":"SAK","final":"SAM","estado":"Amapa","sigla":"AP"},{"inicial":"SAN","final":"SBV","estado":"Ceara","sigla":"CE"},{"inicial":"SBW","final":"SDO","estado":"Goias","sigla":"GO"},{"inicial":"SDP","final":"SFO","estado":"Parana","sigla":"PR"},{"inicial":"SFP","final":"SGM","estado":"Espirito Santo","sigla":"ES"},{"inicial":"SGN","final":"SGZ","estado":"Distrito Federal","sigla":"DF"},{"inicial":"SHB","final":"SJI","estado":"Minas Gerais","sigla":"MG"},{"inicial":"SJJ","final":"SKT","estado":"Bahia","sigla":"BA"},{"inicial":"SKU","final":"SLF","estado":"Paraiba","sigla":"PB"},{"inicial":"SLG","final":"SLL","estado":"Rondonia","sigla":"RO"},{"inicial":"SLM","final":"SLV","estado":"Piaui","sigla":"PI"},{"inicial":"SLW","final":"SML","estado":"Mato Grosso do Sul","sigla":"MS"},{"inicial":"SMM","final":"SNJ","estado":"Maranhao","sigla":"MA"},{"inicial":"SNK","final":"SPB","estado":"Pernambuco","sigla":"PE"},{"inicial":"SPC","final":"SQP","estado":"Mato Grosso","sigla":"MT"},{"inicial":"SQQ","final":"SQU","estado":"Acre","sigla":"AC"},{"inicial":"SQV","final":"SSE","estado":"Rio de Janeiro","sigla":"RJ"},{"inicial":"SSF","final":"SSQ","estado":"Distrito Federal","sigla":"DF"},{"inicial":"SSR","final":"SWZ","estado":"Sao Paulo","sigla":"SP"},{"inicial":"SXA","final":"SXZ","estado":"Santa Catarina","sigla":"SC"},{"inicial":"SYA","final":"SYZ","estado":"Minas Gerais","sigla":"MG"},{"inicial":"SZA","final":"SZZ","estado":"Para","sigla":"PA"},{"inicial":"TAA","final":"TAH","estado":"Amazonas","sigla":"AM"},{"inicial":"TAI","final":"TBZ","estado":"Parana","sigla":"PR"},{"inicial":"TCA","final":"TEZ","estado":"Minas Gerais","sigla":"MG"},{"inicial":"TFA","final":"TGN","estado":"Goias","sigla":"GO"},{"inicial":"TGO","final":"TGQ","estado":"Amapa","sigla":"AP"},{"inicial":"TGR","final":"THH","estado":"Bahia","sigla":"BA"},{"inicial":"THI","final":"THM","estado":"Rondonia","sigla":"RO"},{"inicial":"THN","final":"TIN","estado":"Ceara","sigla":"CE"},{"inicial":"TIO","final":"TMJ","estado":"Sao Paulo","sigla":"SP"},{"inicial":"TMK","final":"TNG","estado":"Bahia","sigla":"BA"},{"inicial":"TNH","final":"TNT","estado":"Alagoas","sigla":"AL"},{"inicial":"TNU","final":"TOD","estado":"Sergipe","sigla":"SE"},{"inicial":"TOE","final":"TOS","estado":"Espirito Santo","sigla":"ES"},{"inicial":"TOT","final":"TPH","estado":"Paraiba","sigla":"PB"},{"inicial":"TPI","final":"TQE","estado":"Santa Catarina","sigla":"SC"},{"inicial":"TQO","final":"TRW","estado":"Rio Grande do Sul","sigla":"RS"},{"inicial":"TRX","final":"TSO","estado":"Amazonas","sigla":"AM"},{"inicial":"TSP","final":"TSZ","estado":"Rio Grande do Norte","sigla":"RN"},{"inicial":"TTA","final":"TUX","estado":"Rio de Janeiro","sigla":"RJ"},{"inicial":"TUY","final":"TUZ","estado":"Distrito Federal","sigla":"DF"},{"inicial":"TVA","final":"TVD","estado":"Tocantins","sigla":"TO"},{"inicial":"TVL","final":"TWX","estado":"Para","sigla":"PA"},{"inicial":"TWY","final":"UAH","estado":"Minas Gerais","sigla":"MG"},{"inicial":"UAJ","final":"UAR","estado":"Rondonia","sigla":"RO"},{"inicial":"UAS","final":"UCZ","estado":"Parana","sigla":"PR"},{"inicial":"UDA","final":"UGV","estado":"Sao Paulo","sigla":"SP"},{"inicial":"UGW","final":"UHI","estado":"Mato Grosso do Sul","sigla":"MS"},{"inicial":"UHJ","final":"UII","estado":"Pernambuco","sigla":"PE"},{"inicial":"UIV","final":"UJL","estado":"Distrito Federal","sigla":"DF"},{"inicial":"UJM","final":"UKE","estado":"Maranhao","sigla":"MA"},{"inicial":"UKF","final":"UKN","estado":"Piaui","sigla":"PI"},{"inicial":"UKO","final":"UKQ","estado":"Amapa","sigla":"AP"},{"inicial":"OVG","final":"OVG","estado":"Acre","sigla":"AC"},{"inicial":"OXL","final":"OXL","estado":"Rondonia","sigla":"RO"},{"inicial":"OXM","final":"OXM","estado":"Amazonas","sigla":"AM"},{"inicial":"OXN","final":"OXN","estado":"Alagoas","sigla":"AL"},{"inicial":"OXO","final":"OXO","estado":"Paraiba","sigla":"PB"},{"inicial":"OXP","final":"OXP","estado":"Acre","sigla":"AC"},{"inicial":"OZA","final":"OZA","estado":"Ceara","sigla":"CE"},{"inicial":"OZB","final":"OZB","estado":"Sergipe","sigla":"SE"},{"inicial":"QRA","final":"QRA","estado":"Rondonia","sigla":"RO"},{"inicial":"QTT","final":"QTT","estado":"Alagoas","sigla":"AL"},{"inicial":"RGN","final":"RGN","estado":"Rio Grande do Norte","sigla":"RN"},{"inicial":"RIO","final":"RIO","estado":"Rio de Janeiro","sigla":"RJ"},{"inicial":"SHA","final":"SHA","estado":"Acre","sigla":"AC"},{"inicial":"TVK","final":"TVK","estado":"Distrito Federal","sigla":"DF"},{"inicial":"UAI","final":"UAI","estado":"Minas Gerais","sigla":"MG"}];

let prazosAbaAtual = "licenciamento";
const ufOrigemHistorico = [];

function prazos_init() {
    prazos_switchTab(prazosAbaAtual);
    prazos_carregarCalendario();
    ufOrigem_atualizarAcao();
}

function prazos_switchTab(tab) {
    prazosAbaAtual = tab === "origem" ? "origem" : "licenciamento";

    document.getElementById("prazos-content-licenciamento")?.classList.toggle("hidden", prazosAbaAtual !== "licenciamento");
    document.getElementById("prazos-content-origem")?.classList.toggle("hidden", prazosAbaAtual !== "origem");
    document.getElementById("tab-prazos-licenciamento")?.classList.toggle("btn-primary", prazosAbaAtual === "licenciamento");
    document.getElementById("tab-prazos-origem")?.classList.toggle("btn-primary", prazosAbaAtual === "origem");

    if (prazosAbaAtual === "licenciamento") {
        prazos_carregarCalendario();
    } else {
        ufOrigem_atualizarAcao();
    }
}

function prazos_carregarCalendario() {
    const uf = document.getElementById("prazos_uf_select")?.value;
    const dados = PRAZOS_LICENCIAMENTO_UF[uf];

    if (!dados) {
        return;
    }

    const titulo = document.getElementById("prazos_uf_titulo");
    const observacao = document.getElementById("prazos_obs_uf");
    const status = document.getElementById("prazos_status_uf");
    const fonte = document.getElementById("prazos_fonte_uf");
    const body = document.getElementById("prazos_tabela_body");

    titulo.innerText = `Licenciamento ${dados.nome}`;
    observacao.innerText = `* ${dados.obs}`;

    if (status) {
        status.innerText = dados.status === "verificado"
            ? "Status: calendario 2026 validado com fonte oficial."
            : "Status: prazos exatos ocultados ate confirmacao oficial.";
        status.style.color = dados.status === "verificado" ? "var(--primary)" : "#b45309";
    }

    if (fonte) {
        if (dados.fonteUrl && dados.fonteLabel) {
            fonte.innerHTML = `<a href="${dados.fonteUrl}" target="_blank" rel="noopener noreferrer">${dados.fonteLabel}</a>`;
        } else {
            fonte.innerText = "Fonte: consultar portal oficial do Detran da UF.";
        }
    }

    body.innerHTML = "";

    PRAZOS_ORDEM_FINAIS.forEach((final, index) => {
        const prazo = dados.status === "verificado" && Array.isArray(dados.datas)
            ? dados.datas[index]
            : PRAZOS_PLACEHOLDER;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="padding: 10px; border: 1px solid var(--border); text-align: center; font-weight: bold; color: var(--primary);">${final}</td>
            <td style="padding: 10px; border: 1px solid var(--border); text-align: center;">${prazo}</td>
        `;
        body.appendChild(row);
    });
}

function ufOrigem_exibirStatus(texto, cor) {
    const status = document.getElementById("uf_origem_status");
    if (!status) {
        return;
    }

    status.innerText = texto;
    status.style.color = cor || "var(--label)";
}

function ufOrigem_obterPrefixo(valor) {
    return (valor || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
}

function ufOrigem_atualizarAcao() {
    const input = document.getElementById("uf_origem_placa_input");
    const botao = document.getElementById("uf_origem_consultar_btn");
    if (!input || !botao) {
        return;
    }

    botao.disabled = ufOrigem_obterPrefixo(input.value).length !== 3;
}

function ufOrigem_formatarInput(input) {
    input.value = (input.value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
    ufOrigem_atualizarAcao();
}

function ufOrigem_renderHistorico() {
    const wrap = document.getElementById("uf_origem_historico_wrap");
    const lista = document.getElementById("uf_origem_historico");
    if (!wrap || !lista) {
        return;
    }

    if (!ufOrigemHistorico.length) {
        wrap.classList.add("hidden");
        lista.innerHTML = "";
        return;
    }

    wrap.classList.remove("hidden");
    lista.innerHTML = ufOrigemHistorico.map(item => `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:rgba(255,255,255,.03);">
            <div style="font-weight:800;">${item.placa}</div>
            <div style="text-align:right;">
                <div style="font-weight:800;color:${item.cor};">${item.resultado}</div>
                <div style="font-size:11px;color:var(--label);">${item.faixa}</div>
            </div>
        </div>
    `).join("");
}

function ufOrigem_registrarHistorico(item) {
    ufOrigemHistorico.unshift(item);
    if (ufOrigemHistorico.length > 6) {
        ufOrigemHistorico.length = 6;
    }
    ufOrigem_renderHistorico();
}

function ufOrigem_exibirResultado(resultado) {
    const box = document.getElementById("uf_origem_resultado");
    const estado = document.getElementById("uf_origem_resultado_estado");
    const faixa = document.getElementById("uf_origem_resultado_faixa");

    if (!box || !estado || !faixa) {
        return;
    }

    box.classList.remove("hidden");
    estado.innerText = resultado.resultado;
    estado.style.color = resultado.cor;
    faixa.innerText = resultado.faixa;
}

async function ufOrigem_carregarSequencias() {
    return UF_ORIGEM_SEQUENCIAS;
}

async function ufOrigem_consultar() {
    const input = document.getElementById("uf_origem_placa_input");
    if (!input) {
        return;
    }

    const placaDigitada = input.value.trim().toUpperCase();
    const prefixo = ufOrigem_obterPrefixo(placaDigitada);
    if (prefixo.length !== 3) {
        ufOrigem_exibirStatus("Informe pelo menos as tres letras iniciais da placa.", "#b45309");
        return;
    }

    ufOrigem_exibirStatus("Consultando faixa da placa...", "var(--primary)");

    try {
        const sequencias = await ufOrigem_carregarSequencias();
        const faixa = sequencias.find(item => prefixo >= item.inicial && prefixo <= item.final);

        let resultado;
        if (faixa) {
            const label = faixa.sigla ? `${faixa.sigla} - ${faixa.estado}` : faixa.estado;
            resultado = {
                placa: placaDigitada || prefixo,
                resultado: label,
                faixa: `Faixa ${faixa.inicial} a ${faixa.final}`,
                cor: "var(--primary)"
            };
            ufOrigem_exibirStatus(`UF localizada para o prefixo ${prefixo}.`, "var(--primary)");
        } else {
            resultado = {
                placa: placaDigitada || prefixo,
                resultado: "Sequencia nao utilizada",
                faixa: `Prefixo consultado: ${prefixo}`,
                cor: "#dc2626"
            };
            ufOrigem_exibirStatus(`Nao ha UF vinculada ao prefixo ${prefixo}.`, "#dc2626");
        }

        ufOrigem_exibirResultado(resultado);
        ufOrigem_registrarHistorico(resultado);
    } catch (error) {
        console.error(error);
        ufOrigem_exibirStatus("Nao foi possivel carregar a base da consulta de placas.", "#dc2626");
    }
}

window.prazos_init = prazos_init;
window.prazos_switchTab = prazos_switchTab;
window.prazos_carregarCalendario = prazos_carregarCalendario;
window.ufOrigem_formatarInput = ufOrigem_formatarInput;
window.ufOrigem_consultar = ufOrigem_consultar;

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("prazos_uf_select")) {
        prazos_init();
    }
});
