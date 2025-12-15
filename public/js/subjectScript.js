loadUserCategories().then();

async function loadUserCategories(){
    let url = '/api/getCategories';
    let response = await fetch(url);
    let categories = await response.json();

    document.querySelector('#subjectFilter').innerHTML = `<select id="filterOption"><option value="All">All</option>`
    for(let i = 0; i < categories.length; i++){
        document.querySelector('#filterOption').innerHTML += `
            <option value='${categories[i].subject_category}'>${categories[i].subject_category}</option>
        `;
    }
    document.querySelector('#subjectFilter').innerHTML += "</select>";

    document.querySelector('#filterOption').addEventListener('change', displayCategorizedSubjects);
}

async function displayCategorizedSubjects() {
    let option = document.getElementById('filterOption');
    option = option.value;
    console.log(option);
    let url = `/api/searchByCategory/${option}`;
    let response = await fetch(url);
    let subjects = await response.json();

    document.querySelector('.subjects-grid').innerHTML = '';
    for(let i = 0; i < subjects.length; i++) {
        const date = new Date(subjects[i].target_date);
        let formattedDate = date.toLocaleDateString();
        document.querySelector('.subjects-grid').innerHTML += `
            <div class="subject-card">
                <h3 class="subject-title">${subjects[i].subject_name}</h3>
                <div class="subject-desc">
                    <div class="card-counts">
                        <span class="count-type"><strong>Cards Learned:</strong> <span class="count-value">${subjects[i].cards_learned}</span></span>
                        <span class="count-type"><strong>Total Cards:</strong> <span class="count-value">${subjects[i].total_cards}</span></span>
                    </div>
                    <span><strong>Targeted Completion Date:</strong> ${formattedDate}</span>
                    <div class="row-format subject-links">
                        <a href="/subjects/edit/${subjects[i].subject_id}" class="subject-link update-link">Edit<span class="material-symbols-outlined">edit</span></a>
                        <a href="/subjects/delete/${subjects[i].subject_id}" class="subject-link delete-link">Delete<span class="material-symbols-outlined">delete</span></a>
                    </div>
                </div>
            </div>
        `;
    }
}