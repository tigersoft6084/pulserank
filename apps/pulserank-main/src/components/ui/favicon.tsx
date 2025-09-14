"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

interface FaviconProps {
  url: string;
  className?: string;
  size?: number;
}

export function Favicon({ url, className = "", size = 16 }: FaviconProps) {
  const [error, setError] = useState(false);

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url.startsWith("http") ? url : `https://${url}`)
        .hostname;
      return domain;
    } catch {
      return url;
    }
  };

  const domain = getDomain(url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;

  if (error) {
    return <Globe className={`text-gray-400 ${className}`} size={size} />;
  }

  return (
    <img
      src={faviconUrl}
      alt={`${domain} favicon`}
      className={`inline-block ${className}`}
      width={size}
      height={size}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
