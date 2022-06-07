import {Route} from 'react-router-dom'
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserPage from './pages/UserPage';
import AccountActivationPage from './pages/AccountActivationPage';
import NavBar from './components/NavBar';


function App() {


  return (
    <>
      <NavBar/>
      <div className="container pt-3">
        <Route exact path="/" component={HomePage}/>
        <Route exact path="/signup" component={SignUpPage}/>
        <Route exact path="/login" component={LoginPage}/>
        <Route exact path="/users/:id" component={UserPage}/>
        <Route exact path="/activate/:token" component={AccountActivationPage}/>
      </div>
    </>
  );
}

export default App;
