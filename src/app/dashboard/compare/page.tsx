import { redirect } from "next/navigation";

/** Legacy route — compare lives under public `/compare` for all visitors. */
export default function DashboardCompareRedirectPage() {
  redirect("/compare");
}
