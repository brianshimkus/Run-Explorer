import { it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
function mount() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
  return userEvent.setup();
}
it("loads and filters runs through the mocked network", async () => {
  const user = mount();
  expect(screen.getByRole("status")).toHaveTextContent("Loading runs");
  await screen.findByRole("button", { name: "run-001" });
  await user.selectOptions(screen.getByLabelText("Status"), "failed");
  await waitFor(() =>
    expect(screen.getByText("6 matching runs")).toBeInTheDocument(),
  );
  expect(window.location.search).toContain("status=failed");
});
it("explains an empty response", async () => {
  window.history.replaceState({}, "", "/?scenario=empty");
  mount();
  expect(await screen.findByText(/No runs on this page/)).toBeInTheDocument();
});
it("shows a recoverable error", async () => {
  window.history.replaceState({}, "", "/?scenario=error");
  mount();
  expect(await screen.findByRole("alert")).toHaveTextContent("503");
  expect(
    screen.getByRole("button", { name: "Retry runs" }),
  ).toBeInTheDocument();
});
