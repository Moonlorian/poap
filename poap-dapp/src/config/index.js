import { EnvironmentsEnum } from '@/lib';

export * from './sharedConfig';

export const API_URL = 'https://devnet-api.multiversx.com';
export const PROXY_URL = 'https://devnet-gateway.multiversx.com';
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqp058xvyasx0uw9lshjmk9np575pktrpemkassyphv3';
export const tokenId = 'POAP-9142a3';
export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];
export const minEgld = 0.1;
export const faucetUrl = 'https://devnet-wallet.multiversx.com/faucet';
export const walletGuideUrl = 'https://devnet-wallet.multiversx.com';
export const companyName = 'Moonlorian';
export const chainId = 'D';

export const EMBLEM_IMAGES = [
  { label: 'Emblem1', url: '/emblem1.png' },
  { label: 'Emblem2', url: '/emblem2.png' },
  { label: 'Emblem3', url: '/emblem3.png' },
  { label: 'Emblem4', url: '/emblem4.png' },
];