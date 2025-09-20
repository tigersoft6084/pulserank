"use client";

import { Twitter } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left Side */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/logo.svg" alt="SEObserver" className="h-8 w-auto" />
            </div>

            <div className="flex items-center">
              {/* Copyright */}
              <p className="text-sm text-gray-500 text-center md:text-left">
                © Copyright 2025. All Rights Reserved.
              </p>

              {/* Links */}
              <div className="flex items-center space-x-2 text-sm">
                <a
                  href="/terms"
                  className="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
                >
                  Terms of Service
                </a>
                <span className="text-gray-400">|</span>
                <a
                  href="/privacy"
                  className="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center ">
            <a
              href="https://twitter.com/seobserver"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Twitter className="w-5 h-5 text-gray-600" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
