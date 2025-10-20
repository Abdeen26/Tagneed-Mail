export const metadata = {
  title: "Tagneed Mail - Login",
};

const Layout = ({ children }) => {
  return (
    <>
      <div className="w-full flex flex-col h-full justify-center">
        {/* Header Gap */}
        <div className="md:h-[94px] h-[71px] -z-20"></div>
        <div className="flex-grow">{children}</div>
      </div>
    </>
  );
};

export default Layout;
