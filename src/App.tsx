import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header'
import ThreadCard from './components/ThreadCard'
import ForumBanner from './components/ForumBanner'
import Sidebar from './components/Sidebar'
import Forum from './pages/Forum'
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

function App() {
  const [count, setCount] = useState(0)

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
        <Route path="/test" element={<BottomSheet title="test">
          <div>
            <input placeholder='asdasd'></input>
            <input placeholder='asdasd'></input>
            <input placeholder='asdasd'></input>
            <input placeholder='asdasd'></input>
            <input placeholder='asdasd'></input>
            <p className="h-3xl border p-50">asdasdadasdas</p>
          </div>
        </BottomSheet>}></Route>
      </Route>
    </Routes>
  )
}

export default App
