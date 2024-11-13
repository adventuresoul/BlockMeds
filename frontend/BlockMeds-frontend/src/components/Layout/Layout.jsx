import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

// The below function wraps the child element with Navbar and Footer component
const Layout = ({ children }) => {
    return (
      <div>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    );
  };

export default Layout;