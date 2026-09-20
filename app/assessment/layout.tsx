import Header from "@/components/Header";

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
