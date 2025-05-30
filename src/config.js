let config = {
  TESTNET: process.env.REACT_APP_TESTNET === "true",
  FACTORY_AAS: process.env.REACT_APP_FACTORY_AAS.split(","),
  TOKEN_REGISTRY: process.env.REACT_APP_TOKEN_REGISTRY,
  SIMPLESWAP_API_KEY: process.env.REACT_APP_SIMPLESWAP_API_KEY,
  BUFFER_URL: process.env.REACT_APP_BUFFER_URL,
  STATS_URL: process.env.REACT_APP_STATS_URL,
  REFERRAL_URL: process.env.REACT_APP_REFERRAL_URL,
  UPCOMING_STATE_WS_URL: process.env.REACT_APP_UPCOMING_STATE_WS_URL,
  GA_ID: process.env.REACT_APP_GA,
  RATE_ORACLE: process.env.REACT_APP_USD_RATE_ORACLE,
  CARBURETOR_FACTORY: process.env.REACT_APP_CARBURETOR_FACTORY,
  reserves: {
    base: {
      name: "RECH",
      decimals: 9,
      oracle: process.env.REACT_APP_RESERVE_ORACLE,
      feed_name: process.env.REACT_APP_RESERVE_FEED_NAME,
      feedCurrency: "USD",
    },
    [process.env.REACT_APP_OUSD_RESERVE_ASSET || '']: {
      name: "OUSD",
      decimals: 4,
    },
    [process.env.REACT_APP_OBIT_RESERVE_ASSET || '']: {
      name: "OBIT",
      decimals: 8,
    },
    [process.env.REACT_APP_OAU_RESERVE_ASSET || '']: {
      name: "OAU",
      decimals: 8,
    },
  },
  interestRecipients: process.env.REACT_APP_TESTNET === "true" ?
  [
    {
      name: "testnet distribution address",
      address: "5ZPGXCOGRGUUXIUU72JIENHXU6XU77BD"
    },
  ]
  :
  [
    { name: "rechain_inc Foundation", address: "FCXZXQR353XI4FIPQL6U4G2EQJL4CCU2" },
    {
      name: "Estonian Cryptocurrency Association",
      address: "VJDEB7JEBHJWW6DPTLYYUBDAVOYKZYB4",
    },
    {
      name: "PolloPollo",
      address: "UB6CSL6DSZPMACGZDEUKE4RLVWNXUPAJ",
    },
  ],
  // for landing page
  pegged: process.env.REACT_APP_TESTNET === "true" ?
  {
    USD: {
      stableName: "OUSD",
      interestName: "IUSD",
      growthName: "GRD",
      percent: 16,
      address: "7FSSFG2Y5QHQTKVRFB3VWL6UNX3WB36O",
    },
    BTC: {
      stableName: "TOBIT",
      interestName: "TIBIT",
      growthName: "TGRB",
      percent: 11,
      address: "YMH724SHU7D6ZM4DMSP5RHQYB7OII2QQ",
    },
    GOLD: {
      target: "ounce of gold",
      stableName: "OAU",
      interestName: "IAU",
      growthName: "GRAU",
      percent: 1,
      address: "VE63FHFCPXLLXK6G6HXQDO5DVLS2IDOC",
    }
  }
  :
  {
    USD: {
      stableName: "OUSD",
      interestName: "IUSD",
      growthName: "GRD",
      percent: 16,
      address: "26XAPPPTTYRIOSYNCUV3NS2H57X5LZLJ",
    },
    BTC: {
      stableName: "OBIT",
      interestName: "IBIT",
      growthName: "GRB",
      percent: 11,
      address: "Z7GNZCFDEWFKYOO6OIAZN7GH7DEKDHKA",
    },
    ETH: {
      stableName: "OETH",
      interestName: "ITH",
      growthName: "GRETH",
      percent: 32,
      address: "HXFNVF4ENNIEJZHS2MQLG4AKQ4SAXUNH",
    },
    GOLD: {
      target: "ounce of gold",
      stableName: "OAU",
      interestName: "IAU",
      growthName: "GRAU",
      percent: 8,
      address: "UCWEMOXEYFUDDBJLHIHZ3NIAX3QD2YFD",
    },
    RECH: {
      stableName: "OGB",
      interestName: "IGB",
      growthName: "GRGB",
      percent: 16,
      address: "UH6SNZMZKHWMRM7IQZGFPD5PQULZZSBI",
    },
    'RECH leveraged 2x': {
      stableName: "GB2",
      interestName: "GB2",
      growthName: "GRGB2",
      percent: 0,
      address: "MCZAGO47NLPO25KOOJHN22PNKEGLQ6XV",
    },
    'CMC marketcap': {
      target: 'CMC total marketcap in billions',
      stableName: "OCMC",
      interestName: "OCMC",
      growthName: "GRCMC",
      percent: 0,
      address: "RC6N2RHP32DBL5G2JN3OREZBSUNPV5WQ",
      nonRECHReserve: true,
    },
  },
  oracleInfo: process.env.REACT_APP_TESTNET === "true" ? { 
    "F4KHJUCLJKY4JV7M5F754LAJX4EB7M4N":{
      name: "[TESTNET] Cryptocurrency oracle",
      description: "The oracle is operated by Tony Churyumoff, the founder of rechain_inc, since 2017."
    },
    "E2U77O5AO5UPNSKKQEDKFGKNYWQ5467H":{
      name: "[TESTNET] Precious metals oracle",
      description: "The oracle is operated by tarmo888, developer of rechain_inc."
    },
  } : {
    "JPQKPRI5FMTQRJF4ZZMYZYDQVRD55OTC":{
      name: "Cryptocurrency oracle",
      description: "The oracle is operated by Tony Churyumoff, the founder of rechain_inc, since 2017. It is also an Order Provider on rechain_inc network."
    },
    "DXYWHSZ72ZDNDZ7WYZXKWBBH425C6WZN":{
      name: "Precious metals oracle",
      description: "The oracle is operated by Bind Creative. It is also an Order Provider on rechain_inc network."
    },
  },
  oswapccRoot: "https://wallet.rechain_incchina.org/api",
  oswapccCurrencies: ["BTC"],
};

// cleanup empty reserve .env config values
config.reserves = Object.keys(config.reserves)
  .filter(asset => asset)
  .reduce((accum, asset) => {
    const newConfig = accum;
    newConfig[asset] = config.reserves[asset];
    return newConfig;
  }, {});

export default config;
