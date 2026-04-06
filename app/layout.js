import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Vignan IPL Quiz & Auction',
  description: 'The official Vignan\'s Institute of Information & Technology IPL Quiz & Player Auction game. Earn coins, bid on superstars, and build the best team!',
  keywords: 'IPL, Vignan, Quiz, Auction, Cricket',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
<head>
        <link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/a/ae/Vignan_logo.png" />
        </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
