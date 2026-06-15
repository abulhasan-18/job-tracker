import "./globals.css";

export const metadata = {
  title: "Job Tracker Dashboard",
  description: "A professional Next.js dashboard for tracking job applications in Postgres.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
