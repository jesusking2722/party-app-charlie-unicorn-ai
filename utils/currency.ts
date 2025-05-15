import { FREECURRENCY_API } from "@/constant";

/**
 * Fetches current USD exchange rates for EUR and PLN
 * @returns Promise resolving to an object with eur and pln rates
 */
const fetchUsdRates = async (): Promise<{ eur: number; pln: number }> => {
  try {
    const response = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${FREECURRENCY_API}&base_currency=USD`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Make sure we have the expected data
    if (!data.data || !data.data.EUR || !data.data.PLN) {
      throw new Error("Invalid API response: Missing EUR or PLN rates");
    }

    return {
      eur: data.data.EUR,
      pln: data.data.PLN,
    };
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    // You might want to handle this differently based on your app's needs
    // Option 1: Return default values
    // return { eur: 0.93, pln: 4.15 }; // Example default values

    // Option 2: Re-throw the error for the caller to handle
    throw error;
  }
};

export default fetchUsdRates;
