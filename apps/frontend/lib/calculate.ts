import axios from "axios";

const fetchCalculation = async (a: number, b: number, op: string) => {
  const res = await axios.post(
    process.env.NEXT_PUBLIC_API_URL + "",
    { a, b, op },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (res.status >= 300) {
    throw new Error("Failed to fetch data.");
  }

  return res.data;
};

export default fetchCalculation;
