import ReactDOM from 'react-dom';
import App from './App';
import { AuthContextProvider } from './store/auth-context';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <AuthContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthContextProvider>,
  document.getElementById('root')
);
