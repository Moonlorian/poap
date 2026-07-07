import { EnvironmentsEnum } from '@/lib';

export * from './sharedConfig';

export const API_URL = 'https://devnet-api.multiversx.com';
export const PROXY_URL = 'https://devnet-gateway.multiversx.com';
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgq69963edk52a44chukh2vtsakn6fgqe7xmkaslagtxf';
export const tokenId = 'POAP-c635f3';
export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];
export const minEgld = 0.1;
export const faucetUrl = 'https://devnet-wallet.multiversx.com/faucet';
export const walletGuideUrl = 'https://devnet-wallet.multiversx.com';
export const companyName = "Prova d'assistència";
export const chainId = 'D';

export const EMBLEM_IMAGES = [
  { label: 'Emblem1', url: 'https://moonlorian.github.io/poap/emblem1.png' },
  { label: 'Emblem2', url: 'https://moonlorian.github.io/poap/emblem2.png' },
  { label: 'Emblem3', url: 'https://moonlorian.github.io/poap/emblem3.png' },
  { label: 'Emblem4', url: 'https://moonlorian.github.io/poap/emblem4.png' },
];