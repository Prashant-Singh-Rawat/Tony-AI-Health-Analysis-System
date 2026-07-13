import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle
import numpy as np

print("--- TRAINING PROCESS STARTED ---")

# We are creating a small fake dataset just to get the file created
# This ensures the script doesn't depend on your internet speed
data = {
    'age': [50, 60, 45, 70, 30],
    'sex': [1, 0, 1, 0, 1],
    'cp': [2, 3, 1, 0, 2],
    'trestbps': [120, 140, 110, 150, 120],
    'chol': [200, 250, 190, 300, 180],
    'fbs': [0, 1, 0, 0, 0],
    'restecg': [1, 0, 1, 0, 1],
    'thalach': [150, 120, 160, 100, 170],
    'exang': [0, 1, 0, 1, 0],
    'oldpeak': [1.0, 2.0, 0.5, 3.0, 0.0],
    'slope': [1, 2, 1, 2, 1],
    'ca': [0, 1, 0, 2, 0],
    'thal': [2, 3, 2, 3, 2],
    'target': [0, 1, 0, 1, 0]
}

df = pd.DataFrame(data)
X = df.drop('target', axis=1)
y = df['target']

print("Training the model...")
model = RandomForestClassifier(n_estimators=10)
model.fit(X, y)

# This is the important part: creating the file
with open('heart_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("--- SUCCESS: heart_model.pkl IS CREATED! ---")