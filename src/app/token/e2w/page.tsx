import { redirect } from "next/navigation";

/** /token/e2w is a convenience alias; /token is canonical. */
export default function TokenE2WPage() {
  redirect("/token");
}
