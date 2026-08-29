import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Autocomplete } from "./Autocomplete";

function TestAutocomplete() {
  const [value, setValue] = useState("miso");
  return (
    <Autocomplete
      id="ingredient"
      value={value}
      onChange={setValue}
      onSelect={vi.fn()}
      options={["apple", "basil", "miso"]}
    />
  );
}

describe("Autocomplete", () => {
  afterEach(cleanup);

  it("reopens with one click while the input remains focused after a selection", () => {
    render(<TestAutocomplete />);
    const input = screen.getByRole("combobox");

    input.focus();
    fireEvent.change(input, { target: { value: "app" } });
    const apple = screen.getByRole("option", { name: "apple" });
    fireEvent.mouseDown(apple);
    fireEvent.click(apple);

    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(input);

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "basil" })).toBeVisible();
  });

  it("selects the highlighted option with the keyboard", () => {
    render(<TestAutocomplete />);
    const input = screen.getByRole("combobox");

    input.focus();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("basil");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
