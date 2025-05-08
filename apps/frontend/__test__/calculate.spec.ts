jest.mock("axios")

import fetchCalculation from "@/lib/calculate";
import axios from "axios";

describe("test lib/calculate.ts", ()=>{
  it('add 1 + 2 should equal 3', async () => {
    (axios.post as jest.Mock).mockImplementation(()=>Promise.resolve({ status: 201, data: 3}))
    expect(await fetchCalculation(1, 2, '+')).toBe(3);
  });
  it('add -5 + 15 should equal 20', async () => {
    (axios.post as jest.Mock).mockImplementation(()=>Promise.resolve({ status: 201, data: 10}))
    expect(await fetchCalculation(-5, 15, '+')).toBe(10);
  });

  it('minus 5 - 15 should equal -10', async () => {
    (axios.post as jest.Mock).mockImplementation(()=>Promise.resolve({ status: 201, data: -10}))
    expect(await fetchCalculation(5, 15, '-')).toBe(-10);
  });
  it('minus 21 - 7 should equal 14', async () => {
    (axios.post as jest.Mock).mockImplementation(()=>Promise.resolve({ status: 201, data: 14}))
    expect(await fetchCalculation(21, 7, '-')).toBe(14);
  });

  it('multiply 2 * 3 should equal 6', async () => {
    (axios.post as jest.Mock).mockImplementation(()=>Promise.resolve({ status: 201, data: 6}))
    expect(await fetchCalculation(2, 3, '*')).toBe(6);
  });
  it('multiply -2 * 15 should equal -30', async () => {
    (axios.post as jest.Mock).mockImplementation(()=>Promise.resolve({ status: 201, data: -30}))
    expect(await fetchCalculation(-2, 15, '*')).toBe(-30);
  });

  it('divide 21 / 7 should equal 3', async () => {
    (axios.post as jest.Mock).mockImplementation(()=>Promise.resolve({ status: 201, data: 3}))
    expect(await fetchCalculation(21, 7, '/')).toBe(3);
  });
  it('divide 99 / -11 should equal -9', async () => {
    (axios.post as jest.Mock).mockImplementation(()=>Promise.resolve({ status: 201, data: -9}))
    expect(await fetchCalculation(99, -11, '/')).toBe(-9);
  });
})
