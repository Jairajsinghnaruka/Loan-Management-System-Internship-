import { useState } from "react";
import "./login.css";

function Login({ setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter Email and Password");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setUserRole("Admin");
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {loading ? (
          <div className="loading-content">
            <div className="flower">🌸</div>

            <div className="loader"></div>

            <h2>Loading Dashboard...</h2>
            <p>Please wait while we authenticate you</p>
          </div>
        ) : (
          <>
            <h1>DashCorp</h1>
            <p>Corporate Project Management System</p>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Login</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;