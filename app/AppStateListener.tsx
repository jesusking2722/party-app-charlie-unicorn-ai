import { useEffect } from "react";
import useSocket from "@/hooks/useSocket";

const AppStateListener = () => {
  const { socketDisconnect } = useSocket();

  useEffect(() => {}, []);

  return null;
};

export default AppStateListener;
