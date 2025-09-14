"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import React, { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";

export default function SigninWithPassword() {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form data
    if (!data.email || !data.password) {
      addToast({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    // You can remove this code block
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        addToast({
          type: "error",
          title: "Sign In Failed",
          message: "Invalid email or password. Please try again.",
        });
        return;
      }

      addToast({
        type: "success",
        title: "Welcome Back!",
        message: "You have successfully signed in.",
      });
      router.refresh();
    } catch (error) {
      addToast({
        type: "error",
        title: "Sign In Error",
        message: "An unexpected error occurred. Please try again.",
      });
      console.error("💥Error signing in:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <div className="mb-4.5">
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
        >
          Sign In
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
