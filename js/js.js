/*   --------------------------------------------------- */
/*  - Cette page de code vous est offerte par Nenette - */
/* --------------------------------------------------- */

// definition des constantes
var nb_faces = 6; // nombre de faces des dés
var nb_des = 3; // nombre de dés à lancer
var max_coups = 3; // definition du compteur coups joués
var img_root_url = "dices/";
var css_des_bloque = "1px solid #00FF00";
var css_des_transp = 10; // opacité en %
// definition des variables
var coups = 0; // definition du compteur de lancés de dés
var figure = [];
var figure2 = "";
// initialisation des 'arrays' tableaux
var valeur_des = []; // definition du tableau stockant la liste de valeur par dés
var bloquage_des = []; // definition du tableau contenant la liste des dés bloqués ou pas (true/false)
var des = []; // initialisation des 3 des
var html_des = []; // stockage du code html pour chaque images de des
var html_des_full = []; // stockage du code html pour toutes les images de des
var html_joueurs = []; // stockage du code html pour chaque images de des
var html_joueurs_full = []; // stockage du code html pour toutes les images de des
/* ------------------------------------------------------ */
// variable pour la console
var ligne = 0; // compteur de lignes pour la console
/* ------------------------------------------------------ */
// futures variables
// penser à apprendre a mieux gerer les array à plusieurs dimensions
// penser à gerer le stockage de des pour chaque joueurs
// nb_jetons = 11;
var nb_joueurs = 2;
var nom_joueurs = ['Anthony', 'IA'];
var joueurs_actuel = 1;
// ------------------------------------------------------
function init() {
    console.log(ligne + ") Page chargée, Fonction init() lancée");
    document.getElementById("titre").innerHTML = "<h1>Un petit 421 ?</h1>";
    document.getElementById("bouton").innerHTML = "<button id=\"lancer\" onclick=\"lancer()\">OK !</button>";
}
// SI VOUS CLIQUEZ SUR OK/LANCER
function lancer() {
    if (coups < max_coups) {
        coups == 0 ? console.clear() : "";
        jet_de_des();
        coups == max_coups ? reservation_off() : "";
        des_html_createur();
        des_html_injecteur('des', html_des_full);
        consoletools('Lancer N° ' + coups + ' = ' + figure);
        joueurs_cartouches();
        des_html_injecteur('cartouches', html_joueurs_full);
        coups < max_coups ? document.getElementById('lancer').innerHTML = 'ReLANCER' : "";
        coups < max_coups ? document.getElementById('commentaires').innerHTML = 'Il vous reste ' + (max_coups - coups) + ' coup(s) à jouer.' : "";
        coups == max_coups ? check() : "";

    }
}

function reservation_off() {
    for (let i = 1; i <= nb_des; i++) {
        bloquage_des[i] = false;
    }
}
/* ------------------------------------------------------ */
function opacificateur() {
    for (let i = 1; i <= nb_des; i++) {
        bloquage_des[i] ? tempo = css_des_bloque : tempo = "";
        bloquage_des[i] ? opacite = css_des_transp : opacite = 100;

        let ledes = document.getElementById('des_' + i).style;
        ledes.border = tempo;
        ledes.opacity = (opacite / 100);
        ledes.MozOpacity = (opacite / 100);
        ledes.KhtmlOpacity = (opacite / 100);
        ledes.filter = 'alpha(opacity=' + opacite + ')';
    }
}
/* ------------------------------------------------------ */
function reserver(num) {
    if (!coups == 0) {
        bloquage_des[num] ? bloquage_des[num] = false : bloquage_des[num] = true;
        consoletools('reservation du des n° ' + num + " [" + bloquage_des[num] + ']');
        opacificateur()
    }
}

/* ------------------------------------------------------ */
function check() {
    if (coups == max_coups) {
        document.getElementById('lancer').innerHTML = 'LANCER';
        CalculsDesPoints();
        coups = 0;
    }
    //nouvelletournee()

}
/* ------------------------------------------------------ */
function CalculsDesPoints() {
    document.getElementById('commentaires').innerHTML = "pts gagné " + figure2; //.sort();


}
/* ------------------------------------------------------ */
/* ------------------------------------------------------ */
function nouvelletournee() {
    document.getElementById('commentaires').innerHTML = '';

}
/* ------------------------------------------------------ */
/* ------------------------------------------------------ */
function jet_de_des() {
    coups++; // coups joués + 1
    figure2 = "";
    for (let i = 1; i <= nb_des; i++) {
        coups == 1 ? bloquage_des[i] = false : ""; // if first play then defining stucked dices to false (true = stucked dice)
        !bloquage_des[i] ? des[i] = Math.floor(Math.random() * nb_faces + 1) : "";
        figure[i] = des[i];
        figure2 += des[i];
    }
}
/* ------------------------------------------------------ */
/* ------------------------------------------------------ */
function des_html_createur() {
    //let espaaace = "";
    html_des_full = "";
    for (var i = 1; i <= nb_des; i++) {
        //i == nb_des ? espaaace = "" : espaaace = "-";
        html_des[i] = '<img class="des" id="des_' + i + '" onclick="reserver(' + i + ')" title="Dés n°' + i + ' = ' + des[i] + '"' +
            'class = "dice" src = "' + img_root_url + 'dice' + des[i] + '.png" width="auto" height="auto">';
        html_des_full += html_des[i]; // + espaaace;
    }
}
/* ------------------------------------------------------ */
/* ------------------------------------------------------ */
function des_html_injecteur(qui, bloc_html) {
    document.getElementById(qui).innerHTML = bloc_html;
    opacificateur();
}
/* ------------------------------------------------------ */
/* ------------------------------------------------------ */
function joueurs_cartouches() {
    consoletools('cartouche ok');
    html_joueurs_full = "<ul>";
    for (var i = 0; i < nb_joueurs; i++) {
        html_joueurs[i] = '<li class="joueurs" id="joueur_' + i + '" title="Joueur ' + i + ' \' ' + nom_joueurs[i] + '\'">' + nom_joueurs[i] + '</li>';
        html_joueurs_full += html_joueurs[i];
    }
    html_joueurs_full += "</ul>";
}
/* ------------------------------------------------------ */
function consoletools(content) {
    ligne++;
    console.log(ligne + ") " + content);
}
/* ------------------------------------------------------ */
function refreshcomment(content) {
    document.getElementById("comment").innerHTML = content;
    document.getElementById("choix").value = "";
}
/* ------------------------------------------------------ */
// LES POINTS
// [key, figure, pts]
var figures = [
    [1, 421, 7, "l'Espagnole/421"],
    [116, 116, 6, "mac"],
    [115, 115, 5, "mac"],
    [114, 114, 4, "mac"],
    [113, 113, 3, "mac"],
    [112, 112, 2, "mac"],
    [666, 666, 6, "brelan"],
    [555, 555, 5, "brelan"],
    [444, 444, 4, "brelan"],
    [333, 333, 3, "brelan"],
    [222, 222, 2, "brelan"],
    [111, 111, 7, "mac 1"],
    [654, 654, 4, "suite"],
    [543, 543, 3, "suite"],
    [432, 432, 2, "suite"],
    [321, 321, 1, "suite"],
    [221, 221, 0, "nenette"]
];
/* ------------------------------------------------------ */
function plusgrand(content) {
    //document.getElementsByClassName('des').width = document.getElementsByClassName(des).width.value + 10;
}