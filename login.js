const firebaseConfig = {
    apiKey: "AIzaSyDLlMDgSuzMwcBK4gKbH-zLD_LDQSPA8RQ",
    authDomain: "crestview-6fac1.firebaseapp.com",
    projectId: "crestview-6fac1",
    storageBucket: "crestview-6fac1.firebasestorage.app",
    messagingSenderId: "171706842554",
    appId: "1:171706842554:web:284347abdabe50662ef183"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  // Check if user is already remembered
  window.addEventListener('load', () => {
      const rememberedEmail = localStorage.getItem('rememberedEmail') || sessionStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
          window.location.href = "landing.html";
      }
  });
  
  // Login function
  function loginRedirect(event) {
      event.preventDefault(); // Prevent form submission
      const email = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('remember-me').checked;
  
      auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
              const user = userCredential.user;
  
              // Save username/email in localStorage or sessionStorage based on "Remember Me" checkbox
              if (rememberMe) {
                  localStorage.setItem('rememberedEmail', email);
              } else {
                  sessionStorage.setItem('rememberedEmail', email);
              }
  
              // Redirect to info.html on successful login
              window.location.href = "info.html";
          })
          .catch((error) => {
              const errorMessage = error.message;
              alert(`Error: ${errorMessage}`);
          });
  }