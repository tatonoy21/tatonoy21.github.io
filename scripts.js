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
let gameState = "ready";
let fallingBalls = [];
let batX = 0;
let feedbackMessage = "Move your mouse to guide the bat and catch the correct answer.";
let nextRoundTimer = 0;

function setupGame() {
    const canvas = createCanvas(560, 360);
    canvas.parent("game-container");
    canvas.elt.style.maxWidth = "100%";
    textFont("Arial");
    resetRound();
}

function resetRound() {
    if (currentQuestionIndex >= cricketQuestions.length) {
        gameState = "finished";
        feedbackMessage = `You finished the challenge with ${score} points! Refresh to play again.`;
        updateGameHud();
        return;
    }

    const question = cricketQuestions[currentQuestionIndex];
    const choices = [...question.choices];

    fallingBalls = choices.map((label, index) => ({
        label,
        x: 90 + index * 180,
        y: -40,
        speed: 2.8 + currentQuestionIndex * 0.2,
        size: 52
    }));

    gameState = "playing";
    feedbackMessage = "Catch the correct answer!";
    updateGameHud();
}

function nextRound() {
    currentQuestionIndex += 1;
    resetRound();
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

function drawGame() {
    background(245, 250, 247);
    noStroke();

    fill(237, 247, 240);
    rect(20, 30, width - 40, height - 60, 18);

    fill(11, 102, 35);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(cricketQuestions[currentQuestionIndex].prompt, width / 2, 50);

    fill(35, 90, 60);
    textSize(12);
    text(feedbackMessage, width / 2, 78);

    batX = constrain(mouseX, 70, width - 70);
    drawBat();

    if (gameState === "transition") {
        nextRoundTimer -= deltaTime / 1000;
        if (nextRoundTimer <= 0) {
            nextRound();
        }
    }

    if (gameState !== "playing") {
        return;
    }

    let missedRound = false;

    for (let i = fallingBalls.length - 1; i >= 0; i -= 1) {
        const ball = fallingBalls[i];
        ball.y += ball.speed;
        drawBall(ball);

        if (ball.y + ball.size / 2 > height - 70 && ball.x > batX - 55 && ball.x < batX + 55) {
            if (ball.label === cricketQuestions[currentQuestionIndex].correct) {
                score += 10;
                feedbackMessage = `Great catch! ${cricketQuestions[currentQuestionIndex].fact}`;
                updateGameHud();
                gameState = "transition";
                nextRoundTimer = 1.2;
                fallingBalls = [];
                return;
            }

            feedbackMessage = `Not that one. The correct answer is ${cricketQuestions[currentQuestionIndex].correct}.`;
            updateGameHud();
            gameState = "transition";
            nextRoundTimer = 1.2;
            fallingBalls = [];
            return;
        }

        if (ball.y > height + 20) {
            missedRound = true;
        }
    }

    if (missedRound) {
        feedbackMessage = `The correct answer was ${cricketQuestions[currentQuestionIndex].correct}.`;
        updateGameHud();
        gameState = "transition";
        nextRoundTimer = 1.2;
    }
}

function drawBat() {
    fill(11, 102, 35);
    rect(batX - 55, height - 60, 110, 16, 8);
    fill(255, 215, 0);
    rect(batX - 45, height - 72, 90, 16, 8);
}

function drawBall(ball) {
    fill(255, 255, 255);
    circle(ball.x, ball.y, ball.size);
    fill(11, 102, 35);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(ball.label, ball.x, ball.y);
}

function setup() {
    setupGame();
}

function draw() {
    drawGame();
}

function windowResized() {
    resizeCanvas(560, 360);
}

if (typeof window !== "undefined") {
    window.setup = setup;
    window.draw = draw;
    window.windowResized = windowResized;
}