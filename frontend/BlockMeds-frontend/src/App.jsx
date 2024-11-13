import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';
import ErrorPage from './pages/ErrorPage/ErrorPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
      <Routes>
        <Route path='/' element={<HomePage />}></Route>
        <Route path='/login' element={<LoginPage />}></Route>
        <Route path='/signup' element={<SignupPage />}></Route>
        <Route path='*' element={<ErrorPage />}></Route>
      </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App
