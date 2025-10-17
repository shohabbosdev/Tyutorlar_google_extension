// Content script to extract tutor information from HEMIS system pages

function extractTutorData() {
  // Look for the specific table structure in HEMIS system (can be on any page)
  const tables = document.querySelectorAll('table.table.table-responsive.table-striped.table-hover');
  
  let targetTable = null;
  
  // Find the table with the tutor group structure
  for (let table of tables) {
    const headers = table.querySelectorAll('thead th');
    if (headers.length >= 4) {
      // Check if we have the required columns: To'liq ismi, Fakultet, Guruhlar
      const headerTexts = Array.from(headers).map(header => header.textContent.trim());
      const hasRequiredColumns = headerTexts.some(text => text.includes('To‘liq ismi')) && 
                                headerTexts.some(text => text.includes('Fakultet')) && 
                                headerTexts.some(text => text.includes('Guruhlar'));
      
      if (hasRequiredColumns) {
        targetTable = table;
        break;
      }
    }
  }
  
  // If we find the table on current page, extract data from it
  if (targetTable) {
    const tutors = [];
    const rows = targetTable.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 5) {
        // Extract full name (column 2) - this is the link with the name
        const fullNameElement = cells[1].querySelector('a');
        let fullName = '';
        if (fullNameElement) {
          // Get only the direct text content, excluding child elements with "text-muted" class
          let directText = '';
          for (let node of fullNameElement.childNodes) {
            // Only get direct text nodes and exclude elements with "text-muted" class
            if (node.nodeType === Node.TEXT_NODE) {
              directText += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('text-muted')) {
              directText += node.textContent;
            }
          }
          fullName = directText.trim();
        }
        
        // Extract faculty (column 3)
        const faculty = cells[2].textContent.trim();
        
        // Extract groups (column 4)
        const groups = cells[3].textContent.trim();
        
        // Only include tutors with non-empty groups
        if (groups && fullName) {
          // Count the number of groups (split by comma and filter out empty ones)
          let groupCount = 0;
          if (groups && groups.trim() !== '') {
            groupCount = groups.split(',').filter(group => group.trim() !== '').length;
          }
          
          tutors.push({
            fullName: fullName,
            faculty: faculty,
            groups: groups,
            groupCount: groupCount
          });
        }
      }
    });
    
    // Sort tutors by full name alphabetically (case insensitive)
    tutors.sort((a, b) => {
      return a.fullName.localeCompare(b.fullName, 'uz', { sensitivity: 'base' });
    });
    
    return {
      tutors: tutors,
      isCorrectPage: true,
      currentPage: window.location.href
    };
  }
  
  // If no table found on current page, indicate that tutor data might be available elsewhere
  return {
    tutors: [],
    isCorrectPage: false,
    currentPage: window.location.href,
    needsRemoteFetch: true
  };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractTutors') {
    const tutorData = extractTutorData();
    sendResponse(tutorData);
    return true;
  } else if (request.action === 'fetchTutorsFromRemote') {
    // Fetch tutor data from the tutor-group page
    fetch('https://hemis.jbnuu.uz/employee/tutor-group')
      .then(response => response.text())
      .then(html => {
        // Parse the HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find the tutor table in the fetched page
        const tables = doc.querySelectorAll('table.table.table-responsive.table-striped.table-hover');
        let targetTable = null;
        
        for (let table of tables) {
          const headers = table.querySelectorAll('thead th');
          if (headers.length >= 4) {
            const headerTexts = Array.from(headers).map(header => header.textContent.trim());
            const hasRequiredColumns = headerTexts.some(text => text.includes('To‘liq ismi')) && 
                                      headerTexts.some(text => text.includes('Fakultet')) && 
                                      headerTexts.some(text => text.includes('Guruhlar'));
            
            if (hasRequiredColumns) {
              targetTable = table;
              break;
            }
          }
        }
        
        if (targetTable) {
          const tutors = [];
          const rows = targetTable.querySelectorAll('tbody tr');
          
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 5) {
              // Extract full name (column 2)
              const fullNameElement = cells[1].querySelector('a');
              let fullName = '';
              if (fullNameElement) {
                let directText = '';
                for (let node of fullNameElement.childNodes) {
                  if (node.nodeType === Node.TEXT_NODE) {
                    directText += node.textContent;
                  } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('text-muted')) {
                    directText += node.textContent;
                  }
                }
                fullName = directText.trim();
              }
              
              // Extract faculty (column 3)
              const faculty = cells[2].textContent.trim();
              
              // Extract groups (column 4)
              const groups = cells[3].textContent.trim();
              
              // Only include tutors with non-empty groups
              if (groups && fullName) {
                // Count the number of groups (split by comma and filter out empty ones)
                let groupCount = 0;
                if (groups && groups.trim() !== '') {
                  groupCount = groups.split(',').filter(group => group.trim() !== '').length;
                }
                
                tutors.push({
                  fullName: fullName,
                  faculty: faculty,
                  groups: groups,
                  groupCount: groupCount
                });
              }
            }
          });
          
          // Sort tutors by full name alphabetically (case insensitive)
          tutors.sort((a, b) => {
            return a.fullName.localeCompare(b.fullName, 'uz', { sensitivity: 'base' });
          });
          
          sendResponse({ tutors: tutors, isCorrectPage: true, fetchedRemotely: true });
        } else {
          sendResponse({ tutors: [], isCorrectPage: false, fetchedRemotely: true });
        }
      })
      .catch(error => {
        console.error('Error fetching tutor data:', error);
        sendResponse({ tutors: [], isCorrectPage: false, error: error.message });
      });
    
    // Return true to indicate that sendResponse will be called asynchronously
    return true;
  }
  return true;
});