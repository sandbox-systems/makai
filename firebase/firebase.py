import firebase_admin
from firebase_admin import credentials, firestore

# TODO Handle potential error validating credentials
cred = credentials.Certificate("firebase/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


# TODO Handle error creating?
def create_empty_doc(collection, doc_key):
    # Create document with empty body
    db.collection(collection).document(doc_key).set({})


# TODO Handle error updating?
def update_doc(collection, doc_key, update):
    # Ref doc_key in collection
    doc_ref = db.collection(collection.decode('utf-8')).document(doc_key.decode('utf-8'))

    # Ensure all keys in update are valid
    for key, val in update.items():
        update[db.field_path(key)] = val
        del update[key]

    # Update the firebase document reference with the update dict
    doc_ref.update(update)


# TODO Handle error getting?
def get_doc(collection, doc_key):
    doc_ref = db.collection(collection.decode('utf-8')).document(doc_key.decode('utf-8'))
    return doc_ref.get()
