import { Drive } from './Components/Drive';
import { Routes, Route } from 'react-router-dom';
import SignIn from './Components/Auth/SignIn';
import Storage from './Components/Storage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn/> } />
      <Route path="/drive" element={<Storage />} />
      {/* <Route path="/drive" element={<Drive />} /> */}
    </Routes>
  )
}

export default App;
