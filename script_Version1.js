/**
 * SCRIPT JAVASCRIPT - UEFA Champions League
 * Gestion du DOM, fetch des données, événements, animations
 * Récupère les données depuis /donnees.json (serveur Python)
 */

// Données globales
let donnees = [];
let donneesClubs = {};
let quizIndex = 0;
let quizScore = 0;
let selectedAnswers = {};
let triActuel = { colonne: 'annee', asc: true };

// Questions du quiz
const quiz = [
    {
        question: "En quelle année la Coupe des clubs champions a-t-elle été créée ?",
        options: ["1950", "1955", "1960", "1965"],
        reponse: 1
    },
    {
        question: "Quel club a remporté les 5 premières éditions consécutives ?",
        options: ["AC Milan", "Bayern Munich", "Real Madrid", "Liverpool"],
        reponse: 2
    },
    {
        question: "Quel est le score de la plus grande victoire en finale UCL ?",
        options: ["5-0", "6-2", "7-3", "8-2"],
        reponse: 2
    },
    {
        question: "En quelle année la compétition a-t-elle été transformée en 'Champions League' ?",
        options: ["1989", "1991", "1992", "1995"],
        reponse: 2
    },
    {
        question: "Quel club compte le plus de titres en 2025 ?",
        options: ["Bayern Munich", "AC Milan", "Real Madrid", "Liverpool"],
        reponse: 2
    }
];

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Chargement du site Champions League...');
    
    // Récupération des données depuis le serveur
    await chargerDonnees();
    
    // Initialisation des sections
    afficherPalmares();
    afficherClubs();
    initialiserComparateur();
    initialiserQuiz();
    
    // Événements
    document.getElementById('searchInput').addEventListener('input', filtrerPalmares);
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function() {
            trierTableau(this.dataset.column);
        });
    });
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Gestion du formulaire de contact
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Le formulaire sera soumis normalement au serveur
        // Mais nous affichons une confirmation avant
        setTimeout(() => {
            document.getElementById('contact-form').style.display = 'none';
            document.getElementById('contact-confirmation').style.display = 'block';
        }, 500);
    });
});

// ============ CHARGEMENT DES DONNÉES ============
async function chargerDonnees() {
    try {
        const response = await fetch('/donnees.json');
        donnees = await response.json();
        console.log('✅ Données chargées :', donnees.length, 'éditions');
        
        // Traitement des données pour calculer les statistiques
        calculerStatistiquesClubs();
        afficherStatistiques();
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données :', error);
        document.getElementById('palmares-tbody').innerHTML = 
            '<tr><td colspan="5" style="text-align: center; color: red;">Erreur lors du chargement des données</td></tr>';
    }
}

// ============ AFFICHAGE DU PALMARÈS ============
function afficherPalmares() {
    const tbody = document.getElementById('palmares-tbody');
    tbody.innerHTML = '';
    
    donnees.forEach((edition, index) => {
        const row = document.createElement('tr');
        
        // Déterminer si c'est un top club (pour coloration)
        const isTopClub = parseInt(edition.nb_titres_cumulés) >= 3;
        if (isTopClub) {
            row.classList.add('top-club');
        }
        
        row.innerHTML = `
            <td>${edition.annee}</td>
            <td><strong>${edition.vainqueur}</strong></td>
            <td>${edition.finaliste}</td>
            <td>${edition.score}</td>
            <td>${edition.lieu}</td>
        `;
        tbody.appendChild(row);
    });
}

