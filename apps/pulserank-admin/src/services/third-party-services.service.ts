export interface ThirdPartyServiceData {
  id: string;
  name: string;
  config: {
    apiKey?: string;
    email?: string;
    password?: string;
  };
  threshold: number;
  createdAt: string;
  updatedAt: string;
  lastSync: string;
  data: Record<string, number>;
}

export interface ThirdPartyServicesResponse {
  success: boolean;
  data: ThirdPartyServiceData[];
  count: number;
}

export const fetchThirdPartyServices =
  async (): Promise<ThirdPartyServicesResponse> => {
    const response = await fetch("/api/third-party-services");

    if (!response.ok) {
      throw new Error("Failed to fetch third-party services");
    }

    return response.json();
  };

export const updateThirdPartyService = async (
  id: string,
  config: ThirdPartyServiceData["config"],
  threshold?: number,
): Promise<{ success: boolean; data: ThirdPartyServiceData }> => {
  const response = await fetch("/api/third-party-services", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, config, threshold }),
  });

  if (!response.ok) {
    throw new Error("Failed to update third-party service");
  }

  return response.json();
};
