import axios from 'axios';
import { API_URL, minEgld, tokenId } from '@/config';

export const fetchAccountBalance = async (address) => {
  const { data } = await axios.get(`${API_URL}/accounts/${address}`, {
    timeout: 6000
  });
  return Number(data.balance) / 1e18;
};

export const hasMinimumEgld = async (address) => {
  const balance = await fetchAccountBalance(address);
  return balance >= minEgld;
};

export const fetchAccountNfts = async (address) => {
  const { data } = await axios.get(
    `${API_URL}/accounts/${address}/nfts?collections=${tokenId}&size=100`,
    { timeout: 6000 }
  );
  return data ?? [];
};

export const fetchNftCount = async (address) => {
  const nfts = await fetchAccountNfts(address);
  return nfts.length;
};
