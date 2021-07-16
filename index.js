

//iniciar sesion con cuenta de google
const loginWithGoogle = (button) => {
    button.addEventListener('click', async e => {
        e.preventDefault()
        try {
            let provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            await firebase.auth().signInWithPopup(provider)
            
            // firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
        } catch (error) {
            console.log(error)
        }
    })
}


//cerrar sesion
const logoutGoogle = () => {
    try {
        firebase.auth().signOut()
    } catch (error) {
        console.log(error)
    }
}

// saber si el usuario inicio sesion
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log(user)
      Router.navigate('/chat')
    localStorage.setItem('user', user.displayName)
    localStorage.setItem('uid', user.uid)
    uploadMessageFirebase('Se ha conectado')
    insertNameNav(user.displayName)

    } else {
      Router.navigate('/login')
    }
  });

  //Enviar mensajes escritura
  const sendMessagesFirebase = async (element) => {
    let messageForm = element.target.messageText.value
    await uploadMessageFirebase(messageForm)
    element.target.messageText.value = ''
  }

  //subir mensaje
  const uploadMessageFirebase = (messagenative) => {
    const now = new Date()
    let ampm = now.getHours() >= 12 ? ' pm' : ' am';
    if(!messagenative.trim()){
        console.log("vacio")
        return
    }
    let messageForSend = {
        name: localStorage.getItem('user'),
        message: messagenative,
        hour: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}${ampm}`,
        uid: localStorage.getItem('uid')
    }
    firebase.firestore().collection('chat').add(messageForSend)
    .catch(e => console.log(e))
  }

//recibir mensajes
const receiveMessages = (content) => {
  const clock = new Date()
  let ampm = clock.getHours() >= 12 ? ' pm' : ' am';
  const currentClock = `${clock.getHours()}:${clock.getMinutes()}:${clock.getSeconds()}${ampm}`
  firebase.firestore().collection('chat').orderBy('hour')
    .onSnapshot(query => {
      content.innerHTML = ''
      query.forEach(doc => {
        if (doc.data().hour >= currentClock) {
          if (doc.data().uid === localStorage.getItem('uid')) {
            drawMessage(doc.data(), 'send')
          } else {
            drawMessage(doc.data(), 'receive')
          }
        } else {
          content.innerHTML = ''
        }
      })
    })
}

  //insertar nombre en sidebar

  const insertNameNav = (user) => {
    let person = `
    <div class="user" id="userConnectOnly">
      <span class="user--name">${user}</span>
      <span class="user--status">En linea</span>
    </div>
    `
    insertNameSidebar(person)
  }