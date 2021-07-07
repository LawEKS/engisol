

// signin here
const auth = firebase.auth();

const signedIn = document.getElementById('signedIn')
const signedOut = document.getElementById('signedOut');

const signInBtn = document.getElementById('signInBtn')
const signOutBtn = document.getElementById('signOutBtn')

const userDetails = document.getElementById('userDetails')

const createButton = document.getElementById('createButton')

const peopleList = document.getElementById('peopleList')

//const totalGrossPrice = document.getElementById('grossPrice')


const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.onclick = () => auth.signInWithPopup(provider);

signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        signedIn.hidden = false;
        signedOut.hidden = true;
        createButton.hidden = false;
        document.getElementById('signedInHeader').hidden = false;
        userDetails.innerHTML = `<h4 class="userDisplayName"> Welcome ${user.displayName} </h4>
        <img src="${user.photoURL}" id="profilePic" alt="user profile picture">`

    } else {
        document.getElementById('signedInHeader').hidden = true;
        signedIn.hidden = true;
        signedOut.hidden = false;
        createButton.hidden = true;
        userDetails.innerHTML = '';
    }
})



const db = firebase.firestore();


let clientRef;
let unsubscribe;



auth.onAuthStateChanged(user => {
    if (user) {
        clientRef = db.collection('clients');

        const { serverTimestamp } = firebase.firestore.FieldValue;
        const profit = 10 // Hard-coded for now, will calculate in future
        let form = document.getElementById('form')
        form.addEventListener('submit', (e) => {
            e.preventDefault()
            clientRef.add({
                uid: user.uid,
                name: form.name.value,
                number: form.number.value,
                owes: form.amountOwed.value,
                paid: form.amountPaid.value,
                profit: profit,
                createdAt: serverTimestamp()
            })
            form.name.value = ''
            form.number.value = ''
            form.amountOwed.value = ''
            form.amountPaid.value = ''
        })

        unsubscribe = clientRef
            .where('uid', '==', user.uid)
            .orderBy('createdAt')
            .onSnapshot(querySnapshot => {
                //const prices = []
                const items = querySnapshot.docs.map(doc => {

                    const day = gettingDate(doc.data().createdAt.seconds)
                    //const price = parseFloat(doc.data().price)
                    //prices.push(price)
                    const owes = doc.data().owes
                    let message;
                    if (owes == 0) {
                        message = "All paid! ✔️"
                    } else {
                        message = owes + "Dh left to pay"
                    }
                    return `
                    <ul class="list">
                        
                    <div style="float:right;">
                        <button onclick="deleteClient('${doc.id}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div style="float:right;">
                        <button onclick="updateClient('${doc.id}')" class="btn btn-success btn-sm">
                            <i class="fas fa-pen"></i>
                        </button>
                    </div>
                        <li id="productNameLi">${doc.data().name}</li>
                        <li><i class="fas fa-phone-volume"></i> ${doc.data().number}</li>
                        <li><i class="fas fa-hand-holding-usd"></i> ${message}</li>
                        <li><i class="fas fa-file-invoice-dollar"></i> ${doc.data().paid}Dh paid so far</li>
                        <li><i class="fas fa-coins"></i> ${doc.data().profit}Dh profit made</li>
                        <li><i class="far fa-clock"></i> ${day}</li>
                    </ul>`

                })


                //totalGrossPrice.innerHTML = `<i class="fas fa-wallet"></i> <span id="priceInfo">${totalPrice(prices)}</span>`
                peopleList.innerHTML = items.join('');
            })
    } else {
        unsubscribe && unsubscribe();
    }
})


const gettingDate = (data) => {
    let unix_timestamp = data
    let date = new Date(unix_timestamp * 1000);
    let day = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    return day
}

const deleteClient = (id) => {
    clientRef.doc(id).delete()
}

const updateClient = (id) => {
    console.log(id)
}

// const totalPrice = (array) => {
//     const total = array.reduce((a, b) => a + b, 0)
//     return total
// }