// ============ RECHERCHE ET FILTRAGE ============
function filtrerPalmares() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#palmares-tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// ============ TRI DU TABLEAU ============
function trierTableau(colonne) {
    if (triActuel.colonne === colonne) {
        triActuel.asc = !triActuel.asc;
    } else {
        triActuel.colonne = colonne;
        triActuel.asc = true;
    }
    
    donnees.sort((a, b) => {
        let valA = a[colonne];
        let valB = b[colonne];
        
        // Conversion en nombres si possible
        if (!isNaN(valA)) valA = parseInt(valA);
        if (!isNaN(valB)) valB = parseInt(valB);
        
        if (triActuel.asc) {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });
    
    afficherPalmares();
}

// ============ CALCUL DES STATISTIQUES CLUBS ============
function calculerStatistiquesClubs() {
    donneesClubs = {};
    
    donnees.forEach(edition => {
        const vainqueur = edition.vainqueur;
        
        if (!donneesClubs[vainqueur]) {
            donneesClubs[vainqueur] = {
                nom: vainqueur,
                titres: 0,
                finales: 0,
                derniereTitre: 0,
                pays: edition.pays_vainqueur
            };
        }
        donneesClubs[vainqueur].titres++;
        donneesClubs[vainqueur].derniereTitre = parseInt(edition.annee);
    });
}

// ============ AFFICHAGE DES CLUBS LÉGENDAIRES ============
function afficherClubs() {
    const clubsLegendes = [
        { nom: "Real Madrid CF", titres: 16, pays: "Espagne", img: "https://upload.wikimedia.org/wikipedia/fr/thumb/0/01/Real_Madrid_CF.svg/250px-Real_Madrid_CF.svg.png" },
        { nom: "AC Milan", titres: 7, pays: "Italie", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/AC_Milan.svg/300px-AC_Milan.svg.png" },
        { nom: "Bayern Munich", titres: 6, pays: "Allemagne", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/FC_Bayern_Munich_logo_%282017%29.svg/300px-FC_Bayern_Munich_logo_%282017%29.svg.png" },
        { nom: "Liverpool FC", titres: 6, pays: "Angleterre", img: "https://upload.wikimedia.org/wikipedia/fr/thumb/0/0c/Liverpool_Football_Club.svg/250px-Liverpool_Football_Club.svg.png" },
        { nom: "Barcelone", titres: 5, pays: "Espagne", img: "https://upload.wikimedia.org/wikipedia/fr/thumb/b/b9/Football_Club_de_Barcelona.svg/200px-Football_Club_de_Barcelona.svg.png" },
        { nom: "Ajax Amsterdam", titres: 4, pays: "Pays-Bas", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AFC_Ajax.svg/300px-AFC_Ajax.svg.png" },
        { nom: "Manchester United", titres: 3, pays: "Angleterre", img: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_badge.svg/300px-Manchester_United_FC_badge.svg.png" },
        { nom: "Inter Milan", titres: 3, pays: "Italie", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Inter_Milan.svg/300px-Inter_Milan.svg.png" }
    ];
    
    const grid = document.getElementById('clubs-grid');
    grid.innerHTML = '';
    
    clubsLegendes.forEach(club => {
        const card = document.createElement('div');
        card.className = 'club-card';
        card.innerHTML = `
            <img src="${club.img}" alt="${club.nom}" class="club-card-img" onerror="this.src='https://via.placeholder.com/300x250?text=${encodeURIComponent(club.nom)}'">
            <div class="club-card-content">
                <h3 class="club-card-title">${club.nom}</h3>
                <p class="club-card-pays">🌍 ${club.pays}</p>
                <div class="club-stat">
                    <span class="club-stat-label">Titres UCL :</span>
                    <span class="club-stat-value">${club.titres}</span>
                </div>
                <div class="club-stat">
                    <span class="club-stat-label">Finales :</span>
                    <span class="club-stat-value">${donneesClubs[club.nom]?.finales || club.titres + 2}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ============ INITIALISATION COMPARATEUR ============
function initialiserComparateur() {
    const select1 = document.getElementById('club1');
    const select2 = document.getElementById('club2');
    
    const clubs = Object.keys(donneesClubs).sort();
    
    clubs.forEach(club => {
        const option1 = document.createElement('option');
        option1.value = club;
        option1.textContent = club;
        select1.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = club;
        option2.textContent = club;
        select2.appendChild(option2);
    });
    
    // Sélections par défaut
    if (clubs.length >= 2) {
        select1.value = clubs[0];
        select2.value = clubs[1];
    }
}

// ============ COMPARAISON DE CLUBS ============
function comparerClubs() {
    const club1 = document.getElementById('club1').value;
    const club2 = document.getElementById('club2').value;
    
    if (!club1 || !club2) {
        alert('Veuillez sélectionner deux clubs');
        return;
    }
    
    const data1 = donneesClubs[club1];
    const data2 = donneesClubs[club2];
    
    if (!data1 || !data2) {
        alert('Clubs non trouvés dans les données');
        return;
    }
    
    // Affichage des résultats
    const maxTitres = Math.max(data1.titres, data2.titres);
    
    document.getElementById('club1-nom').textContent = data1.nom;
    document.getElementById('club1-titres').textContent = data1.titres;
    document.getElementById('club1-finales').textContent = `${data1.finales || data1.titres + 1} finales`;
    document.getElementById('club1-derniere').textContent = `Dernière : ${data1.derniereTitre}`;
    document.getElementById('club1-progress').style.width = (data1.titres / maxTitres * 100) + '%';
    
    document.getElementById('club2-nom').textContent = data2.nom;
    document.getElementById('club2-titres').textContent = data2.titres;
    document.getElementById('club2-finales').textContent = `${data2.finales || data2.titres + 1} finales`;
    document.getElementById('club2-derniere').textContent = `Dernière : ${data2.derniereTitre}`;
    document.getElementById('club2-progress').style.width = (data2.titres / maxTitres * 100) + '%';
    
    document.getElementById('comparaison-resultat').style.display = 'block';
}

// ============ AFFICHAGE DES STATISTIQUES ============
function afficherStatistiques() {
    // Club le plus titré
    let topClub = null;
    let maxTitres = 0;
    
    Object.values(donneesClubs).forEach(club => {
        if (club.titres > maxTitres) {
            maxTitres = club.titres;
            topClub = club;
        }
    });
    
    document.getElementById('record-club').textContent = topClub.nom;
    document.getElementById('record-titres').textContent = topClub.titres + ' titres';
    
    // Pays le plus représenté
    const paysCounts = {};
    Object.values(donneesClubs).forEach(club => {
        paysCounts[club.pays] = (paysCounts[club.pays] || 0) + club.titres;
    });
    
    let topPays = null;
    let maxPays = 0;
    Object.entries(paysCounts).forEach(([pays, count]) => {
        if (count > maxPays) {
            maxPays = count;
            topPays = pays;
        }
    });
    
    document.getElementById('record-pays').textContent = topPays;
    document.getElementById('record-pays-count').textContent = maxPays + ' titres';
    
    // Plus grande victoire
    const plusGrande = donnees.reduce((max, edition) => {
        const [buts1, buts2] = edition.score.split('-').map(Number);
        const maxButs = Math.max(buts1, buts2);
        return maxButs > Math.max(...(max.score.split('-'))) ? edition : max;
    });
    
    document.getElementById('record-victoire').textContent = plusGrande.score;
    document.getElementById('record-victoire-detail').textContent = 
        `${plusGrande.vainqueur} ${plusGrande.annee}`;
    
    // Graphique - Top 10 clubs
    afficherGraphique();
}

// ============ GRAPHIQUE TOP 10 ============
function afficherGraphique() {
    const top10 = Object.values(donneesClubs)
        .sort((a, b) => b.titres - a.titres)
        .slice(0, 10);
    
    const chart = document.getElementById('chart');
    chart.innerHTML = '';
    
    const maxTitres = top10[0].titres;
    
    top10.forEach(club => {
        const barContainer = document.createElement('div');
        barContainer.className = 'chart-bar';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = (club.titres / maxTitres * 300) + 'px';
        bar.title = `${club.nom}: ${club.titres} titres`;
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = club.nom;
        
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        chart.appendChild(barContainer);
    });
}

// ============ INITIALISATION DU QUIZ ============
function initialiserQuiz() {
    afficherQuestionQuiz();
}

// ============ AFFICHAGE QUESTION QUIZ ============
function afficherQuestionQuiz() {
    if (quizIndex >= quiz.length) {
        afficherResultatQuiz();
        return;
    }
    
    const question = quiz[quizIndex];
    document.getElementById('quiz-question-text').textContent = question.question;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('div');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.onclick = () => selectionnerReponse(index, question.reponse);
        
        if (selectedAnswers[quizIndex] === index) {
            btn.classList.add('selected');
        }
        
        optionsContainer.appendChild(btn);
    });
    
    document.querySelector('.btn-quiz').textContent = 
        quizIndex === quiz.length - 1 ? 'Voir Résultat' : 'Question Suivante';
}

// ============ SÉLECTION RÉPONSE QUIZ ============
function selectionnerReponse(index, bonneReponse) {
    selectedAnswers[quizIndex] = index;
    if (index === bonneReponse) {
        quizScore++;
    }
    
    // Mettre à jour l'affichage
    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
        btn.classList.remove('selected');
        if (i === index) {
            btn.classList.add('selected');
        }
    });
}

// ============ QUESTION SUIVANTE ============
function nextQuestion() {
    quizIndex++;
    if (quizIndex < quiz.length) {
        afficherQuestionQuiz();
    } else {
        afficherResultatQuiz();
    }
}

// ============ AFFICHAGE RÉSULTAT QUIZ ============
function afficherResultatQuiz() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';
    
    const pourcentage = (quizScore / quiz.length * 100).toFixed(0);
    document.getElementById('quiz-score-text').textContent = `${quizScore}/${quiz.length} (${pourcentage}%)`;
    
    let message = '';
    if (pourcentage >= 80) {
        message = '🏆 Excellent ! Vous êtes un véritable fan de la Champions League !';
    } else if (pourcentage >= 60) {
        message = '👏 Très bien ! Vous connaissez bien l\'histoire de la Champions League !';
    } else if (pourcentage >= 40) {
        message = '📚 Pas mal ! Continuez à découvrir l\'univers de la Champions League !';
    } else {
        message = '📖 À bientôt ! Découvrez plus sur la Champions League !';
    }
    
    document.getElementById('quiz-message-text').textContent = message;
}

// ============ RECOMMENCER QUIZ ============
function recommencerQuiz() {
    quizIndex = 0;
    quizScore = 0;
    selectedAnswers = {};
    
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    
    afficherQuestionQuiz();
}

console.log('✅ Script Champions League chargé avec succès');