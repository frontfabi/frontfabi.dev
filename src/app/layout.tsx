import StyledComponentsRegistry from "./lib/registry";

import "../theme/global.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className="light">
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
