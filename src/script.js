

var isdemo = true;

function runSearch(e)
{
    var inputText = placeInputText.value;
    if (inputText.length > 0)
    {
        searchByLocation(inputText);
    }    
}

function searchByLocation(cityNameAsSearchString)
{
    cityNameAsSearchString = '&school.city=' + cityNameAsSearchString.replace(' ', '%20');
    const Http = new XMLHttpRequest();
    var url='https://api.data.gov/ed/collegescorecard/v1/schools?fields=school.name,id,location.lat,location.lon,school.tuition_revenue_per_fte,school.instructional_expenditure_per_fte,latest.student.demographics.race_ethnicity.white,latest.student.demographics.race_ethnicity.black,latest.student.demographics.race_ethnicity.hispanic,latest.student.demographics.race_ethnicity.asian,latest.student.demographics.race_ethnicity.aian,latest.student.demographics.race_ethnicity.nhpi,latest.student.demographics.race_ethnicity.two_or_more,latest.student.demographics.race_ethnicity.non_resident_alien,latest.student.demographics.race_ethnicity.unknown,latest.student.demographics.race_ethnicity.white_non_hispanic,latest.student.demographics.race_ethnicity.black_non_hispanic,latest.student.demographics.race_ethnicity.asian_pacific_islander[0]&api_key=fOmdUI7bGDMXqQi9o5h1ToFEhVylxUNOmyHbN2Yp';
    url = url.replace('[0]', cityNameAsSearchString);
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange=function(){
        if (this.readyState==4){ 
            createCardHTML(Http.responseText);
        }
    }
}

function getInstitutionByID(id)
{
    const Http = new XMLHttpRequest();
    var url='https://api.data.gov/ed/collegescorecard/v1/schools?id=[0]&api_key=fOmdUI7bGDMXqQi9o5h1ToFEhVylxUNOmyHbN2Yp';
    url = url.replace('[0]', id);
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange=function(){
        if (this.readyState==4){ 
            // console.log(Http.responseText);
            createPageHTML(Http.responseText);
        }
    }
}

function createPageHTML(chosenData)
{
    for (result of JSON.parse(chosenData).results) {
        console.log(result);
        var resultStats = result.school['name'];
        results.innerHTML = resultStats;
        
        console.log(result.location['lon']);
    }
    //console.log(result);
    var collegeHTML = `
    <div class="container">
    <div class="row">
        <div class="col">
        Accreditor: ${result.school['accreditor']}<br />
        Branches: ${result.school['branches']}<br />
        City: ${result.school['city']}<br />
        Faculty Salary: $${result.school['faculty_salary']}<br />
        FTE Faculty rate: ${Math.round(result.school['ft_faculty_rate']*100,2)}%<br />
        Revenue per FTE: $${result.school['tuition_revenue_per_fte']}<br />
        Expenses per FTE: $${result.school['instructional_expenditure_per_fte']}<br />
        URL: ${result.school['school_url']}<br />
        </div>
        <div cass="col">
            <div id='map2' style='width: 400px; height: 300px;'></div>
        </div>
    </div>`;
    cardrow.innerHTML = collegeHTML;

    var lng = result.location['lon'];
    var lat = result.location['lat'];

    mapboxgl.accessToken = 'pk.eyJ1IjoiemFjc2t5Y29ob3J0IiwiYSI6ImNqbzN4bnJmMjEyODEzcHFpMXlqYTh1ZGEifQ.udtQH-hppvF3aHIHasra_g';
      var map = new mapboxgl.Map({
      container: 'map2',
      style: 'mapbox://styles/mapbox/streets-v10',
      center: [result.location['lon'], result.location['lat']],
      zoom: 11
      });

        var m2 = new mapboxgl.Marker()
          .setLngLat([result.location['lon'], result.location['lat']])
          .addTo(map);

          

}

