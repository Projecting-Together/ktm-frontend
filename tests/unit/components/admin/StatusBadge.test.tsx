import { renderToStaticMarkup } from "react-dom/server";
import { StatusBadge } from "@/components/admin/StatusBadge";

describe("StatusBadge", () => {
  it("renders pending label by default for pending status", () => {
    const html = renderToStaticMarkup(<StatusBadge status="pending" />);
    expect(html).toContain("Pending");
  });
});
