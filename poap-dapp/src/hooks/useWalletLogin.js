import { useNavigate } from 'react-router-dom';
import { ProviderFactory } from '@multiversx/sdk-dapp/out/providers/ProviderFactory';
import { ProviderTypeEnum } from '@multiversx/sdk-dapp/out/providers/types/providerFactory.types';
import { ROLE_KEY } from '@/config';
import { RouteNamesEnum } from '@/routes/routeNames';

export const useWalletLogin = () => {
  const navigate = useNavigate();

  const handlePostLogin = () => {
    const params = new URLSearchParams(window.location.search);
    const hasClaim = params.get('o') && params.get('k');

    if (hasClaim) {
      sessionStorage.setItem(ROLE_KEY, 'student');
      navigate(`${RouteNamesEnum.claim}?${params.toString()}`, { replace: true });
      return;
    }

    navigate(RouteNamesEnum.role, { replace: true });
  };

  const loginWithProvider = async (type) => {
    const provider = await ProviderFactory.create({ type });
    await provider.login();
    handlePostLogin();
  };

  const loginWebWallet = () => loginWithProvider(ProviderTypeEnum.crossWindow);
  const loginDeFiWallet = () => loginWithProvider(ProviderTypeEnum.extension);

  return { loginWebWallet, loginDeFiWallet };
};
