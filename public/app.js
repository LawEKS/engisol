

// signin
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
//


//form - <--------!!!!!!!!
let productName = document.getElementById("productName").value;
let price = document.getElementById("price").value;





const db = firebase.firestore();


let peopleRef;
let unsubscribe;



auth.onAuthStateChanged(user => {
    if (user) {
        peopleRef = db.collection('demo');

        const { serverTimestamp } = firebase.firestore.FieldValue;

        create.onclick = () => {
            peopleRef.add({
                uid: user.uid,
                productName: productName,
                price: price,
                createdAt: serverTimestamp()
            })
        }

        unsubscribe = peopleRef
            .where('uid', '==', user.uid)
            .orderBy('createdAt')
            .onSnapshot(querySnapshot => {
                const items = querySnapshot.docs.map(doc => {
                    const day = gettingDate(doc.data().createdAt.seconds)

                    return `
                    <ul>
                        <li>${doc.data().uid}</li>
                        <li>${doc.data().productName}</li>
                        <li>${doc.data().price}</li>
                        <li>${day}</li>
                    </ul>`
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




