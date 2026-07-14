import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

 const handleSignup = async () => {
  if (!email || !password) {
    setMessage("Please fill all fields");
    return;
  }
  try {
    const generatedName = email.split("@")[0];
    const response = await fetch("http://localhost:4000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: generatedName, email, password }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      setMessage("Account created successfully!");
      setEmail("");
      setPassword("");
      setTimeout(() => {
        setMode("login");
        setMessage("");
      }, 1500);
    } else {
      setMessage(data.message || "Registration failed");
    }
  } catch (error) {
    setMessage("Server connection failed");
  }
};

  const handleLogin = async () => {
  if (!email || !password) {
    setMessage("Please fill all fields");
    return;
  }
  try {
    const response = await fetch("http://localhost:4000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      setMessage("Login Successful!");
      setIsLoading(true);
      localStorage.setItem("token", data.token);
      setTimeout(() => {
        if (onLogin) onLogin();
      }, 2500);
    } else {
      setMessage(data.message || "Invalid credentials");
    }
  } catch (error) {
    setMessage("Server connection failed");
  }
};
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "login") {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setMessage("Enter your email first");
      return;
    }
    setMessage("Password reset link sent successfully!");
  };

  return (
    <div className="login-container">
      <div className="stars">
        <div className="stars-layer-1"></div>
        <div className="stars-layer-2"></div>
        <div className="stars-layer-3"></div>
      </div>
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>
      <div className="content">
        <div className="left-section">
          <div className="badge">Loan Management System</div>
          <h1>
            Manage Loans
            <br />
            Smarter.
          </h1>
          <p>
            Monitor customers, repayments, due dates and financial performance
            through a centralized platform.
          </p>
        </div>
        <form className="login-card" onSubmit={handleSubmit}>
          {isLoading ? (
            <div className="loader-container">
              <div className="cosmic-jelly-wrapper">
                <div className="cosmic-jelly">
                  <div className="space-visor">
                    <div className="visor-blink"></div>
                  </div>
                  <div className="jelly-cheeks"></div>
                </div>
                <div className="pet-star-orbit">
                  <div className="mini-pet-star"></div>
                </div>
                <div className="jelly-shadow"></div>
              </div>
              <h3>Launching Dashboard...</h3>
              <p className="loader-text">Buckling up your seatbelts ✨</p>
            </div>
          ) : (
            <>
              <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p className="subtitle">
                {mode === "login" ? "Sign in to continue" : "Sign up to continue"}
              </p>
              <div className="input-group">
                <label htmlFor="email-input">Email</label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password-input">Password</label>
                <input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="forgot-password" onClick={handleForgotPassword}>
                Forgot Password?
              </div>
              {message && <p className="message">{message}</p>}
              <button type="submit" className="login-btn">
                {mode === "login" ? "Login" : "Sign Up"}
              </button>
              <p className="signup-text">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <span onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                  {mode === "login" ? " Sign Up" : " Login"}
                </span>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;