"use client";

import fetchCalculation from "@/lib/calculate";
import { useState } from "react";

/**
 * Renders a calculator UI that allows users to input two numbers, select an arithmetic operator, and view the calculated result.
 *
 * The calculator supports addition, subtraction, multiplication, division, and exponentiation. Calculation is performed asynchronously when the user clicks the submit button, and the result is displayed next to the equals sign.
 */
export default function Home() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [op, setOp] = useState("+");
  const [value, setValue] = useState<number | null>();

  const onClickCalculate = async () => {
    setValue(await fetchCalculation(a, b, op));
  };

  return (
    <div className="w-screen h-screen flex flex-col place-items-center place-content-center bg-gray-950">
      something
      <div className="p-20 bg-blue-950 rounded-4xl flex place-items-center">
        <label>
          <input
            id="a"
            type="number"
            className="rounded-2xl text-9xl text-black w-120 mx-5"
            onChange={(e) => setA(parseInt(e.target.value))}
            placeholder="a"
          />
          <select
            id="op"
            className="rounded-2xl text-9xl text-black w-24 mx-5"
            onChange={(e) => setOp(e.target.value)}
          >
            <option value={"+"}>+</option>
            <option value={"-"}>-</option>
            <option value={"*"}>*</option>
            <option value={"/"}>/</option>
            <option value={"^"}>^</option>
          </select>
          <input
            id="b"
            type="number"
            className="rounded-2xl text-9xl text-black w-120 mx-5"
            onChange={(e) => setB(parseInt(e.target.value))}
            placeholder="b"
          />
        </label>
        <span className="rounded-2xl text-9xl text-black w-120">
          =<span>{value}</span>
        </span>
      </div>
      <button
        className="mt-10 p-10 rounded-2xl text-6xl text-black bg-green-950 hover:cursor-pointer"
        onClick={onClickCalculate}
      >
        Submit!
      </button>
    </div>
  );
}
