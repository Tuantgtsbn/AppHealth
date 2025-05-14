const admin = require('firebase-admin');
const serviceAccount = require("./functions/config/heart-rate-backend-firebase-adminsdk-fbsvc-21ba5082be.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// kiem tra co connect den Firebase hay không
async function testFirebaseConnection(){
   try{
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('connection-test').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message : 'Test connection susscessful'
    });

    console.log('Ket noi den Firebase thanh cong!', testDoc);
    return true;
   } catch (error) {
    console.error('Khong the ket noi den Firebase:', error);
    return false;
   }
}

// chay test
testFirebaseConnection()
    .then(result => {
        if (result) {
            console.log('Test ket noi Firebase thanh cong!');
        } else {
            console.log('Test ket noi Firebase that bai!');
        }
    })
    .catch(error => {
        console.error('Loi khi test ket noi Firebase:', error);
    });