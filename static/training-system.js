


// Initialize Feather icons on document load
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Feather icons
    feather.replace();

    // Get main form elements
    const uploadForm = document.getElementById('uploadForm');
    const assignForm = document.getElementById('assignTraineesForm');
    const loader = document.getElementById('loader');

    // Handle document upload form submission
    uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        loader.classList.remove('hidden');

        try {
            const formData = new FormData(this);
            const response = await fetch('/trainer/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                loader.classList.add('hidden');
                console.log('Session ID received:', result.session_id);
                showAssignModal(result.session_id);
            } else {
                alert(result.message);
                loader.classList.add('hidden');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during upload');
            loader.classList.add('hidden');
        }
    });

    // Handle trainee assignment form submission
    // Update the trainee assignment form submission handler
    assignForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const sessionId = document.getElementById('session_id').value;
        const assignmentLoader = document.getElementById('assignmentLoader');
    
        // Show loader
        assignmentLoader.classList.remove('hidden');
        assignmentLoader.style.display = 'flex';
    
        try {
            let response;
            if (document.getElementById('assign-input-method').value === 'text') {
                const emails = document.getElementById('assign-trainee-emails').value
                    .split(',')
                    .map(email => email.trim())
                    .filter(email => email);
    
                response = await fetch('/trainer/assign-trainees', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        session_id: sessionId,
                        trainee_emails: emails
                    })
                });
            } else {
                const fileInput = document.getElementById('assign-trainee-list');
                const formData = new FormData();
                formData.append('trainee_list', fileInput.files[0]);
                formData.append('session_id', sessionId);
    
                response = await fetch('/trainer/assign-trainees-file', {
                    method: 'POST',
                    body: formData
                });
            }
    
            const result = await response.json();
            assignmentLoader.classList.add('hidden');
            assignmentLoader.style.display = 'none';
    
            if (result.status === 'success') {
                alert('Trainees assigned successfully');
                closeAssignModal();
                window.location.reload();
            } else {
                assignmentLoader.classList.add('hidden');
                assignmentLoader.style.display = 'none';
                alert(result.message || 'Failed to assign trainees');
            }
        } catch (error) {
            assignmentLoader.classList.add('hidden');
            assignmentLoader.style.display = 'none';
            console.error('Assignment error:', error);
            alert('An error occurred while assigning trainees');
        }
    });

    // Handle flash messages on page load
    const flashMessages = document.getElementById('flash-messages');
    if (flashMessages) {
        const messages = flashMessages.getElementsByTagName('li');
        for (const message of messages) {
            const messageText = message.textContent;
            if (messageText === 'Excel file with passwords is ready for download') {
                showExcelDownloadNotification();
            } else {
                assignmentLoader.classList.add('hidden');
                alert(messageText);
            }
        }
    }
    
});
feather.replace();
// Modal Functions
function showAssignModal(sessionId) {
    const modal = document.getElementById('assignTraineesModal');
    const sessionInput = document.getElementById('session_id');

    if (!modal || !sessionInput) {
        console.error('Required modal elements not found');
        return;
    }

    sessionInput.value = sessionId;
    modal.classList.remove('hidden');
    feather.replace();
    console.log('Modal shown with session ID:', sessionId);
}

function closeAssignModal() {
    const modal = document.getElementById('assignTraineesModal');
    const assignmentLoader = document.getElementById('assignmentLoader');
    if (modal) {
        modal.classList.add('hidden');
        assignmentLoader.classList.add('hidden');  // Ensure loader is hidden when closing modal
        document.getElementById('assignTraineesForm').reset();
    }
    window.location.reload();
}

