import React, { useEffect, useRef, useState } from 'react';

const FirstQuestionCelebration = ({ isOpen, onClose, question, onAnswerClick }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isExiting, setIsExiting] = useState(false);

  // Confetti particle system
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Confetti particles
    const particles = [];
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    const particleCount = 150;

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height - canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = Math.random() * 3 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.size = Math.random() * 8 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = 1;
        this.gravity = 0.3;
        this.life = 100;
      }

      update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.life--;

        if (this.life < 20) {
          this.opacity = this.life / 20;
        }

        if (this.y > canvas.height || this.life <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Stop after 5 seconds
      if (elapsed < 5000) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen]);

  // Handle close with exit animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 300);
  };

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(handleClose, 10000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Format price
  const formatPrice = (cents, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '$';
    const amount = (cents || 0) / 100;
    return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  };

  // Get payer name
  const getPayerName = () => {
    if (!question) return 'Someone';
    const firstName = question.payer_first_name?.trim() || '';
    const lastName = question.payer_last_name?.trim() || '';
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return 'Someone';
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isExiting ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 2 }}
        onClick={handleClose}
      />

      {/* Content */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 ${
          isExiting ? 'scale-95' : 'scale-100'
        }`}
        style={{ zIndex: 3 }}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-black text-white mb-2">
            Your First Question!
          </h2>
          <p className="text-indigo-100 text-lg font-medium">
            This is the beginning of something great
          </p>
        </div>

        {/* Question Preview */}
        {question && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="bg-white rounded-xl p-4 border-2 border-indigo-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    From {getPayerName()}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {question.title || 'Question received'}
                  </h3>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">You'll earn</p>
                    <p className="text-2xl font-black text-green-600">
                      {formatPrice(question.price_cents, question.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {question.media_asset_id && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Video question</span>
                  </span>
                )}
                {question.sla_hours_snapshot && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{question.sla_hours_snapshot}h to answer</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 bg-white">
          <button
            onClick={() => {
              handleClose();
              onAnswerClick();
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] mb-3"
          >
            Answer Your First Question →
          </button>
          
          <button
            onClick={handleClose}
            className="w-full py-3 px-6 text-gray-600 hover:text-gray-800 font-semibold text-sm transition-colors"
          >
            I'll answer it later
          </button>

          {/* Encouragement */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              💡 <span className="font-semibold">Pro tip:</span> Answer quickly to build trust and get more questions!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstQuestionCelebration;