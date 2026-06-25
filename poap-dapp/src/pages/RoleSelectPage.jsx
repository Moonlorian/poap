import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { ROLE_KEY } from '@/config';
import { RouteNamesEnum } from '@/routes/routeNames';

export const RoleSelectPage = () => {
  const navigate = useNavigate();

  const selectRole = (role) => {
    sessionStorage.setItem(ROLE_KEY, role);
    navigate(role === 'student' ? RouteNamesEnum.student : RouteNamesEnum.teacher);
  };

  return (
    <MobileLayout>
      <div className='poap-role'>
        <h2 className='poap-title'>Benvingut</h2>
        <p className='poap-subtitle'>Selecciona el teu rol</p>

        <div className='poap-login-actions'>
          <PoapButton onClick={() => selectRole('student')}>Alumne</PoapButton>
          <PoapButton onClick={() => selectRole('teacher')}>Professor</PoapButton>
        </div>
      </div>
    </MobileLayout>
  );
};
