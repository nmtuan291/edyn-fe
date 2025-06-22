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

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header></Header>
      <ThreadContent />
    </>
  )
}

export default App
