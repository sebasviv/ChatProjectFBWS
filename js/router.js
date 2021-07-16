// Creamos el objeto global ws para acceder al websocket desde diferentes funciones
let ws
let element

const Router = {
    routes: [],
    mode: null,
    root: '/',
    config: function(options) {
        this.mode = options && options.mode && options.mode == 'history' 
                    && !!(history.pushState) ? 'history' : 'hash';
        this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
        return this;
    },
    getFragment: function() {
        var fragment = '';
        if(this.mode === 'history') {
            fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
            fragment = fragment.replace(/\?(.*)$/, '');
            fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
        } else {
            var match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }
        return this.clearSlashes(fragment);
    },
    clearSlashes: function(path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    },
    add: function(re, handler) {
        if(typeof re == 'function') {
            handler = re;
            re = '';
        }
        this.routes.push({ re: re, handler: handler});
        return this;
    },
    remove: function(param) {
        for(var i=0, r; i<this.routes.length, r = this.routes[i]; i++) {
            if(r.handler === param || r.re.toString() === param.toString()) {
                this.routes.splice(i, 1); 
                return this;
            }
        }
        return this;
    },
    flush: function() {
        this.routes = [];
        this.mode = null;
        this.root = '/';
        return this;
    },
    check: function(f) {
        var fragment = f || this.getFragment();
        for(var i=0; i<this.routes.length; i++) {
            var match = fragment.match(this.routes[i].re);
            if(match) {
                match.shift();
                this.routes[i].handler.apply({}, match);
                return this;
            }           
        }
        return this;
    },
    listen: function() {
        var self = this;
        var current = self.getFragment();
        var fn = function() {
            if(current !== self.getFragment()) {
                current = self.getFragment();
                self.check(current);
            }
        }
        clearInterval(this.interval);
        this.interval = setInterval(fn, 50);
        return this;
    },
    navigate: function(path) {
        path = path ? path : '';
        if(this.mode === 'history') {
            history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        return this;
    }
}

// configuration
Router.config({ mode: 'history'});

// returning the user to the initial state
Router.navigate();

//agregando rutas a nuestro router
Router.add(/login/, function () {
  document.body.innerHTML = /*html*/ `
  <div class="login-page">
      <div class="login-container">
        <div class="brand-login">
          <img src="/assets/logo_large.png" alt="logo" class="logo" />
        </div>
        <form class="form-login" id="form-login">
          <input type="text" class="form-login--user" placeholder="Usuario" name="userNameLogin"/>
          <input
            type="password"
            class="form-login--pass"
            placeholder="Contraseña"
            name="userPasswordLogin"
          />
          <input type="submit" value="Ingresar" class="form-login--submit" />
        </form>
        <div class="google-container" id="btnLoginGoogle">
          <img src="/assets/google.png" alt="google" class="logo-google"/>
        </div>
        <div class="linkRegister"><p>Has click <a id="nextToRegister"href="#">aqui</a>para registrarte</p></div>
      </div>
    </div>
  `;

  const btnGoogle = document.getElementById('btnLoginGoogle')
  loginWithGoogle(btnGoogle)
  const formLogin = document.getElementById('form-login')
  nextToRegister.addEventListener('click', e => {
    e.preventDefault()
    Router.navigate('/registro')
  })
  eventFormLogin();
})
.add(/registro/, () => {
  document.body.innerHTML = `
  <div class="login-page">
      <div class="login-container">
        <div class="brand-login">
          <img src="/assets/logo_large.png" alt="logo" class="logo" />
        </div>
        <form class="form-login" id="form-register" autocomplete="off">
          <input type="text" class="form-login--user" placeholder="Usuario" name="userName" />
          <input
            type="password"
            class="form-login--pass"
            placeholder="Contraseña"
            name="userPass"
          />
          <input type="submit" value="Registro" class="form-login--submit" />
        </form>
      </div>
  </div>
  `;
  const formRegister = document.getElementById('form-register')
  eventFormRegister(formRegister);
})
.add(/chat/, () => {
    document.body.innerHTML = /*html*/ `
    <div class="container">
      <aside class="sidebar-container">
        <div class="brand">
          <img src="/assets/logo_large.png" alt="" class="logo" />
        </div>
        <div class="users" id="userConnected">
          <h2>Usuarios conectados</h2>
        </div>
        <div class="account">
          <a id="close-session">Cerrar Sesión</a>
        </div>
      </aside>
      <main class="main-container">
        <div class="chat-details">
          <h1 class="title">Canal público</h1>
          <span class="sub-title">Sala general de comunicación</span>
        </div>
        <div class="messages-container" id="message_content"></div>
        <div class="form-container">
          <form class="message-form" id="messageForm" autocomplete="off">
            <input
              class="message-form--text"
              type="text"
              placeholder="Ingrese su mensaje"
              name="messageText"
            />
            <input class="message-form--submit" type="submit" value="Enviar" />
          </form>
        </div>
      </main>
    `;
  const contentMessage = document.getElementById('message_content')
  receiveMessages(contentMessage)
  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    sendMessagesFirebase(e)
    // eventForm1(e)
  })

  element = document.getElementById('userConnected')

  const buttonClose = document.getElementById("close-session")
  if (buttonClose) {
    buttonClose.addEventListener("click", e => {
      localStorage.clear()
      logoutGoogle()
      ws.close()
      Router.navigate('/login')
    })
  }



}).listen()


  const wsExtern = () => {
    ws=new WebSocket('wss://echo.websocket.org')
    ws.onopen = () => {
      console.log('Se conecto')
      const welcome = {
        name: localStorage.getItem('user'),
        message: 'Conectado',
        type: "connect"
      }
      ws.send(JSON.stringify(welcome));
    }
    ws.onclose = () => {}
    ws.onerror = e => {}
    ws.onmessage = (messageWs) => {
      message(JSON.parse(messageWs.data));
    }
  }

// if (localStorage.getItem("token") === "ESTEESUNTOKENMUYSEGUROQUENADIEPUEDEVIOLENTAR:)" ) {
//     Router.navigate('/chat')
//     wsExtern()
// }else {
//     Router.navigate('/login')
// }

// document.addEventListener('beforeunlodad', e => {
//   localStorage.clear()
// })

const insertNameSidebar = (person) => {
  if (element) element.insertAdjacentHTML("beforeend", person);
}
