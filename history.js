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

// Fetch and display booking history in a table
async function fetchBookingHistory() {
    const bookingHistoryBody = document.getElementById('bookingHistoryBody');
    bookingHistoryBody.innerHTML = "<tr><td colspan='7'>Loading booking history...</td></tr>";

    const bookingHistorySnapshot = await db.collection("bookingHistory").orderBy("timestamp", "desc").get();
    
    if (bookingHistorySnapshot.empty) {
        bookingHistoryBody.innerHTML = "<tr><td colspan='7'>No booking history available.</td></tr>";
        return;
    }

    bookingHistoryBody.innerHTML = ""; // Clear loading text
    bookingHistorySnapshot.forEach(doc => {
        const bookingData = doc.data();
        const bookingDate = bookingData.timestamp.toDate().toLocaleString();

        // Populate a row for each room in the booking
        bookingData.rooms.forEach(room => {
            const rowHTML = `
                <tr id="booking-${doc.id}-${room.id}">
                    <td>${bookingData.clientID}</td>
                    <td>${bookingDate}</td>
                    <td>₹${bookingData.totalCost.toFixed(2)}</td>
                    <td>${room.id}</td>
                    <td>${room.roomType}</td>
                    <td>${room.extraBed}</td>
                    <td><button onclick="vacateRoom('${doc.id}', '${room.id}')">Vacate Room</button></td>
                </tr>
            `;
            bookingHistoryBody.insertAdjacentHTML('beforeend', rowHTML);
        });
    });
}

// Function to vacate a room
async function vacateRoom(bookingId, roomId) {
    if (!confirm("Mark the Room as Available?")) return;

    try {
        // Update Firestore
        await db.collection("bookedRooms").doc(roomId).delete(); // Remove from bookedRooms
        await db.collection("availableRooms").doc(roomId).set({ available: true }); // Mark as available

        // Update booking history (mark room as vacated)
        const bookingRef = db.collection("bookingHistory").doc(bookingId);
        const bookingDoc = await bookingRef.get();
        const bookingData = bookingDoc.data();

        // Filter out the vacated room
        const updatedRooms = bookingData.rooms.filter(room => room.id !== roomId);

        // Update the booking history record
        if (updatedRooms.length > 0) {
            await bookingRef.update({ rooms: updatedRooms });
        } else {
            // If no rooms remain, delete the booking entry
            await bookingRef.delete();
        }

        // Remove the room from UI
        document.getElementById(`booking-${bookingId}-${roomId}`).remove();
        alert("Room vacated successfully.");
    } catch (error) {
        console.error("Error vacating room:", error);
        alert("Failed to vacate room.");
    }
}

// Fetch booking history on page load
document.addEventListener("DOMContentLoaded", fetchBookingHistory);