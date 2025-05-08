import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Page from "./page";

describe("Home page", () => {
  it("add 10 + 20 should equal 30", async () => {
    render(<Page />);
    fireEvent.change(screen.getByPlaceholderText("a"), {
      target: {
        value: 10
      }
    })
    fireEvent.change(screen.getByPlaceholderText("b"), {
      target: {
        value: 20
      }
    })
    fireEvent.change(screen.getByDisplayValue("+"), {
      target: {
        value: "+"
      }
    })
    fireEvent.click(screen.getByText("Submit!"))
  
    await waitFor(()=>{
      expect(screen.getByText("30")).toBeInTheDocument()
    })
  });
  it("add -10 + 20 should equal 10", async () => {
    render(<Page />);
    fireEvent.change(screen.getByPlaceholderText("a"), {
      target: {
        value: -10
      }
    })
    fireEvent.change(screen.getByPlaceholderText("b"), {
      target: {
        value: 20
      }
    })
    fireEvent.change(screen.getByDisplayValue("+"), {
      target: {
        value: "+"
      }
    })
    fireEvent.click(screen.getByText("Submit!"))
  
    await waitFor(()=>{
      expect(screen.getByText("10")).toBeInTheDocument()
    })
  });
  
  it("minus 5 - 15 should equal -10", async () => {
    render(<Page />);
    fireEvent.change(screen.getByPlaceholderText("a"), {
      target: {
        value: 5
      }
    })
    fireEvent.change(screen.getByPlaceholderText("b"), {
      target: {
        value: 15
      }
    })
    fireEvent.change(screen.getByDisplayValue("+"), {
      target: {
        value: "-"
      }
    })
    fireEvent.click(screen.getByText("Submit!"))
  
    await waitFor(()=>{
      expect(screen.getByText("-10")).toBeInTheDocument()
    })
  });
  it("minus 21 - 7 should equal 14", async () => {
    render(<Page />);
    fireEvent.change(screen.getByPlaceholderText("a"), {
      target: {
        value: 21
      }
    })
    fireEvent.change(screen.getByPlaceholderText("b"), {
      target: {
        value: 7
      }
    })
    fireEvent.change(screen.getByDisplayValue("+"), {
      target: {
        value: "-"
      }
    })
    fireEvent.click(screen.getByText("Submit!"))
  
    await waitFor(()=>{
      expect(screen.getByText("14")).toBeInTheDocument()
    })
  });
  
  it("multiply 2 * 3 should equal 6", async () => {
    render(<Page />);
    fireEvent.change(screen.getByPlaceholderText("a"), {
      target: {
        value: 2
      }
    })
    fireEvent.change(screen.getByPlaceholderText("b"), {
      target: {
        value: 3
      }
    })
    fireEvent.change(screen.getByDisplayValue("+"), {
      target: {
        value: "*"
      }
    })
    fireEvent.click(screen.getByText("Submit!"))
  
    await waitFor(()=>{
      expect(screen.getByText("6")).toBeInTheDocument()
    })
  });
  it("multiply -2 * 15 should equal -30", async () => {
    render(<Page />);
    fireEvent.change(screen.getByPlaceholderText("a"), {
      target: {
        value: -2
      }
    })
    fireEvent.change(screen.getByPlaceholderText("b"), {
      target: {
        value: 15
      }
    })
    fireEvent.change(screen.getByDisplayValue("+"), {
      target: {
        value: "*"
      }
    })
    fireEvent.click(screen.getByText("Submit!"))
  
    await waitFor(()=>{
      expect(screen.getByText("-30")).toBeInTheDocument()
    })
  });

  it("divide 21 / 7 should equal 3", async () => {
    render(<Page />);
    fireEvent.change(screen.getByPlaceholderText("a"), {
      target: {
        value: 21
      }
    })
    fireEvent.change(screen.getByPlaceholderText("b"), {
      target: {
        value: 7
      }
    })
    fireEvent.change(screen.getByDisplayValue("+"), {
      target: {
        value: "/"
      }
    })
    fireEvent.click(screen.getByText("Submit!"))
  
    await waitFor(()=>{
      expect(screen.getByText("3")).toBeInTheDocument()
    })
  });
  it("divide 99 / -11 should equal -9", async () => {
    render(<Page />);
    fireEvent.change(screen.getByPlaceholderText("a"), {
      target: {
        value: 99
      }
    })
    fireEvent.change(screen.getByPlaceholderText("b"), {
      target: {
        value: -11
      }
    })
    fireEvent.change(screen.getByDisplayValue("+"), {
      target: {
        value: "/"
      }
    })
    fireEvent.click(screen.getByText("Submit!"))
  
    await waitFor(()=>{
      expect(screen.getByText("-9")).toBeInTheDocument()
    })
  });
})
