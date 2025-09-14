//https://www.semrush.com/users/countapiunits.html?key={{semrush.apikey}}

export async function checkSemrushState(apiKey: string) {
  try {
    const response = await fetch(
      `https://www.semrush.com/users/countapiunits.html?key=${apiKey}`,
    );

    const data = await response.json();
    // check if data is float
    if (typeof parseFloat(data) !== "number") {
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error checking Semrush state:", error);
    return null;
  }
}

//https://api.majestic.com/api/json?app_api_key={{majestic.prodkey}}&cmd=GetSubscriptionInfo&dataSource=fresh
export async function checkMajesticState(apiKey: string) {
  try {
    const response = await fetch(
      `https://api.majestic.com/api/json?app_api_key=${apiKey}&cmd=GetSubscriptionInfo&dataSource=fresh`,
    );
    const data = await response.json();
    if (data.Code !== "OK") return null;
    return data;
  } catch (error) {
    console.error("Error checking Majestic state:", error);
    return null;
  }
}

//https://api.dataforseo.com/v3/appendix/user_data basicauth email and password
export async function checkDataforseoState(email: string, password: string) {
  try {
    const response = await fetch(
      `https://api.dataforseo.com/v3/appendix/user_data`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${email}:${password}`).toString("base64")}`,
        },
      },
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking Dataforseo state:", error);
    return null;
  }
}
