// API & Socket endpoints
export const API_ENDPOINT = "https://charlieeventup.pl:8443/api";
export const API_BASE_URL = "https://charlieeventup.pl:8443";
export const SOCKET_ENDPOINT = "wss://charlieeventup.pl:8443";
export const BACKEND_BASE_URL = "https://charlieeventup.pl:8443";

// Third party api keys
export const GOOGLE_API_KEY = "AIzaSyD-ON7g5hfIjGcbJ0AySwZn1BEbLdqLLnQ";

export const GOOGLE_ANDROID_CLIENT_ID =
  "996856391179-2k2of1051uv7tq3cfioaogeajjbk4a2v.apps.googleusercontent.com";

export const GOOGLE_IOS_CLIENT_ID =
  "996856391179-39prl3561vq266fcf8ttua2kh9lhbl3q.apps.googleusercontent.com";

export const GOOGLE_WEB_CLIENT_ID =
  "996856391179-4dfdrkcluv31jtcqefn3gc9adppqjqm0.apps.googleusercontent.com";

export const FREECURRENCY_API =
  "fca_live_iSwnWj4yX1zRmpzAhGUq3v7AvJ5Nlk2OOr4nDNKP";

export const IMGBB_API_KEY = "83e2873c3863c5dcf4ad703dc8054316";

// Constants
export const EVENT_TYPES = [
  { label: "Birthday Event", value: "birthday" },
  { label: "Common Event", value: "common" },
  { label: "Wedding Event", value: "wedding" },
  { label: "Cultural Event", value: "movie" },
  { label: "Sports Event", value: "sport" },
];

// Fee options
export const USD_FEE_OPTIONS = [
  { label: "$5", value: "5" },
  { label: "$10", value: "10" },
  { label: "$20", value: "20" },
  { label: "$50", value: "50" },
  { label: "$100", value: "100" },
];

export const EUR_FEE_OPTIONS = [
  { label: "€5", value: "5" },
  { label: "€10", value: "10" },
  { label: "€20", value: "20" },
  { label: "€50", value: "50" },
  { label: "€100", value: "100" },
];

export const PLN_FEE_OPTIONS = [
  { label: "zł20", value: "20" },
  { label: "zł40", value: "40" },
  { label: "zł80", value: "80" },
  { label: "zł200", value: "200" },
  { label: "zł400", value: "400" },
];

// Payment options
export const EVENT_PAYMENT_OPTIONS = [
  { label: "Free Entry", value: "free" },
  { label: "Paid Entry", value: "paid" },
];

// Currency options
export const CURRENCY_OPTIONS = [
  { label: "USD", value: "usd" },
  { label: "EUR", value: "eur" },
  { label: "PLN", value: "pln" },
];

export const JSON_RPC_ENDPOINT =
  "https://rpc.ankr.com/bsc/b29aa0d6e313a610c29e8254f0352a0f90f63af46d3679d7a04e3ddaf7d358d6";

export const aggregatorAddress = "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee";

export const aggregatorV3ABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const BURN_FEE_PERCENT = 20;

export const BNB_PAYMENT_ADDRESS = "";

export const BOT_ADDRESS = "0xF03151bD1B16c787e7CaFeE7A1B670C0b777146d";

export const OWNER_WALLET_ADDRESS =
  "0xE9349b24Cf5ee00d1e1DaFA59714254bBAF4A1f0";