function createCardHTML(chosenData)
{

    var meta = JSON.parse(chosenData).metadata;
    var resultStats = `Showing ${meta.page * meta.per_page + 1} to ${meta.page * meta.per_page + 20} of ${meta.total} results`;
    results.innerHTML = resultStats;
    var cardHTML = '';
    var tableHTML = `<table class="table">
    <thead>
      <tr>
        <th scope="col">School</th>
        <th scope="col">Ethnicities</th>
        <th scope="col">Revenue per FTE</th>
        <th scope="col">Expense per FTE</th>
      </tr>
    </thead>
    <tbody>`;
    for (result of JSON.parse(chosenData).results) {
        ethnicity = [];
        ethnicity.push({"name": "aian", "value":result['latest.student.demographics.race_ethnicity.aian']});
        ethnicity.push({"name": "asian", "value":result['latest.student.demographics.race_ethnicity.asian']});
        //ethnicity.push({"name": "asian pacific islander", "value":result['latest.student.demographics.race_ethnicity.asian_pacific_islander']});
        ethnicity.push({"name": "black", "value":result['latest.student.demographics.race_ethnicity.black']});
        //ethnicity.push({"name": "black non hispanic", "value":result['latest.student.demographics.race_ethnicity.black_non_hispanic']});
        ethnicity.push({"name": "hispanic", "value":result['latest.student.demographics.race_ethnicity.hispanic']});
        ethnicity.push({"name": "nhpi", "value":result['latest.student.demographics.race_ethnicity.nhpi']});
        ethnicity.push({"name": "non resident alien", "value":result['latest.student.demographics.race_ethnicity.non_resident_alien']});
        ethnicity.push({"name": "two or more", "value":result['latest.student.demographics.race_ethnicity.two_or_more']});
        ethnicity.push({"name": "unknown", "value":result['latest.student.demographics.race_ethnicity.unknown']});
        ethnicity.push({"name": "white", "value":result['latest.student.demographics.race_ethnicity.white']});
        //ethnicity.push({"name": "white non hispanic", "value":result['latest.student.demographics.race_ethnicity.white_non_hispanic']});
        
         ethnicity.sort(function(a,b){
            return b.value - a.value
         });

         tableHTML +=
            `<tr onclick="getInstitutionByID(${result.id})">
            <th scope="row">${result['school.name']}</th>
            <td>${(ethnicity[0].value != null) ? ethnicity[0].name: 'N/A'}(${Math.round(ethnicity[0].value * 100,2)}%),
                             ${(ethnicity[1].value != null) ? ethnicity[1].name: 'N/A'}(${Math.round(ethnicity[1].value * 100,2)}%),
                             ${(ethnicity[2].value != null) ? ethnicity[2].name: 'N/A'}(${Math.round(ethnicity[2].value * 100,2)}%)</td>
            <td>$${result['school.tuition_revenue_per_fte']}</td>
            <td>$${result['school.instructional_expenditure_per_fte']}</td>
          </tr>`

        // cardHTML += 
        //     `<div class="card w-100 mb-4 shadow-sm" onclick="getInstitutionByID(${result.id})">
        //         <div class="card-header">${result['school.name']}</div>
        //         <div class="card-body">
        //             <p class="card-text">
        //                 Main ethnicity: 
        //                 ${(ethnicity[0].value != null) ? ethnicity[0].name: 'N/A'}(${Math.round(ethnicity[0].value * 100,2)}%),
        //                 ${(ethnicity[1].value != null) ? ethnicity[1].name: 'N/A'}(${Math.round(ethnicity[1].value * 100,2)}%),
        //                 ${(ethnicity[2].value != null) ? ethnicity[2].name: 'N/A'}(${Math.round(ethnicity[2].value * 100,2)}%)
        //             </p>
        //                 Tuition Revnue per fte: $${result['school.tuition_revenue_per_fte']} <br/>
        //                 Instruction expenditure per fte: $${result['school.instructional_expenditure_per_fte']}
        //             </div>
        //         </div>
        //     </div>`
        //     ;
    }
    tableHTML += `</tbody>
    </table>`;
    cardrow.innerHTML = tableHTML;
}

function populateKeywordFilterMenu(data)
{
    //Populate the Keyword master list
    var masterList = [];

        data.map(d => {
            for (element of d.keywordList)
            {
                masterList.push(element);
            }
        });

    const html = masterList.filter(onlyUnique)
        .sort()
        .map(option => {
            return `<a class="dropdown-item" href="#" data-key="${option}">${option}</a>`
        }).join('');
    
        keywordDropDown.innerHTML = html;

        const keys = Array.from(document.querySelectorAll('.dropdown-item'));
        keys.forEach(key => key.addEventListener('click', filterResults));
}


function filterResults(e){
    var keywordFilter = '';
    //var jobTypeFilter ='';
    var filteredData = [];

    if (e.srcElement.parentElement.id === 'keywordDropDown')
    {
        keywordFilter = e.srcElement.innerHTML;
        keywordDDButton.innerHTML = keywordFilter;
        
    } 

    filteredData = qldData.filter(d => d.keywordList.includes(keywordFilter));
    createCardHTML(filteredData);
}

const cardrow = document.querySelector('.cardrow');
const results = document.querySelector('.results');
// const keywordDropDown = document.querySelector('#keywordDropDown')
// const keywordDDButton = document.querySelector('#keywordFilterButton')
// const jobTypeDropDown = document.querySelector('#jobTypeDropDown')
// const jobTypeDDButton = document.querySelector('#jobTypeFilterButton')
const placeInputText = document.querySelector('#placeTxt');
const mapBox = document.querySelector('#map');


