import React, { useEffect, useRef } from 'react';

function AnimatedBackground({ children, variant = 'default' }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    const draw = () => {
      const { width, height } = canvas;
      
      // Create gradient based on variant
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      if (variant === 'hero') {
        gradient.addColorStop(0, `rgba(249, 250, 251, ${0.3 + Math.sin(time) * 0.1})`);
        gradient.addColorStop(0.5, `rgba(224, 231, 255, ${0.2 + Math.cos(time * 0.8) * 0.1})`);
        gradient.addColorStop(1, `rgba(238, 242, 255, ${0.3 + Math.sin(time * 1.2) * 0.1})`);
      } else if (variant === 'testimonials') {
        gradient.addColorStop(0, `rgba(254, 252, 232, ${0.3 + Math.sin(time) * 0.1})`);
        gradient.addColorStop(0.5, `rgba(255, 247, 237, ${0.2 + Math.cos(time * 0.8) * 0.1})`);
        gradient.addColorStop(1, `rgba(243, 244, 246, ${0.3 + Math.sin(time * 1.2) * 0.1})`);
      } else {
        gradient.addColorStop(0, 'rgba(249, 250, 251, 1)');
        gradient.addColorStop(1, 'rgba(249, 250, 251, 1)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      time += 0.005;
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);
  
  return (
    <div className="relative overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default AnimatedBackground;