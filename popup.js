// Popup script to display tutor information

document.addEventListener('DOMContentLoaded', function() {
  // Get the active tab and request tutor data
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'extractTutors'}, function(response) {
      // Check for errors
      if (chrome.runtime.lastError) {
        // Handle the case when content script is not available
        displayError('Kengaytma HEMIS sahifasida mavjud emas. Iltimos, HEMIS tizimiga kiring va qayta urinib ko\'ring.');
        return;
      }
      
      const loadingElement = document.getElementById('loading');
      const tbody = document.getElementById('tutor-data');
      
      // Hide loading element by default
      loadingElement.style.display = 'none';
      
      if (response) {
        // Check if we're on the correct page with the table
        if (!response.isCorrectPage && response.needsRemoteFetch) {
          // Try to fetch data from the tutor-group page
          loadingElement.style.display = 'block';
          loadingElement.innerHTML = '<div class="no-data">Ma\'lumotlar yuklanmoqda...<br><small style="color: #999;">Bu biroz vaqt olishi mumkin</small></div>';
          
          chrome.tabs.sendMessage(tabs[0].id, {action: 'fetchTutorsFromRemote'}, function(remoteResponse) {
            if (chrome.runtime.lastError) {
              displayError('Ma\'lumotlarni yuklashda xatolik yuz berdi. Iltimos, HEMIS tizimiga kiring va qayta urinib ko\'ring.');
              return;
            }
            
            if (remoteResponse && remoteResponse.tutors) {
              loadingElement.style.display = 'none';
              
              if (remoteResponse.tutors.length === 0) {
                loadingElement.style.display = 'block';
                loadingElement.innerHTML = '<div class="no-data">Guruhlari mavjud bo\'lgan tutorlar topilmadi</div>';
                return;
              }
              
              // Calculate total student count
              let totalStudentCount = 0;
              remoteResponse.tutors.forEach(tutor => {
                totalStudentCount += tutor.totalStudents || 0;
              });
              
              // Populate the table with tutor data (only tutors with groups)
              remoteResponse.tutors.forEach((tutor, index) => {
                const row = document.createElement('tr');
                
                // Serial number column
                const serialCell = document.createElement('td');
                serialCell.innerHTML = `<div class="serial-number">${index + 1}</div>`;
                
                const nameCell = document.createElement('td');
                nameCell.textContent = tutor.fullName;
                nameCell.style.fontWeight = '500';
                
                const facultyCell = document.createElement('td');
                facultyCell.textContent = tutor.faculty;
                
                const groupsCell = document.createElement('td');
                groupsCell.innerHTML = makeGroupsClickable(tutor.groups, tutor.groupStudents);
                groupsCell.style.color = '#2c3e50';
                
                // Group count column with error handling
                const groupCountCell = document.createElement('td');
                const groupCount = tutor.groupCount && !isNaN(tutor.groupCount) ? tutor.groupCount : 0;
                groupCountCell.innerHTML = `<div class="group-count">${groupCount}</div>`;
                
                // Total students column
                const totalStudentsCell = document.createElement('td');
                const totalStudents = tutor.totalStudents && !isNaN(tutor.totalStudents) ? tutor.totalStudents : 0;
                totalStudentsCell.innerHTML = `<div class="group-count">${totalStudents}</div>`;
                
                row.appendChild(serialCell);
                row.appendChild(nameCell);
                row.appendChild(facultyCell);
                row.appendChild(groupsCell);
                row.appendChild(groupCountCell);
                row.appendChild(totalStudentsCell);
                
                tbody.appendChild(row);
              });
              
              // Add total student count row at the bottom
              if (totalStudentCount > 0) {
                const totalRow = document.createElement('tr');
                totalRow.style.fontWeight = 'bold';
                totalRow.style.background = '#e3f2fd';
                
                const totalLabelCell = document.createElement('td');
                totalLabelCell.colSpan = 5;
                totalLabelCell.textContent = 'Jami talabalar soni:';
                totalLabelCell.style.textAlign = 'right';
                
                const totalValueCell = document.createElement('td');
                totalValueCell.innerHTML = `<div class="group-count">${totalStudentCount}</div>`;
                
                totalRow.appendChild(totalLabelCell);
                totalRow.appendChild(totalValueCell);
                
                tbody.appendChild(totalRow);
              }
            } else {
              displayError('Ma\'lumotlarni yuklashda xatolik yuz berdi. Iltimos, sahifani yangilang.');
            }
          });
          return;
        }
        
        // We're on the correct page
        if (response.tutors.length === 0) {
          loadingElement.style.display = 'block';
          loadingElement.innerHTML = '<div class="no-data">Guruhlari mavjud bo\'lgan tutorlar topilmadi</div>';
          return;
        }
        
        // Calculate total student count
        let totalStudentCount = 0;
        response.tutors.forEach(tutor => {
          totalStudentCount += tutor.totalStudents || 0;
        });
        
        // Populate the table with tutor data (only tutors with groups)
        response.tutors.forEach((tutor, index) => {
          const row = document.createElement('tr');
          
          // Serial number column
          const serialCell = document.createElement('td');
          serialCell.innerHTML = `<div class="serial-number">${index + 1}</div>`;
          
          const nameCell = document.createElement('td');
          nameCell.textContent = tutor.fullName;
          nameCell.style.fontWeight = '500';
          
          const facultyCell = document.createElement('td');
          facultyCell.textContent = tutor.faculty;
          
          const groupsCell = document.createElement('td');
          groupsCell.innerHTML = makeGroupsClickable(tutor.groups, tutor.groupStudents);
          groupsCell.style.color = '#2c3e50';
          
          // Group count column with error handling
          const groupCountCell = document.createElement('td');
          const groupCount = tutor.groupCount && !isNaN(tutor.groupCount) ? tutor.groupCount : 0;
          groupCountCell.innerHTML = `<div class="group-count">${groupCount}</div>`;
          
          // Total students column
          const totalStudentsCell = document.createElement('td');
          const totalStudents = tutor.totalStudents && !isNaN(tutor.totalStudents) ? tutor.totalStudents : 0;
          totalStudentsCell.innerHTML = `<div class="group-count">${totalStudents}</div>`;
          
          row.appendChild(serialCell);
          row.appendChild(nameCell);
          row.appendChild(facultyCell);
          row.appendChild(groupsCell);
          row.appendChild(groupCountCell);
          row.appendChild(totalStudentsCell);
          
          tbody.appendChild(row);
        });
        
        // Add total student count row at the bottom
        if (totalStudentCount > 0) {
          const totalRow = document.createElement('tr');
          totalRow.style.fontWeight = 'bold';
          totalRow.style.background = '#e3f2fd';
          
          const totalLabelCell = document.createElement('td');
          totalLabelCell.colSpan = 5;
          totalLabelCell.textContent = 'Jami talabalar soni:';
          totalLabelCell.style.textAlign = 'right';
          
          const totalValueCell = document.createElement('td');
          totalValueCell.innerHTML = `<div class="group-count">${totalStudentCount}</div>`;
          
          totalRow.appendChild(totalLabelCell);
          totalRow.appendChild(totalValueCell);
          
          tbody.appendChild(totalRow);
        }
      } else {
        // Handle case when content script returns no data
        displayError('Ma\'lumotlarni yuklashda xatolik yuz berdi. Iltimos, sahifani yangilang.');
      }
    });
  });
});

