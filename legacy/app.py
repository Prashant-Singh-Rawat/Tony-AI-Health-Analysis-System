import streamlit as st
import pandas as pd
import pickle

st.title("❤️ Heart Disease AI")

# Try to load the model
try:
    with open('heart_model.pkl', 'rb') as f:
        model = pickle.load(f)
    st.success("AI Brain Loaded Successfully!")
except Exception as e:
    st.error(f"Could not load model: {e}")

# Simple inputs
age = st.number_input("Age", value=25)
chol = st.number_input("Cholesterol", value=200)

if st.button("Predict"):
    # Creating a dummy row with 13 features to match the model we trained
    # We use 0 for the other values just to test
    input_data = [[age, 1, 1, 120, chol, 0, 1, 150, 0, 1.0, 1, 0, 2]]
    prediction = model.predict(input_data)
    
    if prediction[0] == 1:
        st.warning("High Risk Detected")
    else:
        st.success("Low Risk Detected")