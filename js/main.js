// main.js - Inicialización y control del juego

let game;
let statsInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);

    const levelCompleteScreen = document.getElementById('level-complete');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const gameCompleteScreen = document.getElementById('game-complete');
    const submitScoreBtn = document.getElementById('submit-score-btn');
    const usernameInput = document.getElementById('username-input');
    const playAgainBtn = document.getElementById('play-again-btn');
    const musicToggleBtn = document.getElementById('music-toggle');
    
    const levelDisplay = document.getElementById('level-display');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const deathsDisplay = document.getElementById('deaths');

    // Control de música
    let musicPlaying = false;
    musicToggleBtn.addEventListener('click', () => {
        musicPlaying = game.specialEffects.toggleMusic();
        musicToggleBtn.textContent = musicPlaying ? '🔊 Música: ON' : '🔇 Música: OFF';
    });

    // Botón de siguiente nivel
    nextLevelBtn.addEventListener('click', () => {
        if (game.levelManager.nextLevel()) {
            levelCompleteScreen.classList.remove('visible');
            game.start();
            startStatsUpdate();
        } else {
            // Juego completado - mostrar pantalla de username
            levelCompleteScreen.classList.remove('visible');
            gameCompleteScreen.classList.add('visible');
        }
    });

    // Botón de enviar score
    submitScoreBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        
        if (username === '') {
            alert('Por favor ingresa tu nombre');
            return;
        }

        // Guardar en leaderboard
        game.saveToLeaderboard(username);
        
        // Actualizar vista de leaderboard
        updateLeaderboardDisplay();
        
        // Ocultar pantalla de game complete
        gameCompleteScreen.classList.remove('visible');
        
        // Mostrar mensaje de éxito
        alert('¡Score guardado! Revisa el leaderboard.');
    });

    // Botón de jugar de nuevo
    playAgainBtn.addEventListener('click', () => {
        gameCompleteScreen.classList.remove('visible');
        resetGame();
    });

    function startStatsUpdate() {
        if (statsInterval) {
            clearInterval(statsInterval);
        }

        statsInterval = setInterval(() => {
            if (game.gameState === 'playing') {
                levelDisplay.textContent = game.levelManager.currentLevel;
                scoreDisplay.textContent = game.score;
                deathsDisplay.textContent = game.deaths;
                
                const minutes = Math.floor(game.time / 60);
                const seconds = game.time % 60;
                timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else if (game.gameState === 'levelComplete') {
                clearInterval(statsInterval);
                showLevelComplete();
            }
        }, 100);
    }

    function showLevelComplete() {
        levelCompleteScreen.classList.add('visible');
        document.getElementById('complete-time').textContent = 
            `${Math.floor(game.time / 60)}:${(game.time % 60).toString().padStart(2, '0')}`;
        document.getElementById('complete-score').textContent = game.score;
        document.getElementById('complete-deaths').textContent = game.deaths;
    }

    function updateLeaderboardDisplay() {
        const leaderboard = game.getLeaderboard();
        const leaderboardList = document.getElementById('leaderboard-list');
        
        leaderboardList.innerHTML = '';
        
        leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            if (index === 0) item.classList.add('rank-1');
            else if (index === 1) item.classList.add('rank-2');
            else if (index === 2) item.classList.add('rank-3');
            
            item.innerHTML = `
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">${entry.username}</span>
                <span class="leaderboard-score">${entry.score} pts</span>
            `;
            
            leaderboardList.appendChild(item);
        });

        // Si no hay entradas, mostrar mensaje
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No hay puntuaciones aún</p>';
        }
    }

    function resetGame() {
        // Limpiar localStorage antes de resetear
        try {
            localStorage.removeItem('parkourMazeSave');
        } catch (e) {
            console.log('Error limpiando localStorage');
        }
        
        game.levelManager.setLevel(1);
        game.score = 0;  // IMPORTANTE: Score siempre inicia en 0
        game.deaths = 0;
        game.time = 0;
        game.start();
        startStatsUpdate();
    }

    // Iniciar automáticamente
    console.log('Iniciando juego...');
    
    // CRÍTICO: Limpiar TODO el progreso guardado ANTES de crear el juego
    try {
        localStorage.removeItem('parkourMazeSave');
        console.log('✅ Progreso anterior limpiado');
    } catch (e) {
        console.log('⚠️ No se pudo limpiar progreso:', e);
    }
    
    // FORZAR score en 0 DESPUÉS de limpiar localStorage
    game.score = 0;
    game.deaths = 0;
    game.time = 0;
    
    game.levelManager.setLevel(1);
    game.start();
    startStatsUpdate();
    updateLeaderboardDisplay();
    
    console.log('🎮 Juego iniciado con Score:', game.score);
});