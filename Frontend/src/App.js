import './App.css';
import { BrowserRouter } from 'react-router-dom';
import NavBar from './NavBar';
import RoutesGB from './RoutesGB';
import GBApi from './api';
import { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { Card, CardBody, CardTitle } from "reactstrap";
import io from 'socket.io-client';

const CHAT_URL = process.env.REACT_APP_CHAT_URL || 'http://localhost:4000/';
const socket = io.connect(CHAT_URL);

console.log(socket);

function App() {

  const [user, setUser] = useState({});
  const [showMsg, setShowMsg] = useState(false);
  const closeModal = () => setShowMsg(false);
  const [msg, setMsg] = useState("");

  useEffect(()=>{

    async function getUser() {
      const username = localStorage.getItem("username");
      if(username){
        const u = await GBApi.refreshLogin.bind(GBApi)(username);
        console.log(u);
        setUser(u);
      }
    }

    if(localStorage.getItem("username")) getUser();
    
  }, []);


  return (
    <div className="App">
      <BrowserRouter>
        <NavBar user={user}/>

        <Popup open={showMsg} closeOnDocumentClick onClose={closeModal}>
          <Card>
            <CardBody>{msg}</CardBody>
          </Card>
        </Popup>

        <main>

          <RoutesGB 
            user={user} 
            updateUser={setUser} 
            updateMsg={setMsg} 
            showMsg={setShowMsg}
            socket={socket}/>

        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
