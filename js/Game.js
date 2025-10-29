// Game.js - Clase principal del juego con física de plataformas

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 1000;
        this.canvas.height = 600;
        
        this.particleSystem = new ParticleSystem();
        this.specialEffects = new SpecialEffects(this.ctx, this.particleSystem);
        this.levelManager = new LevelManager();
        
        this.gameState = 'playing';
        this.score = 0;  // SIEMPRE inicia en 0
        this.deaths = 0;
        this.time = 0;
        this.startTime = 0;
        
        // Jugador con física de plataformas
        this.player = {
            x: 50,
            y: 100,
            width: 20,
            height: 20,
            vx: 0,
            vy: 0,
            speed: 4,
            jumpPower: 10,
            gravity: 0.5,
            maxFallSpeed: 15,
            onGround: false,
            color: '#4ECDC4'
        };
        
        this.keys = {};
        this.setupControls();
        this.cellSize = 30;
        
        // NO cargar progreso automáticamente - siempre empezar desde 0
    }

    setupControls() {
        let musicStarted = false;
        
        const tryStartMusic = () => {
            if (!musicStarted && this.gameState === 'playing') {
                this.specialEffects.startBackgroundMusic();
                musicStarted = true;
                console.log('🎵 Música iniciada con primer input');
            }
        };
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Intentar iniciar música con el primer input
            tryStartMusic();
            
            // Saltar solo si está en el suelo
            if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && this.player.onGround && this.gameState === 'playing') {
                this.player.vy = -this.player.jumpPower;
                this.player.onGround = false;
                this.specialEffects.playSound('jump');
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    start() {
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.resetPlayer();
        this.levelManager.resetLevel();
        this.time = 0;
        
        // NO iniciar música aquí porque el navegador lo bloquea
        // La música se iniciará con el primer input del jugador
        
        this.gameLoop();
    }

    resetPlayer() {
        const level = this.levelManager.getCurrentLevel();
        // Buscar posición de inicio (2)
        for (let y = 0; y < level.maze.length; y++) {
            for (let x = 0; x < level.maze[y].length; x++) {
                if (level.maze[y][x] === 2) {
                    this.player.x = x * this.cellSize + 5;
                    this.player.y = y * this.cellSize + 5;
                    this.player.vx = 0;
                    this.player.vy = 0;
                    this.player.onGround = false;
                    return;
                }
            }
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.time = Math.floor((Date.now() - this.startTime) / 1000);

        // Movimiento horizontal
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.vx = -this.player.speed;
        } else if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.vx = this.player.speed;
        } else {
            this.player.vx = 0;
        }

        // Aplicar gravedad
        this.player.vy += this.player.gravity;
        if (this.player.vy > this.player.maxFallSpeed) {
            this.player.vy = this.player.maxFallSpeed;
        }

        // Mover y verificar colisiones
        this.movePlayer();

        // Verificar muerte por pinchos
        this.checkSpikes();

        // Verificar colección de items
        this.checkCollectibles();

        // Verificar meta
        this.checkGoal();

        // Actualizar sistemas
        this.particleSystem.update();
        this.specialEffects.update();

        // Trail effect
        if (Math.abs(this.player.vx) > 0) {
            this.specialEffects.createTrail(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2
            );
        }
    }

    movePlayer() {
        const level = this.levelManager.getCurrentLevel();
        
        // Movimiento horizontal
        this.player.x += this.player.vx;
        
        // Colisión horizontal
        if (this.checkCollision(this.player.x, this.player.y)) {
            this.player.x -= this.player.vx;
        }

        // Movimiento vertical
        this.player.y += this.player.vy;
        
        // Colisión vertical
        this.player.onGround = false;
        if (this.checkCollision(this.player.x, this.player.y)) {
            this.player.y -= this.player.vy;
            
            if (this.player.vy > 0) {
                this.player.onGround = true;
            }
            this.player.vy = 0;
        }
    }

    checkCollision(x, y) {
        const level = this.levelManager.getCurrentLevel();
        
        // Verificar las 4 esquinas del jugador
        const corners = [
            { x: x, y: y },
            { x: x + this.player.width, y: y },
            { x: x, y: y + this.player.height },
            { x: x + this.player.width, y: y + this.player.height }
        ];

        for (let corner of corners) {
            const gridX = Math.floor(corner.x / this.cellSize);
            const gridY = Math.floor(corner.y / this.cellSize);

            if (gridY >= 0 && gridY < level.maze.length && 
                gridX >= 0 && gridX < level.maze[0].length) {
                const cell = level.maze[gridY][gridX];
                if (cell === 1) {
                    return true;
                }
            }
        }

        return false;
    }

    checkSpikes() {
        const level = this.levelManager.getCurrentLevel();
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const gridX = Math.floor(playerCenterX / this.cellSize);
        const gridY = Math.floor(playerCenterY / this.cellSize);

        if (gridY >= 0 && gridY < level.maze.length && 
            gridX >= 0 && gridX < level.maze[0].length) {
            const cell = level.maze[gridY][gridX];
            
            // 4 = pincho abajo, 5 = pincho arriba, 6 = pincho izquierda, 7 = pincho derecha
            if (cell === 4 || cell === 5 || cell === 6 || cell === 7) {
                this.die();
            }
        }
    }

    checkCollectibles() {
        const level = this.levelManager.getCurrentLevel();
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;

        level.collectibles.forEach(collectible => {
            if (!collectible.collected) {
                const collectX = collectible.x * this.cellSize + this.cellSize / 2;
                const collectY = collectible.y * this.cellSize + this.cellSize / 2;
                const dist = Math.hypot(playerCenterX - collectX, playerCenterY - collectY);

                if (dist < 20) {
                    collectible.collected = true;
                    this.score += 100;
                    this.specialEffects.playSound('collect');
                    this.specialEffects.createExplosion(collectX, collectY, '#FFD700');
                }
            }
        });
    }

    checkGoal() {
        const level = this.levelManager.getCurrentLevel();
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const gridX = Math.floor(playerCenterX / this.cellSize);
        const gridY = Math.floor(playerCenterY / this.cellSize);

        if (gridY >= 0 && gridY < level.maze.length && 
            gridX >= 0 && gridX < level.maze[0].length) {
            if (level.maze[gridY][gridX] === 3) {
                this.levelComplete();
            }
        }
    }

    die() {
        this.deaths++;
        this.specialEffects.createExplosion(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            '#FF6B6B'
        );
        this.specialEffects.playSound('death');
        this.resetPlayer();
    }

    levelComplete() {
        this.gameState = 'levelComplete';
        // Solo sumar 500 puntos base por completar nivel
        // El bonus por tiempo solo se suma si hay un buen tiempo (menos de 60 segundos)
        const basePoints = 500;
        const timeBonus = this.time < 60 ? Math.max(0, 60 - this.time) * 5 : 0;
        
        this.score += basePoints + timeBonus;
        
        console.log(`✅ Nivel completado! Base: ${basePoints} + Bonus: ${timeBonus} = Total sumado: ${basePoints + timeBonus}`);
        
        this.specialEffects.playSound('complete');
        this.specialEffects.createExplosion(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            '#FFD700'
        );
    }

    draw() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.specialEffects.applyShake();

        this.drawMaze();
        this.drawCollectibles();
        this.drawPlayer();
        this.particleSystem.draw(this.ctx);

        this.ctx.restore();
    }

    drawMaze() {
        const level = this.levelManager.getCurrentLevel();
        
        for (let y = 0; y < level.maze.length; y++) {
            for (let x = 0; x < level.maze[y].length; x++) {
                const cell = level.maze[y][x];
                const pixelX = x * this.cellSize;
                const pixelY = y * this.cellSize;

                if (cell === 1) {
                    // Pared/Piso
                    this.ctx.fillStyle = '#0f3460';
                    this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
                    this.ctx.strokeStyle = '#16213e';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
                } else if (cell === 3) {
                    // Meta
                    const pulse = Math.sin(Date.now() / 200) * 5;
                    this.ctx.fillStyle = '#00ff00';
                    this.ctx.fillRect(pixelX + 3, pixelY + 3, this.cellSize - 6, this.cellSize - 6);
                    
                    // Brillo
                    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                    this.ctx.fillRect(pixelX - pulse, pixelY - pulse, this.cellSize + pulse * 2, this.cellSize + pulse * 2);
                } else if (cell === 4) {
                    // Pincho abajo (en el piso)
                    this.drawSpike(pixelX, pixelY, 'down');
                } else if (cell === 5) {
                    // Pincho arriba (en el techo)
                    this.drawSpike(pixelX, pixelY, 'up');
                } else if (cell === 6) {
                    // Pincho izquierda
                    this.drawSpike(pixelX, pixelY, 'left');
                } else if (cell === 7) {
                    // Pincho derecha
                    this.drawSpike(pixelX, pixelY, 'right');
                }
            }
        }
    }

    drawSpike(x, y, direction) {
        this.ctx.fillStyle = '#ff4757';
        this.ctx.beginPath();

        const size = this.cellSize;
        
        if (direction === 'down') {
            // Pinchos apuntando hacia abajo
            for (let i = 0; i < 3; i++) {
                const offset = (size / 3) * i;
                this.ctx.moveTo(x + offset + 2, y);
                this.ctx.lineTo(x + offset + size / 6, y + size - 5);
                this.ctx.lineTo(x + offset + size / 3 - 2, y);
            }
        } else if (direction === 'up') {
            // Pinchos apuntando hacia arriba
            for (let i = 0; i < 3; i++) {
                const offset = (size / 3) * i;
                this.ctx.moveTo(x + offset + 2, y + size);
                this.ctx.lineTo(x + offset + size / 6, y + 5);
                this.ctx.lineTo(x + offset + size / 3 - 2, y + size);
            }
        } else if (direction === 'left') {
            // Pinchos apuntando hacia la izquierda
            for (let i = 0; i < 3; i++) {
                const offset = (size / 3) * i;
                this.ctx.moveTo(x + size, y + offset + 2);
                this.ctx.lineTo(x + 5, y + offset + size / 6);
                this.ctx.lineTo(x + size, y + offset + size / 3 - 2);
            }
        } else if (direction === 'right') {
            // Pinchos apuntando hacia la derecha
            for (let i = 0; i < 3; i++) {
                const offset = (size / 3) * i;
                this.ctx.moveTo(x, y + offset + 2);
                this.ctx.lineTo(x + size - 5, y + offset + size / 6);
                this.ctx.lineTo(x, y + offset + size / 3 - 2);
            }
        }

        this.ctx.closePath();
        this.ctx.fill();

        // Sombra del pincho
        this.ctx.fillStyle = '#c23616';
        this.ctx.fill();
    }

    drawCollectibles() {
        const level = this.levelManager.getCurrentLevel();
        
        level.collectibles.forEach(collectible => {
            if (!collectible.collected) {
                const pixelX = collectible.x * this.cellSize + this.cellSize / 2;
                const pixelY = collectible.y * this.cellSize + this.cellSize / 2;
                const pulse = Math.sin(Date.now() / 300) * 2;
                const rotation = Date.now() / 1000;

                this.ctx.save();
                this.ctx.translate(pixelX, pixelY);
                this.ctx.rotate(rotation);

                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                    const radius = i % 2 === 0 ? 8 + pulse : 4 + pulse / 2;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                this.ctx.fill();

                this.ctx.restore();
            }
        });
    }

    drawPlayer() {
        const x = this.player.x + this.player.width / 2;
        const y = this.player.y + this.player.height / 2;

        // Sombra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + this.player.height / 2 + 3, this.player.width / 2, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Cuerpo
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Borde
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Ojos
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x + 4, this.player.y + 5, 4, 4);
        this.ctx.fillRect(this.player.x + 12, this.player.y + 5, 4, 4);

        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 6, 2, 2);
        this.ctx.fillRect(this.player.x + 13, this.player.y + 6, 2, 2);
    }

    gameLoop() {
        this.update();
        this.draw();
        
        if (this.gameState === 'playing') {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    // Sistema de Leaderboard
    saveToLeaderboard(username) {
        try {
            const leaderboard = this.getLeaderboard();
            
            // Agregar nueva puntuación
            leaderboard.push({
                username: username,
                score: this.score,
                deaths: this.deaths,
                time: this.time,
                date: new Date().toLocaleDateString()
            });

            // Ordenar por score (descendente)
            leaderboard.sort((a, b) => b.score - a.score);

            // Mantener solo los top 5
            const top5 = leaderboard.slice(0, 5);

            // Guardar en localStorage
            localStorage.setItem('parkourMazeLeaderboard', JSON.stringify(top5));

            return top5;
        } catch (e) {
            console.log('Error al guardar en leaderboard:', e);
            return [];
        }
    }

    getLeaderboard() {
        try {
            const data = localStorage.getItem('parkourMazeLeaderboard');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.log('Error al cargar leaderboard:', e);
            return [];
        }
    }

    clearLeaderboard() {
        try {
            localStorage.removeItem('parkourMazeLeaderboard');
        } catch (e) {
            console.log('Error al limpiar leaderboard:', e);
        }
    }
}