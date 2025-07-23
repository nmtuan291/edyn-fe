import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header'
import ThreadCard from './components/ThreadCard'
import ForumBanner from './components/ForumBanner'
import Sidebar from './components/Sidebar'
import Forum from './pages/Realm'
import ForumDescription from './components/ForumDescription'
import ThreadContent from './pages/Thread/ThreadContent'
import LoginForm from './components/LoginForm'
import RegistrationForm from './components/RegistrationForm'
import MobileSidebar from './components/MobileSidebar/MobileSidebar'
import UserSetting from './pages/UserSetting'
import { Route, Routes } from 'react-router-dom'
import Account from './pages/UserSetting/Account'
import Profile from './pages/UserSetting/Profile'
import Privacy from './pages/UserSetting/Privacy'
import Preferences from './pages/UserSetting/Preferences'
import Home from './pages/Home'
import Layout from './layout'
import BottomSheet from './components/BottomSheet'
import UserProfile from './pages/UserProfile'
import ProfileComment from './pages/UserProfile/ProfileComment'
import UpvotedThreads from './pages/UserProfile/UpvotedThreads'
import CreateForum from './components/CreateForum'
import Realm from './pages/Realm'
import CreateThread from './pages/Realm/CreateThread';
import "./App.css";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/settings" element={<UserSetting />}>
          <Route path='account' element={<Account />} />
          <Route path='profile' element={<Profile />} />
          <Route path='privacy' element={<Privacy />} />
          <Route path='preferences' element={<Preferences />} />
        </Route>
        {/* <Route path="/test" element={<BottomSheet title="test">
          <div>
            <input placeholder='asdasd'></input>
            <input placeholder='asdasd'></input>
            <input placeholder='asdasd'></input>
            <input placeholder='asdasd'></input>
            <input placeholder='asdasd'></input>
            <p className="h-3xl border p-50">asdasdadasdas</p>
          </div>
        </BottomSheet>}></Route> */}
        <Route path="/profile" element={<UserProfile />}>
          <Route path="comment" element={<ProfileComment />}/>
          <Route path="upvoted" element={<UpvotedThreads />}/>
        </Route>
        <Route path="/r/:name" element={<Realm />} />
        <Route path='/r/:name/create' element={<CreateThread />} />
      </Route>
    </Routes>
  )
}

export default App
