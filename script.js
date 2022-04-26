/*https://www.thecocktaildb.com/api.php*/
const apiKey_Cocktail = 1; // You can use the test API key "1" during development of your app or for educational use
const urlRequestCocktail = "https://www.thecocktaildb.com/api/json/v1/"+apiKey_Cocktail+"/search.php?s=" ;
const Top_5_Cocktail = ["Old fashioned", "Negroni", "Daiquiri", "Dry Martini", "Mojito"];
let cocktailList=[];
const client_id = '4f7c5f1a624b4cd9acfde897a880b150';
const client_secret = '9d2c4cb2ca8b4043bca2f44958a4924a';
let tokenS;

init();

function init(){
    ricerca_top_5_cocktail();
    const spotify = document.querySelector("#div_spotify").children[1];
    spotify.addEventListener('click', mostraRicerca);
    fetch("https://accounts.spotify.com/api/token",
        {
            method: "post",
            body: 'grant_type=client_credentials',
            headers:
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
            }
        }
    ).then(ontokenResponse).then(ontokenJson);
    const form = document.querySelector('#div_spotify').children[0];
    form.addEventListener('submit', ricercaSpotify);
}

// ------ Mostra/Nascondi barra ricerca per spotify ---------

function mostraRicerca(){
    let form_ricerca = document.querySelector("#div_spotify").children[0];
    form_ricerca.classList.remove("hidden");
    form_ricerca.classList.add("visible");
    let spotify = document.querySelector("#div_spotify").children[1];
    spotify.removeEventListener('click', mostraRicerca);
    spotify.addEventListener('click', nascondiRicerca);
}

function nascondiRicerca(){
    let form_ricerca = document.querySelector("#div_spotify").children[0];
    form_ricerca.classList.remove("visible");
    form_ricerca.classList.add("hidden");
    let spotify = document.querySelector("#div_spotify").children[1];
    spotify.removeEventListener('click', nascondiRicerca);
    spotify.addEventListener('click', mostraRicerca);
}

// ------------ Parte di Spotify ----------------

function ontokenResponse(response) {
    //console.log('token Ricevuto!');
    return response.json();
}

function ontokenJson(json) {
    tokenS = json.access_token;
}

function ricercaSpotify(event) {
    event.preventDefault();
    const input = document.querySelector('#track');
    const input_value = encodeURIComponent(input.value);
    // faccio la richiesta
    fetch("https://api.spotify.com/v1/search?type=album&q=" + input_value,
        {
            headers:
            {
                'Authorization': 'Bearer ' + tokenS
            }
        }
    ).then(onResponse, onError).then(onJsonSpotify);
}

function onResponse(response) {
    //console.log('Success!');
    return response.json();
}

function onError(error) {
    console.log('Error' + error);
}

/*
Struttura di ogni scheda spotify

<div class="album">
    <img src="">
    <span>Titolo: </span>
    <span>Artista: </span>
    <a href="">Ascolta su Spotify</a>
</div>

*/

function onJsonSpotify(json){
    window.scrollBy(0,window.scrollMaxY);
    //console.log(json);
    const library = document.querySelector('#brani-spotify');
    library.innerHTML = '';
    const results = json.albums.items;
    let num_results = results.length;
    if (num_results > 3)
        num_results = 3;
    for (let i = 0; i < num_results; i++) {
        const album_data = results[i]
        const title = album_data.name;
        const url = album_data.uri;
        var site = document.createElement('a');
        site.setAttribute('href', url);
        site.textContent = 'Ascolta su Spotify';
        const selected_image = album_data.images[1].url;
        const album = document.createElement('div');
        album.classList.add('album');
        const img = document.createElement('img');
        img.src = selected_image;
        const caption = document.createElement('span');
        caption.textContent = 'Titolo: ' + title;
        const artist = album_data.artists[0].name;
        const artist_name = document.createElement('span');
        artist_name.textContent = 'Artista: ' + artist;
        album.appendChild(img);
        album.appendChild(caption);
        album.appendChild(artist_name);
        album.appendChild(site);
        library.appendChild(album);
    }
    library.classList.remove('hidden');
    library.classList.add('visible-flex');
}

// ------------ Parte dei Cocktail ----------------
 
async function ricerca_top_5_cocktail(){
    let encoded_cocktail;
    for(let cocktail of Top_5_Cocktail){
        encoded_cocktail=encodeURIComponent(cocktail);
        // Faccio la richiesta
        await fetch(urlRequestCocktail+encoded_cocktail)
        .then(onResponse, onError)
        .then(onJsonCocktail);
    }
    aggiungiCocktail();
}

function onJsonCocktail(json){
    cocktailList.push(json);
}

/*
Struttura di ogni scheda cocktail

<div class="scheda" data-card-drink="">
    <div class="titolo-scheda">
        <h4> </h4>
    </div>
    <img class="img-scheda" src="" alt="">
    <div class="contenuto-scheda">
        <p>

        </p>
    </div>
</div>
*/

function aggiungiCocktail(){
    const lista_Schede = document.querySelector("#lista-schede");
    lista_Schede.innerHTML="";
    for(let i=0;i<cocktailList.length;i++){
        let div_scheda = document.createElement('div');
        div_scheda.classList="scheda";
        div_scheda.dataset.cardDrink=cocktailList[i].drinks[0].strDrink.replace(" ","_");
        let div_titolo_scheda = document.createElement('div');
        div_titolo_scheda.classList="titolo-scheda";
        let h4 = document.createElement('h4');
        h4.innerText=cocktailList[i].drinks[0].strDrink;
        let img = document.createElement('img');
        img.classList="img-scheda";
        img.src=cocktailList[i].drinks[0].strDrinkThumb;
        img.alt="img-"+(cocktailList[i].drinks[0].strDrink).replace(" ", "_");
        let div_contenuto = document.createElement('div');
        div_contenuto.classList="contenuto-scheda";
        let p = document.createElement('p');
        p.innerHTML="Ingredienti:<br>";
        for(let j=1;j<10;j++){ 
            if(eval("cocktailList[i].drinks[0].strIngredient"+j)!==null){
                p.innerHTML+=j+") "+eval("cocktailList[i].drinks[0].strIngredient"+j)+"<br>";
            }
        }

        div_contenuto.appendChild(p);
        div_titolo_scheda.appendChild(h4);
        div_scheda.appendChild(div_titolo_scheda);
        div_scheda.appendChild(img);
        div_scheda.appendChild(div_contenuto);
        lista_Schede.appendChild(div_scheda);
    }
}