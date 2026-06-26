import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { ROLE_KEY } from '@/config';
import { RouteNamesEnum } from '@/routes/routeNames';
import { getAccountProvider } from '@/lib';

export const RoleSelectPage = () => {
  const navigate = useNavigate();

  const selectRole = (role) => {
    sessionStorage.setItem(ROLE_KEY, role);
    navigate(role === 'student' ? RouteNamesEnum.student : RouteNamesEnum.teacher);
  };
  
  const handleLogout = async () => {
    const provider = getAccountProvider();
    await provider.logout();
    navigate(RouteNamesEnum.home);
  };
  
  return (
    <MobileLayout>
      <div className='poap-role'>
        <h2 className='poap-title'>Benvingut</h2>
        <p className='poap-subtitle'>Selecciona el teu rol</p>

        <div className='poap-login-actions'>
          <PoapButton onClick={() => selectRole('student')}>Alumne</PoapButton>
          <PoapButton onClick={() => selectRole('teacher')}>Professor</PoapButton>
          <PoapButton variant='secondary' onClick={handleLogout}>Sortir</PoapButton>
        </div>
      </div>
    </MobileLayout>
  );
};
