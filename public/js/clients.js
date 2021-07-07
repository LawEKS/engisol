

// signin here
const auth = firebase.auth();

const signedIn = document.getElementById('signedIn')
const signedOut = document.getElementById('signedOut');

const signInBtn = document.getElementById('signInBtn')
const signOutBtn = document.getElementById('signOutBtn')

const userDetails = document.getElementById('userDetails')

const createButton = document.getElementById('createButton')

const peopleList = document.getElementById('peopleList')

const totalGrossPrice = document.getElementById('grossPrice')


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
        console.log(user)
    } else {
        document.getElementById('signedInHeader').hidden = true;
        signedIn.hidden = true;
        signedOut.hidden = false;
        createButton.hidden = true;
        userDetails.innerHTML = '';
    }
})



const db = firebase.firestore();


let peopleRef;
let unsubscribe;



auth.onAuthStateChanged(user => {
    if (user) {
        peopleRef = db.collection('demo');

        const { serverTimestamp } = firebase.firestore.FieldValue;

        let form = document.getElementById('form')
        form.addEventListener('submit', (e) => {
            e.preventDefault()
            peopleRef.add({
                uid: user.uid,
                productName: form.product.value,
                price: form.price.value,
                createdAt: serverTimestamp()
            })
            form.product.value = ''
            form.price.value = ''
        })

        unsubscribe = peopleRef
            .where('uid', '==', user.uid)
            .orderBy('createdAt')
            .onSnapshot(querySnapshot => {
                const prices = []
                const items = querySnapshot.docs.map(doc => {
                    console.log(doc.data())
                    const day = gettingDate(doc.data().createdAt.seconds)
                    const price = parseFloat(doc.data().price)
                    prices.push(price)

                    return `
                    <ul class="list">
                        
                    <div style="float:right;">
                        <button onclick="handleClick('${doc.id}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                        <li id="productNameLi">${doc.data().productName}</li>
                        <li><i class="fas fa-coins"></i> ${doc.data().price} Dh</li>
                        <li><i class="far fa-clock"></i> ${day}</li>
                    </ul>`

                })


                totalGrossPrice.innerHTML = `<i class="fas fa-wallet"></i> <span id="priceInfo">${totalPrice(prices)}</span>`
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

const handleClick = (id) => {

    //console.log(id)
    peopleRef.doc(id).delete()
}

const totalPrice = (array) => {

    const total = array.reduce((a, b) => a + b, 0)
    return total
}




