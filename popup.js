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
          loadingElement.innerHTML = '<div class="no-data">Ma\'lumotlar yuklanmoqda...</div>';
          
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
                groupsCell.textContent = tutor.groups;
                groupsCell.style.color = '#2c3e50';
                
                row.appendChild(serialCell);
                row.appendChild(nameCell);
                row.appendChild(facultyCell);
                row.appendChild(groupsCell);
                
                tbody.appendChild(row);
              });
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
          groupsCell.textContent = tutor.groups;
          groupsCell.style.color = '#2c3e50';
          
          row.appendChild(serialCell);
          row.appendChild(nameCell);
          row.appendChild(facultyCell);
          row.appendChild(groupsCell);
          
          tbody.appendChild(row);
        });
      } else {
        // Handle case when content script returns no data
        displayError('Ma\'lumotlarni yuklashda xatolik yuz berdi. Iltimos, sahifani yangilang.');
      }
    });
  });
});

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