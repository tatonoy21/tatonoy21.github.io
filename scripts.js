function scrollToSection() {
    document.getElementById("about").scrollIntoView({
        behavior: "smooth"
    });
}

function answer(number) {

    const result = document.getElementById("result");

    if(number === 6){
        result.innerHTML = "✅ Correct! One over has 6 legal balls.";
        result.style.color = "green";
    }
    else{
        result.innerHTML = "❌ Incorrect. The correct answer is 6.";
        result.style.color = "red";
    }
}

function showQuizFeedback(message, isCorrect) {
    const result = document.getElementById("result");
    if (!result) {
        return;
    }

    result.innerHTML = isCorrect
        ? `✅ ${message}`
        : `❌ ${message}`;
    result.style.color = isCorrect ? "green" : "red";
}

// Ask before opening an external website
function openWebsite(url){
    const openLink = confirm("You are leaving Cricket Learning Hub. Continue?");
    if(openLink){
        window.open(url, "_blank");
    }
}

const cricketQuestions = [
    {
        prompt: "How many legal balls are in one over?",
        correct: "6",
        choices: ["4", "5", "6"],
        fact: "An over has 6 legal balls."
    },
    {
        prompt: "A ball that reaches the boundary after bouncing scores...",
        correct: "4",
        choices: ["4", "6", "2"],
        fact: "A boundary after bouncing scores 4 runs."
    },
    {
        prompt: "A ball that clears the boundary without bouncing scores...",
        correct: "6",
        choices: ["3", "6", "1"],
        fact: "A six is worth 6 runs."
    },
    {
        prompt: "What does a bowler try to do?",
        correct: "Take wickets",
        choices: ["Take wickets", "Dance", "Sleep"],
        fact: "Bowlers try to dismiss batters and take wickets."
    },
    {
        prompt: "Who stands behind the stumps to catch the ball?",
        correct: "Wicket keeper",
        choices: ["Wicket keeper", "Referee", "Umpire"],
        fact: "The wicket keeper stands behind the stumps."
    }
];

let currentQuestionIndex = 0;
let score = 0;
let gameState = "question";
let fallingBalls = [];
let batX = 280;
let feedbackMessage = "A new question is coming up. Read it carefully, then swing your bat at the right answer.";
let transitionTimer = 0;
let questionTimer = 0;
let canvas = null;
let ctx = null;
let lastFrameTime = 0;
const gameWidth = 560;
const gameHeight = 360;

function setupGame() {
    const container = document.getElementById("game-container");
    if (!container) {
        return;
    }

    container.innerHTML = "";
    canvas = document.createElement("canvas");
    canvas.width = gameWidth * 2;
    canvas.height = gameHeight * 2;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.maxWidth = "100%";
    canvas.style.display = "block";
    canvas.style.borderRadius = "12px";
    container.appendChild(canvas);

    ctx = canvas.getContext("2d");
    ctx.setTransform(2, 0, 0, 2, 0, 0);

    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("touchmove", handlePointerMove, { passive: false });

    updateGameHud();
    startRound();
    lastFrameTime = performance.now();
    requestAnimationFrame(loop);
}

function handlePointerMove(event) {
    if (!canvas) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const offsetX = x - rect.left;
    batX = Math.min(Math.max(offsetX / rect.width * gameWidth, 70), gameWidth - 70);

    if (event.touches) {
        event.preventDefault();
    }
}

function startRound() {
    if (currentQuestionIndex >= cricketQuestions.length) {
        gameState = "finished";
        feedbackMessage = `You finished the challenge with ${score} points! Refresh to play again.`;
        updateGameHud();
        return;
    }

    fallingBalls = [];
    gameState = "question";
    questionTimer = 1.2;
    feedbackMessage = "The question is up. The bowler is about to deliver the answer balls!";
    updateGameHud();
}

function beginDelivery() {
    const question = cricketQuestions[currentQuestionIndex];
    const choices = [...question.choices];

    fallingBalls = choices.map((label, index) => ({
        label,
        x: 120 + index * 140,
        y: -40,
        speed: 3.0 + currentQuestionIndex * 0.15,
        size: 54
    }));

    gameState = "playing";
    feedbackMessage = "The bowler has delivered the balls! Swing your bat to hit the correct answer.";
    updateGameHud();
}

function nextRound() {
    currentQuestionIndex += 1;
    startRound();
}

