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