// src/Layout.jsx
import { Outlet } from 'react-router-dom';
import Footer from '../Footer/Footer'; // Adjust path if necessary
import NavBar from '../NavBar/NavBar'; // Adjust path if necessary

const Layout = () => {
  return (
    // The outermost div now acts as a flex container
    // min-h-screen ensures it takes at least the full viewport height
    // flex flex-col arranges children vertically
    <div className="min-h-screen flex flex-col">
      <NavBar />
      {/* The main content area. flex-grow makes it expand to fill available space,
          pushing the footer down. pt-16 is preserved for spacing below the fixed NavBar. */}
      <main className="flex-grow pt-12 md:pt-14 lg:pt-15 bg-gray-50">
        <Outlet />  {/* this is where child pages (Home, Dashboard, etc.) will show */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