function updateGameHud() {
    const scoreDisplay = document.getElementById("score-display");
    const roundDisplay = document.getElementById("round-display");
    const tipDisplay = document.getElementById("game-tip");

    if (scoreDisplay) {
        scoreDisplay.textContent = score;
    }

    if (roundDisplay) {
        const roundNumber = Math.min(currentQuestionIndex + 1, cricketQuestions.length);
        roundDisplay.textContent = `${roundNumber}/${cricketQuestions.length}`;
    }

    if (tipDisplay) {
        tipDisplay.textContent = feedbackMessage;
    }
}

function loop(currentTime) {
    const deltaTime = (currentTime - lastFrameTime) / 1000 || 0.016;
    lastFrameTime = currentTime;

    if (gameState === "question") {
        questionTimer -= deltaTime;
        if (questionTimer <= 0) {
            beginDelivery();
        }
    }

    if (gameState === "transition") {
        transitionTimer -= deltaTime;
        if (transitionTimer <= 0) {
            nextRound();
        }
    }

    if (gameState === "playing") {
        updateBalls(deltaTime);
    }

    drawGame();
    requestAnimationFrame(loop);
}

function updateBalls(deltaTime) {
    let missedRound = false;

    for (let i = fallingBalls.length - 1; i >= 0; i -= 1) {
        const ball = fallingBalls[i];
        ball.y += ball.speed * (60 * deltaTime);

        if (ball.y + ball.size / 2 >= gameHeight - 84 && Math.abs(ball.x - batX) <= 60) {
            if (ball.label === cricketQuestions[currentQuestionIndex].correct) {
                score += 10;
                feedbackMessage = `Great shot! ${cricketQuestions[currentQuestionIndex].fact}`;
                updateGameHud();
                gameState = "transition";
                transitionTimer = 1.2;
                fallingBalls = [];
                return;
            }

            feedbackMessage = `That was a miss. The correct answer is ${cricketQuestions[currentQuestionIndex].correct}.`;
            updateGameHud();
            gameState = "transition";
            transitionTimer = 1.2;
            fallingBalls = [];
            return;
        }

        if (ball.y > gameHeight + 20) {
            missedRound = true;
        }
    }

    if (missedRound) {
        feedbackMessage = `The bowler beat you. The correct answer was ${cricketQuestions[currentQuestionIndex].correct}.`;
        updateGameHud();
        gameState = "transition";
        transitionTimer = 1.2;
    }
}

function drawGame() {
    if (!ctx) {
        return;
    }

    ctx.clearRect(0, 0, gameWidth, gameHeight);
    ctx.fillStyle = "#f5faf7";
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    ctx.fillStyle = "#edf7ee";
    ctx.fillRect(20, 30, gameWidth - 40, gameHeight - 60);

    drawPitch();
    drawBowler();
    drawBatter();

    ctx.fillStyle = "#0b6623";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(cricketQuestions[currentQuestionIndex].prompt, gameWidth / 2, 48);

    ctx.font = "12px Arial";
    ctx.fillStyle = "#345";
    ctx.fillText(feedbackMessage, gameWidth / 2, 78);

    fallingBalls.forEach((ball) => drawBall(ball));
}

function drawPitch() {
    ctx.fillStyle = "#2f8b4c";
    ctx.fillRect(0, 100, gameWidth, gameHeight - 110);
    ctx.fillStyle = "#cdebc1";
    ctx.fillRect(0, 100, gameWidth, 8);
}

function drawBowler() {
    ctx.fillStyle = "#0f3d22";
    ctx.beginPath();
    ctx.arc(110, 145, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e6b15e";
    ctx.fillRect(92, 165, 22, 38);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(95, 140, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(115, 160);
    ctx.lineTo(140, 142);
    ctx.stroke();
}

function drawBatter() {
    ctx.fillStyle = "#0f3d22";
    ctx.beginPath();
    ctx.arc(batX, gameHeight - 112, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f8d8a8";
    ctx.fillRect(batX - 14, gameHeight - 90, 28, 46);

    ctx.fillStyle = "#0b6623";
    ctx.beginPath();
    ctx.roundRect(batX - 70, gameHeight - 78, 110, 16, 8);
    ctx.fill();

    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.roundRect(batX - 60, gameHeight - 90, 90, 16, 8);
    ctx.fill();
}

function drawBall(ball) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0b6623";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ball.label, ball.x, ball.y);
}

if (typeof window !== "undefined") {
    document.addEventListener("DOMContentLoaded", setupGame);
    window.addEventListener("resize", () => {
        if (canvas) {
            canvas.style.width = "100%";
            canvas.style.height = "auto";
        }
    });
}