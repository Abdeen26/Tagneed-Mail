"use client";

import { SessionProvider } from "next-auth/react";

export default function Provider({ children, session }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
// import { SessionProvider } from "next-auth/react";
// import DataProvider from "./DataContext";

// export default function Provider({ children, session }) {
//   return (
//     <SessionProvider session={session}>
//       <DataProvider>{children}</DataProvider>
//     </SessionProvider>
//   );
// }
