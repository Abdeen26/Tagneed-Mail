export const metadata = {
  title: "Tagneed Mail",
};

const Layout = ({ children }) => {
  return (
    <>
      <div className="w-full flex flex-col justify-start items-start">
        {/* Header Gap */}
        <div className="md:h-[94px] h-[71px] -z-20"></div>
        <div className="flex-grow w-full justify-center flex relative">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
