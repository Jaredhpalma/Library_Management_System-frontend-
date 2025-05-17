"use client";

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface FormData {
  name?: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, register, authToken, isLoading } = useAppContext();

  useEffect(() => {
    if (authToken && !isLoading) {
      router.push("/dashboard");
    }
  }, [authToken, isLoading, router]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Logged in successfully!");
      } else {
        if (formData.password !== formData.password_confirmation) {
          toast.error("Passwords don't match!");
          return;
        }
        await register(
          formData.name!,
          formData.email,
          formData.password,
          formData.password_confirmation!
        );
        toast.success("Registered successfully! Please login.");
        setIsLogin(true); // Switch to login after registration
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authToken) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">{isLogin ? "Login" : "Register"}</h3>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <input
                className="form-control"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
              />
            </div>
          )}

          <div className="mb-3">
            <input
              className="form-control"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              minLength={8}
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-3">
              <input
                className="form-control"
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                minLength={8}
                required
              />
            </div>
          )}

          <button 
            className="btn btn-primary w-100" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              isLogin ? "Login" : "Register"
            )}
          </button>
        </form>

        <p className="mt-3 text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="btn btn-link p-0 ms-1"
            disabled={isSubmitting}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;