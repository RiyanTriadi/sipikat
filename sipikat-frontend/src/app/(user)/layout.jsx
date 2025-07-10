import Footer from '@/components/user/Footer';
import Navbar from '@/components/user/Navbar';

export default function UserLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
}