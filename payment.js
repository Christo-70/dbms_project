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

    // Get the total amount from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const totalAmount = urlParams.get('amount');

    // Display the total amount
    document.getElementById('totalAmountDisplay').innerText = `Total amount = ₹ ${totalAmount}`;

    function showPaymentFields(method) {
        document.getElementById("cardFields").classList.add("hidden");
        document.getElementById("cashFields").classList.add("hidden");

        if (method === "credit" || method === "debit") {
            document.getElementById("cardFields").classList.remove("hidden");
        } else if (method === "cash") {
            document.getElementById("cashFields").classList.remove("hidden");
        }
    }

    async function completeTransaction() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        
        if (!paymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        if ((paymentMethod.value === 'credit' || paymentMethod.value === 'debit') &&
            (!document.getElementById('cardNumber').value || 
             !document.getElementById('expiryDate').value || 
             !document.getElementById('cvv').value)) {
            alert('Please fill in all card details.');
            return;
        }

        // Show loading spinner and hide button
        document.getElementById('completeBtn').style.display = 'none';
        document.getElementById('loading').style.display = 'flex';

        // Save transaction to Firestore
        try {
            await db.collection("transactions").add({
                amount: parseFloat(totalAmount),
                method: paymentMethod.value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            setTimeout(function() {
                window.location.href = `transconfirm.html`;
            }, 3500);
        } catch (error) {
            alert("Transaction failed. Please try again.");
            console.error("Error storing transaction:", error);
        }
    }