import { Route, Routes } from 'react-router-dom'
import UserSetting from './pages/UserSetting'
import Account from './pages/UserSetting/Account'
import Profile from './pages/UserSetting/Profile'
import Privacy from './pages/UserSetting/Privacy'
import Preferences from './pages/UserSetting/Preferences'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Layout from './layout'
import UserProfile from './pages/UserProfile'
import ProfileComment from './pages/UserProfile/ProfileComment'
import UpvotedThreads from './pages/UserProfile/UpvotedThreads'
import Realm from './pages/Realm'
import CreateThread from './pages/Realm/CreateThread';
import ThreadContent from './pages/Thread/ThreadContent'
import RealmManagement from './pages/RealmManagement'
import Search from './pages/Search'
import NotFound from './pages/NotFound'
import "./App.css";
import ApiLoadingOverlay from "./components/ApiLoadingOverlay";

function App() {

  return (
    <>
    <ApiLoadingOverlay />
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/popular" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/settings" element={<UserSetting />}>
          <Route path='account' element={<Account />} />
          <Route path='profile' element={<Profile />} />
          <Route path='privacy' element={<Privacy />} />
          <Route path='preferences' element={<Preferences />} />
        </Route>
        <Route path="/profile" element={<UserProfile />}>
          <Route path="comment" element={<ProfileComment />}/>
          <Route path="upvoted" element={<UpvotedThreads />}/>
        </Route>
        <Route path="/user/:username" element={<UserProfile />}>
          <Route path="comment" element={<ProfileComment />}/>
          <Route path="upvoted" element={<UpvotedThreads />}/>
        </Route>
        <Route path="/r/:name" element={<Realm />} />
        <Route path="/r/:name/create" element={<CreateThread />} />
        <Route path="/r/:name/:id" element={<ThreadContent />} />
        <Route path="/r/:name/manage" element={<RealmManagement />} />
        <Route path="/realm/:name" element={<Realm />} />
        <Route path="/realm/:name/create" element={<CreateThread />} />
        <Route path="/realm/:name/:id" element={<ThreadContent />} />
        <Route path="/realm/:name/manage" element={<RealmManagement />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
