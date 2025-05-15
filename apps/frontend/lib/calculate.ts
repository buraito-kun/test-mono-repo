import axios from "axios";

/**
 * Performs calculation locally as a fallback when API calls fail
 */
const calculateLocally = (a: number, b: number, op: string): number => {
  try {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        if (b === 0) return NaN; // Handle division by zero gracefully
        return a / b;
      case "^":
        return Math.pow(a, b);
      // For unsupported operations, return NaN instead of throwing
      case "**":
      case "%":
      default:
        console.warn(`Unsupported operation: ${op}, returning NaN`);
        return NaN;
    }
  } catch (err) {
    console.error("Calculation error:", err);
    return NaN; // Return NaN for any calculation errors
  }
};

/**
 * Fetches calculation from API with local fallback for better UX
 */
const fetchCalculation = async (a: number, b: number, op: string): Promise<number> => {
  try {
    // Only attempt API call if URL is configured
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_URL,
        { a, b, op },
        {
          headers: {
            "Content-Type": "application/json",
          },
          // Set a reasonable timeout to avoid long waits
          timeout: 3000,
        }
      );

      if (res.status >= 200 && res.status < 300) {
        return res.data;
      }
    }
    
    // Fallback to local calculation
    console.log("Falling back to local calculation");
    return calculateLocally(a, b, op);
  } catch (err) {
    // Handle API errors gracefully with local fallback
    console.warn("API calculation failed, using local fallback", err);
    return calculateLocally(a, b, op);
  }
};

export default fetchCalculation;
