"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { getUrlValidationError, normalizeUrl } from "@/lib/utils/url-utils";

interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  submitButtonText?: string;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function UrlInput({
  url,
  onUrlChange,
  onSubmit,
  isLoading = false,
  submitButtonText = "Submit",
  placeholder = "https://example.com",
  label = "URL",
  className = "",
}: UrlInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleUrlChange = (value: string) => {
    onUrlChange(value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      return;
    }

    const error = getUrlValidationError(url);
    if (error) {
      setValidationError(error);
      return;
    }

    // Normalize URL before submitting
    const normalizedUrl = normalizeUrl(url.trim());
    onSubmit(normalizedUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 pl-2">
        <Label htmlFor="url">{label}</Label>
        <div className="flex-1">
          <Input
            id="url"
            placeholder={placeholder}
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={validationError ? "border-red-500" : ""}
          />
        </div>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? "Loading..." : submitButtonText}
        </Button>
      </div>

      {validationError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {validationError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
