const URL_DRP_FACILITY = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSz79935IRGsGoV7cw9rsLQ62GIfUb0pLen4KjS-rJwzmGumggj97Sprb9582DW-A_jpG84bscwuX-w/pub?gid=1001329693&single=true&output=csv';
let liveDRMData = [];

// Fetch live DRM data
Papa.parse(URL_DRP_FACILITY, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        liveDRMData = results.data.map(d => ({
            facility: d['Facility name'] || d.Facility || '',
            district: d.District || '',
            teams: parseInt(d.Medical_Teams) || 0,
            fourwd: parseInt(d.Four_WD) || 0,
            amb: parseInt(d.Ambulances) || 0,
            tents: 0, // Placeholder if no tents in new data
            water: d.Water_Supply || 'Standby',
            plan: d.Disaster_Plan || d.Disaster_plan || '',
            genset: d.Genset || '',
            sat: d.Sat_Phone || '',
            mhrt: d.MHRT || '',
            lat: d.Latitude || '',
            lng: d.Longitude || ''
        })).filter(d => d.facility !== '');
        
        console.log("Loaded DRM Data:", liveDRMData.length, "facilities");
        populateFacilityFilter();
        loadAssetTable();
    }
});

function populateFacilityFilter() {
    const filterSelect = document.getElementById('facilityFilter');
    // Keep 'All Facilities' option, remove others
    filterSelect.innerHTML = '<option value="All">All Facilities</option>';
    
    // Get unique districts/facilities or just facilities
    liveDRMData.sort((a, b) => a.facility.localeCompare(b.facility)).forEach(fac => {
        const option = document.createElement('option');
        option.value = fac.facility;
        option.text = fac.facility;
        filterSelect.appendChild(option);
    });
}

function loadAssetTable(filter = "All") {
    const tbody = document.getElementById('assetTableBody');
    tbody.innerHTML = '';
    
    liveDRMData.forEach(asset => {
        if (filter !== "All" && asset.facility !== filter) return;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 500; color: #60a5fa; cursor: pointer; text-decoration: underline;" onclick="openFacilityModal('${asset.facility}')">${asset.facility}</td>
            <td>${asset.teams}</td>
            <td>${asset.fourwd}</td>
            <td>${asset.amb}</td>
            <td>${asset.tents}</td>
            <td><span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${asset.water}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('facilityFilter').addEventListener('change', (e) => {
    loadAssetTable(e.target.value);
});

// Modal Logic
function openFacilityModal(facilityName) {
    const asset = liveDRMData.find(d => d.facility === facilityName);
    if (!asset) return;

    document.getElementById('modal-facility-title').innerText = asset.facility;
    document.getElementById('modal-district').innerText = asset.district || 'N/A';
    document.getElementById('modal-teams').innerText = asset.teams;
    document.getElementById('modal-4wd').innerText = asset.fourwd;
    document.getElementById('modal-amb').innerText = asset.amb;
    
    document.getElementById('modal-gps').innerText = asset.lat && asset.lng ? `${asset.lat}, ${asset.lng}` : 'Coordinates Unavailable';

    // Build Readiness Badges
    let badges = '';
    if (asset.plan && asset.plan !== 'No' && asset.plan !== 'N/A') {
        badges += `<span style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">📝 Plan: ${asset.plan}</span>`;
    }
    if (asset.water && asset.water !== 'No' && asset.water !== 'N/A' && asset.water !== 'Standby') {
        badges += `<span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">💧 Water: ${asset.water}</span>`;
    }
    if (asset.genset === 'Yes') {
        badges += `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">⚡ Genset</span>`;
    }
    if (asset.sat === 'Yes') {
        badges += `<span style="background: rgba(139, 92, 246, 0.2); color: #a78bfa; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">📡 Sat Phone</span>`;
    }
    if (asset.mhrt === 'Yes') {
        badges += `<span style="background: rgba(236, 72, 153, 0.2); color: #f472b6; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">🧠 MHRT</span>`;
    }
    if (badges === '') badges = '<span style="color: var(--text-secondary); font-size: 0.9rem;">No specific readiness badges reported.</span>';
    
    document.getElementById('modal-badges').innerHTML = badges;
    
    document.getElementById('facilityModal').style.display = 'flex';
}

function closeFacilityModal() {
    document.getElementById('facilityModal').style.display = 'none';
}

// Close modal when clicking outside
document.getElementById('facilityModal').addEventListener('click', (e) => {
    if (e.target.id === 'facilityModal') closeFacilityModal();
});

// Form Submission Simulation
document.getElementById('drm-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const msg = document.getElementById('submitMessage');
    
    submitBtn.innerText = 'Syncing to Logistics Database...';
    submitBtn.style.opacity = '0.7';
    
    setTimeout(() => {
        submitBtn.innerText = 'Update Logistics Database';
        submitBtn.style.opacity = '1';
        
        msg.innerText = '✅ Asset Logistics successfully updated!';
        msg.style.color = '#10b981';
        
        this.reset();
        setTimeout(() => { msg.innerText = ''; }, 5000);
    }, 1500);
});
