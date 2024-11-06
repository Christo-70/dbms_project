// Initialize Firestore (Make sure to include Firebase SDK in your HTML)
const firebaseConfig = {
    apiKey: "AIzaSyDLlMDgSuzMwcBK4gKbH-zLD_LDQSPA8RQ",
    authDomain: "crestview-6fac1.firebaseapp.com",
    projectId: "crestview-6fac1",
    storageBucket: "crestview-6fac1.firebasestorage.app",
    messagingSenderId: "171706842554",
    appId: "1:171706842554:web:284347abdabe50662ef183"
  };
  firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    let roomConfigs = [];
    let totalBillAmount = 0; // To store the total bill amount

    // Fetch available rooms from Firestore
    async function fetchAvailableRooms() {
        const availableRoomsSnapshot = await db.collection('availableRooms').get();
        return availableRoomsSnapshot.docs.map(doc => doc.id); // Room IDs like R1, R2, ...
    }

    // Generate Room Configurations with only available rooms
    async function generateClientIDs() {
        const roomCount = parseInt(document.getElementById('roomCount').value);
        const roomConfigDiv = document.getElementById('roomConfig');
        roomConfigDiv.innerHTML = ''; // Clear any previous room configurations
        roomConfigs = [];

        // Fetch available rooms
        const availableRooms = await fetchAvailableRooms();

        if (roomCount > availableRooms.length) {
            alert(`Only ${availableRooms.length} rooms are available. Please select fewer rooms.`);
            return;
        }

        // Generate room configurations only from available rooms
        for (let i = 0; i < roomCount; i++) {
            const clientID = 'C-' + Math.floor(1000 + Math.random() * 9000) + ' ' + availableRooms[i]; // Assign available room ID
            roomConfigs.push({ id: availableRooms[i], roomType: 'single', extraBed: 'none' });

            roomConfigDiv.innerHTML += `
                <div class="room-section" id="${clientID}">
                    <span class="temp-client-id">${clientID}</span>
                    
                    <label for="roomType-${i + 1}">Room Type:</label>
                    <select id="roomType-${i + 1}" onchange="updateRoomType(${i + 1})">
                        <option value="single">Single Bedroom (₹1000 per session)</option>
                        <option value="double">Double Bedroom (₹2000 per session)</option>
                    </select><br>
                    
                    <label>Extra Beds:</label>
                    <div class="bed-selection">
                        <button class="bed-button" type="button" id="noBed-${i + 1}" onclick="updateExtraBed(${i + 1}, 'none', event)">No Extra Bed</button>
                        <button class="bed-button" type="button" id="oneBed-${i + 1}" onclick="updateExtraBed(${i + 1}, 'one', event)">1 Extra Bed</button>
                        <button class="bed-button" type="button" id="twoBeds-${i + 1}" onclick="updateExtraBed(${i + 1}, 'two', event)">2 Extra Beds</button>
                    </div>
                </div>
            `;
        }
    }

    function updateRoomType(roomIndex) {
        const roomType = document.getElementById(`roomType-${roomIndex}`).value;
        roomConfigs[roomIndex - 1].roomType = roomType;
    }

    function updateExtraBed(roomIndex, bedOption, event) {
        roomConfigs[roomIndex - 1].extraBed = bedOption;
        event.preventDefault();

        // Reset button styles
        document.getElementById(`noBed-${roomIndex}`).classList.remove('selected');
        document.getElementById(`oneBed-${roomIndex}`).classList.remove('selected');
        document.getElementById(`twoBeds-${roomIndex}`).classList.remove('selected');

        // Apply the selected style
        document.getElementById(`${bedOption === 'none' ? 'noBed' : bedOption === 'one' ? 'oneBed' : 'twoBeds'}-${roomIndex}`).classList.add('selected');
    }

    async function checkAndBookRooms() {
        const availableRooms = await fetchAvailableRooms();
        const requestedRoomIDs = roomConfigs.map(room => room.id);
        
        // Check if all requested rooms are available
        const unavailableRooms = requestedRoomIDs.filter(roomID => !availableRooms.includes(roomID));
        
        if (unavailableRooms.length > 0) {
            alert(`The following rooms are unavailable: ${unavailableRooms.join(", ")}`);
            return false; // Booking failed
        }

        // Proceed with booking and mark rooms as booked in Firestore
        await Promise.all(roomConfigs.map(async (room) => {
            await db.collection("availableRooms").doc(room.id).delete(); // Remove room from availableRooms
            await db.collection("bookedRooms").doc(room.id).set({ booked: true, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        }));

        const bookingDetails = {
            clientID: `C-${Math.floor(1000 + Math.random() * 9000)}`,
            rooms: roomConfigs,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            totalCost: totalBillAmount
        };
        await db.collection("bookingHistory").add(bookingDetails);

        alert("Rooms booked successfully!");
        return true;
    }

    function calculateTotal() {
        const checkInDate = new Date(document.getElementById('checkInDate').value);
        const checkOutDate = new Date(document.getElementById('checkOutDate').value);

        // Validate check-in and check-out dates
        if (checkOutDate <= checkInDate) {
            alert('Check-out time must be after check-in time.');
            return;
        }

        const sessionDuration = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        const duration = checkOutDate - checkInDate;
        const numberOfSessions = Math.ceil(duration / sessionDuration);
        let totalCost = 0;

        // Calculate cost per room
        roomConfigs.forEach(room => {
            let roomRate = 0;

            if (room.roomType === 'single') {
                roomRate = room.extraBed === 'none' ? 1000 : 1500;
            } else if (room.roomType === 'double') {
                roomRate = room.extraBed === 'none' ? 2000 : room.extraBed === 'one' ? 2500 : 3000;
            }

            totalCost += roomRate * numberOfSessions;
        });

        totalBillAmount = totalCost * 1.20; // Adding 20% tax

        // Display the result
        document.getElementById('result').innerHTML = `
            <strong>Total Estimated Cost:</strong> ₹${totalCost}<br>
            <strong>Final Cost (including 20% tax):</strong> ₹${totalBillAmount.toFixed(2)}
        `;
    }

    async function payNow() {
        if (totalBillAmount > 0) {
            const bookingSuccess = await checkAndBookRooms(); // Check availability and book rooms
            if (bookingSuccess) {
                // Redirect to the transaction page and pass the total amount as a query parameter
                window.location.href = `trans.html?amount=${totalBillAmount.toFixed(2)}`;
            }
        } else {
            alert("Please calculate the total bill before proceeding to payment.");
        }
    }