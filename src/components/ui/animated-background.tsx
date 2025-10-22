"use client"

import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <ShaderGradient
          control='props'
          type='plane'
          animate='on'
          uTime={0}
          uSpeed={0.3}
          uStrength={2.5}
          uDensity={1.0}
          uFrequency={5.5}
          uAmplitude={0}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={0}
          rotationZ={0}
          color1='#6366f1'  // indigo-500
          color2='#ec4899'  // pink-500  
          color3='#8b5cf6'  // violet-500
          reflection={0.1}
          wireframe={false}
          shader='defaults'
          cDistance={3.6}
          cPolarAngle={90}
          cAzimuthAngle={180}
          cameraZoom={1}
          lightType='3d'
          brightness={1.0}
          grain='on'
          grainBlending={1}
        />
      </ShaderGradientCanvas>
    </div>
  )
}
