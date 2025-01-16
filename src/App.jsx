import { BrowserRouter, Route, Routes } from "react-router-dom"

import './App.css'

import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"

import ProtectedRoute from "./components/ProtectedRoute"

import MainPage from "./components/MainPage"
import ProfilePage from "./components/ProfilePage"
import OtherProfilePage from "./components/OtherProfilePage"
import ProfileSettings from "./components/ProfileSettings"

import BrowseChatsPage from "./components/BrowseChatsPages"
import ChatPage from "./components/ChatPage"

import PostPage from "./components/PostPage"
import SeePostpage from "./components/SeePostPage"

import CreateCommunityPage from "./components/CreateCommunityPage"
import CommunityPage from "./components/CommunityPage"
import BannedPage from "./components/BannedPage"

function App() {

  return (
    <>

      {/* Routes of the website */}
      <BrowserRouter>

        <Routes>

          {/* Login page route */}
          <Route path="/" element={<LoginPage />} />

          {/* Register page route */}
          <Route path="/register" element={<RegisterPage />} />

          {/* A protected route so anyone that don't have an account can't enter */}
          <Route element={<ProtectedRoute />}>

            {/* Main page route */}
            <Route path="/main-page" element={<MainPage />} />

            {/* Profile page of user route */}
            <Route path="/main-page/profile-page" element={<ProfilePage />} />

            <Route path="/main-page/other-profile-page" element={<OtherProfilePage />} />

            <Route path="/main-page/profile-page/post-page" element={<PostPage />} />

            <Route path="/main-page/profile-page/community-creation-page" element={<CreateCommunityPage />} />

            <Route path="/main-page/profile-page/community-page" element={<CommunityPage />} />

            <Route path="/main-page/see-post-page" element={<SeePostpage />} />

            <Route path="/main-page/browse-chats" element={<BrowseChatsPage />} />

            <Route path="/main-page/chat-page" element={<ChatPage />} />

            <Route path="/main-page/profile-settings" element={<ProfileSettings />} />

          </Route>

          <Route path="/banned-page" element={<BannedPage />} />

        </Routes>

      </BrowserRouter>

    </>
  )
}

export default App
