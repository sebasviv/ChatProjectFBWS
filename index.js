

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
    
      // ...
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

  //subir mensajes
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
    firebase.firestore().collection('chat').orderBy('hour')
    .onSnapshot(query => {
        content.innerHTML = ''
        query.forEach(doc => {
            console.log(doc.data())
            if(doc.data().uid === localStorage.getItem('uid')){
                drawMessage(doc.data(),'send')
            }else {
                drawMessage(doc.data(), 'receive')
            }
        })
    })
  }