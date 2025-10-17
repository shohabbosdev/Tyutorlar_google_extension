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

// Function to make group numbers clickable
function makeGroupsClickable(groups) {
  if (!groups) return '';
  
  // Split groups by comma and create clickable links
  const groupArray = groups.split(',');
  const clickableGroups = groupArray.map(group => {
    // Clean the group name by removing any special characters or symbols
    const trimmedGroup = group.trim().replace(/[^\d\-\w]/g, '');
    if (trimmedGroup) {
      // Create a link to the group search page with the group name as search parameter
      return `<a href="https://hemis.jbnuu.uz/student/group?EGroup[search]=${encodeURIComponent(trimmedGroup)}" 
                target="_blank" 
                style="color: #667eea; text-decoration: underline; margin-right: 2px;">${trimmedGroup}</a>`;
    }
    return group.trim();
  });
  
  return clickableGroups.join(', ');
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
          
          // First, collect all group names to fetch their student counts
          const groupNames = [];
          const tutorData = [];
          
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
                
                // Collect group names for student count fetching
                const groupArray = groups.split(',');
                groupArray.forEach(group => {
                  const trimmedGroup = group.trim().replace(/[^\d\-\w]/g, '');
                  if (trimmedGroup) {
                    groupNames.push(trimmedGroup);
                  }
                });
                
                tutorData.push({
                  fullName: fullName,
                  faculty: faculty,
                  groups: groups,
                  groupCount: groupCount,
                  groupArray: groupArray
                });
              }
            }
          });
          
          // Optimization: Limit the number of concurrent requests to avoid overwhelming the server
          // Process groups in batches of 5 to reduce server load and improve performance
          const batchSize = 5;
          const batches = [];
          for (let i = 0; i < groupNames.length; i += batchSize) {
            batches.push(groupNames.slice(i, i + batchSize));
          }
          
          // Process batches sequentially to avoid overwhelming the server
          let groupStudentMap = {};
          let batchIndex = 0;
          
          function processBatch() {
            if (batchIndex >= batches.length) {
              // All batches processed, now compile the results
              compileResults();
              return;
            }
            
            const currentBatch = batches[batchIndex];
            Promise.all(currentBatch.map(groupName => 
              fetch(`https://hemis.jbnuu.uz/student/group?EGroup[search]=${encodeURIComponent(groupName)}`)
                .then(response => response.text())
                .catch(error => {
                  console.warn(`Failed to fetch data for group ${groupName}:`, error);
                  return ''; // Return empty string on error
                })
            ))
            .then(batchResults => {
              // Process results for this batch
              batchResults.forEach((pageHtml, index) => {
                if (!pageHtml) return; // Skip if fetch failed
                
                const groupName = currentBatch[index];
                const pageDoc = parser.parseFromString(pageHtml, 'text/html');
                
                // Find the group table with the specific structure
                // Looking for: div#data-grid > div.box-body.no-padding > table.table.table-responsive.table-striped.table-hover
                const dataGrid = pageDoc.querySelector('#data-grid');
                if (dataGrid) {
                  const boxBody = dataGrid.querySelector('.box-body.no-padding');
                  if (boxBody) {
                    const groupTable = boxBody.querySelector('table.table.table-responsive.table-striped.table-hover');
                    if (groupTable) {
                      const groupRows = groupTable.querySelectorAll('tbody tr');
                      for (let row of groupRows) {
                        const cells = row.querySelectorAll('td');
                        // Check if this row contains our group (first column)
                        if (cells.length > 0 && cells[0].textContent.trim() === groupName) {
                          // Extract student count from 7th column (index 6)
                          if (cells.length >= 7) {
                            const studentCountText = cells[6].textContent.trim();
                            const studentCount = parseInt(studentCountText, 10);
                            if (!isNaN(studentCount)) {
                              groupStudentMap[groupName] = studentCount;
                            }
                          }
                          break;
                        }
                      }
                    }
                  }
                }
              });
              
              // Move to next batch
              batchIndex++;
              setTimeout(processBatch, 100); // Small delay to prevent overwhelming
            })
            .catch(error => {
              console.error('Error processing batch:', error);
              batchIndex++;
              setTimeout(processBatch, 100); // Continue with next batch even if current fails
            });
          }
          
          function compileResults() {
            // Add student counts to tutor data
            tutorData.forEach(tutor => {
              const groupStudents = [];
              let totalStudents = 0;
              
              tutor.groupArray.forEach(group => {
                const trimmedGroup = group.trim().replace(/[^\d\-\w]/g, '');
                if (trimmedGroup && groupStudentMap[trimmedGroup]) {
                  groupStudents.push(groupStudentMap[trimmedGroup]);
                  totalStudents += groupStudentMap[trimmedGroup];
                } else {
                  groupStudents.push(0);
                }
              });
              
              tutors.push({
                fullName: tutor.fullName,
                faculty: tutor.faculty,
                groups: tutor.groups,
                groupCount: tutor.groupCount,
                groupStudents: groupStudents,
                totalStudents: totalStudents
              });
            });
            
            // Sort tutors by full name alphabetically (case insensitive)
            tutors.sort((a, b) => {
              return a.fullName.localeCompare(b.fullName, 'uz', { sensitivity: 'base' });
            });
            
            sendResponse({ tutors: tutors, isCorrectPage: true, fetchedRemotely: true });
          }
          
          // Start processing batches
          processBatch();
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