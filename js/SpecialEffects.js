// SpecialEffects.js - Efectos especiales y visuales

class SpecialEffects {
    constructor(ctx, particleSystem) {
        this.ctx = ctx;
        this.particleSystem = particleSystem;
        this.shakeAmount = 0;
        this.shakeDecay = 0.9;
        
        // Sistema de música de fondo
        this.backgroundMusic = null;
        this.musicVolume = 0.3;
    }

    // Iniciar música de fondo desde archivo
    startBackgroundMusic() {
        try {
            // Si ya hay música reproduciéndose, no hacer nada
            if (this.backgroundMusic && !this.backgroundMusic.paused) {
                return;
            }

            // Crear elemento de audio
            this.backgroundMusic = new Audio('audios/background-music.mp3');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.musicVolume;
            
            // Reproducir
            this.backgroundMusic.play().catch(e => {
                console.log('No se pudo reproducir la música automáticamente. El usuario debe interactuar primero.');
            });
        } catch (e) {
            console.log('Error al cargar música de fondo:', e);
        }
    }

    // Detener música de fondo
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    // Alternar música de fondo
    toggleMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.stopBackgroundMusic();
            return false;
        } else {
            this.startBackgroundMusic();
            return true;
        }
    }

    // Ajustar volumen de la música
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }

    createExplosion(x, y, color = '#FF6B6B') {
        this.particleSystem.emit(x, y, 25, color);
        this.shake(8);
    }

    createTrail(x, y, color = '#4ECDC4') {
        if (Math.random() < 0.2) {
            this.particleSystem.emit(x, y, 1, color);
        }
    }

    createCollectEffect(x, y) {
        this.particleSystem.emit(x, y, 15, '#FFD700');
        this.playSound('collect');
    }

    shake(amount) {
        this.shakeAmount = amount;
    }

    update() {
        this.shakeAmount *= this.shakeDecay;
        if (this.shakeAmount < 0.1) {
            this.shakeAmount = 0;
        }
    }

    applyShake() {
        if (this.shakeAmount > 0) {
            const shakeX = (Math.random() - 0.5) * this.shakeAmount;
            const shakeY = (Math.random() - 0.5) * this.shakeAmount;
            this.ctx.translate(shakeX, shakeY);
        }
    }

    drawGlow(x, y, radius, color) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    playSound(type) {
        // Síntesis de audio simple usando Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            switch(type) {
                case 'jump':
                    oscillator.frequency.value = 400;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    break;
                case 'collect':
                    oscillator.frequency.value = 800;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    break;
                case 'complete':
                    oscillator.frequency.value = 600;
                    oscillator.type = 'triangle';
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    break;
                case 'death':
                    oscillator.frequency.value = 150;
                    oscillator.type = 'sawtooth';
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
                    break;
            }

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Si hay error con el audio, simplemente no reproducir sonido
            console.log('Audio no disponible');
        }
    }
}