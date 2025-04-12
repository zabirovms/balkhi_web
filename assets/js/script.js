// Load poems data from JSON file
fetch('assets/data/poems.json')
    .then(response => response.json())
    .then(data => {
        window.poemsData = data;
        initializeWebsite();
    })
    .catch(error => {
        console.error('Error loading poems data:', error);
        // Fallback data if JSON fails to load
        window.poemsData = {
            poems: [],
            biography: "Мирзо Абдулқодири Балхӣ (1207-1273) яке аз бузургтарин шоирони адабиёти форс-тоҷик аст."
        };
        initializeWebsite();
    });

function initializeWebsite() {
    // Display biography
    document.getElementById('biographyText').textContent = window.poemsData.biography;
    
    // Process poems data and display in different sections
    if (window.poemsData.poems && window.poemsData.poems.length > 0) {
        displayPoems('topPoemsContainer', window.poemsData.poems.filter(p => p.likes > 50).sort((a, b) => b.likes - a.likes).slice(0, 6));
        displayPoems('newPoemsContainer', window.poemsData.poems.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6));
        displayPoems('recommendedPoemsContainer', window.poemsData.poems.filter(p => p.recommended).slice(0, 6));
        displayPoems('allPoemsContainer', window.poemsData.poems);
    }
    
    // Set up search functionality
    document.getElementById('searchButton').addEventListener('click', searchPoems);
    document.getElementById('mainSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchPoems();
    });
    
    // Set up filter functionality
    document.getElementById('filterSelect').addEventListener('change', filterPoems);
    
    // Set up poem modal
    const poemModal = new bootstrap.Modal(document.getElementById('poemModal'));
    
    // Like button functionality
    document.getElementById('likePoemBtn').addEventListener('click', function() {
        this.classList.toggle('liked');
        const likeCount = document.getElementById('likeCount');
        likeCount.textContent = this.classList.contains('liked') ? 
            parseInt(likeCount.textContent) + 1 : 
            parseInt(likeCount.textContent) - 1;
    });
    
    // Share button functionality
    document.getElementById('sharePoemBtn').addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: document.getElementById('poemModalTitle').textContent,
                text: 'Шеъри зебо аз Балхӣ',
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
            });
        } else {
            alert('Имкони бахшдан дастнорас аст. Лутфан пайвандро дастӣ нусхабардорӣ кунед.');
        }
    });
    
    // Comment functionality
    document.getElementById('submitComment').addEventListener('click', function() {
        const commentText = document.getElementById('commentText').value;
        if (commentText.trim()) {
            const commentsContainer = document.getElementById('poemComments');
            const newComment = document.createElement('div');
            newComment.className = 'comment mb-3 p-2 bg-light rounded';
            newComment.innerHTML = `
                <strong>Корбари номаълум</strong>
                <p>${commentText}</p>
                <small class="text-muted">Ҳозира</small>
            `;
            commentsContainer.appendChild(newComment);
            document.getElementById('commentText').value = '';
        }
    });
}

function displayPoems(containerId, poems) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    poems.forEach(poem => {
        const poemCard = document.createElement('div');
        poemCard.className = 'col-md-4 mb-4';
        poemCard.innerHTML = `
            <div class="card poem-card h-100">
                <div class="card-body">
                    <h5 class="card-title poem-title">${poem.title}</h5>
                    <p class="card-text">${poem.content.split('\n')[0].substring(0, 100)}...</p>
                    <button class="btn btn-sm btn-outline-primary view-poem" data-poem-id="${poem.id}">Хондан</button>
                    <span class="float-end text-muted"><i class="far fa-heart"></i> ${poem.likes}</span>
                </div>
            </div>
        `;
        container.appendChild(poemCard);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-poem').forEach(btn => {
        btn.addEventListener('click', function() {
            const poemId = parseInt(this.getAttribute('data-poem-id'));
            const poem = window.poemsData.poems.find(p => p.id === poemId);
            if (poem) {
                document.getElementById('poemModalTitle').textContent = poem.title;
                document.getElementById('poemModalContent').innerHTML = poem.content.replace(/\n/g, '<br>');
                document.getElementById('likeCount').textContent = poem.likes;
                const poemModal = new bootstrap.Modal(document.getElementById('poemModal'));
                poemModal.show();
            }
        });
    });
}

function searchPoems() {
    const searchTerm = document.getElementById('mainSearch').value.toLowerCase();
    if (!searchTerm) return;
    
    const filteredPoems = window.poemsData.poems.filter(poem => 
        poem.title.toLowerCase().includes(searchTerm) || 
        poem.content.toLowerCase().includes(searchTerm)
    );
    
    displayPoems('allPoemsContainer', filteredPoems);
    
    // Switch to All Poems tab
    const allTab = new bootstrap.Tab(document.getElementById('all-tab'));
    allTab.show();
}

function filterPoems() {
    const filterValue = document.getElementById('filterSelect').value;
    let filteredPoems = window.poemsData.poems;
    
    if (filterValue !== 'all') {
        filteredPoems = window.poemsData.poems.filter(poem => poem.type === filterValue);
    }
    
    displayPoems('allPoemsContainer', filteredPoems);
    
    // Switch to All Poems tab
    const allTab = new bootstrap.Tab(document.getElementById('all-tab'));
    allTab.show();
}
