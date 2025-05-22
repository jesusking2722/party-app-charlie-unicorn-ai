import { useEffect } from "react";
import useSocket from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

const AppStateListener = () => {
  const {} = useSocket();
  const {} = useAuth();

  useEffect(() => {}, []);

  return null;
};

export default AppStateListener;
