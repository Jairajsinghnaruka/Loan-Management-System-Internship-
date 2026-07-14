import React, { useState } from "react";
import "./CreateCustomer.css";

function CreateCustomer({ setView }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pan: "",
    aadhar: "",
    occupation: "",
    income: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      pan: form.pan,
      aadhaar: form.aadhar,
      occupation: form.occupation,
      monthly_income: form.income,
      address: form.address,
    };

    try {
      const response = await fetch("http://localhost:4000/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Customer Created Successfully!");
        setForm({
          name: "",
          email: "",
          phone: "",
          pan: "",
          aadhar: "",
          occupation: "",
          income: "",
          address: "",
        });
        setTimeout(() => {
          setMessage("");
          setView("Customers");
        }, 1500);
      } else {
        setMessage(data.message || "Failed to create customer profile");
      }
    } catch (error) {
      setMessage("Network connection failure");
    }
  };

  return (
    <div className="create-container">
      <div className="form-header">
        <h2>Create Customer</h2>
        <button
          type="button"
          className="back-btn"
          onClick={() => setView("Customers")}
        >
          Back
        </button>
      </div>

      {message && <div className="success-box">{message}</div>}

      <form onSubmit={handleSubmit} className="customer-form">
        <input
          type="text"
          placeholder="Full Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="text"
          placeholder="PAN Number"
          required
          value={form.pan}
          onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
        />

        <input
          type="text"
          placeholder="Aadhar Number"
          required
          value={form.aadhar}
          onChange={(e) => setForm({ ...form, aadhar: e.target.value })}
        />

        <input
          type="text"
          placeholder="Occupation"
          value={form.occupation}
          onChange={(e) => setForm({ ...form, occupation: e.target.value })}
        />

        <input
          type="number"
          placeholder="Monthly Income"
          value={form.income}
          onChange={(e) => setForm({ ...form, income: e.target.value })}
        />

        <textarea
          placeholder="Address"
          rows="4"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <button type="submit" className="submit-btn">
          Create Customer
        </button>
      </form>
    </div>
  );
}

export default CreateCustomer;