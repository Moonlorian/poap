import { EnvironmentsEnum } from '@/lib';

export * from './sharedConfig';

export const API_URL = 'https://devnet-api.multiversx.com';
export const PROXY_URL = 'https://devnet-gateway.multiversx.com';
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgq5prfr0ynhtsgu5x885hddsfdz2zcz00pmkasp9cmd6';
export const tokenId = 'POAP-042a5d';
export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];
export const minEgld = 0.1;
export const faucetUrl = 'https://devnet-wallet.multiversx.com/faucet';
export const walletGuideUrl = 'https://devnet-wallet.multiversx.com';
export const companyName = 'Company Name';
export const chainId = 'D';

export const EMBLEM_IMAGES = [
  { label: 'Estrella', url: '/emblems/star.png' },
  { label: 'Diploma', url: '/emblems/diploma.png' },
];