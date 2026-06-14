import { useEffect, useRef } from 'react';

const SakuraEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Sakura {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 15 + 10;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.02 - 0.01;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        this.color = this.getRandomColor();
      }

      getRandomColor() {
        const colors = [
          'rgba(216, 180, 254, ',   // violet-300
          'rgba(192, 132, 252, ',   // purple-400
          'rgba(233, 213, 255, ',   // purple-200
          'rgba(221, 214, 254, ',   // violet-200
          'rgba(196, 181, 253, ',   // violet-300
          'rgba(167, 139, 250, ',   // violet-400
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5 + this.speedX;
        this.rotation += this.rotationSpeed;
        this.speedX += (Math.random() - 0.5) * 0.01;

        if (this.y > canvas.height + 50) {
          this.reset();
          this.y = -20;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color + (this.opacity) + ')';

        // Draw petal shape
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.bezierCurveTo(
          this.size / 2, -this.size / 4,
          this.size / 2, this.size / 4,
          0, this.size / 2
        );
        ctx.bezierCurveTo(
          -this.size / 2, this.size / 4,
          -this.size / 2, -this.size / 4,
          0, -this.size / 2
        );
        ctx.fill();

        // Draw petal highlight
        ctx.globalAlpha = this.opacity * 0.3;
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.opacity * 0.5) + ')';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 6, this.size / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    const petalCount = Math.min(50, Math.floor(canvas.width / 30));
    const sakuras = Array.from({ length: petalCount }, () => new Sakura());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sakuras.forEach((sakura) => {
        sakura.update();
        sakura.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default SakuraEffect;