// Function to make group numbers clickable with student count
function makeGroupsClickable(groups, groupStudents) {
  if (!groups) return '';
  
  // Split groups by comma and create clickable links
  const groupArray = groups.split(',');
  const clickableGroups = groupArray.map((group, index) => {
    // Clean the group name by removing any special characters or symbols
    const trimmedGroup = group.trim().replace(/[^\d\-\w]/g, '');
    if (trimmedGroup) {
      // Get student count for this group if available
      let studentCount = '';
      if (groupStudents && groupStudents[index]) {
        studentCount = ` (${groupStudents[index]} ta)`;
      }
      
      // Create a link that will open the group page and fill the search field
      // Use data attributes instead of inline onclick handlers to avoid CSP issues
      return `<a href="https://hemis.jbnuu.uz/student/group?EGroup[search]=${encodeURIComponent(trimmedGroup)}" 
                target="_blank" 
                class="group-link"
                data-group="${trimmedGroup}"
                style="color: #667eea; text-decoration: underline; margin-right: 2px;">${trimmedGroup}${studentCount}</a>`;
    }
    return group.trim();
  });
  
  return clickableGroups.join(', ');
}

// Add event listener for group links to avoid CSP issues
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('group-link')) {
    e.preventDefault();
    const groupName = e.target.getAttribute('data-group');
    fillSearchAndNavigate(groupName);
  }
});

// Function to fill search field and navigate to group page
function fillSearchAndNavigate(groupName) {
  // Open the group page in a new tab
  chrome.tabs.create({url: 'https://hemis.jbnuu.uz/student/group'}, function(tab) {
    // Wait a bit for the page to load, then inject script to fill the search field
    setTimeout(function() {
      chrome.tabs.executeScript(tab.id, {
        code: `
          // Wait for the page to fully load
          setTimeout(function() {
            // Try to find the search input field
            var searchInput = document.getElementById('egroup-search');
            if (searchInput) {
              // Fill the search field with the group name
              searchInput.value = '${groupName}';
              // Trigger input event to update the UI
              var event = new Event('input', { bubbles: true });
              searchInput.dispatchEvent(event);
              // Trigger change event
              var changeEvent = new Event('change', { bubbles: true });
              searchInput.dispatchEvent(changeEvent);
              // Try to submit the form or trigger search
              var form = searchInput.closest('form');
              if (form) {
                // Try to find and click search button
                var searchButton = form.querySelector('button[type="submit"]');
                if (searchButton) {
                  searchButton.click();
                }
              }
            }
          }, 1000);
        `
      });
    }, 2000); // Wait 2 seconds for page to load
  });
}

// Function to display error messages
function displayError(message) {
  const loadingElement = document.getElementById('loading');
  loadingElement.style.display = 'block';
  loadingElement.innerHTML = `
    <div style="text-align: center; padding: 30px;">
      <p style="font-size: 16px; color: #e74c3c; margin-bottom: 15px;">${message}</p>
      <p style="font-weight: 500; margin-bottom: 10px;">Iltimos:</p>
      <ol style="text-align: left; display: inline-block; font-size: 14px;">
        <li>HEMIS tizimiga kirganingizga ishonch hosil qiling</li>
        <li>Sahifani yangilang (F5)</li>
        <li>Kengaytmani qayta o'rnating</li>
      </ol>
    </div>
  `;
}