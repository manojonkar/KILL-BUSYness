import Header from "@/components/Header";
import VerifyContent from "./VerifyContent";
import { Suspense } from "react";

export default function VerifyLink() {
  return (
    <>
      <Header active="" />
      <main>
        <Suspense fallback={<p>Loading...</p>}>
          <VerifyContent />
        </Suspense>
      </main>
    </>
  );
}
