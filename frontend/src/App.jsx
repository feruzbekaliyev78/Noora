import { Routes, Route, Navigate } from 'react-router-dom'
import Splash from './screens/Splash'
import ProfileSetup from './screens/ProfileSetup'
import Onboarding from './screens/Onboarding'
import Camera from './screens/Camera'
import Analyzing from './screens/Analyzing'
import Result from './screens/Result'
import ShareCard from './screens/ShareCard'
import Tracking from './screens/Tracking'
import Battle from './screens/Battle'
import Toast from './components/Toast'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/result" element={<Result />} />
        <Route path="/share" element={<ShareCard />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}
