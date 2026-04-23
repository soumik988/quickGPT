import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";

const AppContext = createContext(); //creates a global data container

export const AppContextProvider = ({ children }) => {
  //----->this is the wraps of my whole application------<//
  const navigate = useNavigate();
  const [user, setUser] = useState(null); //store loggin user
  const [chats, setChats] = useState([]); //this is use for which chat is currently open(needed ui like chatgpt sidebar)
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); //stores dark and lght mode
  const fetchUser = async () => {
    //use for api call and sets the user data
    setUser(dummyUserData);
  };

  const fetchUserChats = async () => {
    //use for loads chats and automatically select the first charts
    setChats(dummyChats);
    setSelectedChat(dummyChats[0]);
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
    localStorage.setItem('theme',theme)
  }, [theme]);

  useEffect(() => {
    fetchUser(); //this is runs only once whhen app start and loads the user automatically
  }, []);

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
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>; //wraps the app and gives acess to all data
};

export const useAppContext = () => useContext(AppContext);
