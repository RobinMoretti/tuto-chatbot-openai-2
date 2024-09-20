import './style.css'

import OpenAI from 'openai';

const openia = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_KEY,
	dangerouslyAllowBrowser: true
});	

let assistant = await getAssistantById("asst_Igbsx74rrKaqOaaesliqZ3YU");

async function getAssistantById(assistantId) {
	const myAssistant = await openia.beta.assistants.retrieve(assistantId);
	return myAssistant;
}  

let thread = await openia.beta.threads.create();

sendMessage();

async function sendMessage(textMessage) {
	await openia.beta.threads.messages.create(
		thread.id,
		{
			role: "user",
			content: textMessage
		}
	);

	const run = openia.beta.threads.runs.stream(thread.id, {
		assistant_id: assistant.id
	})
	.on('textCreated', () => {
		// Événement déclenché lorsque les premiers tokens de réponse sont reçus.

		// Nous pouvons donc créer un élément HTML qui contiendra la réponse ici.
		let responseElement = document.createElement("div");
		responseElement.classList.add("response");
		responseElement.innerHTML = "Assistant : <br/>"

		// Ajoutons cet élément au DOM.
		document.getElementById("messages-container").appendChild(responseElement);
	})
	.on('textDelta', (textDelta) => {
		// Événement déclenché lorsque les tokens suivants de la réponse sont reçus.

		// Retrouvons l'élément précédemment ajouté au DOM.
		let responseElement = document.querySelector("#messages-container .response:last-child");
		// Ajoutons à la suite les tokens suivants reçus.
		responseElement.innerHTML += textDelta.value;
	});
}

document.getElementById("send-message-button").addEventListener("click", () => { 
	let inputText = document.getElementById("text-input-to-gpt").value; // Récupère le texte saisi par l'utilisateur dans l'input HTML.
	document.getElementById("text-input-to-gpt").value = ""; // Vide l'input après la récupération.

	// Crée un nouvel élément HTML pour afficher le message de l'utilisateur et l'ajoute au DOM.
	let messageElement = document.createElement("div");
	messageElement.classList.add("user-message");
	messageElement.innerHTML = "Utilisateur : <br/>" + inputText;

	// Ajoute l'élément créé au DOM.
	document.getElementById("messages-container").appendChild(messageElement);

	// Appelle la fonction sendMessage pour envoyer la requête à ChatGPT avec le texte de l'utilisateur.
	sendMessage(inputText); 
});