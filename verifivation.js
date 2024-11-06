// Firebase configuration (replace with your Firebase project settings)
const firebaseConfig = {
    apiKey: "AIzaSyDLlMDgSuzMwcBK4gKbH-zLD_LDQSPA8RQ",
    authDomain: "crestview-6fac1.firebaseapp.com",
    projectId: "crestview-6fac1",
    storageBucket: "crestview-6fac1.firebasestorage.app",
    messagingSenderId: "171706842554",
    appId: "1:171706842554:web:284347abdabe50662ef183"
  };

// Initialize Firebase and Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM elements
const memberCountInput = document.getElementById('memberCount');
const memberFieldsContainer = document.getElementById('memberFields');
const roomBookingBtn = document.getElementById('roomBookingBtn');
const verifyBtn = document.getElementById('verifyBtn');
const verificationInput = document.getElementById('verificationDocument');
const verificationPreview = document.getElementById('verificationDocumentPreview');

// Set max date for date input
document.getElementById("dob").setAttribute("max", new Date().toISOString().split("T")[0]);

// Update member fields dynamically based on member count
memberCountInput.addEventListener('input', function () {
    const count = parseInt(memberCountInput.value) || 0;
    memberFieldsContainer.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const memberCard = document.createElement('div');
        memberCard.classList.add('card');

        const memberTitle = document.createElement('h3');
        memberTitle.textContent = `Member ${i}`;

        const inputFields = [
            { label: "First Name", placeholder: `Enter Member ${i} First Name`, type: 'text' },
            { label: "Last Name", placeholder: `Enter Member ${i} Last Name`, type: 'text' },
            { label: "Upload Document", placeholder: '', type: 'file', id: `member${i}Document` }
        ];

        inputFields.forEach(({ label, placeholder, type, id }) => {
            const labelElement = document.createElement('label');
            labelElement.textContent = label;
            
            const inputElement = document.createElement('input');
            inputElement.type = type;
            if (placeholder) inputElement.placeholder = placeholder;
            if (id) inputElement.id = id;
            inputElement.required = true;

            memberCard.appendChild(labelElement);
            memberCard.appendChild(inputElement);

            // For file inputs, add a preview toggle button
            if (type === 'file') {
                const eyeButton = document.createElement('span');
                eyeButton.classList.add('eye-button');
                eyeButton.innerHTML = `<img src="/mnt/data/eye.png" alt="View" />`;
                eyeButton.onclick = () => toggleDocumentPreview(id, `${id}Preview`);

                const documentPreview = document.createElement('div');
                documentPreview.id = `${id}Preview`;
                documentPreview.classList.add('document-preview');
                documentPreview.textContent = 'No preview available';

                memberCard.appendChild(eyeButton);
                memberCard.appendChild(documentPreview);
            }
        });

        memberFieldsContainer.appendChild(memberCard);
    }
});

// Handle file preview display
verificationInput.addEventListener('change', function() {
    if (verificationInput.files && verificationInput.files.length > 0) {
        verificationPreview.textContent = `Uploaded: ${verificationInput.files[0].name}`;
        verificationPreview.style.display = 'block';
    } else {
        verificationPreview.textContent = 'No document uploaded';
        verificationPreview.style.display = 'block';
    }
});

function toggleDocumentPreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    if (input && input.files.length > 0) {
        preview.textContent = input.files[0].name;
        preview.style.display = 'block';
    } else {
        preview.textContent = 'No document uploaded';
        preview.style.display = 'block';
    }
}

// Function to collect form data
function collectFormData() {
    const firstName = document.querySelector('input[placeholder="First name"]').value;
    const lastName = document.querySelector('input[placeholder="Last name"]').value;
    const dob = document.getElementById('dob').value;
    const memberCount = memberCountInput.value;
    const verificationFileName = verificationInput.files.length > 0 ? verificationInput.files[0].name : "No file";

    const members = [];
    for (let i = 1; i <= memberCount; i++) {
        const memberFirstName = document.querySelector(`input[placeholder="Enter Member ${i} First Name"]`).value;
        const memberLastName = document.querySelector(`input[placeholder="Enter Member ${i} Last Name"]`).value;
        const memberDoc = document.getElementById(`member${i}Document`).files[0];
        members.push({
            firstName: memberFirstName,
            lastName: memberLastName,
            document: memberDoc ? memberDoc.name : 'No file'
        });
    }

    return {
        headFirstName: firstName,
        headLastName: lastName,
        dob: dob,
        memberCount: memberCount,
        verificationDocument: verificationFileName,
        members: members
    };
}

// Function to save data to Firestore
function saveToFirestore(formData) {
    db.collection('bookings').add(formData)
        .then(() => alert('Data saved successfully!'))
        .catch(error => {
            console.error("Error saving data: ", error);
            alert('Failed to save data.');
        });
}

// Verify and save data to Firestore
function toggleVerification() {
    if (checkFormCompletion()) {
        const isVerified = verifyBtn.classList.toggle('active');
        verifyBtn.textContent = isVerified ? 'Verified' : 'Not Verified';
        roomBookingBtn.disabled = !isVerified;
        roomBookingBtn.classList.toggle('enabled', isVerified);

        if (isVerified) {
            // Collect form data and save to Firestore
            const formData = collectFormData();
            saveToFirestore(formData);

            roomBookingBtn.setAttribute('onclick', 'window.location.href="home.html"');
        } else {
            roomBookingBtn.removeAttribute('onclick');
        }
    } else {
        alert('Please complete all required fields to enable verification.');
    }
}

// Check if all required fields are completed
function checkFormCompletion() {
    const allRequiredFields = document.querySelectorAll('input[required]');
    return Array.from(allRequiredFields).every(field => field.value.trim() !== '');
}
