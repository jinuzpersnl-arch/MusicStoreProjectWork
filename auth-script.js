// Authentication System

// Default Admin Account (credentials requested by user)
const DEFAULT_CREDENTIALS = {
  username: 'Music Store',
  password: '12345'
};

// helper to enforce authentication on protected pages
function ensureAuthenticated() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}
window.ensureAuthenticated = ensureAuthenticated; // expose for pages

// Initialize - Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  initializeEventListeners();
});

// Determine if the user is logged in (session or persistent storage)
function isLoggedIn() {
  return (
    sessionStorage.getItem('musicStoreLoggedIn') === 'true' ||
    localStorage.getItem('musicStoreLoggedIn') === 'true'
  );
}

// Check if user is already authenticated (used on login page)
function checkAuthStatus() {
  if (isLoggedIn()) {
    redirectToHome();
  }
}


// Initialize all event listeners
function initializeEventListeners() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const toggleToSignup = document.getElementById('toggleToSignup');
  const toggleToLogin = document.getElementById('toggleToLogin');
  
  // Form submissions
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  // Toggle between login and signup
  if (toggleToSignup) {
    toggleToSignup.addEventListener('click', switchToSignup);
  }
  
  if (toggleToLogin) {
    toggleToLogin.addEventListener('click', switchToLogin);
  }
  
  // Password visibility toggles
  initializePasswordToggles();
}

// Initialize password visibility toggles
function initializePasswordToggles() {
  const toggles = document.querySelectorAll('.password-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const input = this.parentElement.querySelector('input');
      const icon = this.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

// Handle Login
function handleLogin(e) {
  e.preventDefault();
  
  // Clear previous errors
  clearLoginErrors();
  
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  let isValid = true;
  
  // Validation
  if (!username) {
    showError('loginUsernameError', 'Username is required');
    isValid = false;
  }
  
  if (!password) {
    showError('loginPasswordError', 'Password is required');
    isValid = false;
  }
  
  if (!isValid) return;
  
  // Check credentials against default admin account
  if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
    // Successful login
    if (rememberMe) {
      localStorage.setItem('musicStoreLoggedIn', 'true');
      localStorage.setItem('musicStoreUser', username);
      localStorage.setItem('rememberMe', 'true');
    } else {
      sessionStorage.setItem('musicStoreLoggedIn', 'true');
      sessionStorage.setItem('musicStoreUser', username);
    }
    
    // Show success message and redirect
    showSuccessAnimation(() => {
      redirectToHome();
    });
  } else {
    // Check if user exists in registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    
    if (registeredUsers[username] && registeredUsers[username].password === password) {
      // Successful login with registered account
      if (rememberMe) {
        localStorage.setItem('musicStoreLoggedIn', 'true');
        localStorage.setItem('musicStoreUser', username);
        localStorage.setItem('rememberMe', 'true');
      } else {
        sessionStorage.setItem('musicStoreLoggedIn', 'true');
        sessionStorage.setItem('musicStoreUser', username);
      }
      
      showSuccessAnimation(() => {
        redirectToHome();
      });
    } else {
      // Invalid credentials
      showError('loginGeneralError', 'Invalid username or password');
      document.getElementById('loginPassword').value = '';
    }
  }
}

// Handle Signup
function handleSignup(e) {
  e.preventDefault();
  
  // Clear previous errors
  clearSignupErrors();
  
  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  let isValid = true;
  
  // Validation
  if (!username) {
    showError('signupUsernameError', 'Username is required');
    isValid = false;
  } else if (username.length < 3) {
    showError('signupUsernameError', 'Username must be at least 3 characters');
    isValid = false;
  } else if (username === DEFAULT_CREDENTIALS.username) {
    showError('signupUsernameError', 'This username is reserved');
    isValid = false;
  }
  
  if (!password) {
    showError('signupPasswordError', 'Password is required');
    isValid = false;
  } else if (password.length < 4) {
    showError('signupPasswordError', 'Password must be at least 4 characters');
    isValid = false;
  }
  
  if (!confirmPassword) {
    showError('confirmPasswordError', 'Please confirm your password');
    isValid = false;
  } else if (password !== confirmPassword) {
    showError('confirmPasswordError', 'Passwords do not match');
    isValid = false;
  }
  
  if (!isValid) return;
  
  // Check if username already exists
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
  
  if (registeredUsers[username]) {
    showError('signupUsernameError', 'Username already exists');
    return;
  }
  
  // Create new account
  registeredUsers[username] = {
    password: password,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
  
  // Automatically log in the new user (always persist since just creating account)
  if (true) {
    localStorage.setItem('musicStoreLoggedIn', 'true');
    localStorage.setItem('musicStoreUser', username);
  }
  
  // Show success message and redirect
  showSuccessAnimation(() => {
    redirectToHome();
  });
}

// Switch to signup form
function switchToSignup(e) {
  e.preventDefault();
  clearLoginErrors();
  clearSignupErrors();
  
  document.getElementById('loginWrapper').classList.add('hidden');
  document.getElementById('signupWrapper').classList.remove('hidden');
  
  document.getElementById('loginForm').reset();
}

// Switch to login form
function switchToLogin(e) {
  e.preventDefault();
  clearLoginErrors();
  clearSignupErrors();
  
  document.getElementById('signupWrapper').classList.add('hidden');
  document.getElementById('loginWrapper').classList.remove('hidden');
  
  document.getElementById('signupForm').reset();
}

// Show error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

// Clear login errors
function clearLoginErrors() {
  document.getElementById('loginUsernameError').textContent = '';
  document.getElementById('loginPasswordError').textContent = '';
  document.getElementById('loginGeneralError').textContent = '';
}

// Clear signup errors
function clearSignupErrors() {
  document.getElementById('signupUsernameError').textContent = '';
  document.getElementById('signupPasswordError').textContent = '';
  document.getElementById('confirmPasswordError').textContent = '';
  document.getElementById('signupGeneralError').textContent = '';
}

// Show success animation
function showSuccessAnimation(callback) {
  const card = document.querySelector('.auth-card');
  card.style.animation = 'slideOut 0.6s ease-in forwards';
  
  setTimeout(callback, 600);
}

// Add slide-out animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      opacity: 0;
      transform: translateY(-30px);
    }
  }
`;
document.head.appendChild(style);

// Redirect to home page
function redirectToHome() {
  window.location.href = 'index.html';
}

// Logout function (can be called from main page)
function logout() {
  // clear both storages to fully sign out
  sessionStorage.removeItem('musicStoreLoggedIn');
  sessionStorage.removeItem('musicStoreUser');
  localStorage.removeItem('musicStoreLoggedIn');
  localStorage.removeItem('musicStoreUser');
  localStorage.removeItem('rememberMe');
  window.location.href = 'login.html';
}

// Export logout for use in other pages
window.logoutUser = logout;
