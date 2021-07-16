


const apiURL = "http://localhost:9393/api";

//END POINTS
const apiRegister = apiURL + "/v1/register";
const apiLogin = apiURL + "/v1/login";

const prepareRegister = async (user) => {
  const data = await executeService(apiRegister, "POST", user);
  return data;
};

const prepareLogin = async (user) => {
  const data = await executeService(apiLogin, "POST", user);
  if (data.type === "ok") {
    localStorage.setItem("token", data.data);
    return data
  }
  
};

const executeService = async (uri, met, user) => {
  //PREPARAR FETCH PARA METODO POST
  const header = new Headers();
  header.append("Content-Type", "application/json");

  const myInit = {
    method: met,
    headers: header,
    body: JSON.stringify(user),
  };

  //ENVIAR A API
  const resp = await fetch(uri, myInit);
  const json = await resp.json();
  return json;
};

//prepareRegister()
// prepareLogin();

const message = (data) => {
  const now = new Date()
  let ampm = now.getHours() >= 12 ? ' pm' : ' am';

  switch (data.type) {
    case "connect":
      let person = `
          <div class="user" id="userConnectOnly">
            <span class="user--name">${data.name}</span>
            <span class="user--status">En linea</span>
          </div>
      `
      insertNameSidebar(person)

      if (data.message) {
        drawMessage(data)
      } else {
        console.log("no tiene data");
      }
      break
    case "message":
      if (data.message) {
        drawMessage(data)
      } else {
        console.log("no tiene data");
      }
      break
    case "disconnect":
      userConnectOnly.remove()
    default:
      console.log("tipo de dato desconocido")
  }

  
};



const drawMessage = (data, type) => {
  let content
  switch(type) {
    case 'send':
      content = `
      <div class="message">
      <div class="message-avatar">
          <img src="/assets/man.png" alt="">
      </div>
      <div class="message-info">
          <div class="message--user">
              <span class="message-user_name">${data.name}</span>
              <span class="message--user_time">${data.hour}</span>
          </div>
          <div class="message--content">
              ${data.message}
          </div>
      </div>
    </div>
    `;
    break

    case 'receive':
      content = `
      <div class="message">
      <div class="message-avatar">
          <img src="/assets/man.png" alt="">
      </div>
      <div class="message-info">
          <div class="message--user">
              <span class="message-user_name">${data.name}</span>
              <span class="message--user_time">${data.hour}</span>
          </div>
          <div class="message--content">
              ${data.message}
          </div>
      </div>
    </div>
    `;

    break
  }
 
  let messageContainer = document.getElementById("message_content");
  if (messageContainer) {
    messageContainer.insertAdjacentHTML("beforeend", content);
    
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
}

//PARA ENVIAR MENSAJES
const eventForm1 = (element) => {
      let writeMessage = element.target.messageText.value;
      const msg = {
        name: localStorage.getItem('user'),
        message: writeMessage,
        type: "message"
      }

      ws.send(JSON.stringify(msg));
      writeMessage = element.target.messageText.value = "";
};

const eventFormRegister = (elementRegister) => {

  if (elementRegister) {
    elementRegister.addEventListener("submit", e => {
      e.preventDefault();

      let user = {
        nick_name: e.target.userName.value,
        password: e.target.userPass.value
      }
      prepareRegister(user).then(data => {
        console.log("registrado: ", data)
        elementRegister.innerHTML = `
          <p class="form-register">Ha sido registrado exitosamente</p>
          <button id="btnBackToLogin"class="btnBackToLogin">Volver</button>
          `
        btnBackToLogin.addEventListener('click', e => {

          Router.navigate('/login')
        })
      })
    });
  } else {
    console.log("no existe formRegister");
  }
};

const eventFormLogin = () => {
  const formLogin = document.getElementById("form-login");
  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      let user = {
        nick_name: e.target.userNameLogin.value,
        password: e.target.userPasswordLogin.value,
      };
      prepareLogin(user).then(data => {
        if(data.type == "ok") {
          localStorage.setItem('user', e.target.userNameLogin.value)
          // wsExtern()
          Router.navigate('/chat')
        }
      }).catch(e => {
        console.log(e)
        })
      });
    }
  }



