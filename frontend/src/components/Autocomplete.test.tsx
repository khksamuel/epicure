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

function FreeformAutocomplete({ onEnter }) {
  const [value, setValue] = useState("");
  return (
    <Autocomplete
      id="keyboard"
      value={value}
      onChange={setValue}
      onEnter={onEnter}
      onSelect={vi.fn()}
      options={["apple", "basil", "miso"]}
    />
  );
}

function StatefulAutocomplete(props) {
  const [value, setValue] = useState("");
  return <Autocomplete id="stateful" value={value} onChange={setValue} {...props} />;
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

  it("supports keyboard navigation, empty results, escape, and a free-form enter action", () => {
    const onEnter = vi.fn();
    render(<FreeformAutocomplete onEnter={onEnter} />);
    const input = screen.getByRole("combobox");

    input.focus();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "End" });
    expect(input).toHaveAttribute("aria-activedescendant", "keyboard-option-2");
    fireEvent.keyDown(input, { key: "Home" });
    expect(input).toHaveAttribute("aria-activedescendant", "keyboard-option-0");
    fireEvent.change(input, { target: { value: "zz" } });
    expect(screen.getByText("No matching option.")).toBeVisible();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it("filters excluded values and closes when the user clicks outside", () => {
    render(
      <Autocomplete
        id="excluded"
        value=""
        onChange={vi.fn()}
        onSelect={vi.fn()}
        options={["apple", "basil"]}
        exclude={["apple"]}
      />,
    );
    const input = screen.getByRole("combobox");

    input.focus();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.queryByRole("option", { name: "apple" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "basil" })).toBeVisible();
    fireEvent.pointerDown(document.body);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("handles upward navigation, empty-list arrows, and pointer highlighting", () => {
    render(<FreeformAutocomplete onEnter={vi.fn()} />);
    const input = screen.getByRole("combobox");

    input.focus();
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveAttribute("aria-activedescendant", "keyboard-option-0");
    fireEvent.mouseMove(screen.getByRole("option", { name: "miso" }));
    expect(input).toHaveAttribute("aria-activedescendant", "keyboard-option-2");

    fireEvent.change(input, { target: { value: "none" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(screen.getByText("No matching option.")).toBeVisible();
  });

  it("supports optional callbacks and selections that remain open and clear the input", () => {
    const frame = vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    render(
      <StatefulAutocomplete options={["apple", "basil"]} closeOnSelect={false} clearOnSelect />,
    );
    const input = screen.getByRole("combobox");

    input.focus();
    fireEvent.click(input);
    fireEvent.click(input);
    fireEvent.click(screen.getByRole("option", { name: "apple" }));

    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-expanded", "true");
    frame.mockRestore();
  });

  it("can execute the outside-click handler after its root has been released", () => {
    const listener = vi.fn();
    const addEventListener = vi
      .spyOn(document, "addEventListener")
      .mockImplementation((type, callback, options) => {
        if (type === "pointerdown")
          listener.mockImplementation(callback as (...args: any[]) => any);
        return EventTarget.prototype.addEventListener.call(document, type, callback, options);
      });
    const { unmount } = render(
      <Autocomplete id="released" value="" onChange={vi.fn()} options={["apple"]} />,
    );

    unmount();
    listener({ target: document.body });
    addEventListener.mockRestore();
  });
});
