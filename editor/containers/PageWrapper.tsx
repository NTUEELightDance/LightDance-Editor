import { ReactNode } from "react";

export interface PageWrapperProps {
  children: ReactNode
}

export default function PageWrapper ({ children }: PageWrapperProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh"
      }}
    >
      {children}
    </div>
  );
}
