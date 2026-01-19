import "./globals.css";
import ClientProviders from "../components/ClientProviders";

export const metadata = {
  title: "Edu-Ultra - AI-Powered Education Platform",
  description: "Innovate • Inspire • Iterate",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
