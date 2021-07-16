
//iniciar sesion con cuenta de google
const loginWithGoogle = (button) => {
    button.addEventListener('click',  async e => {
        try {
            console.log("accedi")
            const provider = new firebase.auth.GoogleAuthProvider();
            await firebase.auth()
            .signInWithPopup(provider)
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
//saber si el usuario inicio sesion
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log(user)
      Router.navigate('/chat')
    //   localStorage.setItem('user', user.displayName)
      var uid = user.uid;
      // ...
    } else {
      console.log('no existe el usuario')
      Router.navigate('/login')
    }
  });


//enviar mensajes

const senMessageFirebase = (element) => {
    let writeMessage = element.target.messageText.value
    console.log(writeMessage)
}