// Input method toggle functions
function toggleAssignInputMethod(method) {
    const textSection = document.getElementById('assign-text-input-section');
    const fileSection = document.getElementById('assign-file-input-section');
    const textInput = document.getElementById('assign-trainee-emails');
    const fileInput = document.getElementById('assign-trainee-list');

    if (method === 'text') {
        textSection.classList.remove('hidden');
        fileSection.classList.add('hidden');
        textInput.required = true;
        fileInput.required = false;
        fileInput.value = '';
    } else {
        textSection.classList.add('hidden');
        fileSection.classList.remove('hidden');
        textInput.required = false;
        fileInput.required = true;
        textInput.value = '';
    }
    feather.replace();
}

// Excel download notification functions
function showExcelDownloadNotification() {
    const notification = document.getElementById('excel-download-notification');
    notification.classList.remove('hidden');

    const downloadBtn = document.getElementById('download-excel-btn');
    downloadBtn.href = "/download-excel";

    downloadBtn.addEventListener('click', function () {
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
    });

    feather.replace();
}

// Trainee details toggle function
function toggleTrainees(id) {
    const element = document.getElementById(id);
    element.classList.toggle('hidden');
}

// Browser back button handling
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        const loader = document.getElementById('loader');
        loader.classList.add('hidden');

        const submitButton = document.querySelector('#uploadForm button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <i data-feather="check-circle" class="mr-2 w-5 h-5"></i>
                Create Training
            `;
            feather.replace();
        }
    }
});

// Page unload handling
window.addEventListener('unload', function () {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('hidden');
    }
});

// Debug function for development
function debugFormData(formData) {
    console.log('Form Data Contents:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }
}
function toggleFields() {
    var selectedOption = document.getElementById("options").value;
    var fields = ["document", "video", "audio", "web_url"];
    fields.forEach(function(field) {
        document.getElementById(field).classList.add("hidden");
    });
    if (selectedOption) {
        document.getElementById(selectedOption).classList.remove("hidden");
    }
}

function toggleContentFields(select) {
    const contentSource = select.closest('.content-source');
    const fields = contentSource.querySelectorAll('.content-fields > div');
    fields.forEach(field => field.classList.add('hidden'));
    
    const selectedValue = select.value;
    if (selectedValue) {
        contentSource.querySelector(`.${selectedValue}-field`).classList.remove('hidden');
    }
}

function addContentSource() {
    const template = document.querySelector('.content-source').cloneNode(true);
    template.querySelector('select').value = '';
    template.querySelectorAll('input').forEach(input => input.value = '');
    template.querySelectorAll('.content-fields > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('content-sources').appendChild(template);
}

function removeContentSource(button) {
    const sources = document.querySelectorAll('.content-source');
    if (sources.length > 1) {
        button.closest('.content-source').remove();
    }
}

// Call the function once on page load to ensure correct initial state
document.addEventListener('DOMContentLoaded', toggleFields,feather.replace);


// // Initialize Feather icons on document load
// document.addEventListener('DOMContentLoaded', function () {
//     // Initialize Feather icons
//     feather.replace();

//     // Get main form elements
//     const uploadForm = document.getElementById('uploadForm');
//     const assignForm = document.getElementById('assignTraineesForm');
//     const loader = document.getElementById('loader');

//     // Handle document upload form submission
//     // Modify your existing uploadForm event listener to use the progress bar:
//     uploadForm.addEventListener('submit', async function (e) {
//         e.preventDefault();
//         loader.classList.remove('hidden');
//         const progressInterval = startProgress();

//         try {
//             const formData = new FormData(this);
//             const response = await fetch('/trainer/upload', {
//                 method: 'POST',
//                 body: formData
//             });

//             const result = await response.json();

//             if (result.status === 'success') {
//                 updateProgress(100); // Complete the progress bar
//                 setTimeout(() => {
//                     clearInterval(progressInterval);
//                     loader.classList.add('hidden');
//                     showAssignModal(result.session_id);
//                     updateProgress(0); // Reset progress for next time
//                 }, 500);
//             } else {
//                 clearInterval(progressInterval);
//                 alert(result.message);
//                 loader.classList.add('hidden');
//                 updateProgress(0); // Reset progress
//             }
//         } catch (error) {
//             clearInterval(progressInterval);
//             console.error('Upload error:', error);
//             alert('An error occurred during upload');
//             loader.classList.add('hidden');
//             updateProgress(0); // Reset progress
//         }
//     });


//     // Handle trainee assignment form submission
//     // Update the trainee assignment form submission handler
//     // Modify your existing trainee assignment form submission handler:
//     assignForm.addEventListener('submit', async function (e) {
//         e.preventDefault();
//         const sessionId = document.getElementById('session_id').value;
//         const assignmentLoader = document.getElementById('assignmentLoader');

//         // Show loader and start progress
//         assignmentLoader.classList.remove('hidden');
//         assignmentLoader.style.display = 'flex';
//         const progressInterval = startAssignmentProgress();

//         try {
//             let response;
//             if (document.getElementById('assign-input-method').value === 'text') {
//                 const emails = document.getElementById('assign-trainee-emails').value
//                     .split(',')
//                     .map(email => email.trim())
//                     .filter(email => email);

//                 response = await fetch('/trainer/assign-trainees', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify({
//                         session_id: sessionId,
//                         trainee_emails: emails
//                     })
//                 });
//             } else {
//                 const fileInput = document.getElementById('assign-trainee-list');
//                 const formData = new FormData();
//                 formData.append('trainee_list', fileInput.files[0]);
//                 formData.append('session_id', sessionId);

//                 response = await fetch('/trainer/assign-trainees-file', {
//                     method: 'POST',
//                     body: formData
//                 });
//             }

//             const result = await response.json();

//             // Complete progress and hide loader
//             updateAssignmentProgress(100);
//             setTimeout(() => {
//                 clearInterval(progressInterval);
//                 assignmentLoader.classList.add('hidden');
//                 updateAssignmentProgress(0); // Reset progress

//                 if (result.status === 'success') {
//                     alert('Trainees assigned successfully');
//                     closeAssignModal();
//                     window.location.reload();
//                 } else {
//                     alert(result.message || 'Failed to assign trainees');
//                 }
//             }, 500);

//         } catch (error) {
//             // Handle error and reset progress
//             clearInterval(progressInterval);
//             assignmentLoader.classList.add('hidden');
//             updateAssignmentProgress(0);
//             console.error('Assignment error:', error);
//             alert('An error occurred while assigning trainees');
//         }
//     });

//     // Handle flash messages on page load
//     const flashMessages = document.getElementById('flash-messages');
//     if (flashMessages) {
//         const messages = flashMessages.getElementsByTagName('li');
//         for (const message of messages) {
//             const messageText = message.textContent;
//             if (messageText === 'Excel file with passwords is ready for download') {
//                 showExcelDownloadNotification();
//             } else {
//                 alert(messageText);
//             }
//         }
//     }

// });

// // Modal Functions
// function showAssignModal(sessionId) {
//     const modal = document.getElementById('assignTraineesModal');
//     const sessionInput = document.getElementById('session_id');

//     if (!modal || !sessionInput) {
//         console.error('Required modal elements not found');
//         return;
//     }

//     sessionInput.value = sessionId;
//     modal.classList.remove('hidden');
//     feather.replace();
//     console.log('Modal shown with session ID:', sessionId);
// }
// // Update your closeAssignModal function to reset progress
// function closeAssignModal() {
//     const modal = document.getElementById('assignTraineesModal');
//     const assignmentLoader = document.getElementById('assignmentLoader');
//     if (modal) {
//         modal.classList.add('hidden');
//         assignmentLoader.classList.add('hidden');
//         updateAssignmentProgress(0); // Reset progress when closing modal
//         document.getElementById('assignTraineesForm').reset();
//     }
// }

// // Input method toggle functions
// function toggleAssignInputMethod(method) {
//     const textSection = document.getElementById('assign-text-input-section');
//     const fileSection = document.getElementById('assign-file-input-section');
//     const textInput = document.getElementById('assign-trainee-emails');
//     const fileInput = document.getElementById('assign-trainee-list');

//     if (method === 'text') {
//         textSection.classList.remove('hidden');
//         fileSection.classList.add('hidden');
//         textInput.required = true;
//         fileInput.required = false;
//         fileInput.value = '';
//     } else {
//         textSection.classList.add('hidden');
//         fileSection.classList.remove('hidden');
//         textInput.required = false;
//         fileInput.required = true;
//         textInput.value = '';
//     }
//     feather.replace();
// }

// // Excel download notification functions
// function showExcelDownloadNotification() {
//     const notification = document.getElementById('excel-download-notification');
//     notification.classList.remove('hidden');

//     const downloadBtn = document.getElementById('download-excel-btn');
//     downloadBtn.href = "/download-excel";

//     downloadBtn.addEventListener('click', function () {
//         setTimeout(() => {
//             notification.classList.add('hidden');
//         }, 2000);
//     });

//     feather.replace();
// }

// // Trainee details toggle function
// function toggleTrainees(id) {
//     const element = document.getElementById(id);
//     element.classList.toggle('hidden');
// }

// // Add these new functions for assignment progress
// function updateAssignmentProgress(progress) {
//     const progressBar = document.getElementById('assignment-progress-bar');
//     const progressText = document.getElementById('assignment-progress-text');
//     if (progressBar && progressText) {
//         progressBar.style.width = `${progress}%`;
//         progressText.textContent = progress;
//     }
// }


// function startAssignmentProgress() {
//     let progress = 0;
//     const progressInterval = setInterval(() => {
//         if (progress >= 90) {
//             clearInterval(progressInterval);
//             return;
//         }
//         progress += 10;
//         updateAssignmentProgress(progress);
//     }, 600);
//     return progressInterval;
// }

// // Update your window event listeners to reset progress
// window.addEventListener('pageshow', function (event) {
//     if (event.persisted) {
//         const loader = document.getElementById('loader');
//         loader.classList.add('hidden');
//         updateProgress(0);

//         const submitButton = document.querySelector('#uploadForm button[type="submit"]');
//         if (submitButton) {
//             submitButton.disabled = false;
//             submitButton.innerHTML = `
//                 <i data-feather="check-circle" class="mr-2 w-5 h-5"></i>
//                 Create Training
//             `;
//             feather.replace();
//         }
//     }
// });

// // Page unload handling
// window.addEventListener('unload', function () {
//     const loader = document.getElementById('loader');
//     if (loader) {
//         loader.classList.add('hidden');
//     }
// });

// function updateProgress(progress) {
//     const progressBar = document.getElementById('progress-bar');
//     const progressText = document.getElementById('progress-text');
//     if (progressBar && progressText) {
//         progressBar.style.width = `${progress}%`;
//         progressText.textContent = progress;
//     }
// }

// function startProgress() {
//     let progress = 0;
//     const progressInterval = setInterval(() => {
//         if (progress >= 90) {
//             clearInterval(progressInterval);
//             return;
//         }
//         progress += 10;
//         updateProgress(progress);
//     }, 800);
//     return progressInterval;
// }


// window.addEventListener('unload', function () {
//     const loader = document.getElementById('loader');
//     if (loader) {
//         loader.classList.add('hidden');
//         updateProgress(0);
//     }
// });

// // Debug function for development
// function debugFormData(formData) {
//     console.log('Form Data Contents:');
//     for (let pair of formData.entries()) {
//         console.log(pair[0] + ': ' + pair[1]);
//     }
// }
// function toggleFields() {
//     var selectedOption = document.getElementById("options").value;
//     var fields = ["document", "video", "audio", "web_url"];
//     fields.forEach(function (field) {
//         document.getElementById(field).classList.add("hidden");
//     });
//     if (selectedOption) {
//         document.getElementById(selectedOption).classList.remove("hidden");
//     }
// }

// // Call the function once on page load to ensure correct initial state
// document.addEventListener('DOMContentLoaded', toggleFields);
