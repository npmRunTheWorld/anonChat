import { Link } from "react-router-dom";

const Navbar = () => {
  // States

  // Lifecycle

  // Functions

  return (
    <>
      <nav className="p-4 flex gap-2 justify-center items-center h-fit bg-gradient-to-b from-black from-10% via-transparent via-85% to-red-500/20">
        <Link to={"/"}>
          <img
            src="/AnonChatLogo.jpg"
            className="w-15 h-15 md:w-20 md:h-20 bg-white/80"
          />
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
