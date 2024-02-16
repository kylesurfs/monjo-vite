//-- react, react-router-dom, Auth0 --//
// import { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Auth0Provider, AppState, User } from '@auth0/auth0-react';

//-- TSX Components --//
import { useIsMobile } from '../Util/useUserAgent';

//-- NPM Components --//

//-- Icons --//

//-- NPM Functions --//

//-- Utility Functions --//

//-- Data Objects --//

//-- ***** ***** ***** Exported Component ***** ***** ***** --//
export default function AuthProviderWithNavigateAndContexts() {
  const navigate = useNavigate();
  let mobile = useIsMobile();

  //-- If user requested a Guarded Route, but was sent to login, then upon redirect to this SPA, the Guarded Route's path that the user tried to access is returned by the server as the value appState.returnTo --//
  const onRedirectCallback = (appState?: AppState, user?: User) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain='auth.chrt.com' //-- Tenant: 'chrt-prod' --//
      clientId='8bDLHYeEUfPHH81VRDBsCTN5TYklAMCu' //-- Application: 'chrt-prod-app' --//
      cacheLocation={mobile ? 'localstorage' : 'memory'}
      authorizationParams={{
        redirect_uri: `${window.location.origin}`, //-- redirect_uri NOTE - localhost "not allowed" by Auth0 for prod tenant (which is 'chrt-prod')...but seems to work fine. --//
        // audience: 'https://chrt.com', //-- API: 'chrt' (also /userinfo by default) --//
        audience: 'http://localhost:5173',
        scope: 'openid profile email',
        //-- Scope guide:
        //-- 'openid' included by default, indicates app will use OIDC --//
        //-- 'profile' allows name and profile photo --//
        //-- 'email' allows email --//
        //-- API-level scopes, such as "write:journal", seem to be included per user's roles/permissions --//
      }}
      onRedirectCallback={onRedirectCallback}
    >
      <Outlet />
    </Auth0Provider>
  );
}

//------- Kyle's mock Auth0Provider attempt below. Didn't quite work, but seemed close. -------//

// import React, { createContext, useContext, ReactNode } from 'react';
// import { Outlet } from 'react-router-dom';

// interface User {
//   email: string;
//   name: string;
// }

// interface Auth0ContextInterface {
//   isAuthenticated: boolean;
//   user: User | null;
//   loginWithRedirect: () => Promise<void>;
//   logout: () => void;
//   getAccessTokenSilently: () => Promise<string>;
// }

// const MockAuth0Context = createContext<Auth0ContextInterface>({
//   isAuthenticated: true,
//   user: null,
//   loginWithRedirect: () => Promise.resolve(),
//   logout: () => {},
//   getAccessTokenSilently: () => Promise.resolve('mock_access_token'),
// });

// export const useAuth0 = () => useContext(MockAuth0Context);

// interface AuthProviderWithNavigateAndContextProps {
//   children: ReactNode;
// }

// // Renamed to match your requirement
// const AuthProviderWithNavigateAndContext = ({
//   children,
// }: AuthProviderWithNavigateAndContextProps) => {
//   // Mock implementations here
//   const loginWithRedirect = () => Promise.resolve();
//   const logout = () => {};
//   const getAccessTokenSilently = () => Promise.resolve('mock_access_token');

//   // Mock user or null based on your testing needs
//   const user: User | null = {
//     email: 'mock@example.com',
//     name: 'Mock User',
//   };

//   const isAuthenticated = Boolean(user); // Adjust based on your logic

//   return (
//     <MockAuth0Context.Provider
//       value={{
//         isAuthenticated,
//         user,
//         loginWithRedirect,
//         logout,
//         getAccessTokenSilently,
//       }}
//     >
//       {children}
//     </MockAuth0Context.Provider>
//   );
// };

// export default AuthProviderWithNavigateAndContext;
