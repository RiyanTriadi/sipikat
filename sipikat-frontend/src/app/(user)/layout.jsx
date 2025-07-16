import Footer from '@/components/user/Footer';
import Navbar from '@/components/user/Navbar';

export default function UserLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
}