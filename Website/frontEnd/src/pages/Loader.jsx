import React, { useEffect, useRef } from 'react'
import uiia from "../assets/uiia.gif"
import loadingSound from "../assets/uiia.mp3" // Add your mp3 file to assets folder
import { Box } from '@mui/material'

function Loader() {
  const audioRef = useRef(null)

  useEffect(() => {
    // Autoplay the sound when component loads
    if (audioRef.current) {
      audioRef.current.play().catch((e) => {
        console.warn("Autoplay prevented by browser:", e)
      })
    }
  }, [])

  return (
    <Box 
      sx={{ 
        height: "100vh", 
        width: "100vw", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        position: "fixed", 
        top: 0, 
        left: 0,
        backgroundColor: "white"
      }}
    >
      <img 
        src={uiia} 
        alt="Loading..." 
        style={{ 
          width: "100vw",
          height: "100vh", 
          objectFit: "contain" 
        }} 
      />
      {/* Hidden audio player */}
      <audio ref={audioRef} src={loadingSound} loop />
    </Box>
  )
}

export default Loader
