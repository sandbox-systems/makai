import firebase_admin
from firebase_admin import credentials, firestore

# TODO Handle potential error validating credentials
cred = credentials.Certificate("firebase/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


# TODO Handle error updating?
def update_doc(collection, doc_key, update):
    # Ref doc_key in collection
    doc_ref = db.collection(collection.decode('utf-8')).document(doc_key.decode('utf-8'))
    # Update the firebase document reference with the update dict
    doc_ref.update(update)


# TODO Handle error getting?
def get_doc(collection, doc_key):
    doc_ref = db.collection(collection.decode('utf-8')).document(doc_key.decode('utf-8'))
    return doc_ref.get()