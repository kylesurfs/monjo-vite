//-- react, react-router-dom, Auth0 --//
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

//-- Context providers --//
import { ThemeProvider } from './components/theme-provider';
import { ChatContextProvider } from './Context/ChatContext';
import { AccountContextProvider } from './Context/AccountContext';
import { LessonPlanCreationProvider } from './Context/LessonPlanCreationContext';

//-- TSX Components --//
import GPT from './App/GPT/GPT';
import LLMChatRoadmap from './App/Roadmap/ChrtGPTCurrentRoadmap';
import AppLayout from './Layout/AppLayout';
import AuthProviderWithNavigateAndContexts from './Auth/AuthProviderWithNavigateAndContexts';
import RouteErrorBoundary from './Errors/RouteErrorBoundary';

//== ***** ***** ***** Exported Component ***** ***** ***** ==//
const App: React.FC = () => {
  //== ***** ***** ***** Component Return ***** ***** ***** ==//
  return (
    <>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <AccountContextProvider>
          <ChatContextProvider>
            <LessonPlanCreationProvider>
              <Router>
                <Routes>
                  <Route
                    element={<AuthProviderWithNavigateAndContexts />}
                    errorElement={<RouteErrorBoundary />}
                  >
                    <Route path='/' element={<AppLayout />}>
                      {/* Redirect from root '/' to '/gpt' */}
                      <Route index element={<Navigate replace to='/gpt' />} />
                      <Route
                        path='/gpt/:entity_type?/:conversation_id?'
                        element={<GPT />}
                      />
                      <Route path='/roadmap' element={<LLMChatRoadmap />} />
                      {/* Additional routes here */}
                    </Route>
                  </Route>
                </Routes>
              </Router>
            </LessonPlanCreationProvider>
          </ChatContextProvider>
        </AccountContextProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
