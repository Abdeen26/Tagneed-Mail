"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

//Icons
import { MdMenu } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";

const NavLink = ({ href, label }) => {
  const pathName = usePathname();

  return (
    <Link href={href} className="relative hover:drop-shadow-md">
      <div className="text-wrap w-fit relative">
        {label}
        {pathName === href && (
          <div className="absolute left-0 w-full h-1 opacity-70 rounded-full drop-shadow-md bg-thirdcolor"></div>
        )}
      </div>
    </Link>
  );
};

const Header = () => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sideMenuRef = useRef(null);
  const pathName = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const [fixedHeader, setFixedHeader] = useState(false);

  const fixHeader = () => {
    if (!fixedHeader && window.pageYOffset > 40) {
      setFixedHeader(true);
    } else if (fixedHeader && window.pageYOffset <= 40) {
      setFixedHeader(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", fixHeader);
    return () => {
      window.removeEventListener("scroll", fixHeader);
    };
  }, [fixedHeader]);

  useEffect(() => {
    setShowSideMenu(false);
    const handleClickOutside = (event) => {
      if (sideMenuRef.current && !sideMenuRef.current.contains(event.target)) {
        setShowSideMenu(false); // Close side menu if clicked outside
      }
    };

    // Add the event listener on mousedown or click
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup: Remove the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathName]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    // Run the check on component mount
    handleResize();
    // Add event listener to window resize
    window.addEventListener("resize", handleResize);
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({
      redirect: false,
      headers: { "x-api-key": process.env.NEXT_PUBLIC_INTERNAL_API_KEY },
    });
    router.push("/");
  };

  return (
    <>
      {/* Fixed Top Header */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: "tween",
            duration: 0.5,
            ease: "easeInOut",
          }}
          className={`group transition-all duration-300 overflow-hidden shadow-md fixed z-20 w-full bg-opacity-70 bg-gradient-to-t ${
            fixedHeader ? "md:py-4 max-md:py-2" : "md:py-3 max-md:py-2"
          } md:px-6 max-md:px-4 to-slate-100 from-white flex justify-center items-center transition duration-300`}
        >
          <div className="max-w-7xl flex flex-row items-center justify-between w-full relative h-full">
            <Link
              href={"/"}
              className={`${
                fixedHeader
                  ? "md:h-[50px] md:w-[50px]"
                  : "md:h-[70px] md:w-[70px]"
              } h-[55px] w-[55px] relative flex items-center justify-center hover:drop-shadow-md transition-all duration-1000`}
            >
              <Image
                src={"/Images/TagneedMail.webp"}
                fill
                sizes="50px"
                alt="Tagneed Mail Logo"
                className="object-contain object-center transition duration-300 rounded-full hover:scale-105"
              />
            </Link>

            {/* Desktop Menu */}
            <div
              className={`${
                !fixedHeader && "gap-0"
              } flex flex-col max-lg:flex-row items-center justify-end transition-all duration-300`}
            >
              {session?.user && (
                <div className="capitalize w-full flex flex-row items-center font-semibold justify-end gap-4">
                  <p className="text-xl text-secondcolor">
                    {session.user.name}
                  </p>
                  <p className="transition duration-300 hover:drop-shadow-md cursor-pointer hover:scale-105">
                    <FaSignOutAlt
                      onClick={handleSignOut}
                      color="red"
                      size={20}
                    />
                  </p>
                </div>
              )}
              <div className="flex flex-row gap-8 font-semibold text-2xl max-lg:hidden transition-all duration-300">
                <NavLink href={"/"} label={"Inbox"} />
                {!session?.user && (
                  <NavLink href={"/auth/login"} label={"Login"} />
                )}
                <NavLink href={"/auth/register"} label={"Register"} />
              </div>
              <div className="lg:hidden">
                <MdMenu
                  size={45}
                  className="hover:drop-shadow-md m-1"
                  onClick={() => setShowSideMenu(true)}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && showSideMenu && (
          <motion.div
            ref={sideMenuRef}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "tween",
              duration: 0.5,
              ease: "easeInOut",
            }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-0 right-0 bg-maincolor h-screen z-50 p-8 flex flex-col gap-8 font-semibold text-2xl lg:hidden"
          >
            <IoMdClose size={30} onClick={() => setShowSideMenu(false)} />
            <NavLink href={"/"} label={"Inbox"} />
            <NavLink href={"/auth/login"} label={"Login"} />
            <NavLink href={"/auth/register"} label={"Register"} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
