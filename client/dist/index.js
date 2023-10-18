import { createHashHistory } from "./history.js";
let history = createHashHistory();
document.addEventListener('DOMContentLoaded', () => {

    history.listen(({action, location}) => {



    })

    if ('serviceWorker' in navigator) { //damit es auch auf alten browsern noch funktioniert
        navigator.serviceWorker.register("/sw.js", {scope: "/"});
    }

    //let userSelection = document.getElementById("userSelection");
    //userSelection.addEventListener("change", userChanged);
    let sendButton = document.getElementById("sendButton");
    let menuButton = document.getElementById("menuButton");
    menuButton.addEventListener("click", toggleMenu);
    sendButton.addEventListener("click", sendMessage);
    //history.push("/"); //bei conversation wechsel pushen

})



function toggleMenu(){
    let sidebar = document.getElementById("sidebar");
    let menuButton = document.getElementById("menuButton");

    sidebar.classList.toggle("ml-[-16rem]");
    sidebar.classList.toggle("z-10");
    menuButton.classList.toggle("z-50");

}

function checkUrlAndOpenChat(){
    if (history.location.pathname === "/chat") {
        let username = new URLSearchParams(history.location.search).get("user")
        if (username) {
            displayMessagesForUsername(username);
        }
    } else if(history.location.pathname === "/"){
        openLastConversation();
    }
}

window.onload = async function () {
    checkUrlAndOpenChat();
}

function openLastConversation(){
    let lastConversation = localStorage.getItem("lastConversation");
    if(lastConversation !== null){
        history.push("/chat?user="+lastConversation);
        displayMessagesForUsername(lastConversation);
    }
}

let loggedInUser = "daniel";
let currentConversation;
loadConversationsForUser(loggedInUser);

async function getConversationIdForUser(chatPartner){
    const response = await fetch("/conversations");
    const conversations = await response.json();
    console.log(conversations);

    for (let i = 0; i < conversations.length; i++) {
        if((loggedInUser === conversations[i].participants[0] && chatPartner === conversations[i].participants[1]) ||
            (chatPartner === conversations[i].participants[0] && loggedInUser === conversations[i].participants[1])){
            return conversations[i].id;
        }
    }

}

async function displayMessagesForUsername(username) {
    let conversationId = await getConversationIdForUser(username);

    currentConversationId = conversationId;
    currentConversation = username;

    //fetch chat
    let messages = document.getElementById("messages");
    messages.innerHTML = '';


    let conversationResponse = await fetch("/conversations/" + currentConversationId + "/messages")

    let conversationMessages = await conversationResponse.json();

    localStorage.setItem("lastConversation", username);

    conversationMessages.forEach((conversationMessage) => {
        let messageContainer = document.createElement("div");
        let message = document.createElement("div");
        if (conversationMessage.from === loggedInUser) {
            messageContainer.classList.add("chat", "chat-end");

        } else {
            messageContainer.classList.add("chat", "chat-start");
        }
        message.classList.add("chat-bubble");
        message.innerText = conversationMessage.message;
        messageContainer.appendChild(message);
        messages.appendChild(messageContainer);
    })
}

let currentConversationId;

async function sendMessage(){
    let messageInput = document.getElementById("messageInput");
    let result = await fetch("/conversations/"+currentConversationId+"/messages", {
        method: "POST",
        body: JSON.stringify({
            "from": loggedInUser,
            "message": messageInput.value,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
    messageInput.value = "";
}


// export function userChanged(){
//
//     let conversationList = document.getElementById("conversationList");
//     conversationList.innerHTML = '';
//
//     if(this.value !== "none"){
//         console.log(JSON.parse(this.value).fullname);
//         loggedInUser = JSON.parse(this.value).username;
//         loadConversationsForUser(JSON.parse(this.value).username);
//     }
//
// }


async function loadConversationsForUser(username){
    const response = await fetch("/conversations");
    const conversations = await response.json();
    console.log(conversations);

    conversations.forEach((conversation) => {
        if(username === conversation.participants[0] || username === conversation.participants[1]){
            addConversationToSideBar(conversation);
        }
    })
}

async function addConversationToSideBar(conversation){
    const response = await fetch("/users");
    const users = await response.json();

    users.forEach((user) => {
        if(user.username === conversation.participants[0] || user.username === conversation.participants[1] ){
            if(user.username !== loggedInUser){
                let conversationList = document.getElementById("conversationList");
                const listItem = document.createElement("div");
                listItem.classList.add("p-4", "shadow-md", "flex", "items-center", "hover:bg-gray-800", "rounded-sm");

                const avatar = document.createElement('div');
                avatar.classList.add("avatar");

                const avatarImage = document.createElement("div");
                avatarImage.classList.add("w-12", "rounded-full", "mr-4");
                avatarImage.innerHTML = `<img src="${user.image}" alt="${user.fullname}'s profile picture" />`;

                const fullName = document.createElement("p");
                fullName.textContent = user.fullname;
                fullName.classList.add("text-center", "font-semibold");

                avatar.appendChild(avatarImage);
                listItem.appendChild(avatar);
                listItem.appendChild(fullName);

                listItem.addEventListener("click", async () => {
                    console.log(user.username);
                    currentConversationId = conversation.id;
                    currentConversation = user.username;
                    //push url
                    history.push('/chat?' + new URLSearchParams({ user: user.username }));
                    localStorage.setItem("lastConversation", user.username);

                    //fetch chat
                    let messages = document.getElementById("messages");
                    messages.innerHTML = '';


                    let conversationResponse = await fetch("/conversations/"+conversation.id+"/messages")

                    let conversationMessages = await conversationResponse.json();

                    conversationMessages.forEach((conversationMessage) =>{
                        let messageContainer = document.createElement("div");
                        let message = document.createElement("div");
                        if(conversationMessage.from === loggedInUser){
                            messageContainer.classList.add("chat", "chat-end");

                        } else {
                            messageContainer.classList.add("chat", "chat-start");
                        }
                        message.classList.add("chat-bubble");
                        message.innerText = conversationMessage.message;
                        messageContainer.appendChild(message);
                        messages.appendChild(messageContainer);
                    })


                })

                conversationList.appendChild(listItem);
            }

        }
    })
}

async function getUserData() {
    const response = await fetch("/users");
    const users = await response.json();
    console.log(users);
    //let usersList = document.getElementById("usersList");
    // for(i = 0; i < users.length; i++){
    //     let li = document.createElement('li');
    //     //li.innerText = users[i].fullname;
    //     li.classList.add("flex", "items-center");
    //
    //     const avatar = document.createElement('div');
    //     avatar.classList.add("avatar");
    //
    //     const div = document.createElement('div');
    //     div.classList.add("w-12", "rounded-full");
    //     div.innerHTML = `<img src="${users[i].image}" alt="${users[i].fullname}'s profile picture" />`;
    //
    //     const contentContainer = document.createElement("div");
    //     contentContainer.classList.add("flex-1");
    //
    //     const fullName = document.createElement("p");
    //     fullName.textContent = users[i].fullname;
    //     fullName.classList.add("text-center");
    //
    //     contentContainer.appendChild(fullName);
    //     //li.appendChild(avatar)
    //     li.appendChild(contentContainer)
    //
    //     avatar.appendChild(div);
    //     usersList.appendChild(avatar);
    //     usersList.appendChild(fullName);
    //
    // }
    users.forEach((user) => {

        const userSelection = document.getElementById("userSelection");

        const option = document.createElement("option");
        option.text = user.fullname;
        option.value = JSON.stringify(user);
        userSelection.appendChild(option);


    });
}

//getUserData()