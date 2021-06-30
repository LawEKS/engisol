

// signin here
const auth = firebase.auth();

const signedIn = document.getElementById('signedIn')
const signedOut = document.getElementById('signedOut');

const signInBtn = document.getElementById('signInBtn')
const signOutBtn = document.getElementById('signOutBtn')

const userDetails = document.getElementById('userDetails')

const createButton = document.getElementById('createButton')

const peopleList = document.getElementById('peopleList')


const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.onclick = () => auth.signInWithPopup(provider);

signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        signedIn.hidden = false;
        signedOut.hidden = true;
        createButton.hidden = false;
        userDetails.innerHTML = `<h3> Welcome ${user.displayName} </h3>
        <p> id: ${user.uid}`
    } else {
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
                const items = querySnapshot.docs.map(doc => {

                    const day = gettingDate(doc.data().createdAt.seconds)
                    console.log(day)
                    return `
                    <ul>
                        <li>Item ID: ${doc.id}</li>
                        <li>Name: ${doc.data().productName}</li>
                        <li>Price: ${doc.data().price}</li>
                        <li>Date: ${day}</li>
                        <button onclick="handleClick('${doc.id}')" class="btn btn-danger btn-sm">x</button>
                    </ul>`
                    //delete button not yet functional
                })

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




