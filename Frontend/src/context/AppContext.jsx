import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext(); //creates a global data container

export const AppContextProvider = ({ children }) => {
  //----->this is the wraps of my whole application------<//
  const navigate = useNavigate();
  const [user, setUser] = useState(null); //store loggin user
  const [chats, setChats] = useState([]); //this is use for which chat is currently open(needed ui like chatgpt sidebar)
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); //stores dark and lght mode
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: token },
        
      });
      

      if (data.success) {
        setUser(data.user);
        
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingUser(false);
    }
  };
  const createNewChat = async () => {
    try {
      if (!user) return toast("login to create a new chat");
      navigate("/");
      await axios.get("/api/chat/create", {
        headers: { Authorization: token },
      });
      await fetchUserChats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserChats = async () => {
    //use for loads chats and automatically select the first charts
    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setChats(data.chats);
        //if the user has no chat

        if (data.chats.length === 0) {
          await createNewChat();
          return fetchUserChats();
        } else {
          setSelectedChat(data.chats[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    //this use effct iis runs when user changes
    if (user) {
      fetchUserChats();
    } else {
      //logic is if logged in -load charts
      //not lloged in chats clear
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      fetchUser(); //this is runs only once whhen app start and loads the user automatically
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  const value = {
    //this shares globally any components can access these
    navigate,
    user,
    setUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUserChats,
    token,
    setToken,
    axios,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>; //wraps the app and gives acess to all data
};

export const useAppContext = () => useContext(AppContext);





















/*import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // ✅ get clean token
  const getStoredToken = () => {
    const t = localStorage.getItem("token");
    return t ? t.replace(/"/g, "") : null;
  };

  const [token, setToken] = useState(getStoredToken());
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ attach Bearer token globally
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
      console.log("✅ TOKEN SET:", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // ---------------- USER ----------------
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data");

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("❌ fetchUser error:", error.response);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  // ---------------- CHAT ----------------
  const createNewChat = async () => {
    try {
      if (!user) return toast("Login to create a new chat");

      navigate("/");
      await axios.get("/api/chat/create");
      await fetchUserChats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserChats = async () => {
    try {
      const { data } = await axios.get("/api/chat/get");

      if (data.success) {
        setChats(data.chats);

        if (data.chats.length === 0) {
          await createNewChat();
          return fetchUserChats();
        } else {
          setSelectedChat(data.chats[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("❌ fetchChats error:", error.response);
      toast.error(error.message);
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  const value = {
    navigate,
    user,
    setUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUserChats,
    token,
    setToken,
    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);*/